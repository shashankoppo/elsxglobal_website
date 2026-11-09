export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface FirewallRule {
  id: string;
  type: 'IP_CIDR' | 'COUNTRY' | 'ASN';
  value: string;
  action: 'Block' | 'Managed Challenge' | 'JS Challenge' | 'Allow';
  hits24h: number;
  description: string;
  enabled: boolean;
}

export interface AttackLog {
  id: string;
  timestamp: string;
  targetDomain: string;
  vector: string;
  peakRate: string;
  scrubbingCenter: string;
  layer: string;
  status: string;
  mitigationMethod: string;
  packetsDropped: string;
}

let underAttackMode = false;

let firewallRules: FirewallRule[] = [
  { id: 'fwr-01', type: 'IP_CIDR', value: '45.142.212.0/24', action: 'Block', hits24h: 184200, description: 'Known Mirai variant scanning pool', enabled: true },
  { id: 'fwr-02', type: 'ASN', value: 'AS14061', action: 'Managed Challenge', hits24h: 42100, description: 'High-risk automated scrapers ASN', enabled: true },
  { id: 'fwr-03', type: 'COUNTRY', value: 'RU, CN (Tor Exit)', action: 'JS Challenge', hits24h: 91400, description: 'Non-domestic sensitive endpoint challenge', enabled: true },
];

const ATTACK_LOGS: AttackLog[] = [
  {
    id: 'atk-901',
    timestamp: '2 min ago',
    targetDomain: 'api.bharatpay.co',
    vector: 'UDP Flood + Memcached Amplification',
    peakRate: '340 Gbps / 84 Mpps',
    scrubbingCenter: 'BOM-01 (Mumbai Anycast)',
    layer: 'L3/L4',
    status: 'mitigated',
    mitigationMethod: 'BGP FlowSpec Filter + Anycast Scrubbing Sinkhole',
    packetsDropped: '48.2 Billion',
  },
  {
    id: 'atk-902',
    timestamp: '14 min ago',
    targetDomain: 'auth.apexdigital.io',
    vector: 'Credential Stuffing Botnet (12k IPs)',
    peakRate: '42,000 req/s',
    scrubbingCenter: 'SIN-02 (Singapore Anycast)',
    layer: 'L7',
    status: 'mitigated',
    mitigationMethod: 'VaultBot ML Fingerprint + Managed Challenge (100% Drops)',
    packetsDropped: '2.4 Million',
  },
];

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    return ok({
      telemetry: {
        currentScrubbingGbps: 340,
        attacksBlockedToday: 1842,
        activeMitigationClusters: 38,
        falsePositiveRate: '<0.001%',
        underAttackMode,
      },
      attackLogs: ATTACK_LOGS,
      firewallRules,
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
    const { action, rule, enabled, options, intent } = body;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'toggle_under_attack') {
      const targetState = typeof enabled === 'boolean' ? enabled : !underAttackMode;

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'network',
        actionVerb: 'toggle_under_attack',
        resourceUri: `security://firewall/under_attack`,
        parameters: { enabled: targetState },
        idempotencyKey: `sec_attack_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        underAttackMode = targetState;
        return ok({ underAttackMode, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'add_rule') {
      const { type, value, action: ruleAction = 'Block', description = 'Manual rule' } = rule || {};
      if (!type || !value) {
        return err('BAD_REQUEST', 'Rule type and value are required.', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'network',
        actionVerb: 'add_firewall_rule',
        resourceUri: `security://firewall/rules/${encodeURIComponent(value)}`,
        parameters: { type, value, action: ruleAction, description },
        idempotencyKey: `sec_rule_${Date.now()}_${encodeURIComponent(value)}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        const newRule: FirewallRule = {
          id: `fwr-${Date.now()}`,
          type,
          value,
          action: ruleAction,
          hits24h: 0,
          description,
          enabled: true,
        };
        firewallRules.push(newRule);
        return ok({ rule: newRule, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'toggle_rule') {
      const { id } = body;
      const target = firewallRules.find(r => r.id === id);
      if (!target) {
        return err('NOT_FOUND', 'Rule not found', { status: 404 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'network',
        actionVerb: 'toggle_firewall_rule',
        resourceUri: `security://firewall/rules/${id}`,
        parameters: { id, nextEnabled: !target.enabled },
        idempotencyKey: `sec_toggle_${Date.now()}_${id}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        target.enabled = !target.enabled;
        return ok({ enabled: target.enabled, gateway: gatewayResult });
      }

      return ok(gatewayResult, { status: 202 });
    }

    if (action === 'delete_rule') {
      const { id } = body;
      if (!id) {
        return err('BAD_REQUEST', 'Rule ID is required', { status: 400 });
      }

      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: actorId,
          type: 'user',
          tenantId,
          roles: ['tenant_admin'],
        },
        targetService: 'network',
        actionVerb: 'delete_firewall_rule',
        resourceUri: `security://firewall/rules/${id}`,
        parameters: { id },
        idempotencyKey: `sec_del_${Date.now()}_${id}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      if (gatewayResult.status === 'executed') {
        firewallRules = firewallRules.filter(r => r.id !== id);
        return ok({ message: `Rule ${id} deleted.`, gateway: gatewayResult });
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
    const id = searchParams.get('id');
    if (!id) {
      return err('BAD_REQUEST', 'Rule ID is required', { status: 400 });
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
      targetService: 'network',
      actionVerb: 'delete_firewall_rule',
      resourceUri: `security://firewall/rules/${id}`,
      parameters: { id },
      idempotencyKey: `sec_del_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
    };

    const gatewayResult = await processActionIntent(actionIntent);
    if (gatewayResult.status === 'executed') {
      firewallRules = firewallRules.filter(r => r.id !== id);
      return ok({ message: `Rule ${id} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
