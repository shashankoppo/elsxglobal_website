import { NextResponse } from 'next/server';
import { withPgClient, healPostgrestSchema } from '@/lib/db/pgFallback';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasDbUrl = Boolean(process.env.DATABASE_URL);

  let dbStatus = 'unconfigured';
  let latencyMs = -1;
  let dbError = false;
  let directPgStatus = 'unconfigured';
  let healAttempted = false;

  if (hasDbUrl) {
    try {
      await withPgClient(async (client) => {
        await client.query('SELECT 1');
      });
      directPgStatus = 'connected';
    } catch {
      directPgStatus = 'error';
    }
  }

  if (supabaseUrl && anonKey) {
    const start = Date.now();
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      latencyMs = Date.now() - start;
      if (res.ok || res.status === 200 || res.status === 404) {
        dbStatus = 'connected';
      } else {
        dbStatus = 'error';
        dbError = true;
        if (res.status === 503 && directPgStatus === 'connected') {
          healAttempted = true;
          await healPostgrestSchema().catch(() => {});
        }
      }
    } catch {
      latencyMs = Date.now() - start;
      dbStatus = 'unreachable';
      dbError = true;
    }
  }

  let authStatus = 'unconfigured';
  let authError = false;
  try {
    const authTarget = process.env.GOTRUE_URL || 'http://auth:9999';
    const authRes = await fetch(`${authTarget}/health`, { signal: AbortSignal.timeout(3000) });
    authStatus = authRes.ok ? 'connected' : 'error';
    if (!authRes.ok) authError = true;
  } catch {
    authStatus = 'unreachable';
    authError = true;
  }

  // Determine overall health. If DB or auth unreachable → 503 so Docker marks unhealthy.
  const isHealthy = dbStatus === 'connected' && !authError;
  const httpStatus = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      // Intentionally omit internal URLs, keys, and raw error strings from public response
      auth: { status: authStatus },
      database: {
        configured: Boolean(supabaseUrl && anonKey),
        hasServiceRoleKey: hasServiceKey,
        hasDirectDbUrl: hasDbUrl,
        directPostgres: directPgStatus,
        healAttempted,
        status: dbStatus,
        latencyMs,
      },
    },
    { status: httpStatus }
  );
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
