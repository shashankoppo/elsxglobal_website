import { supabase } from './supabase';

const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/odoo-sync-lead`;

export type OdooLeadPayload = {
  full_name: string;
  work_email: string;
  company?: string | null;
  phone?: string | null;
  intent: string;
  message?: string | null;
  source?: string | null;
  metadata?: {
    role?: string | null;
    company_size?: string | null;
    industry?: string | null;
    challenge?: string | null;
    budget?: string | null;
    source_detail?: string | null;
  } | null;
};

/**
 * Pushes a lead to Odoo CRM via the Supabase Edge Function.
 * This is fire-and-forget — the lead is already saved in Supabase,
 * so if Odoo sync fails, the data is not lost.
 */
export async function syncLeadToOdoo(
  payload: OdooLeadPayload
): Promise<{ success: boolean; odooLeadId?: number; error?: string }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.session?.access_token ?? anonKey}`,
        apikey: anonKey!,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      return { success: false, error: err.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return {
      success: data.success ?? false,
      odooLeadId: data.odoo_lead_id,
      error: data.success ? undefined : data.message,
    };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
