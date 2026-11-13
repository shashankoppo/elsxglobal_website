export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/billing/adminAuth';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized || !auth.supabaseAdmin) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const userId = searchParams.get('userId');
  const productType = searchParams.get('productType');

  // Compute period boundaries
  const [yearStr, monthStr] = period.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const endDate = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1)).toISOString();

  try {
    let query = auth.supabaseAdmin
      .from('usage_records')
      .select('*')
      .gte('billing_period_start', startDate)
      .lt('billing_period_start', endDate)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (productType) {
      query = query.eq('product_type', productType);
    }

    const { data: records, error } = await query;

    if (error) {
      console.warn('Error querying usage_records:', error.message);
      // Return empty aggregated structure rather than crashing
      return NextResponse.json({
        success: true,
        period,
        startDate,
        endDate,
        records: [],
        aggregated: {
          totalAmountPaise: 0,
          totalRecords: 0,
          byProduct: {},
        },
      });
    }

    const rows = records || [];

    // Aggregations by product type
    const byProduct: Record<string, { quantity: number; unit: string; amountPaise: number; recordCount: number }> = {};
    let totalAmountPaise = 0;

    for (const row of rows) {
      const type = row.product_type || 'other';
      if (!byProduct[type]) {
        byProduct[type] = {
          quantity: 0,
          unit: row.unit || 'units',
          amountPaise: 0,
          recordCount: 0,
        };
      }
      byProduct[type].quantity += Number(row.quantity) || 0;
      byProduct[type].amountPaise += Number(row.amount_paise) || 0;
      byProduct[type].recordCount += 1;
      totalAmountPaise += Number(row.amount_paise) || 0;
    }

    return NextResponse.json({
      success: true,
      period,
      startDate,
      endDate,
      records: rows,
      aggregated: {
        totalAmountPaise,
        totalRecords: rows.length,
        byProduct,
      },
    });
  } catch (err: any) {
    console.error('Usage metering GET error:', err);
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
    const {
      userId,
      productType,
      quantity,
      unit,
      unitPricePaise,
      serviceId,
      billingPeriodStart,
      billingPeriodEnd,
    } = body;

    if (!userId || !productType || quantity === undefined || !unit || unitPricePaise === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, productType, quantity, unit, unitPricePaise' },
        { status: 400 }
      );
    }

    const numQuantity = Number(quantity);
    const numPrice = Math.round(Number(unitPricePaise));
    const amountPaise = Math.round(numQuantity * numPrice);

    const now = new Date();
    const start = billingPeriodStart ? new Date(billingPeriodStart).toISOString() : new Date(now.setMinutes(0, 0, 0)).toISOString();
    const end = billingPeriodEnd ? new Date(billingPeriodEnd).toISOString() : new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const insertData = {
      user_id: userId,
      product_type: productType,
      quantity: numQuantity,
      unit,
      unit_price_paise: numPrice,
      amount_paise: amountPaise,
      service_id: serviceId || null,
      billing_period_start: start,
      billing_period_end: end,
      invoiced: false,
    };

    const { data, error } = await auth.supabaseAdmin
      .from('usage_records')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Optionally update quota tracking if table exists
    try {
      await auth.supabaseAdmin.rpc('increment_service_quota', {
        p_user_id: userId,
        p_product_type: productType,
        p_amount: numQuantity,
      });
    } catch {
      // Non-fatal if stored procedure doesn't exist
    }

    return NextResponse.json({
      success: true,
      record: data,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Usage metering POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
