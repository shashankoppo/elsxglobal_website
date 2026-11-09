import { ProvisioningAdapter } from './index';
import crypto from 'crypto';

export interface ProxmoxVM {
  vmid: number;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  cpus: number;
  memory: number; // MB
  disk: string;
  node: string;
  uptime?: number;
  ip?: string;
}

export interface ProxmoxTask {
  upid: string; // Proxmox task ID
  status: 'running' | 'stopped';
  exitstatus?: string;
}

export const PROXMOX_OS_TEMPLATE_MAP: Record<string, number> = {
  'ubuntu-22.04': 9000,
  'ubuntu-24.04': 9001,
  'debian-12':    9002,
  'rocky-linux-9':  9003,
  'almalinux-9':  9004,
  'fedora-39':    9005,
  'windows-server-2022': 9010,
  'default':      9000, // fallback to Ubuntu 22.04
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ProxmoxAdapter implements ProvisioningAdapter {
  id = 'proxmox';
  name = 'Proxmox VE';
  private config: any;

  constructor(config: any) {
    this.config = config || {};
  }

  /**
   * Helper: Convert serviceId to a Proxmox VMID
   */
  public getVMId(serviceId: string): number {
    if (!serviceId) return 200;
    // If it's already an integer string (e.g. "205"), parse directly
    if (/^\d+$/.test(serviceId.trim())) {
      const parsed = parseInt(serviceId.trim(), 10);
      if (parsed > 0) return parsed;
    }
    // For UUIDs or alphanumeric identifiers, deterministically map to range [200, 999]
    const digitsOnly = serviceId.replace(/\D/g, '');
    const numPart = parseInt(digitsOnly.slice(-4) || '100', 10);
    return 200 + (numPart % 800);
  }

  /**
   * Helper: Perform authenticated request against Proxmox VE REST API
   */
  private async fetchProxmox(endpoint: string, method: string, body?: any): Promise<Response> {
    let pveUrl = this.config.proxmox_url;
    const pveTokenId = this.config.proxmox_token_id;
    const pveSecret = this.config.proxmox_secret;

    if (!pveUrl || !pveTokenId || !pveSecret) {
      throw new Error('Proxmox VE configuration is missing (proxmox_url, proxmox_token_id, or proxmox_secret)');
    }

    if (!pveUrl.startsWith('http://') && !pveUrl.startsWith('https://')) {
      pveUrl = `https://${pveUrl}`;
    }
    pveUrl = pveUrl.replace(/\/+$/, '');

    const url = `${pveUrl}/api2/json${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Authorization': `PVEAPIToken=${pveTokenId}=${pveSecret}`,
      'Accept': 'application/json',
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body && method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
    });

    return res;
  }

  /**
   * Helper: Wait for a Proxmox task (UPID) to complete
   */
  public async waitForTask(upid: string, timeoutMs: number = 120000): Promise<ProxmoxTask> {
    const node = this.config.proxmox_node || 'pve';
    const startTime = Date.now();
    const encodedUpid = encodeURIComponent(upid);

    while (Date.now() - startTime < timeoutMs) {
      await sleep(2000);
      try {
        const res = await this.fetchProxmox(`/nodes/${node}/tasks/${encodedUpid}/status`, 'GET');
        if (!res.ok) {
          continue;
        }
        const json = await res.json();
        const taskData = json.data || json;
        const status = taskData.status as 'running' | 'stopped';
        const exitstatus = taskData.exitstatus;

        if (status === 'stopped') {
          if (exitstatus && exitstatus !== 'OK') {
            throw new Error(`Proxmox task failed: ${exitstatus}`);
          }
          return {
            upid,
            status: 'stopped',
            exitstatus: exitstatus || 'OK',
          };
        }
      } catch (err: any) {
        if (err.message && err.message.includes('Proxmox task failed')) {
          throw err;
        }
        console.warn(`[ProxmoxAdapter] Polling task ${upid} warning:`, err.message);
      }
    }

    throw new Error(`Proxmox task ${upid} timed out after ${timeoutMs / 1000}s`);
  }

  /**
   * Helper: Query QEMU guest agent for VM IP address
   */
  public async getIP(node: string, vmid: number): Promise<string | undefined> {
    try {
      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/agent/network-get-interfaces`, 'GET');
      if (!res.ok) return undefined;

      const data = await res.json();
      const interfaces = data.data?.result || data.result || data.data;

      if (!Array.isArray(interfaces)) return undefined;

      for (const iface of interfaces) {
        if (!iface || iface.name === 'lo') continue;
        const ipAddresses = iface['ip-addresses'] || [];
        for (const addr of ipAddresses) {
          if (
            addr['ip-address-type'] === 'ipv4' &&
            addr['ip-address'] &&
            !addr['ip-address'].startsWith('127.')
          ) {
            return addr['ip-address'];
          }
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Full VPS Lifecycle: createService
   */
  async createService(orderId: string, params: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[ProxmoxAdapter] Creating VPS for order ${orderId}`);
      console.log(`[ProxmoxAdapter] Parameters:`, params);

      const node = this.config.proxmox_node || 'pve';

      // 1. Determine template VM ID from OS selection
      const osSelection = (params.os || params.os_selection || '').toLowerCase().trim();
      const templateMap = this.config.proxmox_template_map || {};
      let templateId: number = templateMap[osSelection] || PROXMOX_OS_TEMPLATE_MAP[osSelection];
      if (!templateId) {
        templateId = this.config.proxmox_template_id ? parseInt(this.config.proxmox_template_id, 10) : PROXMOX_OS_TEMPLATE_MAP['default'];
      }

      // 2. Determine new VM ID
      let newVmId = this.getVMId(orderId);
      try {
        const nextIdRes = await this.fetchProxmox('/cluster/nextid', 'GET');
        if (nextIdRes.ok) {
          const nextIdJson = await nextIdRes.json();
          const candidate = parseInt(nextIdJson.data || nextIdJson, 10);
          if (candidate && candidate >= 100) {
            newVmId = candidate;
          }
        }
      } catch (err: any) {
        console.warn('[ProxmoxAdapter] /cluster/nextid failed, falling back to deterministic VMID:', err.message);
      }

      const vmName = `vps-${orderId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 16)}`;

      // 2. Clone template VM with qemu clone API
      const clonePayload: Record<string, any> = {
        newid: newVmId,
        name: vmName,
        full: 1,
      };

      const cloneRes = await this.fetchProxmox(`/nodes/${node}/qemu/${templateId}/clone`, 'POST', clonePayload);
      if (!cloneRes.ok) {
        const errText = await cloneRes.text();
        throw new Error(`Failed to clone template ${templateId}: ${errText}`);
      }

      const cloneJson = await cloneRes.json();
      const cloneUpid = cloneJson.data;

      // 3. Wait for clone task to complete
      if (cloneUpid) {
        console.log(`[ProxmoxAdapter] Waiting for clone UPID: ${cloneUpid}`);
        await this.waitForTask(cloneUpid, 120000);
      }

      // 4. Configure VM: memory, cores, disk resize
      const memoryMb = params.memory || 2048;
      const cores = params.vcpu || 2;

      const configRes = await this.fetchProxmox(`/nodes/${node}/qemu/${newVmId}/config`, 'POST', {
        memory: memoryMb,
        cores,
      });
      if (!configRes.ok) {
        console.warn(`[ProxmoxAdapter] Failed to update memory/cores config for VM ${newVmId}`);
      }

      // Optional disk resize
      if (params.disk) {
        try {
          const diskSizeGb = typeof params.disk === 'number'
            ? Math.max(1, Math.round(params.disk > 1000 ? params.disk / 1000 : params.disk))
            : parseInt(params.disk, 10) || 20;

          await this.fetchProxmox(`/nodes/${node}/qemu/${newVmId}/resize`, 'PUT', {
            disk: 'scsi0',
            size: `+${diskSizeGb}G`,
          });
        } catch (resizeErr: any) {
          console.warn('[ProxmoxAdapter] Disk resize notice (non-fatal):', resizeErr.message);
        }
      }

      // 5. Set cloud-init: user, password, ipconfig0=dhcp
      const ciuser = params.username || 'vaultuser';
      const cipassword = params.password || crypto.randomBytes(12).toString('hex');
      const cloudInitPayload: Record<string, any> = {
        ciuser,
        cipassword,
        ipconfig0: 'ip=dhcp',
      };
      if (params.ssh_key) {
        cloudInitPayload.sshkeys = encodeURIComponent(params.ssh_key);
      }

      await this.fetchProxmox(`/nodes/${node}/qemu/${newVmId}/config`, 'POST', cloudInitPayload);

      // 6. Start VM
      const startRes = await this.fetchProxmox(`/nodes/${node}/qemu/${newVmId}/status/start`, 'POST');
      if (!startRes.ok) {
        const startErr = await startRes.text();
        console.warn(`[ProxmoxAdapter] VM start warning: ${startErr}`);
      }

      // 7. Wait 15s for boot, then try to get IP from qemu-agent
      await sleep(15000);
      const ip = await this.getIP(node, newVmId);

      // 8. Return success with server_id = vmid.toString(), controlPanelUrl
      const cleanUrl = (this.config.proxmox_url || '').replace(/\/+$/, '');
      const controlPanelUrl = `${cleanUrl}/#v1:0:=qemu/${newVmId}`;

      return {
        success: true,
        data: {
          server_id: newVmId.toString(),
          vmid: newVmId,
          ip: ip || null,
          controlPanelUrl,
          username: ciuser,
          password: cipassword,
        },
      };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] createService error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * suspendService: stop VM
   */
  async suspendService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[ProxmoxAdapter] Suspending VPS ${serviceId}`);
      const node = this.config.proxmox_node || 'pve';
      const vmid = this.getVMId(serviceId);

      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/stop`, 'POST');
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return { success: true };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] suspendService error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * terminateService: stop + destroy VM
   */
  async terminateService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[ProxmoxAdapter] Terminating VPS ${serviceId}`);
      const node = this.config.proxmox_node || 'pve';
      const vmid = this.getVMId(serviceId);

      // 1. Stop VM
      try {
        await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/stop`, 'POST');
      } catch (stopErr: any) {
        console.warn(`[ProxmoxAdapter] Stop prior to delete warning for ${vmid}:`, stopErr.message);
      }

      // 2. Wait 10s
      await sleep(10000);

      // 3. Destroy VM
      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}`, 'DELETE');
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return { success: true };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] terminateService error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * restartService: reboot VM
   */
  async restartService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[ProxmoxAdapter] Restarting VPS ${serviceId}`);
      const node = this.config.proxmox_node || 'pve';
      const vmid = this.getVMId(serviceId);

      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/reboot`, 'POST');
      if (!res.ok) {
        // Fallback to start if already stopped
        const startRes = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/start`, 'POST');
        if (!startRes.ok) {
          throw new Error(await res.text());
        }
      }
      return { success: true };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] restartService error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * snapshotService: create snapshot
   */
  async snapshotService(serviceId: string, snapshotName: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[ProxmoxAdapter] Creating snapshot '${snapshotName}' for VPS ${serviceId}`);
      const node = this.config.proxmox_node || 'pve';
      const vmid = this.getVMId(serviceId);

      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/snapshot`, 'POST', {
        snapname: snapshotName,
        description: `Snapshot created via VaultHost API at ${new Date().toISOString()}`,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      return { success: true, data: json.data || json };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] snapshotService error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * listSnapshots: list snapshots for VM
   */
  async listSnapshots(serviceId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const node = this.config.proxmox_node || 'pve';
      const vmid = this.getVMId(serviceId);

      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/snapshot`, 'GET');
      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      const snapshots = json.data || json;
      return { success: true, data: snapshots };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] listSnapshots error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * getMetrics: live VM metrics
   */
  async getMetrics(serviceId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const node = this.config.proxmox_node || 'pve';
      const vmid = this.getVMId(serviceId);

      const res = await this.fetchProxmox(`/nodes/${node}/qemu/${vmid}/status/current`, 'GET');
      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      const current = json.data || json;
      const ip = await this.getIP(node, vmid);

      return {
        success: true,
        data: {
          cpu: current.cpu || 0,
          mem: current.mem || 0,
          maxmem: current.maxmem || 2147483648,
          disk: current.disk || 0,
          maxdisk: current.maxdisk || 21474836480,
          netin: current.netin || 0,
          netout: current.netout || 0,
          uptime: current.uptime || 0,
          status: current.status || 'unknown',
          ip,
        },
      };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] getMetrics error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * listVMs: query all VMs with filter name starts with 'vps-'
   */
  async listVMs(): Promise<{ success: boolean; data?: ProxmoxVM[]; error?: string }> {
    try {
      const node = this.config.proxmox_node || 'pve';
      const res = await this.fetchProxmox(`/nodes/${node}/qemu`, 'GET');
      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);

      const vms: ProxmoxVM[] = rawList
        .filter((vm: any) => vm && typeof vm.name === 'string' && vm.name.startsWith('vps-'))
        .map((vm: any) => ({
          vmid: vm.vmid,
          name: vm.name,
          status: vm.status === 'running' ? 'running' : (vm.status === 'paused' ? 'paused' : 'stopped'),
          cpus: vm.cpus || 1,
          memory: Math.round((vm.maxmem || 0) / (1024 * 1024)),
          disk: `${Math.round((vm.maxdisk || 0) / (1024 * 1024 * 1024))}GB`,
          node,
          uptime: vm.uptime,
        }));

      return { success: true, data: vms };
    } catch (error: any) {
      console.error('[ProxmoxAdapter] listVMs error:', error);
      return { success: false, error: error.message };
    }
  }
}
