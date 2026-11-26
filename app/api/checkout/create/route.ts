export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkoutSchema } from '@/lib/billing/checkoutSchema';
import {
  calculateCheckoutTotals,
  calculateCustomComputeMonthly,
  normalizeCycle,
} from '@/lib/billing/pricingMath';
import {
  pgListTable,
  pgFindOneByColumn,
  pgInsertRow,
  pgUpdateWhere,
  healPostgrestSchema,
  withPgClient,
} from '@/lib/db/pgFallback';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parseResult = checkoutSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      planId,
      planName,
      planTier,
      billingCycle,
      domain,
      os,
      panel,
      location,
      hostname,
      ssh_public_key,
      coupon_code,
      include_gst,
      use_credits,
      addons,
      custom_vcpu,
      custom_ram,
      custom_storage,
    } = parseResult.data;

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'http://api-gw:8000';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
    const authHeader = req.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      },
    });

    // Verify user from the auth token, not from the request body
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabaseDb = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
      : supabase;

    // Load active add-ons (with PG fallback)
    let dbAddons: any[] | null = null;
    try {
      const { data: addonsRes, error: addonsErr } = await supabaseDb.from('hosting_addons').select('*');
      if (!addonsErr && addonsRes) dbAddons = addonsRes;
    } catch {}
    if (!dbAddons) {
      dbAddons = await pgListTable('hosting_addons', 'sort_order', true).catch(() => []);
    }
    const addonMap = new Map(
      (dbAddons || []).map((a: any) => [
        a.id,
        Number(a.price_monthly ?? a.price ?? 0),
      ])
    );

    // Resolve authoritative plan base price
    let baseMonthly = 0;
    let resolvedTier = planTier;
    let dbPlanExists = false;
    if (planId === 'custom') {
      baseMonthly = calculateCustomComputeMonthly(
        Number(custom_vcpu || 4),
        Number(custom_ram || 8),
        Number(custom_storage || 100)
      );
      resolvedTier = 'cloud';
    } else {
      let planData: any = null;
      try {
        const { data: pData, error: pErr } = await supabaseDb
          .from('hosting_plans')
          .select('id, price_monthly, tier')
          .eq('id', planId)
          .maybeSingle();
        if (!pErr && pData) planData = pData;
      } catch {}
      if (!planData) {
        planData = await pgFindOneByColumn('hosting_plans', 'id', planId).catch(() => null);
      }

      if (planData && planData.price_monthly !== undefined && planData.price_monthly !== null) {
        dbPlanExists = true;
        baseMonthly = Number(planData.price_monthly);
        if (planData.tier) resolvedTier = planData.tier;
      } else {
        const { resolvePlan } = await import('@/lib/data/all-plans');
        const resolved = resolvePlan(planId);
        baseMonthly = Number(resolved.price_monthly);
        resolvedTier = resolved.tier || resolvedTier;
      }
    }

    // Validate coupon server-side if supplied (with PG fallback)
    let validCoupon: { id: string; code: string; discount_type: string; discount_value: number; current_uses: number } | null = null;
    if (coupon_code && coupon_code.trim()) {
      const codeUpper = coupon_code.trim().toUpperCase();
      const nowIso = new Date().toISOString();
      let couponRow: any = null;
      try {
        const { data: cData, error: cErr } = await supabaseDb
          .from('hosting_coupons')
          .select('id, code, discount_type, discount_value, max_uses, current_uses, valid_until, is_active')
          .eq('code', codeUpper)
          .eq('is_active', true)
          .maybeSingle();
        if (!cErr && cData) couponRow = cData;
      } catch {}
      if (!couponRow) {
        const pgCoupon = await pgFindOneByColumn('hosting_coupons', 'code', codeUpper).catch(() => null);
        if (pgCoupon?.is_active) couponRow = pgCoupon;
      }

      if (
        couponRow &&
        (!couponRow.valid_until || new Date(couponRow.valid_until).toISOString() >= nowIso) &&
        (!couponRow.max_uses || (couponRow.current_uses || 0) < couponRow.max_uses)
      ) {
        validCoupon = couponRow;
      }
    }

    // Check available wallet credit if user requested credit deduction
    let availableCreditInr = 0;
    if (use_credits) {
      let creditBal: any = null;
      try {
        const { data: cbData, error: cbErr } = await supabaseDb
          .from('credit_balances')
          .select('balance_paise')
          .eq('user_id', authUser.id)
          .maybeSingle();
        if (!cbErr && cbData) creditBal = cbData;
      } catch {}
      if (!creditBal) {
        creditBal = await pgFindOneByColumn('credit_balances', 'user_id', authUser.id).catch(() => null);
      }
      if (creditBal?.balance_paise && creditBal.balance_paise > 0) {
        availableCreditInr = Math.floor(creditBal.balance_paise / 100);
      }
    }

    const normalizedCycle = normalizeCycle(billingCycle);
    const panelMonthly =
      panel === 'cpanel' ? 1500 : panel === 'plesk' ? 800 : panel === 'directadmin' ? 500 : 0;
    const addonMonthlyTotal = addons.reduce(
      (sum: number, id: string) => sum + (addonMap.get(id) || 0),
      0
    );

    const math = calculateCheckoutTotals({
      baseMonthly,
      panelMonthly,
      addonMonthlyTotal,
      billingCycle: normalizedCycle,
      planTier: resolvedTier,
      coupon: validCoupon,
      availableCreditInr,
      applyWalletCredit: use_credits,
      includeGst: include_gst,
    });

    const isZeroPayable = math.payableTotal === 0;

    const orderPayload = {
      plan_id: dbPlanExists ? planId : null,
      plan_name: planName,
      plan_tier: resolvedTier,
      billing_cycle: normalizedCycle,
      subtotal: math.subtotalBeforeCoupon,
      discount_amount: math.couponDiscount + math.creditApplied,
      tax_amount: math.taxAmount,
      total: math.payableTotal,
      domain: domain || null,
      os_selection: os || 'ubuntu-22.04',
      panel_selection: panel || 'none',
      server_location: location || 'pune',
      user_email: authUser.email,
      notes: JSON.stringify({
        os_selection: os || 'ubuntu-22.04',
        panel_selection: panel || 'none',
        server_location: location || 'pune',
        addons,
        user_email: authUser.email,
        hostname: hostname || null,
        ssh_public_key: ssh_public_key || null,
        custom_vcpu: planId === 'custom' ? Number(custom_vcpu || 4) : undefined,
        custom_ram: planId === 'custom' ? Number(custom_ram || 8) : undefined,
        custom_storage: planId === 'custom' ? Number(custom_storage || 100) : undefined,
        coupon_code: validCoupon?.code || null,
        coupon_discount: math.couponDiscount,
        credit_applied: math.creditApplied,
        hourly_rate: math.hourlyRate,
        billing_mode: normalizedCycle === 'pay_as_you_go' ? 'hourly_metered' : 'commitment',
      }),
      status: 'pending_payment',
      user_id: authUser.id,
    };

    let data: any = null;
    let insertErrorMsg: string | null = null;
    try {
      const res = await supabaseDb
        .from('hosting_orders')
        .insert(orderPayload)
        .select('id, total, subtotal, discount_amount, tax_amount')
        .single();
      if (!res.error && res.data) {
        data = res.data;
      } else {
        insertErrorMsg = res.error?.message || 'Order insert failed';
      }
    } catch (e: any) {
      insertErrorMsg = e?.message || 'Order insert failed';
    }

    if (!data) {
      try {
        data = await pgInsertRow('hosting_orders', orderPayload);
        healPostgrestSchema().catch(() => {});
      } catch (pgErr: any) {
        return NextResponse.json({ error: pgErr?.message || insertErrorMsg || 'Failed to create order' }, { status: 400 });
      }
    }

    if (!data) {
      return NextResponse.json({ error: insertErrorMsg || 'Failed to create order' }, { status: 400 });
    }

    // Increment coupon usage atomically
    if (validCoupon) {
      const nextUses = (validCoupon.current_uses || 0) + 1;
      const { error: cUpErr } = await supabaseDb
        .from('hosting_coupons')
        .update({ current_uses: nextUses })
        .eq('id', validCoupon.id);
      if (cUpErr) {
        await pgUpdateWhere('hosting_coupons', { current_uses: nextUses }, 'id', validCoupon.id).catch(() => {});
      }
    }

    // Deduct wallet credits if applied
    if (math.creditApplied > 0) {
      const deductPaise = math.creditApplied * 100;
      const newBalancePaise = Math.max(0, availableCreditInr * 100 - deductPaise);
      const { error: balErr } = await supabaseDb
        .from('credit_balances')
        .update({ balance_paise: newBalancePaise, updated_at: new Date().toISOString() })
        .eq('user_id', authUser.id);
      if (balErr) {
        await withPgClient(async (c) => {
          await c.query(
            `UPDATE public.credit_balances SET balance_paise = $1, updated_at = now() WHERE user_id = $2`,
            [newBalancePaise, authUser.id]
          );
        }).catch(() => {});
      }
      const ledgerEntry = {
        user_id: authUser.id,
        amount_paise: -deductPaise,
        balance_after_paise: newBalancePaise,
        type: 'usage_deduction',
        description: `Applied to order ${data.id} (${planName})`,
        reference_id: data.id,
      };
      const { error: ledErr } = await supabaseDb.from('credit_ledger').insert(ledgerEntry);
      if (ledErr) {
        await pgInsertRow('credit_ledger', ledgerEntry).catch(() => {});
      }
    }

    // If order total is ₹0 (free tier, 100% coupon, or paid fully with wallet credits), fulfill immediately
    if (isZeroPayable) {
      const { fulfillOrder } = await import('@/lib/billing/orderFulfillment');
      await fulfillOrder(
        data.id,
        math.creditApplied > 0 ? 'wallet_credits' : 'free_tier',
        `free-${Date.now()}`
      );
    }

    return NextResponse.json({
      id: data.id,
      total: data.total,
      subtotal: data.subtotal,
      discount_amount: data.discount_amount,
      tax_amount: data.tax_amount,
      fulfilledImmediately: isZeroPayable,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
