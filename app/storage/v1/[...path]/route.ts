export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const STORAGE_TARGET = process.env.STORAGE_URL || 'http://storage:5000';

async function proxyStorageRequest(req: NextRequest, { params }: { params: { path?: string[] } }) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type, x-upsert',
      },
    });
  }

  const subPath = params.path ? params.path.join('/') : '';
  const search = req.nextUrl.search || '';
  const targetUrl = `${STORAGE_TARGET}/${subPath}${search}`;

  try {
    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
      const lower = key.toLowerCase();
      if (['host', 'connection', 'content-length'].includes(lower)) continue;
      headers.set(key, value);
    }

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
    console.error(`[storage-proxy] Failed to connect to ${targetUrl}:`, err.message);
    return NextResponse.json(
      {
        code: 502,
        error: 'Bad Gateway',
        message: `Storage service connection error: ${err.message}`,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyStorageRequest;
export const POST = proxyStorageRequest;
export const PUT = proxyStorageRequest;
export const PATCH = proxyStorageRequest;
export const DELETE = proxyStorageRequest;
export const OPTIONS = proxyStorageRequest;
