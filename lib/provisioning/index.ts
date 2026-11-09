/**
 * VaultHost Provisioning Engine
 * 
 * An extensible architecture to handle server and service provisioning.
 */

export interface ProvisioningAdapter {
  id: string;
  name: string;
  createService(serviceId: string, params: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }>;
  suspendService(serviceId: string): Promise<{ success: boolean; error?: string }>;
  terminateService(serviceId: string): Promise<{ success: boolean; error?: string }>;
  restartService?(serviceId: string): Promise<{ success: boolean; error?: string }>;
  snapshotService?(serviceId: string, snapshotName: string): Promise<{ success: boolean; data?: any; error?: string }>;
  listSnapshots?(serviceId: string): Promise<{ success: boolean; data?: any; error?: string }>;
  getMetrics?(serviceId: string): Promise<{ success: boolean; data?: any; error?: string }>;
}

import { PterodactylAdapter } from './pterodactyl';
import { ProxmoxAdapter } from './proxmox';
import { HestiaCPAdapter } from './hestiacp';
import { CyberPanelAdapter } from './cyberpanel';
import { createClient } from '@supabase/supabase-js';

export { ProvisioningEngine, type ServiceMetrics } from './ProvisioningEngine';

/**
 * Triggered by the Fulfillment Engine (Phase 2)
 */
export async function provisionService(serviceId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error');
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Fetch service and order details
  const { data: service, error } = await supabaseAdmin
    .from('hosting_services')
    .select('*, hosting_orders(*)')
    .eq('id', serviceId)
    .single();

  if (error || !service) {
    throw new Error(`Service not found: ${serviceId}`);
  }

  const order = service.hosting_orders;
  if (!order) {
    throw new Error(`Order details missing for service: ${serviceId}`);
  }

  let orderNotes: any = {};
  try {
    if (order.notes) {
      orderNotes = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
    }
  } catch (e) {
    console.error('Failed to parse order notes in provisioning:', e);
  }

  // 2. Fetch provisioning settings from database
  const { data: settings } = await supabaseAdmin
    .from('provisioning_settings')
    .select('*')
    .eq('id', 1)
    .single();

  const config = settings || {};

  // 3. Initialize adapters with config
  const adapters: Record<string, ProvisioningAdapter> = {
    pterodactyl: new PterodactylAdapter(config),
    proxmox: new ProxmoxAdapter(config),
    hestiacp: new HestiaCPAdapter(config),
    cyberpanel: new CyberPanelAdapter(config)
  };

  // 4. Determine adapter based on plan tier (from service or order)
  const tier = service.tier || order.plan_tier || 'shared';
  
  // Also check if the user selected a specific panel in notes
  const requestedPanel = orderNotes.panel_selection;
  let adapterId = 'hestiacp'; // Default fallback

  if (requestedPanel && adapters[requestedPanel]) {
    adapterId = requestedPanel;
  } else if (tier === 'vps' || tier === 'dedicated' || tier === 'cloud') {
    adapterId = config.default_vps_adapter || 'proxmox';
  } else if (tier === 'game') {
    adapterId = config.default_game_adapter || 'pterodactyl';
  } else {
    adapterId = config.default_shared_adapter || 'cyberpanel';
  }

  const adapter = adapters[adapterId];

  if (!adapter) {
    throw new Error(`No provisioning adapter found for ${adapterId}`);
  }

  console.log(`Starting provisioning for service ${serviceId} using ${adapter.name}...`);
  
  // Extract custom specs if this was a custom plan, or default to standard specs
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
    // Update the hosting_service record
    await supabaseAdmin.from('hosting_services').update({
      status: 'active',
      external_id: result.data?.server_id || serviceId,
      adapter: adapterId,
      control_panel_url: result.data?.controlPanelUrl || null,
    }).eq('id', serviceId);

    // Mark order as active/completed
    await supabaseAdmin.from('hosting_orders').update({
      status: 'active',
      updated_at: new Date().toISOString()
    }).eq('id', order.id);

    console.log(`✅ Service ${serviceId} provisioned successfully via ${adapter.name}.`);
  } else {
    console.error(`❌ Provisioning failed for service ${serviceId}: ${result.error}`);
    
    // Update service status to failed
    await supabaseAdmin.from('hosting_services').update({
      status: 'failed',
    }).eq('id', serviceId);

    // Update order status so admin can review
    await supabaseAdmin.from('hosting_orders').update({
      status: 'provisioning_failed',
      notes: typeof order.notes === 'string' ? order.notes + `\n\nPROVISIONING ERROR: ${result.error}` : JSON.stringify({ ...orderNotes, error: result.error }),
      updated_at: new Date().toISOString()
    }).eq('id', order.id);
  }
}
