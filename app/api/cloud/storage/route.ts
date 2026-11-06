export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

interface Bucket {
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

let fallbackKeys = [
  { id: 'key-01', accessKey: 'vh_r2_live_9f83a8b27c1094ea', name: 'Production Backend API', permissions: 'Read-Write', lastUsed: '3 min ago' },
  { id: 'key-02', accessKey: 'vh_r2_back_3e21d019fba82c91', name: 'Automated Backup Agent', permissions: 'Admin', lastUsed: '4 hours ago' },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bucketName = searchParams.get('bucket');

    const totalStorageGb = fallbackBuckets.reduce((sum, b) => sum + b.sizeGb, 0);
    const totalObjects = fallbackBuckets.reduce((sum, b) => sum + b.objects, 0);
    const totalEgressSaved = fallbackBuckets.reduce((sum, b) => sum + b.egressCostSavedUsd, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalBuckets: fallbackBuckets.length,
        totalStorageGb: totalStorageGb.toFixed(1),
        totalObjects: totalObjects.toLocaleString(),
        totalEgressSavedUsd: totalEgressSaved.toFixed(2),
        egressFee: '$0.00 (Zero Egress Network)',
      },
      buckets: fallbackBuckets,
      credentials: fallbackKeys,
      activeBucket: bucketName ? fallbackBuckets.find(b => b.name === bucketName) : null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bucket, options, intent } = body;

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    if (action === 'create_bucket') {
      const { name, region = 'Auto (Anycast Edge)', publicAccess = false } = bucket || {};

      if (!name || !/^[a-z0-9.-]{3,63}$/.test(name)) {
        return NextResponse.json({
          success: false,
          error: 'Bucket name must be 3-63 lowercase alphanumeric characters, dashes, or dots.',
        }, { status: 400 });
      }

      // Action Gateway intent
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: 'user_active_session',
          type: 'user',
          tenantId: 'ten_portal_default',
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

        return NextResponse.json({
          success: true,
          status: 'executed',
          bucket: newBucket,
          gateway: gatewayResult,
        });
      }

      return NextResponse.json(gatewayResult, { status: 202 });
    }

    if (action === 'create_credential') {
      const newKey = {
        id: `key-${Date.now()}`,
        accessKey: `vh_r2_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
        name: body.name || 'New S3 Access Key',
        permissions: body.permissions || 'Read-Write',
        lastUsed: 'Never',
      };
      fallbackKeys.push(newKey);
      return NextResponse.json({ success: true, key: newKey });
    }

    if (action === 'revoke_credential') {
      const { id } = body;
      fallbackKeys = fallbackKeys.filter(k => k.id !== id);
      return NextResponse.json({ success: true, message: `Key ${id} revoked.` });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
