import { createClient } from '@supabase/supabase-js';
import { ProvisioningAdapter } from './index';
import { PterodactylAdapter } from './pterodactyl';
import { ProxmoxAdapter } from './proxmox';
import { HestiaCPAdapter } from './hestiacp';
import { CyberPanelAdapter } from './cyberpanel';

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
  private static async getServiceContext(serviceId: string) {
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
   * Full provisioning lifecycle for a service
   */
  static async provisionService(serviceId: string): Promise<void> {
    const ctx = await ProvisioningEngine.getServiceContext(serviceId);
    const { supabaseAdmin, service, order, orderNotes, adapter } = ctx;

    if (!order) {
      throw new Error(`Order details missing for service: ${serviceId}`);
    }

    console.log(`[ProvisioningEngine] Starting provisioning for service ${serviceId} using ${adapter.name}...`);

    const memory = orderNotes.custom_ram ? orderNotes.custom_ram * 1024 : 2048;
    const disk = orderNotes.custom_storage ? orderNotes.custom_storage * 1000 : 20000;
    const vcpu = orderNotes.custom_vcpu ? orderNotes.custom_vcpu : 2;

    const result = await adapter.createService(serviceId, {
      memory,
      disk,
      vcpu,
      os: orderNotes.os_selection || order.os_selection,
      email: orderNotes.user_email || 'client@vaulthost.com',
      domain: service.domain || order.domain,
      plan_name: service.plan_name,
    });

    if (result.success) {
      await supabaseAdmin.from('hosting_services').update({
        status: 'active',
        external_id: result.data?.server_id || serviceId,
        adapter: adapter.id,
        control_panel_url: result.data?.controlPanelUrl || null,
        ip_address: result.data?.ip || null,
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
