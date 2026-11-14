export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';
import { MinIOClient } from '@/lib/storage/minio';

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

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
      return err('UNAUTHORIZED', 'Authentication required to access storage buckets', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bucketName = searchParams.get('bucket') || searchParams.get('name');

    let buckets: Bucket[] = [];
    const { data: dbBuckets, error } = await supabase
      .from('cloud_storage_buckets')
      .select('*')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && dbBuckets && dbBuckets.length > 0) {
      buckets = dbBuckets.map((b: any) => ({
        id: b.id,
        name: b.name,
        region: b.region || 'Auto (Anycast Edge)',
        objects: Number(b.object_count || b.objects_count || 0),
        sizeGb: b.size_bytes ? Number((b.size_bytes / (1024 * 1024 * 1024)).toFixed(2)) : 0,
        publicAccess: Boolean(b.public_access),
        corsEnabled: Boolean(b.cors_enabled),
        created: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : '2026-01-01',
        egressCostSavedUsd: Number(b.egress_saved_usd || 0),
      }));
    }

    // Also fetch storage credentials for user
    const { data: dbKeys } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const credentials: StorageCredential[] = (dbKeys || []).map((k: any) => ({
      id: k.id,
      accessKey: k.key_prefix ? `${k.key_prefix}...` : k.id,
      name: k.name || 'S3 API Key',
      permissions: 'Read-Write',
      lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never',
    }));

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
      credentials,
      activeBucket: bucketName ? buckets.find(b => b.name === bucketName) || null : null,
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
      return err('UNAUTHORIZED', 'Authentication required for storage operations', { status: 401 });
    }

    const body = await req.json();
    const { action, bucket, name: rawName, options, intent } = body;
    const actorId = user.id;
    const tenantId = user.id;

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'create_bucket') {
      const name = (bucket?.name || rawName || '').toLowerCase().trim();
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
        const bucketId = crypto.randomUUID();

        // 1. Dispatch to MinIO S3 backend
        try {
          const minio = new MinIOClient();
          await minio.createBucket(name, region);
          if (publicAccess) {
            await minio.setBucketPolicy(name, 'public-read');
          }
        } catch (minioErr: any) {
          console.warn('[Storage Route] MinIO backend notice:', minioErr.message);
        }

        // 2. Persist to Supabase cloud_storage_buckets
        const newBucket: Bucket = {
          id: bucketId,
          name,
          region,
          objects: 0,
          sizeGb: 0,
          publicAccess: Boolean(publicAccess),
          corsEnabled: true,
          created: new Date().toISOString().split('T')[0],
          egressCostSavedUsd: 0,
        };

        await supabase.from('cloud_storage_buckets').insert({
          id: bucketId,
          tenant_id: tenantId,
          name,
          region,
          public_access: Boolean(publicAccess),
          cors_enabled: true,
          created_at: new Date().toISOString(),
        });

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

      // Check ownership
      const { data: existingBucket } = await supabase
        .from('cloud_storage_buckets')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`name.eq.${name},id.eq.${name}`)
        .maybeSingle();

      if (!existingBucket) {
        return err('NOT_FOUND', 'Bucket not found or permission denied', { status: 404 });
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
        // 1. Delete from MinIO
        try {
          const minio = new MinIOClient();
          await minio.deleteBucket(existingBucket.name);
        } catch (minioErr: any) {
          console.warn('[Storage Route] MinIO deletion notice:', minioErr.message);
        }

        // 2. Delete from Supabase
        await supabase
          .from('cloud_storage_buckets')
          .delete()
          .eq('id', existingBucket.id)
          .eq('tenant_id', tenantId);

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
        const keyPrefix = `vh_r2_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
        const keyId = crypto.randomUUID();

        await supabase.from('api_keys').insert({
          id: keyId,
          user_id: user.id,
          name: credName,
          key_prefix: keyPrefix,
          created_at: new Date().toISOString(),
        });

        const newKey: StorageCredential = {
          id: keyId,
          accessKey: `${keyPrefix}...`,
          name: credName,
          permissions,
          lastUsed: 'Never',
        };

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
        await supabase
          .from('api_keys')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

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

    if (!user) {
      return err('UNAUTHORIZED', 'Authentication required', { status: 401 });
    }

    const { data: existingBucket } = await supabase
      .from('cloud_storage_buckets')
      .select('*')
      .eq('tenant_id', user.id)
      .or(`name.eq.${name},id.eq.${name}`)
      .maybeSingle();

    if (!existingBucket) {
      return err('NOT_FOUND', 'Bucket not found or permission denied', { status: 404 });
    }

    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: user.id,
        type: 'user',
        tenantId: user.id,
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
      try {
        const minio = new MinIOClient();
        await minio.deleteBucket(existingBucket.name);
      } catch {}

      await supabase.from('cloud_storage_buckets').delete().eq('id', existingBucket.id).eq('tenant_id', user.id);
      return ok({ message: `Bucket ${name} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
