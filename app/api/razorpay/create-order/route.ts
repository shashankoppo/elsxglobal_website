export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { orderId, currency = 'INR', receipt } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const authHeader = req.headers.get('Authorization');

    let key_id = process.env.RAZORPAY_KEY_ID;
    let key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || '');

    // Fetch order total from DB — NEVER trust client-provided amount
    const { data: dbOrder, error: orderError } = await supabaseAdmin
      .from('hosting_orders')
      .select('id, total, status')
      .eq('id', orderId)
      .single();

    if (orderError || !dbOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (dbOrder.status === 'paid' || dbOrder.status === 'provisioning' || dbOrder.status === 'active') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    const amount = Number(dbOrder.total);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const { data: settings } = await supabaseAdmin.from('payment_settings').select('razorpay_key_id, razorpay_key_secret').eq('id', 1).single();
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

    // Store Razorpay order ID for webhook matching
    await supabaseAdmin
      .from('hosting_orders')
      .update({ razorpay_order_id: order.id })
      .eq('id', orderId);

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
