export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface ContainerDeployment {
  id: string;
  name: string;
  image: string;
  replicas: number;
  availableReplicas: number;
  port: number;
  domain?: string;
  cpu: string;
  memory: string;
  status: 'running' | 'scaling' | 'degraded';
}

export interface ContainerNamespace {
  id: string;
  name: string;
  status: 'active' | 'provisioning' | 'terminating';
  cluster: string;
  region: string;
  deployments: ContainerDeployment[];
  createdAt: string;
}

let fallbackNamespaces: ContainerNamespace[] = [
  {
    id: 'ns-001',
    name: 'production-workloads',
    status: 'active',
    cluster: 'k3s-edge-bom1',
    region: 'Mumbai, India (ap-south)',
    deployments: [
      {
        id: 'dep-01',
        name: 'payment-service',
        image: 'vaulthost/payment-service:v2.4.1',
        replicas: 4,
        availableReplicas: 4,
        port: 8080,
        domain: 'pay.internal.vaulthost.cloud',
        cpu: '500m',
        memory: '512Mi',
        status: 'running',
      },
      {
        id: 'dep-02',
        name: 'notification-worker',
        image: 'vaulthost/notifier:v1.1.0',
        replicas: 2,
        availableReplicas: 2,
        port: 3000,
        domain: 'notifier.internal.vaulthost.cloud',
        cpu: '250m',
        memory: '256Mi',
        status: 'running',
      },
    ],
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'ns-002',
    name: 'staging-microservices',
    status: 'active',
    cluster: 'k3s-edge-del1',
    region: 'Delhi, India (ap-north)',
    deployments: [
      {
        id: 'dep-03',
        name: 'auth-gateway-stage',
        image: 'vaulthost/auth:v3.0.0-rc2',
        replicas: 1,
        availableReplicas: 1,
        port: 4000,
        domain: 'auth-stage.internal.vaulthost.cloud',
        cpu: '250m',
        memory: '256Mi',
        status: 'running',
      },
    ],
    createdAt: '2026-02-20T11:30:00Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    let namespaces = fallbackNamespaces;
    try {
      const { data: dbContainers, error } = await supabase
        .from('cloud_containers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbContainers && dbContainers.length > 0) {
        namespaces = dbContainers.map((c: any) => ({
          id: c.id,
          name: c.name || c.namespace,
          status: c.status || 'active',
          cluster: c.cluster || 'k3s-edge-bom1',
          region: c.region || 'Mumbai, India',
          deployments: c.deployments || [],
          createdAt: c.created_at,
        }));
      }
    } catch {}

    return ok({
      namespaces,
      stats: {
        totalNamespaces: namespaces.length,
        activeNamespaces: namespaces.filter(n => n.status === 'active').length,
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
    const { action = 'create_namespace', name, namespace, cluster = 'k3s-edge-bom1', region = 'Mumbai, India', options = {}, intent } = body;
    const finalName = name || namespace;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (!finalName) {
      return err('BAD_REQUEST', 'Namespace name is required', { status: 400 });
    }

    // Action Gateway: risk tier 2 for create_namespace
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_admin'],
      },
      targetService: 'compute',
      actionVerb: 'create_container_namespace',
      resourceUri: `compute://k3s/namespaces/${finalName}`,
      parameters: { name: finalName, cluster, region, status: 'provisioning' },
      idempotencyKey: `k3s_ns_create_${Date.now()}_${finalName}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 2 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);
    if (gatewayResult.status === 'executed') {
      const newNs: ContainerNamespace = {
        id: `ns-${Date.now()}`,
        name: finalName,
        status: 'provisioning',
        cluster,
        region,
        deployments: [],
        createdAt: new Date().toISOString(),
      };
      fallbackNamespaces.unshift(newNs);

      try {
        await supabase.from('cloud_containers').insert({
          tenant_id: tenantId,
          name: finalName,
          status: 'provisioning',
          cluster,
          region,
        });
      } catch {}

      return ok({
        status: 'executed',
        namespace: newNs,
        gateway: gatewayResult,
      });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { namespace, namespaceId, deploymentName, replicas, image, port, domain, options = {}, intent } = body;
    const nsKey = namespace || namespaceId;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (!nsKey || !deploymentName) {
      return err('BAD_REQUEST', 'Namespace and deploymentName are required for scaling or updating', { status: 400 });
    }

    // Tier 1 for scale
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_operator'],
      },
      targetService: 'compute',
      actionVerb: 'scale',
      resourceUri: `compute://k3s/namespaces/${nsKey}/deployments/${deploymentName}`,
      parameters: { namespace: nsKey, deploymentName, replicas: Number(replicas ?? 1), image, port, domain },
      idempotencyKey: `k3s_scale_${Date.now()}_${deploymentName}`,
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
      const targetNs = fallbackNamespaces.find(n => n.name === nsKey || n.id === nsKey);
      if (targetNs) {
        const dep = targetNs.deployments.find(d => d.name === deploymentName);
        if (dep) {
          if (replicas !== undefined) {
            dep.replicas = Number(replicas);
            dep.availableReplicas = Number(replicas);
          }
          if (image) dep.image = image;
          if (port) dep.port = Number(port);
          if (domain) dep.domain = domain;
        } else {
          targetNs.deployments.push({
            id: `dep-${Date.now()}`,
            name: deploymentName,
            image: image || 'vaulthost/workload:latest',
            replicas: Number(replicas ?? 1),
            availableReplicas: Number(replicas ?? 1),
            port: Number(port ?? 80),
            domain: domain || `${deploymentName}.${targetNs.name}.vaulthost.cloud`,
            cpu: '250m',
            memory: '256Mi',
            status: 'running',
          });
        }
      }

      return ok({
        status: 'executed',
        message: `Deployment ${deploymentName} updated.`,
        gateway: gatewayResult,
      });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = searchParams.get('id') || searchParams.get('namespace') || body.id || body.namespace;
    const options = body.options || {};

    if (!id) {
      return err('BAD_REQUEST', 'Namespace ID or name is required', { status: 400 });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    // Risk Tier 2 for delete
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
      resourceUri: `compute://k3s/namespaces/${id}`,
      parameters: { namespace: id },
      idempotencyKey: `k3s_del_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 2 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);
    if (gatewayResult.status === 'executed') {
      fallbackNamespaces = fallbackNamespaces.filter(n => n.id !== id && n.name !== id);
      try {
        await supabase.from('cloud_containers').delete().or(`id.eq.${id},name.eq.${id}`);
      } catch {}

      return ok({ message: `Namespace ${id} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
