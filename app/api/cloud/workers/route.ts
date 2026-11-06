export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

interface Worker {
  id: string;
  name: string;
  route: string;
  status: 'running' | 'throttled' | 'suspended';
  code: string;
  runtime: string;
  memoryLimitMb: number;
  cpuLimitMs: number;
  deployedAt: string;
  envVars: Record<string, string>;
  bindings: { type: string; name: string; resource: string }[];
}

let fallbackWorkers: Worker[] = [
  {
    id: 'wrk-001',
    name: 'edge-auth-router',
    route: 'api.apexdigital.io/auth/*',
    status: 'running',
    runtime: 'v8_isolate',
    memoryLimitMb: 128,
    cpuLimitMs: 50,
    deployedAt: '12 min ago',
    envVars: { JWT_SECRET: '••••••••••••••••', ENVIRONMENT: 'production' },
    bindings: [
      { type: 'KV Store', name: 'SESSIONS_KV', resource: 'kv-sess-prod-01' },
      { type: 'D1 Database', name: 'DB_USERS', resource: 'd1-users-apac' },
    ],
    code: `export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/auth/verify')) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) return new Response('Unauthorized', { status: 401 });
      return Response.json({ valid: true, timestamp: Date.now() });
    }
    return new Response('VaultHost Edge Worker Active');
  }
};`,
  },
  {
    id: 'wrk-002',
    name: 'image-transformer-cdn',
    route: 'media.apexdigital.io/transform/*',
    status: 'running',
    runtime: 'v8_isolate',
    memoryLimitMb: 256,
    cpuLimitMs: 100,
    deployedAt: '2 days ago',
    envVars: { CACHE_TTL: '86400', WEBP_QUALITY: '85' },
    bindings: [
      { type: 'VaultR2 Bucket', name: 'MEDIA_BUCKET', resource: 'bkt-user-media' },
    ],
    code: `export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const width = searchParams.get('w') || '800';
    return Response.json({ status: 'optimized', width, format: 'image/webp' });
  }
};`,
  },
];

const DEMO_LOGS = [
  { id: '1', time: '11:42:01.204', method: 'GET', path: '/auth/verify', status: 200, colo: 'BOM', duration: '1.2ms' },
  { id: '2', time: '11:42:02.819', method: 'POST', path: '/auth/token', status: 200, colo: 'BLR', duration: '2.4ms' },
  { id: '3', time: '11:42:04.102', method: 'GET', path: '/auth/verify', status: 200, colo: 'SIN', duration: '3.1ms' },
  { id: '4', time: '11:42:05.441', method: 'GET', path: '/auth/verify', status: 401, colo: 'FRA', duration: '0.8ms' },
  { id: '5', time: '11:42:06.912', method: 'POST', path: '/auth/refresh', status: 200, colo: 'BOM', duration: '1.9ms' },
  { id: '6', time: '11:42:08.310', method: 'GET', path: '/auth/health', status: 200, colo: 'DEL', duration: '0.5ms' },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');
    const logsOnly = searchParams.get('logs');

    if (logsOnly) {
      return NextResponse.json({
        success: true,
        logs: DEMO_LOGS,
      });
    }

    if (workerId) {
      const worker = fallbackWorkers.find(w => w.id === workerId);
      if (!worker) return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
      return NextResponse.json({ success: true, worker });
    }

    return NextResponse.json({
      success: true,
      workers: fallbackWorkers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, worker, code, envVars, options, intent } = body;

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    if (action === 'deploy_worker') {
      const { name, route, scriptCode = code } = worker || {};

      if (!name || !route) {
        return NextResponse.json({ success: false, error: 'Worker name and route pattern are required.' }, { status: 400 });
      }

      // Route through Action Gateway
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: 'user_active_session',
          type: 'user',
          tenantId: 'ten_portal_default',
          roles: ['tenant_developer'],
        },
        targetService: 'compute',
        actionVerb: 'deploy_worker',
        resourceUri: `compute://workers/${name}`,
        parameters: { name, route, runtime: 'v8_isolate', memoryLimitMb: 128 },
        idempotencyKey: `worker_deploy_${Date.now()}_${name}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);

      if (gatewayResult.status === 'executed') {
        const existingIdx = fallbackWorkers.findIndex(w => w.name === name);
        const updatedWorker: Worker = {
          id: existingIdx >= 0 ? fallbackWorkers[existingIdx].id : `wrk-${Date.now()}`,
          name,
          route,
          status: 'running',
          runtime: 'v8_isolate',
          memoryLimitMb: 128,
          cpuLimitMs: 50,
          deployedAt: 'Just now',
          envVars: envVars || { ENVIRONMENT: 'production' },
          bindings: existingIdx >= 0 ? fallbackWorkers[existingIdx].bindings : [],
          code: scriptCode || '// VaultHost edge worker',
        };

        if (existingIdx >= 0) {
          fallbackWorkers[existingIdx] = updatedWorker;
        } else {
          fallbackWorkers.push(updatedWorker);
        }

        return NextResponse.json({
          success: true,
          status: 'executed',
          worker: updatedWorker,
          gateway: gatewayResult,
        });
      }

      return NextResponse.json(gatewayResult, { status: 202 });
    }

    if (action === 'suspend_worker') {
      const { id } = worker;
      const target = fallbackWorkers.find(w => w.id === id);
      if (target) {
        target.status = target.status === 'suspended' ? 'running' : 'suspended';
      }
      return NextResponse.json({ success: true, status: target?.status });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
