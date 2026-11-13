export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/billing/adminAuth';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized || !auth.supabaseAdmin) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  try {
    let ledgerQuery = auth.supabaseAdmin
      .from('credit_ledger')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      ledgerQuery = ledgerQuery.eq('user_id', userId);
    }

    let balancesQuery = auth.supabaseAdmin
      .from('credit_balances')
      .select('*')
      .order('balance_paise', { ascending: false })
      .limit(limit);

    if (userId) {
      balancesQuery = balancesQuery.eq('user_id', userId);
    }

    const [ledgerRes, balancesRes] = await Promise.all([
      ledgerQuery,
      balancesQuery,
    ]);

    const ledger = ledgerRes.data || [];
    const balances = balancesRes.data || [];

    // Compute totals
    const totalCreditsOutstandingPaise = balances.reduce((sum, b) => sum + (Number(b.balance_paise) || 0), 0);
    const totalLifetimeCreditedPaise = balances.reduce((sum, b) => sum + (Number(b.lifetime_credited_paise) || 0), 0);

    return NextResponse.json({
      success: true,
      ledger,
      balances,
      summary: {
        totalCreditsOutstandingPaise,
        totalLifetimeCreditedPaise,
        totalCustomersWithBalance: balances.filter(b => b.balance_paise > 0).length,
      },
    });
  } catch (err: any) {
    console.error('Credits GET error:', err);
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
    const { userId, amountPaise, type, description, referenceId } = body;

    if (!userId || amountPaise === undefined || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amountPaise, type, description' },
        { status: 400 }
      );
    }

    const validTypes = ['topup', 'refund', 'promo', 'usage_deduction', 'adjustment'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid credit type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const deltaPaise = Math.round(Number(amountPaise));

    // 1. Fetch current balance
    const { data: currentBalanceRecord } = await auth.supabaseAdmin
      .from('credit_balances')
      .select('balance_paise, lifetime_credited_paise')
      .eq('user_id', userId)
      .maybeSingle();

    const previousBalance = currentBalanceRecord ? Number(currentBalanceRecord.balance_paise) || 0 : 0;
    const previousLifetime = currentBalanceRecord ? Number(currentBalanceRecord.lifetime_credited_paise) || 0 : 0;

    const balanceAfterPaise = previousBalance + deltaPaise;
    const newLifetimeCredited = deltaPaise > 0 ? previousLifetime + deltaPaise : previousLifetime;

    // 2. Insert ledger record
    const { data: ledgerEntry, error: ledgerError } = await auth.supabaseAdmin
      .from('credit_ledger')
      .insert({
        user_id: userId,
        amount_paise: deltaPaise,
        balance_after_paise: balanceAfterPaise,
        type,
        description,
        reference_id: referenceId || null,
      })
      .select()
      .single();

    if (ledgerError) {
      return NextResponse.json({ error: ledgerError.message }, { status: 400 });
    }

    // 3. Upsert credit_balances record
    const { error: balanceError } = await auth.supabaseAdmin
      .from('credit_balances')
      .upsert({
        user_id: userId,
        balance_paise: balanceAfterPaise,
        lifetime_credited_paise: newLifetimeCredited,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (balanceError) {
      console.warn('Could not upsert credit_balances directly:', balanceError.message);
    }

    return NextResponse.json({
      success: true,
      ledgerEntry,
      previousBalancePaise: previousBalance,
      balanceAfterPaise,
      deltaPaise,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Credits POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
