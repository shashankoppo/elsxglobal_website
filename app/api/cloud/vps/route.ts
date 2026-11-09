export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { TenantPolicyOverride } from '@/lib/action-gateway/risk-classifier';
import { ProvisioningEngine } from '@/lib/provisioning/ProvisioningEngine';

interface FallbackInstance {
  id: string;
  name: string;
  planName: string;
  domain: string;
  ip: string;
  status: 'running' | 'stopped' | 'rebooting' | 'rebuilding' | 'active' | 'terminated';
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

const fallbackInstances: FallbackInstance[] = [
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

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials missing');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * GET /api/cloud/vps
 * - ?action=metrics&serviceId=xxx: Live Proxmox metrics
 * - ?action=snapshots&serviceId=xxx: List snapshots
 * - Default: List user's servers from hosting_services table
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId') || searchParams.get('instanceId');

    // 1. Live metrics query
    if (action === 'metrics') {
      if (!serviceId) {
        return NextResponse.json({ success: false, error: 'serviceId is required for metrics query' }, { status: 400 });
      }
      const metrics = await ProvisioningEngine.getServiceMetrics(serviceId);
      return NextResponse.json({ success: true, serviceId, metrics });
    }

    // 2. Snapshots query
    if (action === 'snapshots') {
      if (!serviceId) {
        return NextResponse.json({ success: false, error: 'serviceId is required for snapshots query' }, { status: 400 });
      }

      const supabaseAdmin = getSupabaseAdmin();
      const { data: dbSnapshots } = await supabaseAdmin
        .from('backup_snapshots')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      let liveSnapshots: any[] = [];
      try {
        const { data: service } = await supabaseAdmin
          .from('hosting_services')
          .select('external_id, adapter, tier')
          .eq('id', serviceId)
          .single();

        if (service) {
          const { data: settings } = await supabaseAdmin
            .from('provisioning_settings')
            .select('*')
            .eq('id', 1)
            .single();

          const adapter = ProvisioningEngine.getAdapter(service.tier || 'vps', service.adapter, settings);
          if (adapter.listSnapshots) {
            const snapRes = await adapter.listSnapshots(service.external_id || serviceId);
            if (snapRes.success && Array.isArray(snapRes.data)) {
              liveSnapshots = snapRes.data;
            }
          }
        }
      } catch (e: any) {
        console.warn('[VPS Route] Live snapshot query warning:', e.message);
      }

      const combinedSnapshots = liveSnapshots.length > 0 ? liveSnapshots : (dbSnapshots || []);
      return NextResponse.json({ success: true, serviceId, snapshots: combinedSnapshots });
    }

    // 3. Default: List user's servers from hosting_services
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('hosting_services')
      .select('*, hosting_plans(*)')
      .order('created_at', { ascending: false });

    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      if (userData?.user) {
        query = query.eq('user_id', userData.user.id);
      }
    }

    const { data: services, error } = await query;
    if (error) {
      console.warn('[VPS Route] Database query error, using fallback instances:', error.message);
    }

    let instances: any[] = [];
    if (services && services.length > 0) {
      instances = services.map((svc: any) => {
        const planSpecs = svc.hosting_plans?.specs || {};
        const isRunning = svc.status === 'active' || svc.status === 'running';
        return {
          id: svc.id,
          serviceId: svc.id,
          name: svc.domain || svc.plan_name || 'Cloud VPS',
          planName: svc.plan_name,
          domain: svc.domain || '',
          ip: svc.ip_address || '103.21.244.12',
          status: isRunning ? 'running' : (svc.status === 'stopped' || svc.status === 'suspended' ? 'stopped' : svc.status),
          location: svc.location || 'Mumbai, India (BOM-01)',
          specs: {
            cpu: svc.hosting_plans?.cpu || planSpecs.cpu || '2 vCPU (EPYC)',
            ram: svc.hosting_plans?.ram || planSpecs.ram || '4 GB RAM',
            storage: svc.hosting_plans?.storage || planSpecs.storage || '40 GB NVMe',
            bandwidth: svc.hosting_plans?.bandwidth || planSpecs.bandwidth || '2 TB / mo',
          },
          metrics: {
            cpuPct: isRunning ? 14.5 : 0,
            ramPct: isRunning ? 38.2 : 0,
            diskPct: 22.0,
            networkRxMbps: isRunning ? 8.4 : 0,
            networkTxMbps: isRunning ? 12.1 : 0,
          },
          controlPanelUrl: svc.control_panel_url,
          renewalDate: svc.renewal_date || '2026-11-01',
          price: svc.hosting_plans?.price_monthly || 999,
        };
      });
    }

    const displayInstances = instances.length > 0 ? instances : fallbackInstances;

