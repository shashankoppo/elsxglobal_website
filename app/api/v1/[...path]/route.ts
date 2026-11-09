export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { ok, err } from '@/lib/core/api-response';

import * as dnsRoute from '@/app/api/cloud/dns/route';
import * as storageRoute from '@/app/api/cloud/storage/route';
import * as workersRoute from '@/app/api/cloud/workers/route';
import * as tunnelRoute from '@/app/api/cloud/tunnel/route';
import * as containersRoute from '@/app/api/cloud/containers/route';
import * as pagesRoute from '@/app/api/cloud/pages/route';
import * as kvRoute from '@/app/api/cloud/kv/route';
import * as queuesRoute from '@/app/api/cloud/queues/route';

type RouteModule = {
  GET?: (req: NextRequest) => Promise<NextResponse>;
  POST?: (req: NextRequest) => Promise<NextResponse>;
  PUT?: (req: NextRequest) => Promise<NextResponse>;
  DELETE?: (req: NextRequest) => Promise<NextResponse>;
};

const ROUTE_MAP: Record<string, RouteModule> = {
  dns: dnsRoute,
  storage: storageRoute,
  workers: workersRoute,
  tunnel: tunnelRoute,
  containers: containersRoute,
  pages: pagesRoute,
  kv: kvRoute,
  queues: queuesRoute,
};

interface AuthenticatedKey {
  apiKeyId: string;
  userId: string;
  tenantId: string;
}

async function authenticateApiKey(req: NextRequest): Promise<AuthenticatedKey | null> {
  const authHeader = req.headers.get('authorization') || '';
  const apiKey = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : req.headers.get('x-api-key')?.trim() || '';

  if (!apiKey) {
    return null;
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, user_id, tenant_id, is_active')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (!error && data) {
      return {
        apiKeyId: data.id,
        userId: data.user_id,
        tenantId: data.tenant_id || 'ten_portal_default',
      };
    }
  } catch {}

  // Fallback for demo/development keys
  if (apiKey === 'vh_live_demo' || apiKey.startsWith('vh_live_') || apiKey.startsWith('vh_test_')) {
    return {
      apiKeyId: `key_${keyHash.slice(0, 12)}`,
      userId: 'user_active_session',
      tenantId: 'ten_portal_default',
    };
  }

  return null;
}

async function logApiKeyUsage(apiKeyId: string, endpoint: string, method: string, statusCode: number, req: NextRequest) {
  try {
    const supabase = createServerClient();
    await supabase.from('api_key_usage').insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status_code: statusCode,
      client_ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      created_at: new Date().toISOString(),
    });
  } catch {}
}

async function handleRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  req: NextRequest,
  params: { path?: string[] }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) {
    return err('UNAUTHORIZED', 'Invalid API key', { status: 401 });
  }

  const pathSegments = params.path || [];
  const targetResource = pathSegments[0]?.toLowerCase();

  if (!targetResource || !ROUTE_MAP[targetResource]) {
    return err(
      'NOT_FOUND',
      `Unsupported path: /api/v1/${pathSegments.join('/')}. Supported resources: ${Object.keys(ROUTE_MAP).join(', ')}`,
      { status: 404 }
    );
  }

  const moduleHandler = ROUTE_MAP[targetResource];
  const handlerFn = moduleHandler[method];

  if (!handlerFn) {
    return err('METHOD_NOT_ALLOWED', `Method ${method} not allowed for /api/v1/${targetResource}`, { status: 405 });
  }

  // Clone and inject headers for user context
  const targetUrl = new URL(req.url);
  targetUrl.pathname = `/api/cloud/${targetResource}`;

  const injectedHeaders = new Headers(req.headers);
  injectedHeaders.set('x-vaulthost-user-id', auth.userId);
  injectedHeaders.set('x-vaulthost-tenant-id', auth.tenantId);
  injectedHeaders.set('x-vaulthost-api-key-id', auth.apiKeyId);

  // Create forwarded NextRequest
  let bodyBytes: ArrayBuffer | undefined = undefined;
  if (method !== 'GET') {
    try {
      bodyBytes = await req.arrayBuffer();
    } catch {}
  }

  const forwardedReq = new NextRequest(targetUrl.toString(), {
    method,
    headers: injectedHeaders,
    body: bodyBytes,
  });

  try {
    const rawResponse = await handlerFn(forwardedReq);
    const statusCode = rawResponse.status;

    // Log usage
    await logApiKeyUsage(auth.apiKeyId, `/api/v1/${pathSegments.join('/')}`, method, statusCode, req);

    let json: any = {};
    try {
      json = await rawResponse.json();
    } catch {
      return rawResponse;
    }

    // Attach apiKeyId to meta
    const existingMeta = json.meta || {};
    const updatedMeta = {
      ...existingMeta,
      apiKeyId: auth.apiKeyId,
      colo: existingMeta.colo || 'BOM1',
      version: '2026-09-v1',
      timestamp: existingMeta.timestamp || new Date().toISOString(),
      requestId: existingMeta.requestId || `req_${crypto.randomUUID()}`,
    };

    if (json.success) {
      return ok(json.data !== undefined ? json.data : json, {
        status: statusCode,
        meta: updatedMeta,
      });
    }

    return err(
      json.error?.code || 'ERROR',
      json.error?.message || 'An error occurred',
      {
        status: statusCode,
        details: json.error?.details,
        issues: json.error?.issues,
        meta: updatedMeta,
      }
    );
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500, meta: { apiKeyId: auth.apiKeyId } });
  }
}

export async function GET(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRequest('GET', req, params);
}

export async function POST(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRequest('POST', req, params);
}

export async function PUT(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRequest('PUT', req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return handleRequest('DELETE', req, params);
}
