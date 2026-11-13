export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface CloudQueue {
  id: string;
  name: string;
  messagesAvailable: number;
  messagesInFlight: number;
  messagesDelayed: number;
  deliveryDelaySeconds: number;
  maxRetries: number;
  deadLetterQueue?: string;
  createdAt: string;
}

let fallbackQueues: CloudQueue[] = [
  {
    id: 'queue-001',
    name: 'order-processing-queue',
    messagesAvailable: 142,
    messagesInFlight: 8,
    messagesDelayed: 0,
    deliveryDelaySeconds: 0,
    maxRetries: 3,
    deadLetterQueue: 'order-processing-dlq',
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'queue-002',
    name: 'email-dispatch-queue',
    messagesAvailable: 28,
    messagesInFlight: 4,
    messagesDelayed: 12,
    deliveryDelaySeconds: 60,
    maxRetries: 5,
    deadLetterQueue: 'email-dispatch-dlq',
    createdAt: '2026-02-15T14:00:00Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queueId = searchParams.get('id') || searchParams.get('queueId') || searchParams.get('name');

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    let queues = fallbackQueues;
    try {
      const { data: dbQueues, error } = await supabase
        .from('cloud_queues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbQueues && dbQueues.length > 0) {
        queues = dbQueues.map((q: any) => ({
          id: q.id,
          name: q.name,
          messagesAvailable: q.messages_available ?? 0,
          messagesInFlight: q.messages_in_flight ?? 0,
          messagesDelayed: q.messages_delayed ?? 0,
          deliveryDelaySeconds: q.delivery_delay_seconds ?? 0,
          maxRetries: q.max_retries ?? 3,
          deadLetterQueue: q.dead_letter_queue,
          createdAt: q.created_at,
        }));
      }
    } catch {}

    if (queueId) {
      const queue = queues.find(q => q.id === queueId || q.name === queueId);
      if (!queue) return err('NOT_FOUND', 'Queue not found', { status: 404 });
      return ok({ queue, user: user ? { id: user.id, email: user.email } : null });
    }

    return ok({
      queues,
      stats: {
        totalQueues: queues.length,
        totalMessagesInFlight: queues.reduce((sum, q) => sum + q.messagesInFlight, 0),
        totalMessagesAvailable: queues.reduce((sum, q) => sum + q.messagesAvailable, 0),
      },
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
    const { action = 'create_queue', name, queueName, queueId, message, payload, deliveryDelaySeconds = 0, maxRetries = 3, deadLetterQueue, options = {}, intent } = body;
    const finalName = name || queueName;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'create_queue' || action === 'create') {
      if (!finalName) {
        return err('BAD_REQUEST', 'Queue name is required', { status: 400 });
      }

      // Tier 1 for create queue
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_developer'],
        },
        targetService: 'compute',
        actionVerb: 'create',
        resourceUri: `compute://queues/${finalName}`,
        parameters: { name: finalName, deliveryDelaySeconds, maxRetries, deadLetterQueue },
        idempotencyKey: `queue_create_${Date.now()}_${finalName}`,
        createdAt: new Date().toISOString(),
      };

      const execOptions = {
        ...options,
        tenantPolicyOverrides: [
          ...(options.tenantPolicyOverrides || []),
          { tenantId, enforceTier: 1 as const },
        ],
      };

      const gatewayResult = await processActionIntent(actionIntent, execOptions);
      if (gatewayResult.status === 'executed') {
        const newQueue: CloudQueue = {
          id: `queue-${Date.now()}`,
          name: finalName,
          messagesAvailable: 0,
          messagesInFlight: 0,
          messagesDelayed: 0,
          deliveryDelaySeconds: Number(deliveryDelaySeconds),
          maxRetries: Number(maxRetries),
          deadLetterQueue,
          createdAt: new Date().toISOString(),
        };
        fallbackQueues.unshift(newQueue);

        try {
          await supabase.from('cloud_queues').insert({
            tenant_id: tenantId,
            name: finalName,
            delivery_delay_seconds: Number(deliveryDelaySeconds),
            max_retries: Number(maxRetries),
            dead_letter_queue: deadLetterQueue || null,
          });
        } catch {}

        return ok({
          status: 'executed',
          queue: newQueue,
          gateway: gatewayResult,
        });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'publish' || action === 'publish_message') {
      const targetQueue = queueId || finalName;
      if (!targetQueue) {
        return err('BAD_REQUEST', 'Queue name or ID is required to publish', { status: 400 });
      }

      const msgPayload = message || payload;
      if (msgPayload === undefined) {
        return err('BAD_REQUEST', 'Message payload is required', { status: 400 });
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
        actionVerb: 'insert',
        resourceUri: `compute://queues/${targetQueue}/messages`,
        parameters: { queue: targetQueue, payload: typeof msgPayload === 'object' ? JSON.stringify(msgPayload) : String(msgPayload) },
        idempotencyKey: `queue_pub_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString(),
      };

      const execOptions = {
        ...options,
        tenantPolicyOverrides: [
          ...(options.tenantPolicyOverrides || []),
          { tenantId, enforceTier: 1 as const },
        ],
      };

      const gatewayResult = await processActionIntent(actionIntent, execOptions);
      if (gatewayResult.status === 'executed') {
        const q = fallbackQueues.find(queue => queue.id === targetQueue || queue.name === targetQueue);
        if (q) {
          q.messagesAvailable += 1;
        }

        const messageId = `msg_${crypto.randomUUID()}`;
        return ok({
          status: 'executed',
          messageId,
          queue: targetQueue,
          gateway: gatewayResult,
        });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'purge') {
      const targetQueue = queueName || queueId || name || body.id;
      if (!targetQueue) {
        return err('BAD_REQUEST', 'Queue name is required to purge', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: { id: actorId, type: 'user', tenantId, roles: ['tenant_operator'] },
        targetService: 'compute',
        actionVerb: 'purge',
        resourceUri: `compute://queues/${targetQueue}/messages`,
        parameters: { queue: targetQueue },
        idempotencyKey: `queue_purge_${Date.now()}_${targetQueue}`,
        createdAt: new Date().toISOString(),
      };

      const execOptions = {
        ...options,
        tenantPolicyOverrides: [
          ...(options.tenantPolicyOverrides || []),
          { tenantId, enforceTier: 1 as const },
        ],
      };

      const gatewayResult = await processActionIntent(actionIntent, execOptions);
      if (gatewayResult.status === 'executed') {
        const q = fallbackQueues.find(queue => queue.id === targetQueue || queue.name === targetQueue);
        if (q) {
          q.messagesAvailable = 0;
          q.messagesInFlight = 0;
          q.messagesDelayed = 0;
        }
        return ok({ status: 'executed', message: `Queue ${targetQueue} purged.`, gateway: gatewayResult });
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
    const body = await req.json().catch(() => ({}));
    const id = searchParams.get('id') || searchParams.get('queueId') || searchParams.get('name') || body.id || body.queueId;
    const options = body.options || {};

    if (!id) {
      return err('BAD_REQUEST', 'Queue ID is required for deletion', { status: 400 });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    // Tier 1 for queue delete
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_admin'],
      },
      targetService: 'compute',
      actionVerb: 'delete',
      resourceUri: `compute://queues/${id}`,
      parameters: { queueId: id },
      idempotencyKey: `queue_del_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 1 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);
    if (gatewayResult.status === 'executed') {
      fallbackQueues = fallbackQueues.filter(q => q.id !== id && q.name !== id);
      try {
        await supabase.from('cloud_queues').delete().or(`id.eq.${id},name.eq.${id}`);
      } catch {}

      return ok({ message: `Queue ${id} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
