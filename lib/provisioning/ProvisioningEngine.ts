import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { ProvisioningAdapter } from './index';
import { PterodactylAdapter } from './pterodactyl';
import { ProxmoxAdapter } from './proxmox';
import { HestiaCPAdapter } from './hestiacp';
import { CyberPanelAdapter } from './cyberpanel';
import { resolvePlan } from '@/lib/data/all-plans';

export interface ServiceMetrics {
  cpuPercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  networkInMbps: number;
  networkOutMbps: number;
  uptime: number; // seconds
  status: string;
}

export interface InfrastructureNode {
  id: string;
  hostname: string;
  api_key: string;
  provider_type: string;
  [key: string]: any;
}

export interface MetricsResult {
  cpu: number;
  ram: number;
  disk: number;
  network: { in: number; out: number };
  uptime?: number;
}

export class ProvisioningEngine {
  /**
   * Factory: returns the right adapter based on tier/panel
   */
  static getAdapter(tier: string, panel?: string, config?: any): ProvisioningAdapter {
    const safeConfig = config || {};
    const adapters: Record<string, ProvisioningAdapter> = {
      pterodactyl: new PterodactylAdapter(safeConfig),
      proxmox: new ProxmoxAdapter(safeConfig),
      hestiacp: new HestiaCPAdapter(safeConfig),
      cyberpanel: new CyberPanelAdapter(safeConfig),
    };

    if (panel && adapters[panel.toLowerCase()]) {
      return adapters[panel.toLowerCase()];
    }

    const normalizedTier = (tier || '').toLowerCase().trim();
    if (normalizedTier === 'vps' || normalizedTier === 'dedicated' || normalizedTier === 'cloud') {
      const vpsAdapterId = safeConfig.default_vps_adapter || 'proxmox';
      return adapters[vpsAdapterId] || adapters.proxmox;
    }
    if (normalizedTier === 'game') {
      const gameAdapterId = safeConfig.default_game_adapter || 'pterodactyl';
      return adapters[gameAdapterId] || adapters.pterodactyl;
    }

    const sharedAdapterId = safeConfig.default_shared_adapter || 'hestiacp';
    return adapters[sharedAdapterId] || adapters.hestiacp;
  }

