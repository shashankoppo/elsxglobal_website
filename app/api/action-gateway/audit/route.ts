export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { queryAuditLogs, AuditLogFilter } from '@/lib/action-gateway/audit-logger';
import { RiskTier, TargetService } from '@/lib/action-gateway/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || undefined;
    const actorId = searchParams.get('actorId') || undefined;
    const targetService = (searchParams.get('targetService') as TargetService) || undefined;
    const riskTierParam = searchParams.get('riskTier');
    const riskTier = riskTierParam !== null ? (parseInt(riskTierParam, 10) as RiskTier) : undefined;
    const outcome = searchParams.get('outcome') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;

    const filter: AuditLogFilter = {
      tenantId,
      actorId,
      targetService,
      riskTier,
      outcome,
      limit,
    };

    const logs = await queryAuditLogs(filter);
    return NextResponse.json({ logs, total: logs.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query audit logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
