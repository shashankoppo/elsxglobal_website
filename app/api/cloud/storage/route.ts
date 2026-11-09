export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface Bucket {
  id: string;
  name: string;
  region: string;
  objects: number;
  sizeGb: number;
  publicAccess: boolean;
  corsEnabled: boolean;
  created: string;
  egressCostSavedUsd: number;
}

export interface StorageCredential {
  id: string;
  accessKey: string;
  name: string;
  permissions: string;
  lastUsed: string;
}

let fallbackBuckets: Bucket[] = [
  {
    id: 'bkt-01',
    name: 'user-media-uploads',
    region: 'Auto (Anycast Edge)',
    objects: 1420500,
    sizeGb: 312.4,
    publicAccess: true,
    corsEnabled: true,
    created: '2026-02-14',
    egressCostSavedUsd: 1405.80,
  },
  {
    id: 'bkt-02',
    name: 'db-backup-snapshots',
    region: 'Mumbai, India (ap-south)',
    objects: 84,
    sizeGb: 840.0,
    publicAccess: false,
    corsEnabled: false,
    created: '2026-03-01',
    egressCostSavedUsd: 3780.00,
  },
  {
    id: 'bkt-03',
    name: 'static-frontend-assets',
    region: 'Auto (Anycast Edge)',
    objects: 28400,
    sizeGb: 14.8,
    publicAccess: true,
    corsEnabled: true,
    created: '2026-04-10',
    egressCostSavedUsd: 66.60,
  },
];

let fallbackKeys: StorageCredential[] = [
  { id: 'key-01', accessKey: 'vh_r2_live_9f83a8b27c1094ea', name: 'Production Backend API', permissions: 'Read-Write', lastUsed: '3 min ago' },
  { id: 'key-02', accessKey: 'vh_r2_back_3e21d019fba82c91', name: 'Automated Backup Agent', permissions: 'Admin', lastUsed: '4 hours ago' },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bucketName = searchParams.get('bucket') || searchParams.get('name');

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    // Try Supabase first
    let buckets = fallbackBuckets;
    try {
      const { data: dbBuckets, error } = await supabase
        .from('cloud_storage_buckets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbBuckets && dbBuckets.length > 0) {
        buckets = dbBuckets.map((b: any) => ({
          id: b.id,
          name: b.name,
          region: b.region || 'Auto (Anycast Edge)',
          objects: b.objects_count || 0,
          sizeGb: b.size_bytes ? Number((b.size_bytes / (1024 * 1024 * 1024)).toFixed(2)) : 0,
          publicAccess: Boolean(b.public_access),
          corsEnabled: Boolean(b.cors_enabled),
          created: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : '2026-01-01',
          egressCostSavedUsd: b.egress_saved_usd || 0,
        }));
      }
    } catch {}

    const totalStorageGb = buckets.reduce((sum, b) => sum + b.sizeGb, 0);
    const totalObjects = buckets.reduce((sum, b) => sum + b.objects, 0);
    const totalEgressSaved = buckets.reduce((sum, b) => sum + b.egressCostSavedUsd, 0);

    return ok({
      stats: {
        totalBuckets: buckets.length,
        totalStorageGb: totalStorageGb.toFixed(1),
        totalObjects: totalObjects.toLocaleString(),
        totalEgressSavedUsd: totalEgressSaved.toFixed(2),
        egressFee: '$0.00 (Zero Egress Network)',
      },
      buckets,
      credentials: fallbackKeys,
      activeBucket: bucketName ? buckets.find(b => b.name === bucketName) || null : null,
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
    const { action, bucket, name: rawName, options, intent } = body;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'create_bucket') {
      const name = bucket?.name || rawName;
      const region = bucket?.region || body.region || 'Auto (Anycast Edge)';
      const publicAccess = bucket?.publicAccess ?? body.publicAccess ?? false;

      if (!name || !/^[a-z0-9.-]{3,63}$/.test(name)) {
        return err('BAD_REQUEST', 'Bucket name must be 3-63 lowercase alphanumeric characters, dashes, or dots.', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'storage',
        actionVerb: 'create_bucket',
        resourceUri: `storage://r2/${name}`,
        parameters: { name, region, publicAccess },
        idempotencyKey: `bucket_create_${Date.now()}_${name}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);

      if (gatewayResult.status === 'executed') {
        const newBucket: Bucket = {
          id: `bkt-${Date.now()}`,
          name,
          region,
          objects: 0,
          sizeGb: 0,
          publicAccess: Boolean(publicAccess),
          corsEnabled: true,
          created: new Date().toISOString().split('T')[0],
          egressCostSavedUsd: 0,
        };
        fallbackBuckets.push(newBucket);

        try {
          await supabase.from('cloud_storage_buckets').insert({
            tenant_id: tenantId,
            name,
            region,
            public_access: Boolean(publicAccess),
            cors_enabled: true,
          });
        } catch {}

        return ok({
          status: 'executed',
          bucket: newBucket,
          gateway: gatewayResult,
        });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'delete_bucket') {
      const name = bucket?.name || rawName || body.name || body.id;
      if (!name) {
        return err('BAD_REQUEST', 'Bucket name is required for deletion', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'storage',
        actionVerb: 'delete_bucket',
        resourceUri: `storage://r2/${name}`,
        parameters: { name },
        idempotencyKey: `bucket_del_${Date.now()}_${name}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        fallbackBuckets = fallbackBuckets.filter(b => b.name !== name && b.id !== name);
        try {
          await supabase.from('cloud_storage_buckets').delete().or(`name.eq.${name},id.eq.${name}`);
        } catch {}
        return ok({ message: `Bucket ${name} deleted.`, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'create_credential') {
      const credName = body.name || 'New S3 Access Key';
      const permissions = body.permissions || 'Read-Write';

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'storage',
        actionVerb: 'create_credential',
        resourceUri: `storage://credentials/${encodeURIComponent(credName)}`,
        parameters: { name: credName, permissions },
        idempotencyKey: `storage_key_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        const newKey: StorageCredential = {
          id: `key-${Date.now()}`,
          accessKey: `vh_r2_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
          name: credName,
          permissions,
          lastUsed: 'Never',
        };
        fallbackKeys.push(newKey);
        return ok({ key: newKey, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'revoke_credential') {
      const { id } = body;
      if (!id) {
        return err('BAD_REQUEST', 'Credential ID is required', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'storage',
        actionVerb: 'revoke_credential',
        resourceUri: `storage://credentials/${id}`,
        parameters: { id },
        idempotencyKey: `storage_revoke_${Date.now()}_${id}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        fallbackKeys = fallbackKeys.filter(k => k.id !== id);
        return ok({ message: `Key ${id} revoked.`, gateway: gatewayResult });
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
    const name = searchParams.get('name') || searchParams.get('bucket') || searchParams.get('id');
    if (!name) {
      return err('BAD_REQUEST', 'Bucket name or ID is required', { status: 400 });
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
        roles: ['tenant_admin'],
      },
      targetService: 'storage',
      actionVerb: 'delete_bucket',
      resourceUri: `storage://r2/${name}`,
      parameters: { name },
      idempotencyKey: `bucket_del_${Date.now()}_${name}`,
      createdAt: new Date().toISOString(),
    };

    const gatewayResult = await processActionIntent(actionIntent);
    if (gatewayResult.status === 'executed') {
      fallbackBuckets = fallbackBuckets.filter(b => b.name !== name && b.id !== name);
      try {
        await supabase.from('cloud_storage_buckets').delete().or(`name.eq.${name},id.eq.${name}`);
      } catch {}
      return ok({ message: `Bucket ${name} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