    return NextResponse.json({
      success: true,
      instances: displayInstances,
      stats: {
        totalInstances: displayInstances.length,
        activeInstances: displayInstances.filter((i: any) => i.status === 'running' || i.status === 'active').length,
        totalMonthlyCost: displayInstances.reduce((sum: number, i: any) => sum + (Number(i.price) || 0), 0),
        nextRenewal: 'Nov 1, 2026',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/cloud/vps
 * Actions: 'start' | 'stop' | 'restart' | 'snapshot' | 'terminate'
 * Routed through processActionIntent:
 * - start/stop/restart = riskTier 1
 * - snapshot = riskTier 1
 * - terminate = riskTier 2 (irreversible!)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, serviceId, instanceId, snapshotName, options, intent } = body;

    // Direct ActionIntent pass-through
    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    const targetServiceId = serviceId || instanceId;
    if (!targetServiceId) {
      return NextResponse.json({ success: false, error: 'serviceId or instanceId is required' }, { status: 400 });
    }

    const normAction = (action || '').toLowerCase().trim();
    const validActions = ['start', 'stop', 'restart', 'reboot', 'snapshot', 'create_snapshot', 'terminate', 'power_toggle'];
    if (!validActions.includes(normAction)) {
      return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
    }

    // Map action to ActionIntent verb & risk tier policy
    let actionVerb = 'restart_instance';
    let targetTier: 1 | 2 = 1;

    if (normAction === 'start') {
      actionVerb = 'start_instance';
      targetTier = 1;
    } else if (normAction === 'stop') {
      actionVerb = 'stop_instance';
      targetTier = 1;
    } else if (normAction === 'restart' || normAction === 'reboot') {
      actionVerb = 'restart_instance';
      targetTier = 1;
    } else if (normAction === 'snapshot' || normAction === 'create_snapshot') {
      actionVerb = 'create_snapshot';
      targetTier = 1;
    } else if (normAction === 'terminate') {
      actionVerb = 'terminate_instance';
      targetTier = 2; // Irreversible!
    } else if (normAction === 'power_toggle') {
      actionVerb = 'power_toggle';
      targetTier = 1;
    }

    // Determine calling user id if available
    let actorId = 'user_active_session';
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabaseAdmin = getSupabaseAdmin();
        const { data: userData } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
        if (userData?.user?.id) actorId = userData.user.id;
      } catch {}
    }

    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId: 'ten_portal_default',
        roles: ['tenant_operator'],
      },
      targetService: 'compute',
      actionVerb,
      resourceUri: `compute://vps/${targetServiceId}`,
      parameters: {
        serviceId: targetServiceId,
        action: normAction,
        snapshotName: snapshotName || `snap-${Date.now()}`,
      },
      idempotencyKey: `vps_${normAction}_${Date.now()}_${targetServiceId}`,
      createdAt: new Date().toISOString(),
    };

    const tenantPolicyOverrides: TenantPolicyOverride[] = [
      { tenantId: 'ten_portal_default', actionVerbPattern: '(start|stop|restart|reboot|power_toggle).*', enforceTier: 1 },
      { tenantId: 'ten_portal_default', actionVerbPattern: '.*snapshot.*', enforceTier: 1 },
      { tenantId: 'ten_portal_default', actionVerbPattern: 'terminate.*', enforceTier: 2 },
    ];

    const gatewayResult = await processActionIntent(actionIntent, {
      ...options,
      tenantPolicyOverrides,
    });

    // If executed through the Action Gateway, perform the underlying infrastructure mutation
    if (gatewayResult.status === 'executed') {
      const supabaseAdmin = getSupabaseAdmin();

      if (normAction === 'start') {
        await ProvisioningEngine.restartService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'stop') {
        await ProvisioningEngine.suspendService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'stopped', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'restart' || normAction === 'reboot') {
        await ProvisioningEngine.restartService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'snapshot' || normAction === 'create_snapshot') {
        const snapName = snapshotName || `snap-${Date.now()}`;
        await ProvisioningEngine.snapshotService(targetServiceId, snapName);
      } else if (normAction === 'terminate') {
        await ProvisioningEngine.terminateService(targetServiceId);
        await supabaseAdmin.from('hosting_services').update({ status: 'terminated', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
      } else if (normAction === 'power_toggle') {
        const currentStatus = await ProvisioningEngine.getServiceStatus(targetServiceId);
        if (currentStatus === 'active') {
          await ProvisioningEngine.suspendService(targetServiceId);
          await supabaseAdmin.from('hosting_services').update({ status: 'stopped', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
        } else {
          await ProvisioningEngine.restartService(targetServiceId);
          await supabaseAdmin.from('hosting_services').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', targetServiceId);
        }
      }

      return NextResponse.json({
        success: true,
        status: 'executed',
        riskTier: targetTier,
        message: `Action '${normAction}' on ${targetServiceId} executed successfully.`,
        gateway: gatewayResult,
      });
    }

    // Step-up authentication or confirmation required (Tier 1 confirmation / Tier 2 2FA)
    if (gatewayResult.status === 'require_confirmation' || gatewayResult.status === 'require_step_up_auth') {
      return NextResponse.json(gatewayResult, { status: 202 });
    }

    return NextResponse.json(gatewayResult, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
