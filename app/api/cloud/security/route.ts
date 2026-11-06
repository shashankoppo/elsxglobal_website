export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

interface FirewallRule {
  id: string;
  type: 'IP_CIDR' | 'COUNTRY' | 'ASN';
  value: string;
  action: 'Block' | 'Managed Challenge' | 'JS Challenge' | 'Allow';
  hits24h: number;
  description: string;
  enabled: boolean;
}

let underAttackMode = false;

let firewallRules: FirewallRule[] = [
  { id: 'fwr-01', type: 'IP_CIDR', value: '45.142.212.0/24', action: 'Block', hits24h: 184200, description: 'Known Mirai variant scanning pool', enabled: true },
  { id: 'fwr-02', type: 'ASN', value: 'AS14061', action: 'Managed Challenge', hits24h: 42100, description: 'High-risk automated scrapers ASN', enabled: true },
  { id: 'fwr-03', type: 'COUNTRY', value: 'RU, CN (Tor Exit)', action: 'JS Challenge', hits24h: 91400, description: 'Non-domestic sensitive endpoint challenge', enabled: true },
];

const ATTACK_LOGS = [
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
    return NextResponse.json({
      success: true,
      telemetry: {
        currentScrubbingGbps: 340,
        attacksBlockedToday: 1842,
        activeMitigationClusters: 38,
        falsePositiveRate: '<0.001%',
        underAttackMode,
      },
      attackLogs: ATTACK_LOGS,
      firewallRules,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, rule, enabled, options, intent } = body;

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    if (action === 'toggle_under_attack') {
      underAttackMode = typeof enabled === 'boolean' ? enabled : !underAttackMode;
      return NextResponse.json({ success: true, underAttackMode });
    }

    if (action === 'add_rule') {
      const { type, value, action: ruleAction = 'Block', description = 'Manual rule' } = rule || {};
      if (!type || !value) {
        return NextResponse.json({ success: false, error: 'Rule type and value are required.' }, { status: 400 });
      }

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
      return NextResponse.json({ success: true, rule: newRule });
    }

    if (action === 'toggle_rule') {
      const { id } = body;
      const target = firewallRules.find(r => r.id === id);
      if (target) {
        target.enabled = !target.enabled;
      }
      return NextResponse.json({ success: true, enabled: target?.enabled });
    }

    if (action === 'delete_rule') {
      const { id } = body;
      firewallRules = firewallRules.filter(r => r.id !== id);
      return NextResponse.json({ success: true, message: `Rule ${id} deleted.` });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
