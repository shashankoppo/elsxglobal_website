import { ProvisioningAdapter } from './index';

export class CyberPanelAdapter implements ProvisioningAdapter {
  id = 'cyberpanel';
  name = 'CyberPanel';
  private config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  async createService(orderId: string, params: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`[CyberPanel] Creating account for ${params.domain} (Order ${orderId})`);
      
      if (!this.config.cyberpanel_url || !this.config.cyberpanel_admin_user || !this.config.cyberpanel_admin_pass) {
        throw new Error('CyberPanel configuration is missing');
      }

      const res = await fetch(`${this.config.cyberpanel_url}/api/createWebsite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: this.config.cyberpanel_admin_user,
          adminPass: this.config.cyberpanel_admin_pass,
          domainName: params.domain,
          ownerEmail: params.email || 'admin@example.com',
          package: 'Default',
          phpSelection: 'PHP 8.1'
        })
      });

      const data = await res.json();
      if (data.status === 1) {
        return { 
          success: true, 
          data: { 
            server_id: params.domain, 
            controlPanelUrl: this.config.cyberpanel_url
          } 
        };
      } else {
        throw new Error(`CyberPanel Error: ${data.error_message || 'Failed to create website'}`);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async suspendService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[CyberPanel] Suspending ${serviceId}`);
      if (!this.config.cyberpanel_url) throw new Error('CyberPanel URL not configured');

      const res = await fetch(`${this.config.cyberpanel_url}/api/suspendWebsite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: this.config.cyberpanel_admin_user,
          adminPass: this.config.cyberpanel_admin_pass,
          domainName: serviceId,
        })
      });
      const data = await res.json();
      if (data.status === 1) return { success: true };
      throw new Error(data.error_message || 'Failed to suspend website');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async terminateService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[CyberPanel] Terminating ${serviceId}`);
      if (!this.config.cyberpanel_url) throw new Error('CyberPanel URL not configured');

      const res = await fetch(`${this.config.cyberpanel_url}/api/deleteWebsite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: this.config.cyberpanel_admin_user,
          adminPass: this.config.cyberpanel_admin_pass,
          domainName: serviceId,
        })
      });
      const data = await res.json();
      if (data.status === 1) return { success: true };
      throw new Error(data.error_message || 'Failed to terminate website');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
