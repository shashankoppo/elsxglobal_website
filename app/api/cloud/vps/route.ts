export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

interface Instance {
  id: string;
  name: string;
  planName: string;
  domain: string;
  ip: string;
  status: 'running' | 'stopped' | 'rebooting' | 'rebuilding';
  location: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    bandwidth: string;
  };
  metrics: {
    cpuPct: number;
    ramPct: number;
    diskPct: number;
    networkRxMbps: number;
    networkTxMbps: number;
  };
  renewalDate: string;
  price: number;
}

let instances: Instance[] = [
  {
    id: 'svc-001',
    name: 'Production Core API',
    planName: 'VPS Pro 8GB',
    domain: 'api.myapp.io',
    ip: '103.21.244.12',
    status: 'running',
    location: 'Mumbai, India (BOM-01)',
    specs: { cpu: '4 vCPU (AMD EPYC)', ram: '8 GB DDR5', storage: '160 GB NVMe', bandwidth: '6 TB / mo' },
    metrics: { cpuPct: 18.4, ramPct: 54.2, diskPct: 32.1, networkRxMbps: 48.2, networkTxMbps: 112.6 },
    renewalDate: '2026-10-01',
    price: 4999,
  },
  {
    id: 'svc-002',
    name: 'Database Primary Replica',
    planName: 'Shared Business',
    domain: 'myblog.elsxglobal.com',
    ip: '104.22.51.77',
    status: 'running',
    location: 'Bangalore, India (BLR-01)',
    specs: { cpu: '2 vCPU', ram: '2 GB', storage: '20 GB SSD', bandwidth: '500 GB / mo' },
    metrics: { cpuPct: 8.1, ramPct: 41.0, diskPct: 19.5, networkRxMbps: 12.1, networkTxMbps: 18.4 },
    renewalDate: '2026-10-15',
    price: 799,
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      instances,
      stats: {
        totalInstances: instances.length,
        activeInstances: instances.filter(i => i.status === 'running').length,
        totalMonthlyCost: instances.reduce((sum, i) => sum + i.price, 0),
        nextRenewal: 'Oct 1, 2026',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, instanceId, options, intent } = body;

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    const instance = instances.find(i => i.id === instanceId);
    if (!instance && action !== 'deploy') {
      return NextResponse.json({ success: false, error: 'Instance not found' }, { status: 404 });
    }

    if (action === 'reboot') {
      // Risk Tier 1 Action
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: 'user_active_session',
          type: 'user',
          tenantId: 'ten_portal_default',
          roles: ['tenant_operator'],
        },
        targetService: 'compute',
        actionVerb: 'reboot_instance',
        resourceUri: `compute://vps/${instanceId}`,
        parameters: { instanceId, graceful: true },
        idempotencyKey: `vps_reboot_${Date.now()}_${instanceId}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);

      if (gatewayResult.status === 'executed') {
        if (instance) {
          instance.status = 'rebooting';
          setTimeout(() => {
            instance.status = 'running';
          }, 3000);
        }
        return NextResponse.json({
          success: true,
          status: 'executed',
          message: `Instance ${instanceId} reboot initiated successfully.`,
          gateway: gatewayResult,
        });
      }

      return NextResponse.json(gatewayResult, { status: 202 });
    }

    if (action === 'power_toggle') {
      if (instance) {
        instance.status = instance.status === 'running' ? 'stopped' : 'running';
        return NextResponse.json({
          success: true,
          status: instance.status,
          message: `Instance is now ${instance.status}.`,
        });
      }
    }

    if (action === 'create_snapshot') {
      return NextResponse.json({
        success: true,
        snapshotId: `snap-${Date.now()}`,
        message: `Snapshot backup for ${instance?.name} triggered successfully.`,
      });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
