export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
  pgFindOneByColumn,
  pgGetSingleRow,
  pgUpdateWhere,
} from '@/lib/db/pgFallback';

export async function POST(req: Request) {
  try {
    const { orderId, currency = 'INR', receipt } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'http://api-gw:8000';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '';

    let key_id = process.env.RAZORPAY_KEY_ID;
    let key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Fetch order total from DB (with direct PG fallback) — NEVER trust client-provided amount
    let dbOrder: any = null;
    try {
      const { data, error: orderError } = await supabaseAdmin
        .from('hosting_orders')
        .select('id, total, status')
        .eq('id', orderId)
        .maybeSingle();
      if (!orderError && data) dbOrder = data;
    } catch {}
    if (!dbOrder) {
      dbOrder = await pgFindOneByColumn('hosting_orders', 'id', orderId).catch(() => null);
    }

    if (!dbOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (dbOrder.status === 'paid' || dbOrder.status === 'provisioning' || dbOrder.status === 'active') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    const amount = Number(dbOrder.total);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    let settings: any = null;
    try {
      const { data: sData, error: sErr } = await supabaseAdmin
        .from('payment_settings')
        .select('razorpay_key_id, razorpay_key_secret')
        .eq('id', 1)
        .maybeSingle();
      if (!sErr && sData) settings = sData;
    } catch {}
    if (!settings) {
      settings = await pgGetSingleRow('payment_settings', 1).catch(() => null);
    }
    if (settings?.razorpay_key_id) key_id = settings.razorpay_key_id;
    if (settings?.razorpay_key_secret) key_secret = settings.razorpay_key_secret;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Payment gateway configuration is missing on the server.' }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency,
      receipt: receipt || crypto.randomBytes(10).toString('hex'),
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    // Store Razorpay order ID for webhook matching (with PG fallback if schema cache stale)
    const { error: updateErr } = await supabaseAdmin
      .from('hosting_orders')
      .update({ razorpay_order_id: order.id })
      .eq('id', orderId);
    if (updateErr) {
      await pgUpdateWhere('hosting_orders', { razorpay_order_id: order.id }, 'id', orderId).catch(() => {});
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
