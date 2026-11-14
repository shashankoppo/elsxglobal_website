export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { TenantPolicyOverride } from '@/lib/action-gateway/risk-classifier';
import { ProvisioningEngine } from '@/lib/provisioning/ProvisioningEngine';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials missing');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function getAuthUser(req: NextRequest) {
  // 1. Bearer token auth
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      if (userData?.user) return userData.user;
    } catch {}
  }

  // 2. Cookie session auth
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  } catch {}

  return null;
}

async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('admin_users')
      .select('id, role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

/**
 * GET /api/cloud/vps
 * - ?action=metrics&serviceId=xxx: Live Proxmox metrics (requires service ownership)
 * - ?action=snapshots&serviceId=xxx: List snapshots (requires service ownership)
 * - Default: List user's servers from hosting_services table
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId') || searchParams.get('instanceId');
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Live metrics query
    if (action === 'metrics') {
      if (!serviceId) {
        return NextResponse.json({ success: false, error: 'serviceId is required for metrics query' }, { status: 400 });
      }

      const { data: service } = await supabaseAdmin
        .from('hosting_services')
        .select('id, user_id')
        .eq('id', serviceId)
        .maybeSingle();

      if (!service) {
        return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
      }

      if (service.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not own this service' }, { status: 403 });
      }

      const metrics = await ProvisioningEngine.getServiceMetrics(serviceId);
      return NextResponse.json({ success: true, serviceId, metrics });
    }

    // 2. Snapshots query
    if (action === 'snapshots') {
      if (!serviceId) {
        return NextResponse.json({ success: false, error: 'serviceId is required for snapshots query' }, { status: 400 });
      }

      const { data: service } = await supabaseAdmin
        .from('hosting_services')
        .select('id, user_id, external_id, adapter, tier')
        .eq('id', serviceId)
        .maybeSingle();

      if (!service) {
        return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
      }

      if (service.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not own this service' }, { status: 403 });
      }

      const { data: dbSnapshots } = await supabaseAdmin
        .from('backup_snapshots')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      let liveSnapshots: any[] = [];
      try {
        const { data: settings } = await supabaseAdmin
          .from('provisioning_settings')
          .select('*')
          .eq('id', 1)
          .single();

        const adapter = ProvisioningEngine.getAdapter(service.tier || 'vps', service.adapter, settings);
        if (adapter.listSnapshots) {
          const snapRes = await adapter.listSnapshots(service.external_id || serviceId);
          if (snapRes.success && Array.isArray(snapRes.data)) {
            liveSnapshots = snapRes.data;
          }
        }
      } catch (e: any) {
        console.warn('[VPS Route] Live snapshot query warning:', e.message);
      }

      const combinedSnapshots = liveSnapshots.length > 0 ? liveSnapshots : (dbSnapshots || []);
      return NextResponse.json({ success: true, serviceId, snapshots: combinedSnapshots });
    }

    // 3. Default: List user's servers from hosting_services
    let query = supabaseAdmin
      .from('hosting_services')
      .select('*, hosting_plans(*)')
      .order('created_at', { ascending: false });

    // Allow admins with ?all=true to view all instances, otherwise enforce user_id
    if (!(isAdmin && searchParams.get('all') === 'true')) {
      query = query.eq('user_id', user.id);
    }

    const { data: services, error } = await query;
    if (error) {
      console.error('[VPS Route] Database query error:', error.message);
      return NextResponse.json({ success: false, error: 'Failed to retrieve hosting services' }, { status: 500 });
    }

    let instances: any[] = [];
    if (services && services.length > 0) {
      instances = services.map((svc: any) => {
        const planSpecs = svc.hosting_plans?.specs || {};
        const isRunning = svc.status === 'active' || svc.status === 'running';
        return {
          id: svc.id,
          serviceId: svc.id,
          name: svc.domain || svc.plan_name || 'Cloud VPS',
          planName: svc.plan_name,
          domain: svc.domain || '',
          ip: svc.ip_address || 'Unassigned',
          status: isRunning ? 'running' : (svc.status === 'stopped' || svc.status === 'suspended' ? 'stopped' : svc.status),
          location: svc.location || 'Mumbai, India (BOM-01)',
          specs: {
            cpu: svc.hosting_plans?.cpu || planSpecs.cpu || '2 vCPU',
            ram: svc.hosting_plans?.ram || planSpecs.ram || '4 GB RAM',
            storage: svc.hosting_plans?.storage || planSpecs.storage || '40 GB NVMe',
            bandwidth: svc.hosting_plans?.bandwidth || planSpecs.bandwidth || '2 TB / mo',
          },
          metrics: {
            cpuPct: isRunning ? 14.5 : 0,
            ramPct: isRunning ? 38.2 : 0,
            diskPct: 22.0,
            networkRxMbps: isRunning ? 8.4 : 0,
            networkTxMbps: isRunning ? 12.1 : 0,
          },
          controlPanelUrl: svc.control_panel_url,
          renewalDate: svc.renewal_date || null,
          price: svc.hosting_plans?.price_monthly || 0,
        };
      });
    }

    return NextResponse.json({
      success: true,
      instances,
      stats: {
        totalInstances: instances.length,
        activeInstances: instances.filter((i: any) => i.status === 'running' || i.status === 'active').length,
        totalMonthlyCost: instances.reduce((sum: number, i: any) => sum + (Number(i.price) || 0), 0),
        nextRenewal: instances[0]?.renewalDate || null,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/cloud/vps
 * Actions: 'start' | 'stop' | 'restart' | 'snapshot' | 'terminate'
 * Routed through processActionIntent:
 * - start/stop/restart = riskTier 1
 * - snapshot = riskTier 1
 * - terminate = riskTier 2 (irreversible!)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    const body = await req.json();
    const { action, serviceId, instanceId, snapshotName, options, intent } = body;

    // Direct ActionIntent pass-through
    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    const targetServiceId = serviceId || instanceId;
    if (!targetServiceId) {
      return NextResponse.json({ success: false, error: 'serviceId or instanceId is required' }, { status: 400 });
    }

    // Verify ownership of the target service
    const supabaseAdmin = getSupabaseAdmin();
    const { data: targetSvc } = await supabaseAdmin
      .from('hosting_services')
      .select('id, user_id, status')
      .eq('id', targetServiceId)
      .maybeSingle();

    if (!targetSvc && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    if (targetSvc && targetSvc.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this service' }, { status: 403 });
    }

    const normAction = (action || '').toLowerCase().trim();
    const validActions = ['start', 'stop', 'restart', 'reboot', 'snapshot', 'create_snapshot', 'terminate', 'power_toggle'];
    if (!validActions.includes(normAction)) {
      return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
    }

    // Map action to ActionIntent verb & risk tier policy
    let actionVerb = 'restart_instance';
    let targetTier: 1 | 2 = 1;

    if (normAction === 'start') {
      actionVerb = 'start_instance';
      targetTier = 1;
    } else if (normAction === 'stop') {
      actionVerb = 'stop_instance';
      targetTier = 1;
    } else if (normAction === 'restart' || normAction === 'reboot') {
      actionVerb = 'restart_instance';
      targetTier = 1;
    } else if (normAction === 'snapshot' || normAction === 'create_snapshot') {
      actionVerb = 'create_snapshot';
      targetTier = 1;
    } else if (normAction === 'terminate') {
      actionVerb = 'terminate_instance';
      targetTier = 2; // Irreversible!
    } else if (normAction === 'power_toggle') {
      actionVerb = 'power_toggle';
      targetTier = 1;
    }

    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: user.id,
        type: 'user',
        tenantId: user.id,
        roles: isAdmin ? ['tenant_admin', 'platform_admin'] : ['tenant_operator'],
      },
      targetService: 'compute',
      actionVerb,
      resourceUri: `compute://vps/${targetServiceId}`,
      parameters: {
        serviceId: targetServiceId,
        action: normAction,
        snapshotName: snapshotName || `snap-${Date.now()}`,
      },
      idempotencyKey: `vps_${normAction}_${Date.now()}_${targetServiceId}`,
      createdAt: new Date().toISOString(),
    };

    const tenantPolicyOverrides: TenantPolicyOverride[] = [
      { tenantId: user.id, actionVerbPattern: '(start|stop|restart|reboot|power_toggle).*', enforceTier: 1 },
      { tenantId: user.id, actionVerbPattern: '.*snapshot.*', enforceTier: 1 },
      { tenantId: user.id, actionVerbPattern: 'terminate.*', enforceTier: 2 },
    ];

    const gatewayResult = await processActionIntent(actionIntent, {
      ...options,
      tenantPolicyOverrides,
    });

    // If executed through the Action Gateway, perform the underlying infrastructure mutation
    if (gatewayResult.status === 'executed') {
      if (normAction === 'start') {
        await ProvisioningEngine.restartService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'stop') {
        await ProvisioningEngine.suspendService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'stopped', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'restart' || normAction === 'reboot') {
        await ProvisioningEngine.restartService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'snapshot' || normAction === 'create_snapshot') {
        const snapName = snapshotName || `snap-${Date.now()}`;
        await ProvisioningEngine.snapshotService(targetServiceId, snapName);
      } else if (normAction === 'terminate') {
        await ProvisioningEngine.terminateService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'terminated', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'power_toggle') {
        const currentStatus = await ProvisioningEngine.getServiceStatus(targetServiceId);
        if (currentStatus === 'active') {
          await ProvisioningEngine.suspendService(targetServiceId);
          await supabaseAdmin.from('hosting_services').update({ status: 'stopped', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
        } else {
          await ProvisioningEngine.restartService(targetServiceId);
          await supabaseAdmin.from('hosting_services').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
        }
      }

      return NextResponse.json({
        success: true,
        status: 'executed',
        riskTier: targetTier,
        message: `Action '${normAction}' on ${targetServiceId} executed successfully.`,
        gateway: gatewayResult,
      });
    }

    // Step-up authentication or confirmation required (Tier 1 confirmation / Tier 2 2FA)
    if (gatewayResult.status === 'require_confirmation' || gatewayResult.status === 'require_step_up_auth') {
      return NextResponse.json(gatewayResult, { status: 202 });
    }

    return NextResponse.json(gatewayResult, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
