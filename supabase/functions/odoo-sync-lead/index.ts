import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface LeadPayload {
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
}

async function getIntegrationConfig(): Promise<{
  apiKey: string;
  url: string;
  db: string;
}> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/integrations?select=key,value`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch integration config: ${res.status}`);
  }

  const rows: { key: string; value: string }[] = await res.json();
  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }

  if (!config.odoo_api_key) {
    throw new Error("Odoo API key not configured in integrations table");
  }

  return {
    apiKey: config.odoo_api_key,
    url: config.odoo_url || "https://elsxglobal.com",
    db: config.odoo_db || "elsxglobal",
  };
}

async function odooJsonRpc(
  baseUrl: string,
  endpoint: string,
  params: unknown
) {
  const body = {
    jsonrpc: "2.0",
    method: "call",
    params,
    id: Math.floor(Math.random() * 1000000000),
  };

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Odoo HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`Odoo error: ${JSON.stringify(data.error)}`);
  }
  return data.result;
}

async function authenticate(
  url: string,
  db: string,
  apiKey: string
): Promise<number> {
  const uid = await odooJsonRpc(url, "/jsonrpc/2/common", {
    service: "common",
    method: "authenticate",
    args: [db, "api", apiKey, {}],
  });

  if (!uid || uid === false) {
    throw new Error("Odoo authentication failed — check API key and database name");
  }

  return uid as number;
}

async function createOdooLead(
  url: string,
  db: string,
  uid: number,
  apiKey: string,
  lead: LeadPayload
): Promise<number> {
  const name = lead.company || lead.full_name;
  const title = `${lead.intent.charAt(0).toUpperCase() + lead.intent.slice(1)} — ${name}`;

  const leadData: Record<string, unknown> = {
    name: title,
    contact_name: lead.full_name,
    email_from: lead.work_email,
    phone: lead.phone || false,
    partner_name: lead.company || false,
    description: lead.message || false,
    type: "lead",
  };

  // Build description with qualification metadata
  if (lead.metadata) {
    const meta: string[] = [];
    if (lead.metadata.role) meta.push(`Role: ${lead.metadata.role}`);
    if (lead.metadata.company_size) meta.push(`Company Size: ${lead.metadata.company_size}`);
    if (lead.metadata.industry) meta.push(`Industry: ${lead.metadata.industry}`);
    if (lead.metadata.challenge) meta.push(`Primary Challenge: ${lead.metadata.challenge}`);
    if (lead.metadata.budget) meta.push(`Budget: ${lead.metadata.budget}`);
    if (lead.metadata.source_detail) meta.push(`Source Detail: ${lead.metadata.source_detail}`);

    if (meta.length > 0) {
      const existingDesc = lead.message ? lead.message + "\n\n" : "";
      leadData.description = existingDesc + "--- Qualification ---\n" + meta.join("\n");
    }
  }

  const leadId = await odooJsonRpc(url, "/jsonrpc/2/object", {
    service: "object",
    method: "execute_kw",
    args: [db, uid, apiKey, "crm.lead", "create", [leadData]],
  });

  return leadId as number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const lead: LeadPayload = await req.json();

    if (!lead.full_name || !lead.work_email) {
      return new Response(
        JSON.stringify({ error: "full_name and work_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = await getIntegrationConfig();
    const uid = await authenticate(config.url, config.db, config.apiKey);
    const odooLeadId = await createOdooLead(
      config.url,
      config.db,
      uid,
      config.apiKey,
      lead
    );

    return new Response(
      JSON.stringify({
        success: true,
        odoo_lead_id: odooLeadId,
        message: "Lead created in Odoo CRM",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Odoo lead sync error:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        message: "Lead was saved locally but could not be synced to Odoo",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
