export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPendingApprovals, approveStaffRequest, rejectStaffRequest } from '@/lib/action-gateway/gateway';
import { ActionActor } from '@/lib/action-gateway/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || undefined;

    const approvals = await getPendingApprovals(tenantId);
    return NextResponse.json({ approvals });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve approval queue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, requestId, staffActor, staff2FaToken, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters: requestId and action' },
        { status: 400 }
      );
    }

    const defaultStaffActor: ActionActor = staffActor || {
      id: 'staff_master_admin',
      type: 'user',
      tenantId: 'global',
      email: 'admin@elsxglobal.com',
      roles: ['super_admin'],
    };

    if (action === 'approve') {
      if (!staff2FaToken) {
        return NextResponse.json(
          { error: 'Staff 2FA token is required for Tier 3 dual authorization' },
          { status: 400 }
        );
      }

      const result = await approveStaffRequest(requestId, defaultStaffActor, staff2FaToken);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'reject') {
      const reason = rejectionReason || 'Action rejected by security staff review.';
      const updatedRequest = await rejectStaffRequest(requestId, defaultStaffActor, reason);
      return NextResponse.json({ success: true, request: updatedRequest });
    }

    return NextResponse.json({ error: `Invalid action '${action}'` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error modifying approval request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
