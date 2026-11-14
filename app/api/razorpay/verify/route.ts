export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { fulfillOrder } from '@/lib/billing/orderFulfillment';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let key_secret = process.env.RAZORPAY_KEY_SECRET;

    const { data: settings } = await supabaseAdmin.from('payment_settings').select('razorpay_key_secret').eq('id', 1).single();
    if (settings?.razorpay_key_secret) {
      key_secret = settings.razorpay_key_secret;
    }

    if (!key_secret) {
      console.error('Razorpay secret is missing. Cannot verify signature.');
      return NextResponse.json({ error: 'Payment gateway configuration is missing on the server.' }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const expectedBuf = Buffer.from(generated_signature, 'utf8');
    const signatureBuf = Buffer.from(razorpay_signature, 'utf8');
    const isValid = expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Verify order exists and matches razorpay_order_id
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('hosting_orders')
      .select('id, user_id, status, razorpay_order_id')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.razorpay_order_id && order.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: 'Order transaction mismatch' }, { status: 400 });
    }

    // Hand off to the centralized fulfillment engine
    const result = await fulfillOrder(orderId, 'razorpay', razorpay_payment_id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Fulfillment Failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: result.message || 'Payment verified and service provisioned' });
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
