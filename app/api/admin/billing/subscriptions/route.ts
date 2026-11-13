export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/billing/adminAuth';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized || !auth.supabaseAdmin) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') || 'all';
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
  const offset = (page - 1) * limit;
  const search = searchParams.get('search')?.trim();

  try {
    let query = auth.supabaseAdmin
      .from('subscriptions')
      .select('*, hosting_plans(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (search) {
      query = query.or(`plan_id.ilike.%${search}%,razorpay_subscription_id.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: subscriptions, count, error } = await query;

    if (error) {
      console.warn('Subscriptions table query warning:', error.message);
      // Fallback response if table not yet populated
      return NextResponse.json({
        success: true,
        subscriptions: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        stats: { activeCount: 0, trialingCount: 0, pastDueCount: 0, totalMrrPaise: 0 },
      });
    }

    const rows = subscriptions || [];

    // Calculate quick stats across all subscriptions
    const { data: allSubs } = await auth.supabaseAdmin
      .from('subscriptions')
      .select('status, next_invoice_amount_paise, billing_cycle');

    const totalActive = (allSubs || []).filter(s => s.status === 'active').length;
    const totalTrialing = (allSubs || []).filter(s => s.status === 'trialing').length;
    const totalPastDue = (allSubs || []).filter(s => s.status === 'past_due').length;
    
    // MRR calculation (normalize annual to monthly)
    const totalMrrPaise = (allSubs || []).reduce((sum, s) => {
      if (s.status !== 'active') return sum;
      const amt = Number(s.next_invoice_amount_paise) || 0;
      return sum + (s.billing_cycle === 'annual' ? Math.round(amt / 12) : amt);
    }, 0);

    return NextResponse.json({
      success: true,
      subscriptions: rows,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: {
        activeCount: totalActive,
        trialingCount: totalTrialing,
        pastDueCount: totalPastDue,
        totalMrrPaise,
      },
    });
  } catch (err: any) {
    console.error('Subscriptions GET error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized || !auth.supabaseAdmin) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { action, subscriptionId, planId, reason } = body;

    if (!subscriptionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, action' },
        { status: 400 }
      );
    }

    const validActions = ['cancel', 'pause', 'resume', 'upgrade', 'downgrade', 'apply_credit'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Fetch current subscription
    const { data: subscription, error: fetchError } = await auth.supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // 2. Perform Razorpay external API call if subscription ID is present
    let razorpayResponse: any = null;
    if (subscription.razorpay_subscription_id && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const RazorpayModule = (await import('razorpay')).default;
        const rzp = new RazorpayModule({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        if (action === 'cancel') {
          razorpayResponse = await (rzp.subscriptions as any).cancel(subscription.razorpay_subscription_id, {
            cancel_at_cycle_end: body.cancelAtPeriodEnd ? 1 : 0,
          });
        } else if (action === 'pause') {
          razorpayResponse = await (rzp.subscriptions as any).pause(subscription.razorpay_subscription_id, {
            pause_at: 'now',
          });
        } else if (action === 'resume') {
          razorpayResponse = await (rzp.subscriptions as any).resume(subscription.razorpay_subscription_id, {
            resume_at: 'now',
          });
        }
      } catch (rzpErr: any) {
        console.warn('Razorpay action warning:', rzpErr?.message || rzpErr);
      }
    }

    // 3. Update database state
    const updatePayload: Record<string, any> = {};

    if (action === 'cancel') {
      updatePayload.status = 'cancelled';
      updatePayload.cancelled_at = new Date().toISOString();
      if (body.cancelAtPeriodEnd !== undefined) {
        updatePayload.cancel_at_period_end = Boolean(body.cancelAtPeriodEnd);
      }
    } else if (action === 'pause') {
      updatePayload.status = 'paused';
    } else if (action === 'resume') {
      updatePayload.status = 'active';
    } else if (action === 'upgrade' || action === 'downgrade') {
      if (!planId) {
        return NextResponse.json({ error: 'planId is required for upgrade/downgrade' }, { status: 400 });
      }
      updatePayload.plan_id = planId;

      // Look up new plan price
      const { data: plan } = await auth.supabaseAdmin
        .from('hosting_plans')
        .select('price_monthly, price_annual')
        .eq('id', planId)
        .maybeSingle();

      if (plan) {
        const isAnnual = subscription.billing_cycle === 'annual';
        const price = isAnnual ? Number(plan.price_annual) : Number(plan.price_monthly);
        updatePayload.next_invoice_amount_paise = Math.round(price * 100);
      }
    }

    const { data: updated, error: updateError } = await auth.supabaseAdmin
      .from('subscriptions')
      .update(updatePayload)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      subscription: updated,
      razorpay: razorpayResponse,
      reason: reason || null,
    });
  } catch (err: any) {
    console.error('Subscriptions POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
