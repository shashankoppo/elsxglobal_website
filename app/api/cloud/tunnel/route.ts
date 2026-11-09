export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface Tunnel {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'provisioning';
  protocol: 'http' | 'https' | 'tcp';
  subdomain?: string;
  target?: string;
  publicUrl: string;
  token?: string;
  createdAt?: string;
  connectedAt?: string;
}

let fallbackTunnels: Tunnel[] = [
  {
    id: 'tun-001',
    name: 'dev-api-tunnel',
    status: 'connected',
    protocol: 'http',
    subdomain: 'dev-api',
    target: 'http://localhost:3000',
    publicUrl: 'https://dev-api.vaulthost.cloud',
    connectedAt: '2026-03-01T10:00:00Z',
    token: 'vh_tun_tok_live_8a92f0c1',
  },
  {
    id: 'tun-002',
    name: 'grafana-metrics',
    status: 'connected',
    protocol: 'http',
    subdomain: 'metrics-edge',
    target: 'http://localhost:9090',
    publicUrl: 'https://metrics-edge.vaulthost.cloud',
    connectedAt: '2026-03-10T14:30:00Z',
    token: 'vh_tun_tok_live_7b81e3d4',
  },
];

function generateFrpcConfig(tunnelName: string, protocol: string, token: string, subdomain?: string): string {
  return `[common]
server_addr = ingress.vaulthost.cloud
server_port = 7000
token = ${token}

[${tunnelName}]
type = ${protocol || 'http'}
local_ip = 127.0.0.1
local_port = 8080
subdomain = ${subdomain || tunnelName}
`;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    let tunnels = fallbackTunnels;
    try {
      const { data: dbTunnels, error } = await supabase
        .from('cloud_tunnels')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbTunnels && dbTunnels.length > 0) {
        tunnels = dbTunnels.map((t: any) => ({
          id: t.id,
          name: t.name,
          status: t.status || 'connected',
          protocol: t.protocol || 'http',
          subdomain: t.subdomain || t.name,
          target: t.target || 'http://localhost:8080',
          publicUrl: t.public_url || `https://${t.subdomain || t.name}.vaulthost.cloud`,
          token: t.token,
          createdAt: t.created_at,
          connectedAt: t.connected_at || t.created_at,
        }));
      }
    } catch {}

    return ok({
      tunnels,
      stats: {
        total: tunnels.length,
        active: tunnels.filter(t => t.status === 'connected').length,
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
    const { action = 'create_tunnel', name, tunnelName, protocol = 'http', subdomain, target, options, intent } = body;
    const finalName = name || tunnelName;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'create_tunnel' || action === 'create') {
      if (!finalName) {
        return err('BAD_REQUEST', 'Tunnel name is required', { status: 400 });
      }

      const token = crypto.randomUUID();
      const finalSubdomain = subdomain || finalName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const publicUrl = `https://${finalSubdomain}.vaulthost.cloud`;
      const frpcConfig = generateFrpcConfig(finalName, protocol, token, finalSubdomain);

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_developer'],
        },
        targetService: 'network',
        actionVerb: 'create_tunnel',
        resourceUri: `network://tunnels/${finalName}`,
        parameters: { name: finalName, protocol, subdomain: finalSubdomain, target: target || 'http://localhost:8080' },
        idempotencyKey: `tunnel_create_${Date.now()}_${finalName}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        const newTunnel: Tunnel = {
          id: `tun-${Date.now()}`,
          name: finalName,
          status: 'connected',
          protocol,
          subdomain: finalSubdomain,
          target: target || 'http://localhost:8080',
          publicUrl,
          token,
          createdAt: new Date().toISOString(),
          connectedAt: new Date().toISOString(),
        };
        fallbackTunnels.unshift(newTunnel);

        try {
          await supabase.from('cloud_tunnels').insert({
            tenant_id: tenantId,
            name: finalName,
            protocol,
            subdomain: finalSubdomain,
            target: target || 'http://localhost:8080',
            public_url: publicUrl,
            token,
            status: 'connected',
          });
        } catch {}

        return ok({
          status: 'executed',
          tunnel: newTunnel,
          frpcConfig,
          gateway: gatewayResult,
        });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'delete_tunnel' || action === 'delete') {
      const tunnelId = body.id || body.tunnelId || finalName;
      if (!tunnelId) {
        return err('BAD_REQUEST', 'Tunnel ID is required', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_developer'],
        },
        targetService: 'network',
        actionVerb: 'delete_tunnel',
        resourceUri: `network://tunnels/${tunnelId}`,
        parameters: { tunnelId },
        idempotencyKey: `tunnel_del_${Date.now()}_${tunnelId}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        fallbackTunnels = fallbackTunnels.filter(t => t.id !== tunnelId && t.name !== tunnelId);
        try {
          await supabase.from('cloud_tunnels').delete().or(`id.eq.${tunnelId},name.eq.${tunnelId}`);
        } catch {}

        return ok({ message: `Tunnel ${tunnelId} deleted.`, gateway: gatewayResult });
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
    const tunnelId = searchParams.get('id') || searchParams.get('name');
    if (!tunnelId) {
      return err('BAD_REQUEST', 'Tunnel ID or name is required', { status: 400 });
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
      targetService: 'network',
      actionVerb: 'delete_tunnel',
      resourceUri: `network://tunnels/${tunnelId}`,
      parameters: { tunnelId },
      idempotencyKey: `tunnel_del_${Date.now()}_${tunnelId}`,
      createdAt: new Date().toISOString(),
    };

    const gatewayResult = await processActionIntent(actionIntent);
    if (gatewayResult.status === 'executed') {
      fallbackTunnels = fallbackTunnels.filter(t => t.id !== tunnelId && t.name !== tunnelId);
      try {
        await supabase.from('cloud_tunnels').delete().or(`id.eq.${tunnelId},name.eq.${tunnelId}`);
      } catch {}

      return ok({ message: `Tunnel ${tunnelId} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
