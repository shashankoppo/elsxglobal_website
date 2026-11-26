export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fulfillOrder } from '@/lib/billing/orderFulfillment';
import { createClient } from '@supabase/supabase-js';
import {
  pgFindOneByColumn,
  pgGetSingleRow,
  pgUpdateWhere,
} from '@/lib/db/pgFallback';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Get webhook secret from env or DB
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Also try to get from DB payment_settings (with PG fallback)
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'http://api-gw:8000';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
    let secret = webhookSecret;
    
    let settings: any = null;
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });
        const { data: sData, error: sErr } = await supabaseAdmin
          .from('payment_settings')
          .select('razorpay_webhook_secret')
          .eq('id', 1)
          .maybeSingle();
        if (!sErr && sData) settings = sData;
      } catch {}
    }
    if (!settings) {
      settings = await pgGetSingleRow('payment_settings', 1).catch(() => null);
    }
    if (settings?.razorpay_webhook_secret) {
      secret = settings.razorpay_webhook_secret;
    }

    if (!secret) {
      console.error('Razorpay webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Verify webhook signature (timing-safe)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');
    const isValid = expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf);

    if (!isValid) {
      console.error('Razorpay webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`Razorpay webhook event: ${event.event}`);

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }

      const razorpay_payment_id = payment.id;
      const razorpay_order_id = payment.order_id;
      
      // Find our internal order by Razorpay order ID (with PG fallback)
      let matchedOrder: any = null;
      try {
        const { data: directMatch, error: dErr } = await supabaseAdmin
          .from('hosting_orders')
          .select('id, status')
          .eq('razorpay_order_id', razorpay_order_id)
          .maybeSingle();
        if (!dErr && directMatch) matchedOrder = directMatch;
      } catch {}

      if (!matchedOrder && razorpay_order_id) {
        matchedOrder = await pgFindOneByColumn('hosting_orders', 'razorpay_order_id', razorpay_order_id).catch(() => null);
      }

      if (!matchedOrder && razorpay_order_id) {
        try {
          const { data: txMatch, error: txErr } = await supabaseAdmin
            .from('hosting_orders')
            .select('id, status')
            .eq('transaction_id', razorpay_order_id)
            .maybeSingle();
          if (!txErr && txMatch) matchedOrder = txMatch;
        } catch {}
      }

      if (!matchedOrder && razorpay_order_id) {
        matchedOrder = await pgFindOneByColumn('hosting_orders', 'transaction_id', razorpay_order_id).catch(() => null);
      }

      if (!matchedOrder) {
        console.error(`Razorpay webhook: payment ${razorpay_payment_id} captured for order ${razorpay_order_id} but no matching internal order found`);
        return NextResponse.json({ received: true, warning: 'Order not found - logged for review' });
      }

      if (matchedOrder.status === 'paid' || matchedOrder.status === 'provisioning' || matchedOrder.status === 'active') {
        return NextResponse.json({ received: true, message: 'Already fulfilled' });
      }

      // Fulfill the order
      const result = await fulfillOrder(matchedOrder.id, 'razorpay', razorpay_payment_id);
      console.log(`Webhook fulfillment result for order ${matchedOrder.id}:`, result);
      
      return NextResponse.json({ received: true, fulfilled: result.success });
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        const patch = { status: 'payment_failed', updated_at: new Date().toISOString() };
        const { error: failErr } = await supabaseAdmin
          .from('hosting_orders')
          .update(patch)
          .eq('razorpay_order_id', payment.order_id);
        if (failErr) {
          await pgUpdateWhere('hosting_orders', patch, 'razorpay_order_id', payment.order_id).catch(() => {});
        }
      }
      return NextResponse.json({ received: true });
    }

    // For all other events, acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
