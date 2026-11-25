/**
 * Direct PostgreSQL fallback and PostgREST self-healing helper.
 * Used on the server whenever PostgREST returns PGRST002 (schema cache unavailable)
 * or HTTP 503 during container boot / migration windows.
 */

const ALLOWED_TABLES = new Set([
  'payment_settings',
  'site_settings',
  'provisioning_settings',
  'integrations',
  'infrastructure_nodes',
  'hosting_plans',
  'hosting_addons',
  'hosting_coupons',
  'hosting_orders',
  'hosting_services',
  'hosting_invoices',
  'support_tickets',
  'admin_users',
  'email_log',
  'leads',
  'payment_transactions',
  'transactions',
]);

function assertSafeIdentifier(name: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Invalid SQL identifier: ${name}`);
  }
  return `"${name}"`;
}

export function getCandidateDatabaseUrls(): string[] {
  const dbPass = process.env.POSTGRES_PASSWORD || 'postgres_standalone_pwd_2026';
  const candidates = [
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
    `postgresql://postgres:${dbPass}@db:5432/postgres`,
    `postgresql://postgres:${dbPass}@supabase-db:5432/postgres`,
  ];
  return candidates.filter((u): u is string => Boolean(u && !u.includes('placeholder')));
}

export function isPostgrestUnavailable(errOrRes: any): boolean {
  if (!errOrRes) return false;
  const code = String(errOrRes.code || errOrRes?.error?.code || '');
  const msg = String(errOrRes.message || errOrRes?.error?.message || errOrRes || '');
  return (
    code.startsWith('PGRST00') ||
    /schema cache|PGRST00|503 Service Unavailable|HTTP 503|fetch failed|ECONNREFUSED/i.test(msg)
  );
}

