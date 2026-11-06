export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

// In-memory fallback dataset for instant resilience when DB is provisioning
interface DnsRecord {
  id: string;
  zoneId: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  priority?: number;
}

const FALLBACK_ZONES = [
  { id: 'zone-01', domain: 'apexdigital.io', status: 'active', dnssec: 'active', queries24h: 421000 },
  { id: 'zone-02', domain: 'bharatpay.co', status: 'active', dnssec: 'active', queries24h: 892000 },
  { id: 'zone-03', domain: 'vaulthost.cloud', status: 'active', dnssec: 'active', queries24h: 1240000 },
];

let fallbackRecords: DnsRecord[] = [
  { id: 'rec-01', zoneId: 'zone-01', type: 'A', name: '@', content: '103.21.244.12', ttl: 300, proxied: true },
  { id: 'rec-02', zoneId: 'zone-01', type: 'A', name: 'api', content: '103.21.244.18', ttl: 300, proxied: true },
  { id: 'rec-03', zoneId: 'zone-01', type: 'CNAME', name: 'www', content: 'apexdigital.io', ttl: 300, proxied: true },
  { id: 'rec-04', zoneId: 'zone-01', type: 'TXT', name: '@', content: 'v=spf1 include:_spf.vaulthost.cloud ~all', ttl: 3600, proxied: false },
  { id: 'rec-05', zoneId: 'zone-01', type: 'MX', name: '@', content: 'mail.vaulthost.cloud', ttl: 3600, proxied: false, priority: 10 },
  { id: 'rec-06', zoneId: 'zone-02', type: 'A', name: '@', content: '104.22.51.77', ttl: 300, proxied: true },
  { id: 'rec-07', zoneId: 'zone-02', type: 'A', name: 'checkout', content: '104.22.51.89', ttl: 300, proxied: true },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'apexdigital.io';

    const supabase = createServerClient();
    const { data: dbRecords, error } = await supabase
      .from('cloud_dns_records')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && dbRecords && dbRecords.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'database',
        zones: FALLBACK_ZONES,
        activeZone: domain,
        records: dbRecords,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'edge_cache',
      zones: FALLBACK_ZONES,
      activeZone: domain,
      records: fallbackRecords,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, record, options, intent } = body;

    // Check if an explicit Action Gateway intent or confirmation is passed
    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return NextResponse.json(result);
    }

    if (action === 'create_record') {
      const { type, name, content, ttl = 300, proxied = true, priority } = record;

      if (!type || !name || !content) {
        return NextResponse.json({ success: false, error: 'Type, Name, and Content are required.' }, { status: 400 });
      }

      // Generate Action Gateway intent for mutation verification
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: 'user_active_session',
          type: 'user',
          tenantId: 'ten_portal_default',
          roles: ['tenant_admin'],
        },
        targetService: 'dns',
        actionVerb: 'create_record',
        resourceUri: `dns://apexdigital.io/records/${name}.${type}`,
        parameters: { type, name, content, ttl, proxied, priority },
        idempotencyKey: `dns_create_${Date.now()}_${name}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);

      // If execution was approved or executed directly
      if (gatewayResult.status === 'executed') {
        const newRecord: DnsRecord = {
          id: `rec-${Date.now()}`,
          zoneId: 'zone-01',
          type,
          name,
          content,
          ttl: Number(ttl),
          proxied: Boolean(proxied),
          priority: priority ? Number(priority) : undefined,
        };
        fallbackRecords.push(newRecord);

        // Best-effort write to Supabase if configured
        try {
          const supabase = createServerClient();
          await supabase.from('cloud_dns_records').insert({
            tenant_id: 'ten_portal_default',
            zone_id: '00000000-0000-0000-0000-000000000001',
            type,
            name,
            content,
            ttl: Number(ttl),
            proxied: Boolean(proxied),
            priority: priority ? Number(priority) : null,
          });
        } catch {}

        return NextResponse.json({
          success: true,
          status: 'executed',
          record: newRecord,
          gateway: gatewayResult,
        });
      }

      // If Tier 1 requires confirmation
      return NextResponse.json(gatewayResult, { status: 202 });
    }

    if (action === 'delete_record') {
      const { id } = record;
      fallbackRecords = fallbackRecords.filter(r => r.id !== id);

      try {
        const supabase = createServerClient();
        await supabase.from('cloud_dns_records').delete().eq('id', id);
      } catch {}

      return NextResponse.json({ success: true, message: `Record ${id} deleted.` });
    }

    if (action === 'purge_cache') {
      const { zone, type = 'Everything', target = 'all' } = body;
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: {
          id: 'user_active_session',
          type: 'user',
          tenantId: 'ten_portal_default',
          roles: ['tenant_admin'],
        },
        targetService: 'dns',
        actionVerb: 'purge_cache',
        resourceUri: `dns://${zone || 'all'}/cache`,
        parameters: { zone, type, target },
        idempotencyKey: `dns_purge_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const gatewayResult = await processActionIntent(actionIntent, options);
      return NextResponse.json({
        success: true,
        status: gatewayResult.status,
        zone: zone || 'all',
        type,
        target,
        latencyMs: Math.floor(Math.random() * 20 + 130),
        gateway: gatewayResult,
      });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
