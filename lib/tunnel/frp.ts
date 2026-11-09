import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export interface Tunnel {
  id: string;
  userId: string;
  name: string;
  subdomain: string;
  protocol: 'http' | 'https' | 'tcp' | 'udp';
  localPort?: number;
  remotePort?: number;
  status: 'online' | 'offline' | 'provisioning';
  createdAt: string;
  publicUrl: string;
  token: string; // frpc config token
}

export interface FRPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * FRP (Fast Reverse Proxy) Server Manager.
 * Orchestrates customer tunnels, generates frpc client configs, and checks proxy status via FRP Admin API.
 */
export class FRPClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the FRP client.
   * @param config Optional initial configuration object (e.g. from provisioning_settings).
   */
  constructor(config?: Record<string, any>) {
    this.config = config ? { ...config } : {};
  }

  /**
   * Resolves a configuration value from explicit config, Supabase provisioning_settings row id=1, or environment variables.
   */
  private async getConfigValue(key: string, envVar?: string): Promise<string | undefined> {
    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (!this.configLoaded) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const { data } = await supabase.from('provisioning_settings').select('*').eq('id', 1).single();
          if (data) {
            this.config = { ...data, ...this.config };
          }
        }
      } catch (err: any) {
        console.warn('[FRPClient] Failed to load configuration from Supabase:', err.message);
      }
      this.configLoaded = true;
    }

    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (envVar && process.env[envVar] !== undefined && process.env[envVar] !== '') {
      return process.env[envVar];
    }

    return undefined;
  }

  /**
   * Returns a Supabase Admin client instance.
   */
  private getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase admin configuration missing (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Executes an authenticated request to the FRP Admin REST API.
   * @param endpoint API subpath (e.g. /api/proxy/http)
   * @param method HTTP method
   * @param body Optional request body
   */
  private async fetchAdminAPI(endpoint: string, method: string = 'GET', body?: any): Promise<Response> {
    const rawUrl = (await this.getConfigValue('frp_server_url', 'FRP_SERVER_URL')) || 'http://localhost:7400';
    const token = (await this.getConfigValue('frp_server_token', 'FRP_SERVER_TOKEN')) || '';

    const baseUrl = rawUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      const authCredentials = token.includes(':') ? token : `admin:${token}`;
      const base64Auth = Buffer.from(authCredentials).toString('base64');
      headers['Authorization'] = `Basic ${base64Auth}`;
      headers['X-FRP-Token'] = token;
    }

    return fetch(`${baseUrl}${cleanEndpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Generates a customer `.toml` configuration string for frpc.
   * @param tunnel Tunnel configuration details
   */
  generateFrpcConfig(tunnel: Tunnel): string {
    const serverUrl = this.config.frp_server_url || process.env.FRP_SERVER_URL || 'http://frp.vaulthost.cloud:7400';
    let serverHost = 'frp.vaulthost.cloud';
    try {
      const parsed = new URL(serverUrl.startsWith('http') ? serverUrl : `http://${serverUrl}`);
      serverHost = parsed.hostname || serverHost;
    } catch {
      serverHost = serverUrl.split(':')[0] || 'frp.vaulthost.cloud';
    }

    const baseDomain = this.config.frp_base_domain || process.env.FRP_BASE_DOMAIN || 'tunnel.vaulthost.cloud';

    if (tunnel.protocol === 'http' || tunnel.protocol === 'https') {
      return [
        '[common]',
        `server_addr = "${serverHost}"`,
        'server_port = 7000',
        `token = "${tunnel.token}"`,
        '',
        `[${tunnel.name}]`,
        `type = "${tunnel.protocol}"`,
        `local_port = ${tunnel.localPort || 3000}`,
        `custom_domains = ["${tunnel.subdomain}.${baseDomain}"]`,
      ].join('\n');
    }

    return [
      '[common]',
      `server_addr = "${serverHost}"`,
      'server_port = 7000',
      `token = "${tunnel.token}"`,
      '',
      `[${tunnel.name}]`,
      `type = "${tunnel.protocol}"`,
      `local_port = ${tunnel.localPort || 3000}`,
      `remote_port = ${tunnel.remotePort || 0}`,
    ].join('\n');
  }

  /**
   * Creates a new tunnel record in the database and generates customer connection config.
   * @param userId Owner user ID
   * @param opts Tunnel configuration options
   */
  async createTunnel(
    userId: string,
    opts: {
      name: string;
      protocol: 'http' | 'https' | 'tcp' | 'udp';
      subdomain?: string;
      localPort?: number;
      remotePort?: number;
    }
  ): Promise<FRPResponse<{ tunnel: Tunnel; configToml: string }>> {
    try {
      const baseDomain = (await this.getConfigValue('frp_base_domain', 'FRP_BASE_DOMAIN')) || 'tunnel.vaulthost.cloud';
      const subdomain = (opts.subdomain || opts.name).toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const token = crypto.randomBytes(16).toString('hex');
      const tunnelId = crypto.randomUUID();

      let publicUrl = `https://${subdomain}.${baseDomain}`;
      if (opts.protocol === 'tcp' || opts.protocol === 'udp') {
        publicUrl = `${baseDomain}:${opts.remotePort || 7000}`;
      }

      const tunnel: Tunnel = {
        id: tunnelId,
        userId,
        name: opts.name,
        subdomain,
        protocol: opts.protocol,
        localPort: opts.localPort || 3000,
        remotePort: opts.remotePort,
        status: 'provisioning',
        createdAt: new Date().toISOString(),
        publicUrl,
        token,
      };

      try {
        const supabase = this.getSupabaseAdmin();
        const { error: dbError } = await supabase.from('cloud_tunnels').upsert({
          id: tunnel.id,
          user_id: tunnel.userId,
          name: tunnel.name,
          subdomain: tunnel.subdomain,
          protocol: tunnel.protocol,
          local_port: tunnel.localPort,
          remote_port: tunnel.remotePort,
          status: tunnel.status,
          public_url: tunnel.publicUrl,
          token: tunnel.token,
          created_at: tunnel.createdAt,
        });

        if (dbError) {
          console.warn('[FRPClient] Supabase save warning:', dbError.message);
        }
      } catch (err: any) {
        console.warn('[FRPClient] Supabase exception during createTunnel:', err.message);
      }

      const configToml = this.generateFrpcConfig(tunnel);

      return {
        success: true,
        data: {
          tunnel,
          configToml,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating tunnel' };
    }
  }

  /**
   * Deletes a tunnel from FRP server and removes it from the database.
   * @param tunnelId Unique identifier of the tunnel
   */
  async deleteTunnel(tunnelId: string): Promise<FRPResponse<void>> {
    try {
      let tunnelName = tunnelId;
      try {
        const supabase = this.getSupabaseAdmin();
        const { data } = await supabase.from('cloud_tunnels').select('name').eq('id', tunnelId).single();
        if (data && data.name) {
          tunnelName = data.name;
        }

        await supabase.from('cloud_tunnels').delete().eq('id', tunnelId);
      } catch (err: any) {
        console.warn('[FRPClient] DB delete warning:', err.message);
      }

      // Call FRP admin API to remove proxy
      try {
        const res = await this.fetchAdminAPI(`/api/proxy/${encodeURIComponent(tunnelName)}`, 'DELETE');
        if (!res.ok && res.status !== 404) {
          const errText = await res.text();
          console.warn('[FRPClient] FRP admin delete returned:', errText);
        }
      } catch (err: any) {
        console.warn('[FRPClient] FRP admin delete call failed:', err.message);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting tunnel' };
    }
  }

  /**
   * Retrieves the current live status of a tunnel from the FRP admin proxy list.
   * @param tunnelId Unique identifier or name of the tunnel
   */
  async getTunnelStatus(tunnelId: string): Promise<FRPResponse<{ status: 'online' | 'offline' | 'provisioning' }>> {
    try {
      let tunnelName = tunnelId;
      try {
        const supabase = this.getSupabaseAdmin();
        const { data } = await supabase.from('cloud_tunnels').select('name').eq('id', tunnelId).single();
        if (data && data.name) {
          tunnelName = data.name;
        }
      } catch {
        // Fallback to passed tunnelId as name
      }

      let isOnline = false;

      // Check HTTP proxies
      try {
        const httpRes = await this.fetchAdminAPI('/api/proxy/http', 'GET');
        if (httpRes.ok) {
          const httpProxies = await httpRes.json();
          if (Array.isArray(httpProxies?.proxies)) {
            isOnline = httpProxies.proxies.some((p: any) => p.name === tunnelName);
          }
        }
      } catch (err: any) {
        console.warn('[FRPClient] HTTP proxy check failed:', err.message);
      }

      // Check TCP proxies if not yet found
      if (!isOnline) {
        try {
          const tcpRes = await this.fetchAdminAPI('/api/proxy/tcp', 'GET');
          if (tcpRes.ok) {
            const tcpProxies = await tcpRes.json();
            if (Array.isArray(tcpProxies?.proxies)) {
              isOnline = tcpProxies.proxies.some((p: any) => p.name === tunnelName);
            }
          }
        } catch (err: any) {
          console.warn('[FRPClient] TCP proxy check failed:', err.message);
        }
      }

      const status = isOnline ? 'online' : 'offline';

      // Update status in database if available
      try {
        const supabase = this.getSupabaseAdmin();
        await supabase.from('cloud_tunnels').update({ status }).eq('id', tunnelId);
      } catch {
        // Non-critical
      }

      return { success: true, data: { status } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while checking tunnel status' };
    }
  }

  /**
   * Lists all tunnels belonging to a specified user.
   * @param userId Owner user ID
   */
  async listTunnels(userId: string): Promise<FRPResponse<Tunnel[]>> {
    try {
      const supabase = this.getSupabaseAdmin();
      const { data, error } = await supabase
        .from('cloud_tunnels')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: `Failed to query tunnels: ${error.message}` };
      }

      const tunnels: Tunnel[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        subdomain: row.subdomain,
        protocol: row.protocol,
        localPort: row.local_port,
        remotePort: row.remote_port,
        status: row.status,
        createdAt: row.created_at,
        publicUrl: row.public_url,
        token: row.token,
      }));

      return { success: true, data: tunnels };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing tunnels' };
    }
  }
}
