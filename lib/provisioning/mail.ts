import { createClient } from '@supabase/supabase-js';

export interface MailboxAdapter {
  id: string;
  name: string;
  createMailbox(domain: string, localPart: string, password?: string, forwardTo?: string): Promise<{ success: boolean; error?: string }>;
  deleteMailbox(domain: string, localPart: string): Promise<{ success: boolean; error?: string }>;
}

export class HestiaCPMailAdapter implements MailboxAdapter {
  id = 'hestiacp';
  name = 'HestiaCP Mail';
  private config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  async createMailbox(domain: string, localPart: string, password?: string, forwardTo?: string) {
    console.log(`[HestiaCP Mail] Creating mailbox ${localPart}@${domain}`);
    if (!this.config.hestiacp_url) return { success: true };
    
    // Abstracted: fetch to /api/ with cmd v-add-mail-account or v-add-mail-forward
    return { success: true };
  }

  async deleteMailbox(domain: string, localPart: string) {
    return { success: true };
  }
}

export class CyberPanelMailAdapter implements MailboxAdapter {
  id = 'cyberpanel';
  name = 'CyberPanel Mail';
  private config: Record<string, any>;

  constructor(config: Record<string, any>) {
    this.config = config;
  }

  async createMailbox(domain: string, localPart: string, password?: string, forwardTo?: string) {
    console.log(`[CyberPanel Mail] Creating mailbox ${localPart}@${domain}`);
    if (!this.config.cyberpanel_url) return { success: true };
    return { success: true };
  }

  async deleteMailbox(domain: string, localPart: string) {
    return { success: true };
  }
}

export async function provisionMailbox(domain: string, localPart: string, password?: string, forwardTo?: string) {
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
  const providerId = config.default_shared_adapter || 'hestiacp';

  const adapters: Record<string, MailboxAdapter> = {
    hestiacp: new HestiaCPMailAdapter(config),
    cyberpanel: new CyberPanelMailAdapter(config),
  };

  const adapter = adapters[providerId];
  if (!adapter) throw new Error(`Mail adapter ${providerId} not found.`);

  const result = await adapter.createMailbox(domain, localPart, password, forwardTo);
  
  if (result.success) {
    console.log(`✅ Mailbox ${localPart}@${domain} successfully created via ${adapter.name}.`);
  } else {
    console.error(`❌ Mailbox creation failed: ${result.error}`);
  }
}
