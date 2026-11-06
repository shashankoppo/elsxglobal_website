import { supabase } from './supabase';

const ODOO_URL = process.env.NEXT_PUBLIC_ODOO_URL;
const ODOO_DB = process.env.NEXT_PUBLIC_ODOO_DB || 'elsxglobal';

export interface OdooConnection {
  apiKey: string;
  url: string;
  db: string;
}

export async function getOdooConfig(): Promise<OdooConnection> {
  const { data, error } = await supabase
    .from('integrations')
    .select('key,value')
    .in('key', ['odoo_api_key', 'odoo_url', 'odoo_db'])
    .maybeSingle();

  if (error || !data) {
    return {
      apiKey: '',
      url: ODOO_URL || 'https://elsxglobal.com',
      db: ODOO_DB,
    };
  }

  const rows = Array.isArray(data) ? data : [data];
  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }

  return {
    apiKey: config.odoo_api_key || '',
    url: config.odoo_url || ODOO_URL || 'https://elsxglobal.com',
    db: config.odoo_db || ODOO_DB,
  };
}

async function odooJsonRpc(baseUrl: string, endpoint: string, params: unknown) {
  const body = {
    jsonrpc: '2.0',
    method: 'call',
    params,
    id: Math.floor(Math.random() * 1000000000),
  };

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

async function authenticate(conn: OdooConnection): Promise<number> {
  const uid = await odooJsonRpc(conn.url, '/jsonrpc/2/common', {
    service: 'common',
    method: 'authenticate',
    args: [conn.db, 'api', conn.apiKey, {}],
  });

  if (!uid || uid === false) {
    throw new Error('Odoo authentication failed');
  }
  return uid as number;
}

export async function createOdooLead(
  conn: OdooConnection,
  lead: {
    name: string;
    contact_name: string;
    email_from: string;
    phone?: string;
    partner_name?: string;
    description?: string;
    type?: string;
  }
): Promise<number> {
  const uid = await authenticate(conn);

  const leadId = await odooJsonRpc(conn.url, '/jsonrpc/2/object', {
    service: 'object',
    method: 'execute_kw',
    args: [conn.db, uid, conn.apiKey, 'crm.lead', 'create', [lead]],
  });

  return leadId as number;
}

export async function searchOdooLeads(
  conn: OdooConnection,
  domain: Array<[string, string, unknown]> = []
): Promise<Array<Record<string, unknown>>> {
  const uid = await authenticate(conn);

  const result = await odooJsonRpc(conn.url, '/jsonrpc/2/object', {
    service: 'object',
    method: 'execute_kw',
    args: [
      conn.db,
      uid,
      conn.apiKey,
      'crm.lead',
      'search_read',
      [domain],
      { fields: ['id', 'name', 'email_from', 'phone', 'contact_name', 'partner_name', 'type', 'stage_id', 'create_date'], limit: 100 },
    ],
  });

  return result as Array<Record<string, unknown>>;
}

export async function getOdooPartners(
  conn: OdooConnection,
  domain: Array<[string, string, unknown]> = []
): Promise<Array<Record<string, unknown>>> {
  const uid = await authenticate(conn);

  const result = await odooJsonRpc(conn.url, '/jsonrpc/2/object', {
    service: 'object',
    method: 'execute_kw',
    args: [
      conn.db,
      uid,
      conn.apiKey,
      'res.partner',
      'search_read',
      [domain],
      { fields: ['id', 'name', 'email', 'phone', 'city', 'country_id', 'company_id', 'website'], limit: 50 },
    ],
  });

  return result as Array<Record<string, unknown>>;
}

export async function getOdooProducts(
  conn: OdooConnection,
  domain: Array<[string, string, unknown]> = []
): Promise<Array<Record<string, unknown>>> {
  const uid = await authenticate(conn);

  const result = await odooJsonRpc(conn.url, '/jsonrpc/2/object', {
    service: 'object',
    method: 'execute_kw',
    args: [
      conn.db,
      uid,
      conn.apiKey,
      'product.product',
      'search_read',
      [domain],
      { fields: ['id', 'name', 'list_price', 'default_code', 'description_sale', 'categ_id'], limit: 50 },
    ],
  });

  return result as Array<Record<string, unknown>>;
}
