export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface KvNamespace {
  id: string;
  name: string;
  entryCount: number;
  sizeBytes: number;
  createdAt: string;
}

export interface KvEntry {
  key: string;
  value: string;
  ttlSeconds?: number;
  expiresAt?: string;
  updatedAt: string;
}

let fallbackNamespaces: KvNamespace[] = [
  { id: 'kv-ns-001', name: 'AUTH_SESSIONS', entryCount: 14200, sizeBytes: 2450000, createdAt: '2026-01-10T00:00:00Z' },
  { id: 'kv-ns-002', name: 'EDGE_CONFIG', entryCount: 45, sizeBytes: 12000, createdAt: '2026-02-01T00:00:00Z' },
];

let fallbackEntries: Record<string, Record<string, KvEntry>> = {
  'kv-ns-001': {
    'sess_9f81a': { key: 'sess_9f81a', value: JSON.stringify({ userId: 'u_101', role: 'admin' }), ttlSeconds: 86400, updatedAt: '2026-03-01T12:00:00Z' },
  },
  'AUTH_SESSIONS': {
    'sess_9f81a': { key: 'sess_9f81a', value: JSON.stringify({ userId: 'u_101', role: 'admin' }), ttlSeconds: 86400, updatedAt: '2026-03-01T12:00:00Z' },
  },
  'kv-ns-002': {
    'maintenance_mode': { key: 'maintenance_mode', value: 'false', updatedAt: '2026-03-10T08:00:00Z' },
    'rate_limit_default': { key: 'rate_limit_default', value: '1000', updatedAt: '2026-03-10T08:00:00Z' },
  },
  'EDGE_CONFIG': {
    'maintenance_mode': { key: 'maintenance_mode', value: 'false', updatedAt: '2026-03-10T08:00:00Z' },
    'rate_limit_default': { key: 'rate_limit_default', value: '1000', updatedAt: '2026-03-10T08:00:00Z' },
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const namespaceId = searchParams.get('namespace') || searchParams.get('namespaceId');
    const key = searchParams.get('key');
    const prefix = searchParams.get('prefix');

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    // If specific namespace requested
    if (namespaceId) {
      if (key) {
        // Fetch specific key
        try {
          const { data, error } = await supabase
            .from('cloud_kv_entries')
            .select('*')
            .eq('namespace_id', namespaceId)
            .eq('key', key)
            .single();

          if (!error && data) {
            return ok({
              key: data.key,
              value: data.value,
              ttl: data.ttl_seconds,
              expiresAt: data.expires_at,
              updatedAt: data.updated_at,
            });
          }
        } catch {}

        const entry = fallbackEntries[namespaceId]?.[key];
        if (entry) {
          return ok({ value: entry.value, key: entry.key, ttl: entry.ttlSeconds });
        }
        return err('NOT_FOUND', `Key '${key}' not found in namespace '${namespaceId}'`, { status: 404 });
      }

      // List entries or keys in namespace
      let entries: KvEntry[] = [];
      try {
        let query = supabase
          .from('cloud_kv_entries')
          .select('*')
          .eq('namespace_id', namespaceId);

        if (prefix) {
          query = query.ilike('key', `${prefix}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
        if (!error && data && data.length > 0) {
          entries = data.map((d: any) => ({
            key: d.key,
            value: d.value,
            ttlSeconds: d.ttl_seconds,
            expiresAt: d.expires_at,
            updatedAt: d.updated_at,
          }));
        }
      } catch {}

      if (entries.length === 0 && fallbackEntries[namespaceId]) {
        entries = Object.values(fallbackEntries[namespaceId]);
        if (prefix) {
          entries = entries.filter(e => e.key.startsWith(prefix));
        }
      }

      return ok({
        namespace: namespaceId,
        keys: entries.map(e => e.key),
        entries,
        count: entries.length,
      });
    }

    // List all namespaces
    let namespaces = fallbackNamespaces;
    try {
      const { data: dbNamespaces, error } = await supabase
        .from('cloud_kv_namespaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbNamespaces && dbNamespaces.length > 0) {
        namespaces = dbNamespaces.map((ns: any) => ({
          id: ns.id,
          name: ns.name,
          entryCount: ns.entry_count || 0,
          sizeBytes: ns.size_bytes || 0,
          createdAt: ns.created_at,
        }));
      }
    } catch {}

    return ok({
      namespaces,
      stats: {
        totalNamespaces: namespaces.length,
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
    const { action = 'put', namespaceId, namespace, name, key, value, ttl, ttlSeconds, options = {}, intent } = body;
    const nsKey = namespaceId || namespace || name;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'create_namespace') {
      const nsName = name || namespace || namespaceId;
      if (!nsName) {
        return err('BAD_REQUEST', 'Namespace name is required', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_developer'],
        },
        targetService: 'storage',
        actionVerb: 'create',
        resourceUri: `storage://kv/namespaces/${nsName}`,
        parameters: { name: nsName },
        idempotencyKey: `kv_ns_create_${Date.now()}_${nsName}`,
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
        const newNs: KvNamespace = {
          id: `kv-ns-${Date.now()}`,
          name: nsName,
          entryCount: 0,
          sizeBytes: 0,
          createdAt: new Date().toISOString(),
        };
        fallbackNamespaces.unshift(newNs);
        fallbackEntries[newNs.id] = {};
        fallbackEntries[newNs.name] = {};

        try {
          await supabase.from('cloud_kv_namespaces').insert({
            tenant_id: tenantId,
            name: nsName,
          });
        } catch {}

        return ok({
          status: 'executed',
          namespace: newNs,
          gateway: gatewayResult,
        });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'put' || action === 'set') {
      if (!nsKey || !key || value === undefined) {
        return err('BAD_REQUEST', 'namespaceId, key, and value are required', { status: 400 });
      }

      const effectiveTtl = Number(ttlSeconds ?? ttl ?? 0);
      const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_developer'],
        },
        targetService: 'storage',
        actionVerb: 'insert',
        resourceUri: `storage://kv/namespaces/${nsKey}/entries/${key}`,
        parameters: { namespaceId: nsKey, key, value: strVal, ttlSeconds: effectiveTtl },
        idempotencyKey: `kv_put_${Date.now()}_${key}`,
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
        if (!fallbackEntries[nsKey]) fallbackEntries[nsKey] = {};
        fallbackEntries[nsKey][key] = {
          key,
          value: strVal,
          ttlSeconds: effectiveTtl || undefined,
          updatedAt: new Date().toISOString(),
        };

        try {
          await supabase.from('cloud_kv_entries').upsert({
            namespace_id: nsKey,
            key,
            value: strVal,
            ttl_seconds: effectiveTtl || null,
          });
        } catch {}

        return ok({
          status: 'executed',
          key,
          namespaceId: nsKey,
          gateway: gatewayResult,
        });
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
    const namespaceId = searchParams.get('namespace') || searchParams.get('namespaceId') || body.namespaceId || body.namespace;
    const key = searchParams.get('key') || body.key;
    const options = body.options || {};

    if (!namespaceId) {
      return err('BAD_REQUEST', 'Namespace ID is required', { status: 400 });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    // Tier 1 for writes/deletes
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_developer'],
      },
      targetService: 'storage',
      actionVerb: 'delete',
      resourceUri: key ? `storage://kv/namespaces/${namespaceId}/entries/${key}` : `storage://kv/namespaces/${namespaceId}`,
      parameters: { namespaceId, key },
      idempotencyKey: `kv_del_${Date.now()}_${namespaceId}_${key || 'all'}`,
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
      if (key) {
        if (fallbackEntries[namespaceId]) {
          delete fallbackEntries[namespaceId][key];
        }
        try {
          await supabase.from('cloud_kv_entries').delete().eq('namespace_id', namespaceId).eq('key', key);
        } catch {}
        return ok({ message: `Key '${key}' deleted from namespace '${namespaceId}'.`, gateway: gatewayResult });
      }

      fallbackNamespaces = fallbackNamespaces.filter(n => n.id !== namespaceId && n.name !== namespaceId);
      delete fallbackEntries[namespaceId];
      try {
        await supabase.from('cloud_kv_namespaces').delete().or(`id.eq.${namespaceId},name.eq.${namespaceId}`);
        await supabase.from('cloud_kv_entries').delete().eq('namespace_id', namespaceId);
      } catch {}

      return ok({ message: `Namespace '${namespaceId}' deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