  /**
   * Helper: Retrieve database client, service record, configuration, and resolved adapter
   */
  public static async getServiceContext(serviceId: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase server configuration error (missing URL or SERVICE_ROLE_KEY)');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: service, error } = await supabaseAdmin
      .from('hosting_services')
      .select('*, hosting_orders(*)')
      .eq('id', serviceId)
      .single();

    if (error || !service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    const { data: settings } = await supabaseAdmin
      .from('provisioning_settings')
      .select('*')
      .eq('id', 1)
      .single();

    const config = settings || {};

    let orderNotes: any = {};
    if (service.hosting_orders?.notes) {
      try {
        orderNotes = typeof service.hosting_orders.notes === 'string'
          ? JSON.parse(service.hosting_orders.notes)
          : service.hosting_orders.notes;
      } catch (e) {
        console.error('Failed to parse order notes:', e);
      }
    }

    const tier = service.tier || service.hosting_orders?.plan_tier || 'vps';
    const requestedPanel = service.adapter || orderNotes.panel_selection;
    const adapter = ProvisioningEngine.getAdapter(tier, requestedPanel, config);

    return {
      supabaseAdmin,
      service,
      order: service.hosting_orders,
      orderNotes,
      config,
      adapter,
      externalId: service.external_id || serviceId,
    };
  }

  /**
   * Resolve CPU / RAM (GB) / Disk (GB) from orderNotes custom sliders or plan specs
   */
  static async resolveServiceSpecs(
    supabaseAdmin: any,
    planId: string | null | undefined,
    orderNotes: any,
    existingSpecs?: any
  ): Promise<{ vcpu: number; ramGb: number; diskGb: number }> {
    const parseNum = (val: unknown, fallback: number): number => {
      if (typeof val === 'number' && !isNaN(val) && val > 0) return val;
      if (typeof val === 'string') {
        const m = val.match(/[\d.]+/);
        if (m) {
          const n = parseFloat(m[0]);
          if (/tb/i.test(val)) return Math.round(n * 1000);
          return Math.round(n);
        }
      }
      return fallback;
    };

    if (orderNotes?.custom_vcpu || orderNotes?.custom_ram || orderNotes?.custom_storage) {
      return {
        vcpu: Number(orderNotes.custom_vcpu) || 2,
        ramGb: Number(orderNotes.custom_ram) || 4,
        diskGb: Number(orderNotes.custom_storage) || 40,
      };
    }

    if (existingSpecs?.vcpu && existingSpecs?.ram_gb && existingSpecs?.disk_gb) {
      return {
        vcpu: Number(existingSpecs.vcpu),
        ramGb: Number(existingSpecs.ram_gb),
        diskGb: Number(existingSpecs.disk_gb),
      };
    }

    if (planId) {
      const { data: dbPlan } = await supabaseAdmin
        .from('hosting_plans')
        .select('cpu, ram, storage')
        .eq('id', planId)
        .maybeSingle();

      const resolved = dbPlan || resolvePlan(planId);
      if (resolved) {
        return {
          vcpu: parseNum((resolved as any).cpu, 2),
          ramGb: parseNum((resolved as any).ram, 4),
          diskGb: parseNum((resolved as any).storage, 40),
        };
      }
    }

    return { vcpu: 2, ramGb: 4, diskGb: 40 };
  }

  /**
   * Full provisioning lifecycle for a service
   */
  static async provisionService(serviceId: string): Promise<void> {
    const ctx = await ProvisioningEngine.getServiceContext(serviceId);
    const { supabaseAdmin, service, order, orderNotes, adapter } = ctx;

    if (!order) {
      throw new Error(`Order details missing for service: ${serviceId}`);
    }

    console.log(`[ProvisioningEngine] Starting provisioning for service ${serviceId} using ${adapter.name}...`);

    const specs = await ProvisioningEngine.resolveServiceSpecs(
      supabaseAdmin,
      order.plan_id,
      orderNotes,
      service.specs_json
    );
    const memory = specs.ramGb * 1024;
    const disk = specs.diskGb * 1000;
    const vcpu = specs.vcpu;

    const hostname =
      orderNotes.hostname ||
      service.hostname ||
      service.domain ||
      order.domain ||
      `srv-${serviceId.slice(0, 8)}.vaulthost.cloud`;

    const sshKey = orderNotes.ssh_public_key || service.ssh_public_key || undefined;
    const osTemplate = orderNotes.os_selection || order.os_selection || service.os_template || 'ubuntu-22.04';

    const result = await adapter.createService(serviceId, {
      memory,
      disk,
      vcpu,
      os: osTemplate,
      email: orderNotes.user_email || 'client@vaulthost.com',
      domain: service.domain || order.domain,
      hostname,
      ssh_key: sshKey,
      plan_name: service.plan_name,
    });

    if (result.success) {
      const ipAddress = result.data?.ip || service.ip_address || null;
      const sshPort = result.data?.ssh_port || service.ssh_port || 22;
      const username = result.data?.username || service.username || (adapter.id === 'proxmox' ? 'vaultuser' : 'root');
      const password = result.data?.password || service.password || null;
      const webConsoleUrl = result.data?.webConsoleUrl || result.data?.controlPanelUrl || service.web_console_url || null;
      const controlPanelUrl = result.data?.controlPanelUrl || service.control_panel_url || null;

      const accessEndpoints = {
        ...(typeof service.access_endpoints === 'object' && service.access_endpoints ? service.access_endpoints : {}),
        ssh: ipAddress ? `ssh ${username}@${ipAddress} -p ${sshPort}` : null,
        web_console: webConsoleUrl,
        control_panel: controlPanelUrl,
      };

      await supabaseAdmin.from('hosting_services').update({
        status: 'active',
        setup_status: 'ready',
        external_id: result.data?.server_id || serviceId,
        adapter: adapter.id,
        provisioning_mode: 'automated',
        control_panel_url: controlPanelUrl,
        web_console_url: webConsoleUrl,
        ip_address: ipAddress,
        hostname: result.data?.hostname || hostname,
        os_template: osTemplate,
        ssh_port: sshPort,
        ssh_public_key: sshKey || null,
        username,
        password,
        specs_json: {
          vcpu,
          ram_gb: specs.ramGb,
          disk_gb: specs.diskGb,
        },
        access_endpoints: accessEndpoints,
        updated_at: new Date().toISOString(),
      }).eq('id', serviceId);

      await supabaseAdmin.from('hosting_orders').update({
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('id', order.id);

      console.log(`[ProvisioningEngine] ✅ Service ${serviceId} provisioned successfully via ${adapter.name}.`);
    } else {
      console.error(`[ProvisioningEngine] ❌ Provisioning failed for service ${serviceId}: ${result.error}`);

      await supabaseAdmin.from('hosting_services').update({
        status: 'failed',
        setup_status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('id', serviceId);

      await supabaseAdmin.from('hosting_orders').update({
        status: 'provisioning_failed',
        notes: typeof order.notes === 'string'
          ? order.notes + `\n\nPROVISIONING ERROR: ${result.error}`
          : JSON.stringify({ ...orderNotes, error: result.error }),
        updated_at: new Date().toISOString(),
      }).eq('id', order.id);

      throw new Error(result.error || 'Provisioning failed');
    }
  }

  /**
   * Suspend / stop service
   */
  static async suspendService(serviceId: string): Promise<void> {
    const { supabaseAdmin, adapter, externalId } = await ProvisioningEngine.getServiceContext(serviceId);
    console.log(`[ProvisioningEngine] Suspending service ${serviceId} (external: ${externalId}) via ${adapter.name}`);

    const res = await adapter.suspendService(externalId);
    if (!res.success) {
      throw new Error(res.error || `Failed to suspend service ${serviceId}`);
    }

    await supabaseAdmin.from('hosting_services').update({
      status: 'stopped',
      updated_at: new Date().toISOString(),
    }).eq('id', serviceId);
  }

  /**
   * Terminate / destroy service
   */
  static async terminateService(serviceId: string): Promise<void> {
    const { supabaseAdmin, adapter, externalId } = await ProvisioningEngine.getServiceContext(serviceId);
    console.log(`[ProvisioningEngine] Terminating service ${serviceId} (external: ${externalId}) via ${adapter.name}`);

    const res = await adapter.terminateService(externalId);
    if (!res.success) {
      throw new Error(res.error || `Failed to terminate service ${serviceId}`);
    }

    await supabaseAdmin.from('hosting_services').update({
      status: 'terminated',
      updated_at: new Date().toISOString(),
    }).eq('id', serviceId);
  }

  /**
   * Restart service (Proxmox reboot or adapter restart)
   */
  static async restartService(serviceId: string): Promise<void> {
    const { supabaseAdmin, adapter, externalId } = await ProvisioningEngine.getServiceContext(serviceId);
    console.log(`[ProvisioningEngine] Restarting service ${serviceId} (external: ${externalId}) via ${adapter.name}`);

    if (adapter.restartService) {
      const res = await adapter.restartService(externalId);
      if (!res.success) {
        throw new Error(res.error || `Failed to restart service ${serviceId}`);
      }
    } else {
      // Fallback for adapters without dedicated reboot
      await adapter.suspendService(externalId);
    }

    await supabaseAdmin.from('hosting_services').update({
      status: 'active',
      updated_at: new Date().toISOString(),
    }).eq('id', serviceId);
  }

  /**
   * Snapshot service
   */
  static async snapshotService(serviceId: string, name: string): Promise<void> {
    const { supabaseAdmin, service, adapter, externalId } = await ProvisioningEngine.getServiceContext(serviceId);
    console.log(`[ProvisioningEngine] Creating snapshot '${name}' for service ${serviceId} via ${adapter.name}`);

    if (adapter.snapshotService) {
      const res = await adapter.snapshotService(externalId, name);
      if (!res.success) {
        throw new Error(res.error || `Failed to create snapshot for ${serviceId}`);
      }
    }

    // Persist in backup_snapshots table
    try {
      await supabaseAdmin.from('backup_snapshots').insert({
        service_id: serviceId,
        user_id: service.user_id,
        backup_type: 'snapshot',
        status: 'completed',
        storage_url: name,
        created_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.warn('[ProvisioningEngine] Could not record snapshot in backup_snapshots:', e.message);
    }
  }

  /**
   * Live service metrics query
   */
  static async getServiceMetrics(serviceId: string): Promise<ServiceMetrics> {
    const { adapter, externalId, service } = await ProvisioningEngine.getServiceContext(serviceId);

    if (adapter.getMetrics) {
      const res = await adapter.getMetrics(externalId);
      if (res.success && res.data) {
        const d = res.data;
        return {
          cpuPercent: Math.round(Number(d.cpu || 0) * 100),
          memoryUsedMb: Math.round(Number(d.mem || 0) / (1024 * 1024)),
          memoryTotalMb: Math.round(Number(d.maxmem || 2147483648) / (1024 * 1024)),
          diskUsedGb: Math.round(Number(d.disk || 0) / (1024 * 1024 * 1024)),
          diskTotalGb: Math.round(Number(d.maxdisk || 21474836480) / (1024 * 1024 * 1024)),
          networkInMbps: Number((((d.netin || 0) * 8) / 1000000).toFixed(2)),
          networkOutMbps: Number((((d.netout || 0) * 8) / 1000000).toFixed(2)),
          uptime: Number(d.uptime || 0),
          status: String(d.status || service.status || 'unknown'),
        };
      }
    }

    return {
      cpuPercent: 0,
      memoryUsedMb: 0,
      memoryTotalMb: 2048,
      diskUsedGb: 0,
      diskTotalGb: 20,
      networkInMbps: 0,
      networkOutMbps: 0,
      uptime: 0,
      status: service.status || 'active',
    };
  }

  /**
   * Status check: query the adapter for current status of a service
   */
  static async getServiceStatus(serviceId: string): Promise<'active' | 'stopped' | 'error' | 'unknown'> {
    try {
      const { adapter, externalId, service } = await ProvisioningEngine.getServiceContext(serviceId);

      if (adapter.getMetrics) {
        const res = await adapter.getMetrics(externalId);
        if (res.success && res.data?.status) {
          const s = res.data.status.toLowerCase();
          if (s === 'running' || s === 'active') return 'active';
          if (s === 'stopped' || s === 'paused') return 'stopped';
        }
      }

      const st = (service.status || '').toLowerCase();
      if (st === 'active' || st === 'running') return 'active';
      if (st === 'stopped' || st === 'suspended') return 'stopped';
      if (st === 'failed' || st === 'error') return 'error';

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Inject or rotate SSH public key for a dedicated/VPS instance
   */
  static async updateSshKey(serviceId: string, sshPublicKey: string): Promise<{ success: boolean; syncedToBackend: boolean; error?: string }> {
    const ctx = await ProvisioningEngine.getServiceContext(serviceId);
    const { supabaseAdmin, adapter, externalId, config } = ctx;
    let syncedToBackend = false;

    if (adapter instanceof ProxmoxAdapter && config?.proxmox_url && config?.proxmox_token_secret) {
      const res = await adapter.updateVMConfig(externalId, {
        sshkeys: encodeURIComponent(sshPublicKey.trim()),
      });
      if (res.success) syncedToBackend = true;
    }

    const { error } = await supabaseAdmin
      .from('hosting_services')
      .update({
        ssh_public_key: sshPublicKey.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId);

    if (error) return { success: false, syncedToBackend, error: error.message };
    return { success: true, syncedToBackend };
  }

  /**
   * Reset OS login / SSH password and persist in DB (+ Proxmox Cloud-Init when configured)
   */
  static async resetPassword(serviceId: string, providedPassword?: string): Promise<{ success: boolean; password?: string; syncedToBackend: boolean; error?: string }> {
    const ctx = await ProvisioningEngine.getServiceContext(serviceId);
    const { supabaseAdmin, adapter, externalId, config } = ctx;
    const newPassword = (providedPassword && providedPassword.trim().length >= 8)
      ? providedPassword.trim()
      : `Vh#${crypto.randomBytes(8).toString('hex')}!`;
    let syncedToBackend = false;

    if (adapter instanceof ProxmoxAdapter && config?.proxmox_url && config?.proxmox_token_secret) {
      const res = await adapter.updateVMConfig(externalId, {
        cipassword: newPassword,
      });
      if (res.success) syncedToBackend = true;
    }

    const { error } = await supabaseAdmin
      .from('hosting_services')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId);

    if (error) return { success: false, syncedToBackend, error: error.message };
    return { success: true, password: newPassword, syncedToBackend };
  }

  /**
   * Update hostname / rDNS label
   */
  static async updateHostname(serviceId: string, hostname: string): Promise<{ success: boolean; syncedToBackend: boolean; error?: string }> {
    const cleanHost = hostname.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '');
    if (!cleanHost) return { success: false, syncedToBackend: false, error: 'Invalid hostname' };

    const ctx = await ProvisioningEngine.getServiceContext(serviceId);
    const { supabaseAdmin, adapter, externalId, config } = ctx;
    let syncedToBackend = false;

    if (adapter instanceof ProxmoxAdapter && config?.proxmox_url && config?.proxmox_token_secret) {
      const res = await adapter.updateVMConfig(externalId, {
        name: cleanHost.slice(0, 63),
      });
      if (res.success) syncedToBackend = true;
    }

    const { error } = await supabaseAdmin
      .from('hosting_services')
      .update({
        hostname: cleanHost,
        domain: cleanHost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId);

    if (error) return { success: false, syncedToBackend, error: error.message };
    return { success: true, syncedToBackend };
  }

  /**
   * Trigger OS reinstall with new OS template selection
   */
  static async reinstallOS(serviceId: string, osTemplate: string): Promise<{ success: boolean; error?: string }> {
    const ctx = await ProvisioningEngine.getServiceContext(serviceId);
    const { supabaseAdmin } = ctx;

    await supabaseAdmin
      .from('hosting_services')
      .update({
        os_template: osTemplate,
        setup_status: 'reinstalling',
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId);

    try {
      await ProvisioningEngine.provisionService(serviceId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Reinstall queued for manual completion' };
    }
  }

  /**
   * Save firewall / security group port rules to DB
   */
  static async updateFirewallRules(serviceId: string, rules: any[]): Promise<{ success: boolean; error?: string }> {
    const ctx = await ProvisioningEngine.getServiceContext(serviceId);
    const { supabaseAdmin } = ctx;

    const { error } = await supabaseAdmin
      .from('hosting_services')
      .update({
        firewall_rules: Array.isArray(rules) ? rules : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Backward compatibility instance methods for portal routes
  async getMetrics(
    providerType: string,
    node: InfrastructureNode,
    externalId: string
  ): Promise<MetricsResult> {
    console.log(`[ProvisioningEngine] getMetrics for ${providerType}/${externalId} on ${node?.hostname}`);
    return {
      cpu: 0,
      ram: 0,
      disk: 0,
      network: { in: 0, out: 0 },
      uptime: 100,
    };
  }

  async suspend(
    providerType: string,
    node: InfrastructureNode,
    externalId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log(`[ProvisioningEngine] Suspending ${externalId} on ${providerType}/${node?.hostname}`);
    return { success: true };
  }

  async unsuspend(
    providerType: string,
    node: InfrastructureNode,
    externalId: string
  ): Promise<{ success: boolean; error?: string }> {
    console.log(`[ProvisioningEngine] Unsuspending ${externalId} on ${providerType}/${node?.hostname}`);
    return { success: true };
  }
}

export const engine = new ProvisioningEngine();
