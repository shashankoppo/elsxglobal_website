export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';
import { WorkerdClient } from '@/lib/workers/workerd';

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

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
      return err('UNAUTHORIZED', 'Authentication required to access workers', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId') || searchParams.get('name') || searchParams.get('id');
    const logsOnly = searchParams.get('logs');

    if (logsOnly) {
      const { data: dbLogs } = await supabase
        .from('cloud_worker_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      const logs: WorkerLog[] = (dbLogs || []).map((l: any) => ({
        id: l.id,
        time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Just now',
        method: l.method || 'GET',
        path: l.path || '/',
        status: l.status_code || 200,
        colo: l.colo || 'BOM',
        duration: l.duration_ms ? `${l.duration_ms}ms` : '1.2ms',
      }));

      return ok({ logs });
    }

    let workers: Worker[] = [];
    const { data: dbWorkers, error } = await supabase
      .from('cloud_workers')
      .select('*')
      .eq('tenant_id', user.id)
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

    if (workerId) {
      const worker = workers.find(w => w.id === workerId || w.name === workerId);
      if (!worker) return err('NOT_FOUND', 'Worker not found or permission denied', { status: 404 });
      return ok({ worker, user: { id: user.id, email: user.email } });
    }

    return ok({
      workers,
      user: { id: user.id, email: user.email },
    });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
      return err('UNAUTHORIZED', 'Authentication required for worker operations', { status: 401 });
    }

    const body = await req.json();
    const { action, worker, code, envVars, options, intent } = body;
    const actorId = user.id;
    const tenantId = user.id;

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
        const workerId = crypto.randomUUID();

        // 1. Dispatch to workerd runtime
        try {
          const workerd = new WorkerdClient();
          await workerd.deployWorker(
            user.id,
            name,
            scriptCode,
            [route],
            envVars || { ENVIRONMENT: 'production' }
          );
        } catch (workerdErr: any) {
          console.warn('[Workers Route] workerd backend notice:', workerdErr.message);
        }

        // 2. Persist to Supabase
        await supabase.from('cloud_workers').upsert({
          id: workerId,
          tenant_id: tenantId,
          name,
          route_pattern: route,
          script_code: scriptCode,
          status: 'running',
          updated_at: new Date().toISOString(),
        });

        const deployedWorker: Worker = {
          id: workerId,
          name,
          route,
          status: 'running',
          runtime: 'v8_isolate',
          memoryLimitMb: 128,
          cpuLimitMs: 50,
          deployedAt: 'Just now',
          envVars: envVars || { ENVIRONMENT: 'production' },
          bindings: [],
          code: scriptCode,
        };

        return ok({
          status: 'executed',
          worker: deployedWorker,
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

      // Verify ownership
      const { data: existingWorker } = await supabase
        .from('cloud_workers')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`id.eq.${id},name.eq.${id}`)
        .maybeSingle();

      if (!existingWorker) {
        return err('NOT_FOUND', 'Worker not found or permission denied', { status: 404 });
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
        const newStatus = action === 'resume_worker' ? 'running' : 'suspended';

        try {
          const workerd = new WorkerdClient();
          await workerd.setWorkerStatus(existingWorker.id, newStatus === 'running' ? 'running' : 'stopped');
        } catch {}

        await supabase
          .from('cloud_workers')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', existingWorker.id)
          .eq('tenant_id', tenantId);

        return ok({ status: newStatus, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'delete_worker') {
      const id = worker?.id || body.id || worker?.name || body.name;
      if (!id) {
        return err('BAD_REQUEST', 'Worker id or name is required', { status: 400 });
      }

      // Verify ownership
      const { data: existingWorker } = await supabase
        .from('cloud_workers')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`id.eq.${id},name.eq.${id}`)
        .maybeSingle();

      if (!existingWorker) {
        return err('NOT_FOUND', 'Worker not found or permission denied', { status: 404 });
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
        try {
          const workerd = new WorkerdClient();
          await workerd.deleteWorker(existingWorker.id);
        } catch {}

        await supabase
          .from('cloud_workers')
          .delete()
          .eq('id', existingWorker.id)
          .eq('tenant_id', tenantId);

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

    if (!user) {
      return err('UNAUTHORIZED', 'Authentication required', { status: 401 });
    }

    const { data: existingWorker } = await supabase
      .from('cloud_workers')
      .select('*')
      .eq('tenant_id', user.id)
      .or(`id.eq.${id},name.eq.${id}`)
      .maybeSingle();

    if (!existingWorker) {
      return err('NOT_FOUND', 'Worker not found or permission denied', { status: 404 });
    }

    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: user.id,
        type: 'user',
        tenantId: user.id,
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
      try {
        const workerd = new WorkerdClient();
        await workerd.deleteWorker(existingWorker.id);
      } catch {}

      await supabase.from('cloud_workers').delete().eq('id', existingWorker.id).eq('tenant_id', user.id);
      return ok({ message: `Worker ${id} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
