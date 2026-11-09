import { createClient } from '@supabase/supabase-js';

export interface DomainAvailability {
  domain: string;
  available: boolean;
  price?: number;
  isPremium?: boolean;
}

export interface DomainRegistration {
  domain: string;
  orderId: string;
  transactionId: string;
  expireDate: string;
  status: 'OK' | 'Failed';
}

export interface DomainInfo {
  domain: string;
  created: string;
  expires: string;
  status: 'Active' | 'Expired' | 'Suspended';
  nameservers: string[];
  whoisGuard: boolean;
}

export interface NamecheapResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Namecheap Domain Registrar API Client.
 * Handles availability checks, domain registrations, renewals, DNS nameserver configuration, and WhoisGuard.
 */
export class NamecheapClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the Namecheap client.
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
        console.warn('[NamecheapClient] Failed to load configuration from Supabase:', err.message);
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
   * Parses Namecheap XML responses, inspecting top-level status and error elements.
   * @param xml Raw XML string from Namecheap API
   */
  private parseXmlResponse(xml: string): { success: boolean; data?: string; error?: string } {
    const statusMatch = xml.match(/Status="([^"]+)"/i);
    const status = statusMatch ? statusMatch[1].toUpperCase() : 'ERROR';

    if (status !== 'OK') {
      const errorRegex = /<Error[^>]*>([\s\S]*?)<\/Error>/g;
      const errors: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = errorRegex.exec(xml)) !== null) {
        errors.push(match[1].trim());
      }

      return {
        success: false,
        error: errors.length > 0 ? errors.join('; ') : 'Namecheap API returned an unknown error',
      };
    }

    const commandResponseMatch = xml.match(/<CommandResponse[^>]*>([\s\S]*?)<\/CommandResponse>/i);
    return {
      success: true,
      data: commandResponseMatch ? commandResponseMatch[1] : xml,
    };
  }

  /**
   * Executes an HTTP GET request to the Namecheap API endpoint with required credentials.
   * @param command Namecheap API command name (e.g. 'namecheap.domains.check')
   * @param query Extra query parameters
   */
  private async executeCommand(command: string, query: Record<string, string> = {}): Promise<string> {
    const apiUser = (await this.getConfigValue('namecheap_api_user', 'NAMECHEAP_API_USER')) || '';
    const apiKey = (await this.getConfigValue('namecheap_api_key', 'NAMECHEAP_API_KEY')) || '';
    const clientIp = (await this.getConfigValue('namecheap_client_ip', 'NAMECHEAP_CLIENT_IP')) || '127.0.0.1';
    const sandboxVal = await this.getConfigValue('namecheap_sandbox', 'NAMECHEAP_SANDBOX');
    const isSandbox = sandboxVal === undefined || sandboxVal === 'true' || sandboxVal === '1';

    if (!apiUser || !apiKey) {
      throw new Error('Namecheap credentials missing (namecheap_api_user or namecheap_api_key)');
    }

    const baseUrl = isSandbox
      ? 'https://api.sandbox.namecheap.com/xml.response'
      : 'https://api.namecheap.com/xml.response';

    const params = new URLSearchParams({
      ApiUser: apiUser,
      ApiKey: apiKey,
      UserName: apiUser,
      ClientIp: clientIp,
      Command: command,
      ...query,
    });

    const res = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errText}`);
    }

    return res.text();
  }

  /**
   * Checks the registration availability of a list of domain names.
   * @param domains List of domain names (e.g. ['vaulthost.cloud', 'example.org'])
   */
  async checkAvailability(domains: string[]): Promise<NamecheapResponse<DomainAvailability[]>> {
    try {
      const domainList = domains.join(',');
      const xml = await this.executeCommand('namecheap.domains.check', { DomainList: domainList });
      const parsed = this.parseXmlResponse(xml);

      if (!parsed.success || !parsed.data) {
        return { success: false, error: parsed.error || 'Failed to check domain availability' };
      }

      const results: DomainAvailability[] = [];
      const itemRegex = /<DomainCheckResult\s+([^>]+)\/?>/g;
      let match: RegExpExecArray | null;

      while ((match = itemRegex.exec(parsed.data)) !== null) {
        const attrs = match[1];
        const domainMatch = attrs.match(/Domain="([^"]+)"/i);
        const availMatch = attrs.match(/Available="([^"]+)"/i);
        const isPremiumMatch = attrs.match(/IsPremiumName="([^"]+)"/i);
        const priceMatch = attrs.match(/PremiumRegistrationPrice="([^"]+)"/i);

        if (domainMatch) {
          const domain = domainMatch[1];
          const available = availMatch ? availMatch[1].toLowerCase() === 'true' : false;
          const isPremium = isPremiumMatch ? isPremiumMatch[1].toLowerCase() === 'true' : false;
          const price = priceMatch ? parseFloat(priceMatch[1]) : undefined;

          results.push({
            domain,
            available,
            price: !isNaN(price as number) ? price : undefined,
            isPremium,
          });
        }
      }

      return { success: true, data: results };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while checking domain availability' };
    }
  }

  /**
   * Registers a domain name for a specified period with contact details.
   * @param domain Domain name to register
   * @param years Duration of registration in years
   * @param registrantInfo Registrant contact profile details
   */
  async registerDomain(
    domain: string,
    years: number = 1,
    registrantInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address1: string;
      city: string;
      stateProvince: string;
      postalCode: string;
      country: string;
    }
  ): Promise<NamecheapResponse<DomainRegistration>> {
    try {
      const contactParams: Record<string, string> = {
        DomainName: domain,
        Years: String(years),
      };

      const contactPrefixes = ['Registrant', 'Tech', 'Admin', 'AuxBilling'];
      for (const prefix of contactPrefixes) {
        contactParams[`${prefix}FirstName`] = registrantInfo.firstName;
        contactParams[`${prefix}LastName`] = registrantInfo.lastName;
        contactParams[`${prefix}Address1`] = registrantInfo.address1;
        contactParams[`${prefix}City`] = registrantInfo.city;
        contactParams[`${prefix}StateProvince`] = registrantInfo.stateProvince;
        contactParams[`${prefix}PostalCode`] = registrantInfo.postalCode;
        contactParams[`${prefix}Country`] = registrantInfo.country;
        contactParams[`${prefix}Phone`] = registrantInfo.phone;
        contactParams[`${prefix}EmailAddress`] = registrantInfo.email;
      }

      const xml = await this.executeCommand('namecheap.domains.create', contactParams);
      const parsed = this.parseXmlResponse(xml);

      if (!parsed.success || !parsed.data) {
        return { success: false, error: parsed.error || 'Failed to register domain' };
      }

      const orderMatch = parsed.data.match(/OrderID="([^"]+)"/i);
      const txMatch = parsed.data.match(/TransactionID="([^"]+)"/i);
      const dateMatch = parsed.data.match(/ExpireDate="([^"]+)"/i);
      const registeredMatch = parsed.data.match(/Registered="([^"]+)"/i);

      const isRegistered = registeredMatch ? registeredMatch[1].toLowerCase() === 'true' : true;

      const registration: DomainRegistration = {
        domain,
        orderId: orderMatch ? orderMatch[1] : '0',
        transactionId: txMatch ? txMatch[1] : '0',
        expireDate: dateMatch ? dateMatch[1] : new Date(Date.now() + years * 365 * 86400000).toISOString(),
        status: isRegistered ? 'OK' : 'Failed',
      };

      return { success: true, data: registration };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while registering domain' };
    }
  }

  /**
   * Renews an existing registered domain for additional years.
   * @param domain Domain name
   * @param years Duration to extend
   */
  async renewDomain(domain: string, years: number = 1): Promise<NamecheapResponse<any>> {
    try {
      const xml = await this.executeCommand('namecheap.domains.renew', {
        DomainName: domain,
        Years: String(years),
      });

      const parsed = this.parseXmlResponse(xml);
      if (!parsed.success || !parsed.data) {
        return { success: false, error: parsed.error || 'Failed to renew domain' };
      }

      return { success: true, data: parsed.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while renewing domain' };
    }
  }

  /**
   * Retrieves detailed configuration and expiration metadata for a domain.
   * @param domain Target domain name
   */
  async getDomainInfo(domain: string): Promise<NamecheapResponse<DomainInfo>> {
    try {
      const xml = await this.executeCommand('namecheap.domains.getInfo', { DomainName: domain });
      const parsed = this.parseXmlResponse(xml);

      if (!parsed.success || !parsed.data) {
        return { success: false, error: parsed.error || 'Failed to retrieve domain info' };
      }

      const createdMatch = parsed.data.match(/<CreatedDate>([\s\S]*?)<\/CreatedDate>/i);
      const expiresMatch = parsed.data.match(/<ExpiredDate>([\s\S]*?)<\/ExpiredDate>/i);
      const statusMatch = parsed.data.match(/Status="([^"]+)"/i);
      const whoisGuardMatch = parsed.data.match(/<Whoisguard Enabled="([^"]+)"/i);

      const nameservers: string[] = [];
      const nsRegex = /<Nameserver>([\s\S]*?)<\/Nameserver>/g;
      let nsMatch: RegExpExecArray | null;
      while ((nsMatch = nsRegex.exec(parsed.data)) !== null) {
        nameservers.push(nsMatch[1].trim());
      }

      const rawStatus = (statusMatch ? statusMatch[1] : 'Active').toLowerCase();
      let status: 'Active' | 'Expired' | 'Suspended' = 'Active';
      if (rawStatus.includes('expired')) {
        status = 'Expired';
      } else if (rawStatus.includes('suspend') || rawStatus.includes('locked')) {
        status = 'Suspended';
      }

      const domainInfo: DomainInfo = {
        domain,
        created: createdMatch ? createdMatch[1].trim() : new Date().toISOString(),
        expires: expiresMatch ? expiresMatch[1].trim() : new Date().toISOString(),
        status,
        nameservers,
        whoisGuard: whoisGuardMatch ? whoisGuardMatch[1].toLowerCase() === 'true' : false,
      };

      return { success: true, data: domainInfo };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while fetching domain information' };
    }
  }

  /**
   * Lists domains registered under this Namecheap user account.
   * @param userId Optional customer or filter ID
   */
  async listDomains(userId?: string): Promise<NamecheapResponse<any[]>> {
    try {
      const query: Record<string, string> = { PageSize: '100' };
      if (userId) {
        query.SearchTerm = userId;
      }

      const xml = await this.executeCommand('namecheap.domains.getList', query);
      const parsed = this.parseXmlResponse(xml);

      if (!parsed.success || !parsed.data) {
        return { success: false, error: parsed.error || 'Failed to list domains' };
      }

      const domains: any[] = [];
      const itemRegex = /<Domain\s+([^>]+)\/?>/g;
      let match: RegExpExecArray | null;

      while ((match = itemRegex.exec(parsed.data)) !== null) {
        const attrs = match[1];
        const nameMatch = attrs.match(/Name="([^"]+)"/i);
        const expiresMatch = attrs.match(/Expires="([^"]+)"/i);
        const userMatch = attrs.match(/User="([^"]+)"/i);

        if (nameMatch) {
          domains.push({
            domain: nameMatch[1],
            expires: expiresMatch ? expiresMatch[1] : undefined,
            user: userMatch ? userMatch[1] : undefined,
          });
        }
      }

      return { success: true, data: domains };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing domains' };
    }
  }

  /**
   * Sets custom DNS nameservers for a domain.
   * @param domain Target domain name
   * @param nameservers List of authoritative nameserver hostnames
   */
  async setNameservers(domain: string, nameservers: string[]): Promise<NamecheapResponse<void>> {
    try {
      const parts = domain.split('.');
      const sld = parts[0];
      const tld = parts.slice(1).join('.');

      const xml = await this.executeCommand('namecheap.domains.dns.setCustom', {
        SLD: sld,
        TLD: tld,
        Nameservers: nameservers.join(','),
      });

      const parsed = this.parseXmlResponse(xml);
      if (!parsed.success) {
        return { success: false, error: parsed.error || 'Failed to update nameservers' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while setting nameservers' };
    }
  }

  /**
   * Enables WhoisGuard privacy protection for a domain.
   * @param domain Target domain name
   */
  async enableWhoisGuard(domain: string): Promise<NamecheapResponse<void>> {
    try {
      const xml = await this.executeCommand('namecheap.whoisguard.enable', { DomainName: domain });
      const parsed = this.parseXmlResponse(xml);

      if (!parsed.success) {
        return { success: false, error: parsed.error || 'Failed to enable WhoisGuard' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while enabling WhoisGuard' };
    }
  }

  /**
   * Queries registration pricing for a given TLD.
   * @param tld Top-level domain without leading dot (e.g. 'com', 'cloud', 'org')
   */
  async getPricing(tld: string): Promise<NamecheapResponse<{ tld: string; price: number; currency: string }>> {
    try {
      const cleanTld = tld.replace(/^\./, '').toLowerCase();
      const xml = await this.executeCommand('namecheap.users.getPricing', {
        ProductType: 'DOMAIN',
        ProductCategory: 'DOMAINS',
        ActionName: 'REGISTER',
      });

      const parsed = this.parseXmlResponse(xml);
      if (!parsed.success || !parsed.data) {
        return { success: false, error: parsed.error || 'Failed to retrieve pricing' };
      }

      // Find price matching TLD
      const priceRegex = new RegExp(`<Product\\s+Name="${cleanTld}"[\\s\\S]*?<Price[^>]*Price="([^"]+)"`, 'i');
      const match = parsed.data.match(priceRegex);
      const price = match ? parseFloat(match[1]) : 10.99;

      return {
        success: true,
        data: {
          tld: cleanTld,
          price,
          currency: 'USD',
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while fetching pricing' };
    }
  }
}
