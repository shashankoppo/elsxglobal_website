import { createClient } from '@supabase/supabase-js';

export interface Zone {
  id: string;
  name: string;
  kind: 'Native' | 'Master' | 'Slave';
  dnssec: boolean;
  serial: number;
}

export interface DNSRecord {
  id: string;
  zoneId: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA' | 'DKIM' | 'PTR';
  name: string;
  content: string;
  ttl: number;
  prio?: number;
  disabled?: boolean;
}

export interface PowerDNSResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * PowerDNS Authoritative DNS API Client.
 * Manages zones, DNS records, DNSSEC, and cache operations.
 */
export class PowerDNSClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the PowerDNS client.
   * @param config Optional initial configuration object (e.g. from provisioning_settings).
   */
  constructor(config?: Record<string, any>) {
    this.config = config ? { ...config } : {};
  }

  /**
   * Resolves a configuration value from explicit config, Supabase provisioning_settings row id=1, or environment variables.
   * @param key Database column key in provisioning_settings.
   * @param envVar Optional environment variable fallback name.
   */
  private async getConfigValue(key: string, envVar?: string): Promise<string | undefined> {
    if (this.config[key] !== undefined && this.config[key] !== '') {
      return this.config[key];
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
        console.warn('[PowerDNSClient] Failed to load configuration from Supabase:', err.message);
      }
      this.configLoaded = true;
    }

    if (this.config[key] !== undefined && this.config[key] !== '') {
      return this.config[key];
    }

    if (envVar && process.env[envVar] !== undefined && process.env[envVar] !== '') {
      return process.env[envVar];
    }

    return undefined;
  }

  /**
   * Internal helper to execute PowerDNS REST API requests.
   * @param endpoint API subpath (e.g. /api/v1/servers/localhost/zones)
   * @param method HTTP method
   * @param body Optional request payload
   */
  private async fetchAPI(endpoint: string, method: string, body?: any): Promise<Response> {
    const rawUrl = await this.getConfigValue('powerdns_url', 'POWERDNS_URL');
    const apiKey = await this.getConfigValue('powerdns_api_key', 'POWERDNS_API_KEY');

    if (!rawUrl || !apiKey) {
      throw new Error('PowerDNS configuration is missing (powerdns_url or powerdns_api_key)');
    }

    const baseUrl = rawUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    return fetch(`${baseUrl}${cleanEndpoint}`, {
      method,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Formats a zone ID / domain to ensure a trailing dot as required by PowerDNS canonical naming.
   * @param zone Domain name or zone ID
   */
  private canonicalZoneId(zone: string): string {
    const trimmed = zone.trim();
    return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
  }

  /**
   * Creates a new DNS zone in PowerDNS.
   * @param domain FQDN of the domain to host (e.g. 'example.com')
   * @returns Response containing the created Zone metadata or error message.
   */
  async createZone(domain: string): Promise<PowerDNSResponse<Zone>> {
    try {
      const canonicalName = this.canonicalZoneId(domain);
      const payload = {
        name: canonicalName,
        kind: 'Native',
        nameservers: ['ns1.vaulthost.cloud.', 'ns2.vaulthost.cloud.'],
      };

      const res = await this.fetchAPI('/api/v1/servers/localhost/zones', 'POST', payload);
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to create zone: ${errorText}` };
      }

      const data = await res.json();
      const zone: Zone = {
        id: data.id || canonicalName,
        name: data.name || canonicalName,
        kind: data.kind || 'Native',
        dnssec: Boolean(data.dnssec),
        serial: data.serial || 0,
      };

      return { success: true, data: zone };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating zone' };
    }
  }

  /**
   * Deletes a DNS zone from PowerDNS by its zone identifier.
   * @param zoneId Identifier or canonical domain name of the zone (e.g. 'example.com.')
   * @returns Success status or error message.
   */
  async deleteZone(zoneId: string): Promise<PowerDNSResponse<void>> {
    try {
      const canonicalId = this.canonicalZoneId(zoneId);
      const res = await this.fetchAPI(`/api/v1/servers/localhost/zones/${encodeURIComponent(canonicalId)}`, 'DELETE');
      if (!res.ok && res.status !== 404) {
        const errorText = await res.text();
        return { success: false, error: `Failed to delete zone: ${errorText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting zone' };
    }
  }

  /**
   * Lists all DNS authoritative zones configured in the server.
   * @returns Array of Zone records.
   */
  async listZones(): Promise<PowerDNSResponse<Zone[]>> {
    try {
      const res = await this.fetchAPI('/api/v1/servers/localhost/zones', 'GET');
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to list zones: ${errorText}` };
      }

      const rawZones: any[] = await res.json();
      const zones: Zone[] = rawZones.map((z) => ({
        id: z.id || z.name,
        name: z.name,
        kind: z.kind || 'Native',
        dnssec: Boolean(z.dnssec),
        serial: z.serial || 0,
      }));

      return { success: true, data: zones };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing zones' };
    }
  }

  /**
   * Lists all DNS resource records (rrsets) inside a given zone.
   * @param zoneId Identifier or domain of the zone
   * @returns Array of DNSRecord entries.
   */
  async listRecords(zoneId: string): Promise<PowerDNSResponse<DNSRecord[]>> {
    try {
      const canonicalId = this.canonicalZoneId(zoneId);
      const res = await this.fetchAPI(`/api/v1/servers/localhost/zones/${encodeURIComponent(canonicalId)}`, 'GET');
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to retrieve records: ${errorText}` };
      }

      const zoneData = await res.json();
      const records: DNSRecord[] = [];

      if (Array.isArray(zoneData.rrsets)) {
        for (const rrset of zoneData.rrsets) {
          if (Array.isArray(rrset.records)) {
            for (const r of rrset.records) {
              let prio: number | undefined;
              let content = r.content || '';

              if (rrset.type === 'MX' || rrset.type === 'SRV') {
                const parts = content.split(' ');
                if (parts.length > 1 && !isNaN(parseInt(parts[0], 10))) {
                  prio = parseInt(parts[0], 10);
                }
              }

              records.push({
                id: `${rrset.name}:${rrset.type}:${content}`,
                zoneId: canonicalId,
                type: rrset.type,
                name: rrset.name,
                content,
                ttl: rrset.ttl || 300,
                prio,
                disabled: Boolean(r.disabled),
              });
            }
          }
        }
      }

      return { success: true, data: records };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing records' };
    }
  }

  /**
   * Adds or replaces a DNS record in the specified zone.
   * @param zoneId Identifier or domain of the zone
   * @param record Record configuration to add
   */
  async addRecord(zoneId: string, record: Omit<DNSRecord, 'id'>): Promise<PowerDNSResponse<any>> {
    try {
      const canonicalId = this.canonicalZoneId(zoneId);
      const recordName = this.canonicalZoneId(record.name);

      let recordContent = record.content;
      if (record.type === 'MX' && record.prio !== undefined && !recordContent.startsWith(`${record.prio} `)) {
        recordContent = `${record.prio} ${recordContent}`;
      }

      const payload = {
        rrsets: [
          {
            name: recordName,
            type: record.type,
            ttl: record.ttl || 300,
            changetype: 'REPLACE',
            records: [
              {
                content: recordContent,
                disabled: record.disabled ?? false,
              },
            ],
          },
        ],
      };

      const res = await this.fetchAPI(`/api/v1/servers/localhost/zones/${encodeURIComponent(canonicalId)}`, 'PATCH', payload);
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to add record: ${errorText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while adding record' };
    }
  }

  /**
   * Updates an existing DNS record in the zone.
   * @param zoneId Identifier or domain of the zone
   * @param record Complete DNSRecord definition to apply
   */
  async updateRecord(zoneId: string, record: DNSRecord): Promise<PowerDNSResponse<any>> {
    return this.addRecord(zoneId, record);
  }

  /**
   * Deletes a DNS record from the specified zone.
   * @param zoneId Identifier or domain of the zone
   * @param record DNSRecord to delete
   */
  async deleteRecord(zoneId: string, record: DNSRecord): Promise<PowerDNSResponse<any>> {
    try {
      const canonicalId = this.canonicalZoneId(zoneId);
      const recordName = this.canonicalZoneId(record.name);

      const payload = {
        rrsets: [
          {
            name: recordName,
            type: record.type,
            changetype: 'DELETE',
            records: [],
          },
        ],
      };

      const res = await this.fetchAPI(`/api/v1/servers/localhost/zones/${encodeURIComponent(canonicalId)}`, 'PATCH', payload);
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to delete record: ${errorText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting record' };
    }
  }

  /**
   * Enables DNSSEC signing for the given zone.
   * @param zoneId Identifier or domain of the zone
   */
  async enableDNSSEC(zoneId: string): Promise<PowerDNSResponse<any>> {
    try {
      const canonicalId = this.canonicalZoneId(zoneId);
      // Generate or activate cryptokey for DNSSEC in PowerDNS
      const res = await this.fetchAPI(`/api/v1/servers/localhost/zones/${encodeURIComponent(canonicalId)}/cryptokeys`, 'POST', {
        keytype: 'ksk',
        active: true,
        algorithm: 'ecdsa256',
        bits: 256,
      });

      if (!res.ok) {
        // Fallback or zone-level enable
        const patchRes = await this.fetchAPI(`/api/v1/servers/localhost/zones/${encodeURIComponent(canonicalId)}`, 'PUT', {
          dnssec: true,
        });
        if (!patchRes.ok) {
          const errorText = await patchRes.text();
          return { success: false, error: `Failed to enable DNSSEC: ${errorText}` };
        }
      }

      // Also rectify zone
      await this.purgeCache(zoneId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while enabling DNSSEC' };
    }
  }

  /**
   * Rectifies the zone and purges/refreshes authoritative caches.
   * @param zoneId Identifier or domain of the zone
   */
  async purgeCache(zoneId: string): Promise<PowerDNSResponse<any>> {
    try {
      const canonicalId = this.canonicalZoneId(zoneId);
      const res = await this.fetchAPI(`/api/v1/servers/localhost/zones/${encodeURIComponent(canonicalId)}/rectify`, 'PUT');
      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: `Failed to rectify zone cache: ${errorText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while purging cache' };
    }
  }
}
