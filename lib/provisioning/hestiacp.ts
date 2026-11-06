import { ProvisioningAdapter } from './index';

export class HestiaCPAdapter implements ProvisioningAdapter {
  id = 'hestiacp';
  name = 'HestiaCP';
  private config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  private async executeCommand(cmd: string, args: string[]): Promise<any> {
    if (!this.config.hestiacp_url || !this.config.hestiacp_username || !this.config.hestiacp_password) {
      throw new Error('HestiaCP configuration is missing (url, username, or password)');
    }

    const formData = new URLSearchParams();
    formData.append('hash', `${this.config.hestiacp_username}:${this.config.hestiacp_password}`);
    formData.append('returncode', 'yes');
    formData.append('cmd', cmd);
    args.forEach((arg, i) => formData.append(`arg${i + 1}`, arg));

    const res = await fetch(`${this.config.hestiacp_url}/api/`, {
      method: 'POST',
      body: formData,
    });
    
    const text = await res.text();
    if (text.trim() === '0' || text.trim() === '') {
      return { success: true };
    } else {
      throw new Error(`HestiaCP Error: ${text}`);
    }
  }

  async createService(orderId: string, params: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[HestiaCP] Creating account for ${params.domain} (Order ${orderId})`);
      const username = `u${orderId.replace(/-/g, '').slice(0, 10)}`;
      const password = require('crypto').randomBytes(16).toString('hex');
      const pkg = 'default';

      await this.executeCommand('v-add-user', [username, password, params.email || 'admin@example.com', pkg, 'VaultHost', 'Client']);

      if (params.domain) {
        await this.executeCommand('v-add-web-domain', [username, params.domain]);
      }

      return { 
        success: true, 
        data: { 
          server_id: username, 
          controlPanelUrl: this.config.hestiacp_url,
          username,
          password
        } 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async suspendService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[HestiaCP] Suspending ${serviceId}`);
      await this.executeCommand('v-suspend-user', [serviceId]);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async terminateService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[HestiaCP] Terminating ${serviceId}`);
      await this.executeCommand('v-delete-user', [serviceId]);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
