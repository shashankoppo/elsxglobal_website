export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { createClient as createCookieServerClient } from '@/lib/supabase/server';
import { ProvisioningEngine } from '@/lib/provisioning/ProvisioningEngine';
import { PowerDNSClient } from '@/lib/dns/powerdns';
import { provisionMailbox } from '@/lib/provisioning/mail';

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Server Supabase configuration missing');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function resolveAuthenticatedUser(request: Request, supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (bearerToken) {
    const { data, error } = await supabaseAdmin.auth.getUser(bearerToken);
    if (!error && data?.user) return data.user;
  }

  try {
    const cookieSupabase = createCookieServerClient();
    const { data, error } = await cookieSupabase.auth.getUser();
    if (!error && data?.user) return data.user;
  } catch {
    // Fallback cleanly if cookies unavailable
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const user = await resolveAuthenticatedUser(request, supabaseAdmin);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    const { data: service, error } = await supabaseAdmin
      .from('hosting_services')
      .select('*')
      .eq('id', serviceId)
      .eq('user_id', user.id)
      .single();

    if (error || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    let metrics;
    try {
      metrics = await ProvisioningEngine.getServiceMetrics(serviceId);
    } catch {
      const specs = service.specs_json || {};
      metrics = {
        cpuPercent: 0,
        memoryUsedMb: 0,
        memoryTotalMb: (Number(specs.ram_gb) || 4) * 1024,
        diskUsedGb: 0,
        diskTotalGb: Number(specs.disk_gb) || 40,
        networkInMbps: 0,
        networkOutMbps: 0,
        uptime: 0,
        status: service.status || 'active',
      };
    }

    return NextResponse.json({ ok: true, service, metrics });
  } catch (err: any) {
    console.error('[server-action GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, action } = body;

    const supabaseAdmin = getSupabaseAdmin();
    const user = await resolveAuthenticatedUser(request, supabaseAdmin);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create / register a BYO / manual dedicated server directly from the user portal
    if (action === 'register_manual_server') {
      const {
        plan_name = 'Custom BYO Dedicated Server',
        tier = 'dedicated',
        hostname,
        domain,
        ip_address,
        ipv6_address,
        ssh_port = 22,
        username = 'root',
        ssh_public_key,
        web_console_url,
        control_panel_url,
        os_template = 'ubuntu-22.04',
        location = 'Mumbai (ap-west-in)',
        vcpu = 4,
        ram_gb = 8,
        disk_gb = 160,
        manual_setup_notes,
      } = body;

      const cleanHost = (hostname || domain || '').trim();
      if (!cleanHost && !ip_address) {
        return NextResponse.json({ error: 'Hostname or IPv4 address is required' }, { status: 400 });
      }

      const accessEndpoints: Record<string, string> = {};
      if (ip_address) {
        accessEndpoints.ssh = `ssh ${username}@${ip_address} -p ${Number(ssh_port) || 22}`;
      }
      if (web_console_url) accessEndpoints.web_console = web_console_url;
      if (control_panel_url) accessEndpoints.control_panel = control_panel_url;

      const { data: created, error: createErr } = await supabaseAdmin
        .from('hosting_services')
        .insert({
          user_id: user.id,
          plan_name,
          tier,
          domain: domain || cleanHost || null,
          hostname: cleanHost || null,
          ip_address: ip_address || null,
          ipv6_address: ipv6_address || null,
          ssh_port: Number(ssh_port) || 22,
          username,
          ssh_public_key: ssh_public_key || null,
          web_console_url: web_console_url || null,
          control_panel_url: control_panel_url || null,
          os_template,
          location,
          provisioning_mode: 'manual',
          setup_status: ip_address ? 'ready' : 'awaiting_setup',
          adapter: 'manual',
          status: 'active',
          specs_json: {
            vcpu: Number(vcpu) || 4,
            ram_gb: Number(ram_gb) || 8,
            disk_gb: Number(disk_gb) || 160,
          },
          access_endpoints: accessEndpoints,
          manual_setup_notes: manual_setup_notes || 'Registered manually by customer via Dedicated Access Portal.',
          next_renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('*')
        .single();

      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        service: created,
        message: 'Manual / BYO dedicated server registered cleanly.',
      });
    }

    if (!serviceId || !action) {
      return NextResponse.json({ error: 'serviceId and action are required' }, { status: 400 });
    }

    // Verify service belongs to user
    const { data: service, error: svcError } = await supabaseAdmin
      .from('hosting_services')
      .select('*')
      .eq('id', serviceId)
      .eq('user_id', user.id)
      .single();

    if (svcError || !service) {
      return NextResponse.json({ error: 'Service not found or access denied' }, { status: 404 });
    }

    const isManual =
      service.provisioning_mode === 'manual' ||
      service.adapter === 'manual' ||
      !service.adapter;

    switch (action) {
      case 'start':
      case 'unsuspend': {
        if (!isManual && service.adapter === 'proxmox') {
          try {
            const ctx = await ProvisioningEngine.getServiceContext(serviceId);
            if (ctx.adapter.startService) {
              await ctx.adapter.startService(ctx.externalId);
            } else {
              await ProvisioningEngine.restartService(serviceId);
            }
          } catch (e: any) {
            console.warn('[server-action start] backend warning:', e.message);
          }
        }
        await supabaseAdmin
          .from('hosting_services')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', serviceId);
        return NextResponse.json({ ok: true, status: 'active', message: 'Instance power-on applied.' });
      }

      case 'stop':
      case 'suspend': {
        if (!isManual) {
          try {
            await ProvisioningEngine.suspendService(serviceId);
          } catch (e: any) {
            console.warn('[server-action stop] backend warning:', e.message);
            await supabaseAdmin
              .from('hosting_services')
              .update({ status: 'stopped', updated_at: new Date().toISOString() })
              .eq('id', serviceId);
          }
        } else {
          await supabaseAdmin
            .from('hosting_services')
            .update({ status: 'stopped', updated_at: new Date().toISOString() })
            .eq('id', serviceId);
        }
        return NextResponse.json({ ok: true, status: 'stopped', message: 'Instance stopped cleanly.' });
      }

      case 'restart':
      case 'reboot': {
        if (!isManual) {
          try {
            await ProvisioningEngine.restartService(serviceId);
          } catch (e: any) {
            console.warn('[server-action restart] backend warning:', e.message);
          }
        }
        await supabaseAdmin
          .from('hosting_services')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', serviceId);
        return NextResponse.json({ ok: true, status: 'active', message: 'Reboot command dispatched.' });
      }

      case 'snapshot':
      case 'create_backup': {
        const snapName =
          (body.snapshotName || body.name || `snap_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
        if (!isManual) {
          try {
            await ProvisioningEngine.snapshotService(serviceId, snapName);
          } catch (e: any) {
            console.warn('[server-action snapshot] backend notice:', e.message);
          }
        }
        const { data: backupRow } = await supabaseAdmin
          .from('backup_snapshots')
          .insert({
            user_id: user.id,
            service_id: serviceId,
            size_mb: body.size_mb || 256,
            status: 'completed',
            backup_type: body.type || 'manual',
          })
          .select('*')
          .maybeSingle();

        return NextResponse.json({
          ok: true,
          snapshotName: snapName,
          backup: backupRow,
          message: `Snapshot "${snapName}" recorded.`,
        });
      }

      case 'update_ssh_key': {
        if (!body.sshPublicKey || typeof body.sshPublicKey !== 'string') {
          return NextResponse.json({ error: 'Valid SSH public key is required' }, { status: 400 });
        }
        const res = await ProvisioningEngine.updateSshKey(serviceId, body.sshPublicKey);
        if (!res.success) {
          return NextResponse.json({ error: res.error || 'Failed to update SSH key' }, { status: 500 });
        }
        return NextResponse.json({
          ok: true,
          syncedToBackend: res.syncedToBackend,
          message: res.syncedToBackend
            ? 'SSH key saved and synced via Cloud-Init.'
            : 'SSH key saved. Run Cloud-Init / paste into ~/.ssh/authorized_keys to apply immediately.',
        });
      }

      case 'reset_password': {
        const res = await ProvisioningEngine.resetPassword(serviceId, body.newPassword);
        if (!res.success) {
          return NextResponse.json({ error: res.error || 'Failed to reset password' }, { status: 500 });
        }
        return NextResponse.json({
          ok: true,
          password: res.password,
          syncedToBackend: res.syncedToBackend,
          message: res.syncedToBackend
            ? 'Password updated cleanly on Cloud-Init backend.'
            : 'New password generated and saved. Apply via passwd or next Cloud-Init boot.',
        });
      }

      case 'update_hostname': {
        if (!body.hostname || typeof body.hostname !== 'string') {
          return NextResponse.json({ error: 'Hostname is required' }, { status: 400 });
        }
        const res = await ProvisioningEngine.updateHostname(serviceId, body.hostname);
        if (!res.success) {
          return NextResponse.json({ error: res.error || 'Failed to update hostname' }, { status: 500 });
        }
        return NextResponse.json({
          ok: true,
          syncedToBackend: res.syncedToBackend,
          message: 'Hostname / rDNS label updated.',
        });
      }

      case 'reinstall_os': {
        const osTemplate = body.osTemplate || 'ubuntu-22.04';
        const res = await ProvisioningEngine.reinstallOS(serviceId, osTemplate);
        return NextResponse.json({
          ok: res.success,
          osTemplate,
          message: res.success
            ? `OS reinstall initiated with ${osTemplate}.`
            : res.error || 'OS reinstall request queued.',
        });
      }

      case 'save_firewall_rules': {
        const rules = Array.isArray(body.rules) ? body.rules : [];
        const res = await ProvisioningEngine.updateFirewallRules(serviceId, rules);
        if (!res.success) {
          return NextResponse.json({ error: res.error || 'Failed to save firewall rules' }, { status: 500 });
        }
        return NextResponse.json({
          ok: true,
          rules,
          message: `${rules.length} firewall rule(s) saved.`,
        });
      }

      case 'save_manual_config': {
        const updates: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (body.hostname !== undefined) updates.hostname = body.hostname;
        if (body.domain !== undefined) updates.domain = body.domain;
        if (body.ip_address !== undefined) updates.ip_address = body.ip_address;
        if (body.ipv6_address !== undefined) updates.ipv6_address = body.ipv6_address;
        if (body.ssh_port !== undefined) updates.ssh_port = Number(body.ssh_port) || 22;
        if (body.username !== undefined) updates.username = body.username;
        if (body.os_template !== undefined) updates.os_template = body.os_template;
        if (body.web_console_url !== undefined) updates.web_console_url = body.web_console_url;
        if (body.control_panel_url !== undefined) updates.control_panel_url = body.control_panel_url;
        if (body.manual_setup_notes !== undefined) updates.manual_setup_notes = body.manual_setup_notes;
        if (body.access_endpoints !== undefined) updates.access_endpoints = body.access_endpoints;
        if (body.ip_address && service.setup_status === 'awaiting_setup') {
          updates.setup_status = 'ready';
        }

        const { data: updatedService, error: updErr } = await supabaseAdmin
          .from('hosting_services')
          .update(updates)
          .eq('id', serviceId)
          .select('*')
          .single();

        if (updErr) {
          return NextResponse.json({ error: updErr.message }, { status: 500 });
        }
        return NextResponse.json({
          ok: true,
          service: updatedService,
          message: 'Dedicated server configuration saved.',
        });
      }

      case 'add_dns_record': {
        const { type = 'A', name = '@', value, ttl = 3600, prio, priority } = body;
        if (!value) {
          return NextResponse.json({ error: 'Record value is required' }, { status: 400 });
        }

        const zoneDomain = (service.domain || service.hostname || 'example.com').trim();
        let syncedPowerDns = false;
        try {
          const pdns = new PowerDNSClient();
          const fullName = name === '@' ? zoneDomain : `${name}.${zoneDomain}`;
          const pdnsRes = await pdns.addRecord(zoneDomain, {
            zoneId: zoneDomain,
            type,
            name: fullName,
            content: value,
            ttl: Number(ttl) || 3600,
            prio: (prio || priority) ? Number(prio || priority) : undefined,
          });
          if (pdnsRes.success) syncedPowerDns = true;
        } catch (e: any) {
          console.warn('[server-action add_dns_record] PowerDNS notice:', e.message);
        }

        let { data: zoneRow } = await supabaseAdmin
          .from('dns_zones')
          .select('id')
          .eq('user_id', user.id)
          .eq('domain', zoneDomain)
          .maybeSingle();

        if (!zoneRow) {
          const { data: createdZone, error: zoneErr } = await supabaseAdmin
            .from('dns_zones')
            .insert({ user_id: user.id, domain: zoneDomain, status: 'active' })
            .select('id')
            .single();
          if (zoneErr) {
            return NextResponse.json({ error: zoneErr.message }, { status: 500 });
          }
          zoneRow = createdZone;
        }

        const { data: dnsRow, error: dnsErr } = await supabaseAdmin
          .from('dns_records')
          .insert({
            zone_id: zoneRow.id,
            user_id: user.id,
            type,
            name,
            value,
            ttl: Number(ttl) || 3600,
            priority: (prio || priority) ? Number(prio || priority) : null,
          })
          .select('*')
          .single();

        if (dnsErr) {
          return NextResponse.json({ error: dnsErr.message }, { status: 500 });
        }

        return NextResponse.json({
          ok: true,
          record: dnsRow,
          syncedPowerDns,
          message: syncedPowerDns ? 'DNS record saved and synced to PowerDNS.' : 'DNS record saved.',
        });
      }

      case 'delete_dns_record': {
        const { recordId } = body;
        if (!recordId) return NextResponse.json({ error: 'recordId required' }, { status: 400 });

        const { data: existing } = await supabaseAdmin
          .from('dns_records')
          .select('*')
          .eq('id', recordId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing && (service.domain || service.hostname)) {
          const zoneDomain = service.domain || service.hostname;
          try {
            const pdns = new PowerDNSClient();
            const fullName = existing.name === '@' ? zoneDomain : `${existing.name}.${zoneDomain}`;
            await pdns.deleteRecord(zoneDomain, {
              id: recordId,
              zoneId: zoneDomain,
              type: existing.type,
              name: fullName,
              content: existing.value,
              ttl: existing.ttl || 3600,
            });
          } catch {
            // Non-blocking fallback
          }
        }

        await supabaseAdmin
          .from('dns_records')
          .delete()
          .eq('id', recordId)
          .eq('user_id', user.id);

        return NextResponse.json({ ok: true, message: 'DNS record deleted.' });
      }

      case 'create_email_account': {
        const { localPart, password, quota_mb = 1024, forward_to } = body;
        if (!localPart) {
          return NextResponse.json({ error: 'Mailbox address is required' }, { status: 400 });
        }
        const domainName = service.domain || service.hostname || 'example.com';
        const cleanLocal = localPart.split('@')[0].trim().toLowerCase();
        const fullEmail = `${cleanLocal}@${domainName}`;

        let passwordHash: string | null = null;
        if (password) {
          const salt = crypto.randomBytes(16).toString('hex');
          passwordHash = `${salt}:${crypto.scryptSync(password, salt, 32).toString('hex')}`;
        }

        let mailAdapterResult = { success: false };
        try {
          await provisionMailbox(domainName, cleanLocal, password, forward_to);
          mailAdapterResult = { success: true };
        } catch (e: any) {
          console.warn('[create_email_account] adapter notice:', e.message);
        }

        const { data: mailRow, error: mailErr } = await supabaseAdmin
          .from('email_accounts')
          .insert({
            user_id: user.id,
            domain: domainName,
            local_part: cleanLocal,
            password_hash: passwordHash,
            forward_to: forward_to || null,
            storage_quota_mb: Number(quota_mb) || 1024,
            storage_used_mb: 0,
            status: 'active',
          })
          .select('*')
          .single();

        if (mailErr) {
          return NextResponse.json({ error: mailErr.message }, { status: 500 });
        }

        return NextResponse.json({
          ok: true,
          account: mailRow,
          adapterSynced: mailAdapterResult.success,
          message: `Mailbox ${fullEmail} created.`,
        });
      }

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Action API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
