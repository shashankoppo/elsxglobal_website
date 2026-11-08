export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fulfillOrder } from '@/lib/billing/orderFulfillment';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Get webhook secret from env or DB
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Also try to get from DB payment_settings
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let secret = webhookSecret;
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
      const { data: settings } = await supabaseAdmin
        .from('payment_settings')
        .select('razorpay_webhook_secret')
        .eq('id', 1)
        .single();
      if (settings?.razorpay_webhook_secret) {
        secret = settings.razorpay_webhook_secret;
      }
    }

    if (!secret) {
      console.error('Razorpay webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    
    if (expectedSignature !== signature) {
      console.error('Razorpay webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`Razorpay webhook event: ${event.event}`);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }

      const razorpay_payment_id = payment.id;
      const razorpay_order_id = payment.order_id;
      
      // Find our internal order by Razorpay order ID
      const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl2 || !supabaseServiceKey2) {
        return NextResponse.json({ error: 'Server config error' }, { status: 500 });
      }
      const supabaseAdmin = createClient(supabaseUrl2, supabaseServiceKey2, {
        auth: { persistSession: false },
      });
      
      // Find the order that has this Razorpay order ID as transaction_id or in notes
      // We look for orders that are still pending_payment (not yet fulfilled)
      const { data: orders } = await supabaseAdmin
        .from('hosting_orders')
        .select('id, status, transaction_id')
        .eq('status', 'pending_payment')
        .limit(100);
      
      // Try to find by transaction_id match or by looking at notes
      // Also search in recently pending orders (within last 24h) that match the payment amount
      let targetOrderId: string | null = null;
      
      // First try: search by razorpay_order_id stored in a column
      const { data: directMatch } = await supabaseAdmin
        .from('hosting_orders')
        .select('id, status')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle();
      
      if (directMatch) {
        targetOrderId = directMatch.id;
      } else {
        // Fallback: check transaction_id column 
        const { data: txMatch } = await supabaseAdmin
          .from('hosting_orders')
          .select('id, status')
          .eq('transaction_id', razorpay_order_id)
          .maybeSingle();
        if (txMatch) targetOrderId = txMatch.id;
      }

      if (!targetOrderId) {
        // Log this for manual review - payment captured but we can't find the order
        console.error(`Razorpay webhook: payment ${razorpay_payment_id} captured for order ${razorpay_order_id} but no matching internal order found`);
        // Return 200 to Razorpay so it doesn't retry (we'll handle manually)
        return NextResponse.json({ received: true, warning: 'Order not found - logged for review' });
      }

      // Don't double-fulfill
      const { data: existingOrder } = await supabaseAdmin
        .from('hosting_orders')
        .select('status')
        .eq('id', targetOrderId)
        .single();
      
      if (existingOrder?.status === 'paid' || existingOrder?.status === 'provisioning' || existingOrder?.status === 'active') {
        return NextResponse.json({ received: true, message: 'Already fulfilled' });
      }

      // Fulfill the order
      const result = await fulfillOrder(targetOrderId, 'razorpay', razorpay_payment_id);
      console.log(`Webhook fulfillment result for order ${targetOrderId}:`, result);
      
      return NextResponse.json({ received: true, fulfilled: result.success });
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        const supabaseAdmin2 = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );
        // Update order to failed so user can retry
        await supabaseAdmin2
          .from('hosting_orders')
          .update({ status: 'payment_failed', updated_at: new Date().toISOString() })
          .eq('razorpay_order_id', payment.order_id);
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
