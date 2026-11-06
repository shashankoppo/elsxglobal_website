import { createClient } from '@supabase/supabase-js';

export interface DomainRegistrarAdapter {
  id: string;
  name: string;
  registerDomain(domain: string, contactData: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }>;
  renewDomain(domain: string, years: number): Promise<{ success: boolean; data?: any; error?: string }>;
}

export class NameSiloAdapter implements DomainRegistrarAdapter {
  id = 'namesilo';
  name = 'NameSilo';
  private config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  async registerDomain(domain: string, contactData: Record<string, any>) {
    console.log(`[NameSilo] Registering domain ${domain}`);
    if (!this.config.domains_api_key) {
      throw new Error('NameSilo API key is not configured');
    }
    
    const url = `https://www.namesilo.com/api/registerDomain?version=1&type=xml&key=${this.config.domains_api_key}&domain=${domain}&years=1&private=1&auto_renew=1`;
    const res = await fetch(url);
    const text = await res.text();
    
    if (text.includes('<code>300</code>')) {
      return { success: true, data: { status: 'active', domain } };
    } else {
      const errorMatch = text.match(/<detail>(.*?)<\/detail>/);
      throw new Error(`NameSilo Error: ${errorMatch?.[1] || 'Registration failed'}`);
    }
  }

  async renewDomain(domain: string, years: number) {
    console.log(`[NameSilo] Renewing domain ${domain} for ${years} years`);
    return { success: true };
  }
}

export class ResellerClubAdapter implements DomainRegistrarAdapter {
  id = 'resellerclub';
  name = 'ResellerClub';
  private config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  async registerDomain(domain: string, contactData: Record<string, any>) {
    console.log(`[ResellerClub] Registering domain ${domain}`);
    if (!this.config.domains_api_key || !this.config.domains_reseller_id) {
      throw new Error('ResellerClub API key or Reseller ID is not configured');
    }
    
    const url = `https://httpapi.com/api/domains/register.json?auth-userid=${this.config.domains_reseller_id}&api-key=${this.config.domains_api_key}&domain-name=${domain}&years=1&ns=ns1.vaulthost.cloud&ns=ns2.vaulthost.cloud&customer-id=${this.config.domains_customer_id || '0'}&invoice-option=NoInvoice`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    
    if (data.status === 'Success' || data.actionstatus === 'Success') {
      return { success: true, data: { status: 'active', domain } };
    } else {
      throw new Error(`ResellerClub Error: ${data.message || JSON.stringify(data)}`);
    }
  }

  async renewDomain(domain: string, years: number) {
    return { success: true };
  }
}

export async function provisionDomain(orderId: string, domainName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error');
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: settings } = await supabaseAdmin
    .from('provisioning_settings')
    .select('*')
    .eq('id', 1)
    .single();

  const config = settings || {};
  if (!config.domains_enabled) {
    console.log(`Domain provisioning is disabled. Skipping registration for ${domainName}.`);
    return;
  }

  const adapters: Record<string, DomainRegistrarAdapter> = {
    namesilo: new NameSiloAdapter(config),
    resellerclub: new ResellerClubAdapter(config),
  };

  const provider = config.domains_provider || 'namesilo';
  const adapter = adapters[provider];

  if (!adapter) {
    throw new Error(`Domain provider ${provider} not found.`);
  }

  const result = await adapter.registerDomain(domainName, {});
  
  if (result.success) {
    console.log(`✅ Domain ${domainName} successfully registered via ${adapter.name}.`);
    // Ideally update the domain_registry table here
  } else {
    console.error(`❌ Domain registration failed for ${domainName}: ${result.error}`);
  }
}
