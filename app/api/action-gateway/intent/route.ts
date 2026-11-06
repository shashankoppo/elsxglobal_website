export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const intent = (body.intent || (body.intentId ? body : null)) as ActionIntent;
    const options = body.options || {
      confirmationToken: body.confirmationToken,
      stepUpAuthToken: body.stepUpAuthToken,
      approverStaffId: body.approverStaffId,
      staffPasscode: body.staffPasscode,
    };

    if (!intent || !intent.intentId) {
      return NextResponse.json(
        { error: 'Missing required field: intent or valid intentId' },
        { status: 400 }
      );
    }

    // Attach client IP from request headers if available
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    if (!intent.actor.clientIp) {
      intent.actor.clientIp = clientIp;
    }

    const result = await processActionIntent(intent, options);

    let httpStatus = 200;
    if (result.status === 'require_confirmation') httpStatus = 202;
    if (result.status === 'require_step_up_auth') httpStatus = 401;
    if (result.status === 'enqueued_for_approval') httpStatus = 202;
    if (result.status === 'rejected') httpStatus = 400;

    return NextResponse.json(result, { status: httpStatus });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Action Gateway execution error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
