import { ProvisioningAdapter } from './index';

export class PterodactylAdapter implements ProvisioningAdapter {
  id = 'pterodactyl';
  name = 'Pterodactyl Panel';

  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  private async fetchPanel(endpoint: string, method: string, body?: any) {
    const pteroUrl = this.config.pterodactyl_url;
    const pteroKey = this.config.pterodactyl_api_key;

    if (!pteroUrl || !pteroKey) {
      throw new Error('Pterodactyl configuration missing in database');
    }

    const res = await fetch(`${pteroUrl}/api/application${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${pteroKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return res;
  }

  async createService(orderId: string, params: Record<string, any>) {
    try {
      // 1. Get or create user in Pterodactyl
      // (This is a simplified example. In reality, you'd check if user exists by email)
      
      console.log(`[PterodactylAdapter] Creating server for order ${orderId}`);
      console.log(`[PterodactylAdapter] Params:`, params);

      if (!this.config.pterodactyl_url || !this.config.pterodactyl_api_key) {
        throw new Error('Pterodactyl configuration missing (url or api_key)');
      }

      // Create a unique user for this order if we don't have a lookup system
      const username = `u${orderId.replace(/-/g, '').slice(0, 8)}`;
      const userRes = await this.fetchPanel('/users', 'POST', {
        email: params.email || 'admin@example.com',
        username: username,
        first_name: 'VaultHost',
        last_name: 'Client',
        password: require('crypto').randomBytes(16).toString('hex')
      });
      
      let pteroUserId = 1;
      if (userRes.ok) {
        const userData = await userRes.json();
        pteroUserId = userData.attributes.id;
      }

      const serverRes = await this.fetchPanel('/servers', 'POST', {
        name: `Server for Order ${orderId}`,
        user: pteroUserId,
        egg: 1, // Default egg (e.g., Minecraft Paper)
        docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
        startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar',
        environment: { SERVER_MEMORY: params.memory || 2048 },
        limits: {
          memory: params.memory || 2048,
          swap: 0,
          disk: params.disk || 20000,
          io: 500,
          cpu: 100
        },
        feature_limits: { databases: 1, backups: 1 },
        allocation: { default: 1 } // Requires a valid allocation ID
      });

      if (!serverRes.ok) throw new Error(await serverRes.text());
      const serverData = await serverRes.json();
      return { success: true, data: { server_id: serverData.attributes.id.toString() } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async suspendService(serviceId: string) {
    try {
      console.log(`[PterodactylAdapter] Suspending server ${serviceId}`);
      if (!this.config.pterodactyl_url) throw new Error('Pterodactyl URL not configured');

      const res = await this.fetchPanel(`/servers/${serviceId}/suspend`, 'POST');
      if (!res.ok) throw new Error(await res.text());
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async terminateService(serviceId: string) {
    try {
      console.log(`[PterodactylAdapter] Terminating server ${serviceId}`);
      if (!this.config.pterodactyl_url) throw new Error('Pterodactyl URL not configured');

      const res = await this.fetchPanel(`/servers/${serviceId}`, 'DELETE');
      if (!res.ok) throw new Error(await res.text());
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