export async function withPgClient<T>(fn: (client: any) => Promise<T>): Promise<T> {
  // @ts-ignore
  const pg: any = await import('pg');
  const Client = pg.default?.Client || pg.Client;
  const urls = getCandidateDatabaseUrls();
  let lastError: any = null;

  for (const connectionString of urls) {
    const client = new Client({
      connectionString,
      connectionTimeoutMillis: 4000,
      ssl:
        connectionString.includes('sslmode=require') ||
        connectionString.includes('supabase.co') ||
        connectionString.includes('aws.')
          ? { rejectUnauthorized: false }
          : undefined,
    });
    try {
      await client.connect();
      try {
        return await fn(client);
      } finally {
        await client.end().catch(() => {});
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Direct PostgreSQL connection unavailable');
}

let lastRepairAttempt = 0;

/**
 * Self-heals common PostgREST PGRST002 causes (missing schema, role overrides,
 * or missing authenticator grants) and dispatches schema/config reload signals.
 */
export async function healPostgrestSchema(): Promise<{ ok: boolean; detail?: string }> {
  const now = Date.now();
  if (now - lastRepairAttempt < 10_000) {
    return { ok: true, detail: 'debounced' };
  }
  lastRepairAttempt = now;

  try {
    await withPgClient(async (client) => {
      await client.query(`
        CREATE SCHEMA IF NOT EXISTS public;
        CREATE SCHEMA IF NOT EXISTS graphql_public;
        CREATE SCHEMA IF NOT EXISTS storage;
        CREATE SCHEMA IF NOT EXISTS extensions;

        ALTER ROLE authenticator RESET pgrst.db_schemas;
        ALTER ROLE authenticator SET search_path TO public, graphql_public, extensions;

        GRANT USAGE ON SCHEMA public, graphql_public, extensions TO authenticator, anon, authenticated, service_role;
        GRANT USAGE ON SCHEMA storage TO authenticator, postgres, service_role;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator, anon, authenticated, service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator, anon, authenticated, service_role;
        GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticator, anon, authenticated, service_role;
        GRANT ALL ON ALL TABLES IN SCHEMA graphql_public TO authenticator, anon, authenticated, service_role;
        GRANT ALL ON ALL ROUTINES IN SCHEMA graphql_public TO authenticator, anon, authenticated, service_role;

        NOTIFY pgrst, 'reload config';
        NOTIFY pgrst, 'reload schema';
      `);
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, detail: err?.message || 'Repair failed' };
  }
}

export async function pgGetSingleRow(table: string, idValue: string | number = 1): Promise<Record<string, any> | null> {
  if (!ALLOWED_TABLES.has(table)) throw new Error(`Table not allowed: ${table}`);
  const t = assertSafeIdentifier(table);
  return withPgClient(async (client) => {
    const res = await client.query(`SELECT * FROM public.${t} WHERE id = $1 LIMIT 1`, [idValue]);
    return res.rows?.[0] || null;
  });
}

export async function pgListTable(table: string, orderColumn = 'created_at', ascending = false): Promise<any[]> {
  if (!ALLOWED_TABLES.has(table)) throw new Error(`Table not allowed: ${table}`);
  const t = assertSafeIdentifier(table);
  const o = assertSafeIdentifier(orderColumn);
  const dir = ascending ? 'ASC' : 'DESC';
  return withPgClient(async (client) => {
    try {
      const res = await client.query(`SELECT * FROM public.${t} ORDER BY ${o} ${dir}`);
      return res.rows || [];
    } catch {
      const res = await client.query(`SELECT * FROM public.${t}`);
      return res.rows || [];
    }
  });
}

/**
 * Parameterized upsert against valid columns actually existing in information_schema
 * so extra UI fields never fail with unknown column errors.
 */
export async function pgUpsertRow(
  table: string,
  row: Record<string, any>,
  conflictColumn = 'id'
): Promise<Record<string, any> | null> {
  if (!ALLOWED_TABLES.has(table)) throw new Error(`Table not allowed: ${table}`);
  const t = assertSafeIdentifier(table);
  const conflictCol = assertSafeIdentifier(conflictColumn);

  return withPgClient(async (client) => {
    const colRes = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    );
    const columnTypes = new Map<string, string>(
      (colRes.rows || []).map((r: any) => [String(r.column_name), String(r.data_type)])
    );

    const validEntries = Object.entries(row).filter(
      ([k, v]) => columnTypes.has(k) && v !== undefined
    );

    if (validEntries.length === 0) return null;

    const colsSql = validEntries.map(([k]) => assertSafeIdentifier(k)).join(', ');
    const placeholders = validEntries.map((_, idx) => `$${idx + 1}`).join(', ');
    const values = validEntries.map(([k, v]) => {
      const dt = columnTypes.get(k);
      if ((dt === 'jsonb' || dt === 'json') && typeof v !== 'string' && v !== null) {
        return JSON.stringify(v);
      }
      return v;
    });

    const updateCols = validEntries
      .map(([k]) => k)
      .filter((k) => k !== conflictColumn);

    const updateSql =
      updateCols.length > 0
        ? updateCols
            .map((k) => `${assertSafeIdentifier(k)} = EXCLUDED.${assertSafeIdentifier(k)}`)
            .join(', ')
        : `${conflictCol} = EXCLUDED.${conflictCol}`;

    const sql = `
      INSERT INTO public.${t} (${colsSql})
      VALUES (${placeholders})
      ON CONFLICT (${conflictCol}) DO UPDATE SET ${updateSql}
      RETURNING *;
    `;
    const res = await client.query(sql, values);
    return res.rows?.[0] || null;
  });
}

export async function pgDeleteById(table: string, id: string, idColumn = 'id'): Promise<void> {
  if (!ALLOWED_TABLES.has(table)) throw new Error(`Table not allowed: ${table}`);
  const t = assertSafeIdentifier(table);
  const c = assertSafeIdentifier(idColumn);
  await withPgClient(async (client) => {
    await client.query(`DELETE FROM public.${t} WHERE ${c} = $1`, [id]);
  });
}
