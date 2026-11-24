export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Target GoTrue auth service directly inside Docker network, with fallback to gateway
const AUTH_TARGET = process.env.GOTRUE_URL || 'http://auth:9999';

async function proxyAuthRequest(req: NextRequest, { params }: { params: { path?: string[] } }) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type, X-Client-Info, x-upsert',
      },
    });
  }

  const subPath = params.path ? params.path.join('/') : '';
  const search = req.nextUrl.search || '';
  const targetUrl = `${AUTH_TARGET}/${subPath}${search}`;

  try {
    const headers = new Headers();
    // Forward essential headers
    for (const [key, value] of req.headers.entries()) {
      const lower = key.toLowerCase();
      // Skip hop-by-hop and host headers
      if (['host', 'connection', 'content-length'].includes(lower)) continue;
      headers.set(key, value);
    }

    // Ensure apikey and authorization are preserved
    const apikey = req.headers.get('apikey') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (apikey && !headers.has('apikey')) {
      headers.set('apikey', apikey);
    }

    const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    const body = hasBody ? await req.arrayBuffer() : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      cache: 'no-store',
    });

    const resHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      const lower = key.toLowerCase();
      // Preserve set-cookie, content-type, content-range
      if (['content-encoding', 'transfer-encoding', 'connection'].includes(lower)) continue;
      resHeaders.set(key, value);
    }
    resHeaders.set('Access-Control-Allow-Origin', '*');

    const resBody = await response.arrayBuffer();
    return new NextResponse(resBody, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error(`[auth-proxy] Failed to connect to ${targetUrl}:`, err.message);
    return NextResponse.json(
      {
        code: 502,
        error: 'Bad Gateway',
        message: `Auth service connection error: ${err.message}`,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyAuthRequest;
export const POST = proxyAuthRequest;
export const PUT = proxyAuthRequest;
export const PATCH = proxyAuthRequest;
export const DELETE = proxyAuthRequest;
export const OPTIONS = proxyAuthRequest;
