export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface WorkerBinding {
  type: string;
  name: string;
  resource: string;
}

export interface Worker {
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
  bindings: WorkerBinding[];
}

export interface WorkerLog {
  id: string;
  time: string;
  method: string;
  path: string;
  status: number;
  colo: string;
  duration: string;
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

const DEMO_LOGS: WorkerLog[] = [
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
    const workerId = searchParams.get('workerId') || searchParams.get('name') || searchParams.get('id');
    const logsOnly = searchParams.get('logs');

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (logsOnly) {
      return ok({
        logs: DEMO_LOGS,
      });
    }

    let workers = fallbackWorkers;
    try {
      const { data: dbWorkers, error } = await supabase
        .from('cloud_workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbWorkers && dbWorkers.length > 0) {
        workers = dbWorkers.map((w: any) => ({
          id: w.id,
          name: w.name,
          route: w.route_pattern || w.route,
          status: w.status || 'running',
          runtime: w.runtime || 'v8_isolate',
          memoryLimitMb: w.memory_limit_mb || 128,
          cpuLimitMs: w.cpu_limit_ms || 50,
          deployedAt: w.updated_at ? new Date(w.updated_at).toLocaleTimeString() : 'Recently',
          envVars: w.env_vars || {},
          bindings: w.bindings || [],
          code: w.script_code || '',
        }));
      }
    } catch {}

    if (workerId) {
      const worker = workers.find(w => w.id === workerId || w.name === workerId);
      if (!worker) return err('NOT_FOUND', 'Worker not found', { status: 404 });
      return ok({ worker, user: user ? { id: user.id, email: user.email } : null });
    }

    return ok({
      workers,
      user: user ? { id: user.id, email: user.email } : null,
    });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, worker, code, envVars, options, intent } = body;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'deploy_worker') {
      const name = worker?.name || body.name;
      const route = worker?.route || body.route || body.routes || 'api.vaulthost.cloud/*';
      const scriptCode = worker?.scriptCode || worker?.script || code || body.script || '// VaultHost edge worker';

      if (!name || !route) {
        return err('BAD_REQUEST', 'Worker name and route pattern are required.', { status: 400 });
      }

      // Route through Action Gateway
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
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
          envVars: envVars || (existingIdx >= 0 ? fallbackWorkers[existingIdx].envVars : { ENVIRONMENT: 'production' }),
          bindings: existingIdx >= 0 ? fallbackWorkers[existingIdx].bindings : [],
          code: scriptCode,
        };

        if (existingIdx >= 0) {
          fallbackWorkers[existingIdx] = updatedWorker;
        } else {
          fallbackWorkers.push(updatedWorker);
        }

        try {
          await supabase.from('cloud_workers').upsert({
            tenant_id: tenantId,
            name,
            route_pattern: route,
            script_code: scriptCode,
            status: 'running',
          });
        } catch {}

        return ok({
          status: 'executed',
          worker: updatedWorker,
          gateway: gatewayResult,
        });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'suspend_worker' || action === 'resume_worker') {
      const id = worker?.id || body.id || worker?.name || body.name;
      if (!id) {
        return err('BAD_REQUEST', 'Worker id or name is required', { status: 400 });
      }

      const actionVerb = action === 'resume_worker' ? 'resume_worker' : 'suspend_worker';
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_developer'],
        },
        targetService: 'compute',
        actionVerb,
        resourceUri: `compute://workers/${id}`,
        parameters: { id, action: actionVerb },
        idempotencyKey: `worker_toggle_${Date.now()}_${id}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        const target = fallbackWorkers.find(w => w.id === id || w.name === id);
        if (target) {
          target.status = action === 'resume_worker' ? 'running' : (target.status === 'suspended' ? 'running' : 'suspended');
        }
        return ok({ status: target?.status, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'delete_worker') {
      const id = worker?.id || body.id || worker?.name || body.name;
      if (!id) {
        return err('BAD_REQUEST', 'Worker id or name is required', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_developer'],
        },
        targetService: 'compute',
        actionVerb: 'delete_worker',
        resourceUri: `compute://workers/${id}`,
        parameters: { id },
        idempotencyKey: `worker_del_${Date.now()}_${id}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        fallbackWorkers = fallbackWorkers.filter(w => w.id !== id && w.name !== id);
        try {
          await supabase.from('cloud_workers').delete().or(`id.eq.${id},name.eq.${id}`);
        } catch {}
        return ok({ message: `Worker ${id} deleted.`, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    return err('BAD_REQUEST', `Unsupported action: ${action}`, { status: 400 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || searchParams.get('name');
    if (!id) {
      return err('BAD_REQUEST', 'Worker id or name is required', { status: 400 });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_developer'],
      },
      targetService: 'compute',
      actionVerb: 'delete_worker',
      resourceUri: `compute://workers/${id}`,
      parameters: { id },
      idempotencyKey: `worker_del_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
    };

    const gatewayResult = await processActionIntent(actionIntent);
    if (gatewayResult.status === 'executed') {
      fallbackWorkers = fallbackWorkers.filter(w => w.id !== id && w.name !== id);
      try {
        await supabase.from('cloud_workers').delete().or(`id.eq.${id},name.eq.${id}`);
      } catch {}
      return ok({ message: `Worker ${id} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
