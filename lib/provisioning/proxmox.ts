import { ProvisioningAdapter } from './index';

export class ProxmoxAdapter implements ProvisioningAdapter {
  id = 'proxmox';
  name = 'Proxmox VE';
  
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  private async fetchProxmox(endpoint: string, method: string, body?: any) {
    const pveUrl = this.config.proxmox_url;
    const pveTokenId = this.config.proxmox_token_id;
    const pveSecret = this.config.proxmox_secret;

    if (!pveUrl || !pveTokenId || !pveSecret) {
      throw new Error('Proxmox configuration is missing');
    }

    const res = await fetch(`${pveUrl}/api2/json${endpoint}`, {
      method,
      headers: {
        'Authorization': `PVEAPIToken=${pveTokenId}=${pveSecret}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return res;
  }

  async createService(orderId: string, params: Record<string, any>) {
    try {
      console.log(`[ProxmoxAdapter] Creating VPS for order ${orderId}`);
      console.log(`[ProxmoxAdapter] Params:`, params);

      if (!this.config.proxmox_url || !this.config.proxmox_token_id || !this.config.proxmox_secret) {
        throw new Error('Proxmox VE configuration is missing (url, token_id, or secret)');
      }

      const node = this.config.proxmox_node || 'pve';
      const templateId = 100; // Template VM ID
      const newVmId = 200 + parseInt(orderId.replace(/\D/g, '').slice(-3) || '0', 10); // Deterministic VM ID from order
      
      const cloneRes = await this.fetchProxmox(`/nodes/${node}/qemu/${templateId}/clone`, 'POST', {
        newid: newVmId,
        name: `vps-${orderId}`,
        full: 1
      });

      if (!cloneRes.ok) throw new Error(await cloneRes.text());
      return { success: true, data: { server_id: newVmId.toString() } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async suspendService(serviceId: string) {
    try {
      console.log(`[ProxmoxAdapter] Suspending VPS ${serviceId}`);
      if (!this.config.proxmox_url) throw new Error('Proxmox URL not configured');

      const node = this.config.proxmox_node || 'pve';
      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${serviceId}/status/suspend`, 'POST');
      if (!res.ok) throw new Error(await res.text());
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async terminateService(serviceId: string) {
    try {
      console.log(`[ProxmoxAdapter] Terminating VPS ${serviceId}`);
      if (!this.config.proxmox_url) throw new Error('Proxmox URL not configured');

      const node = this.config.proxmox_node || 'pve';
      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${serviceId}`, 'DELETE');
      if (!res.ok) throw new Error(await res.text());
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
