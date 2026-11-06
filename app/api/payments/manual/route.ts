export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const authHeader = req.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined
      }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { orderId, paymentMethod, proofUrl } = await req.json();

    if (!orderId || !paymentMethod) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('hosting_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify the authenticated user owns this order
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to modify this order' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('hosting_orders')
      .update({
        status: 'pending_verification',
        payment_method: paymentMethod,
        payment_proof_url: proofUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Record pending transaction
    await supabase.from('transactions').insert({
      user_id: order.user_id,
      order_id: orderId,
      amount: order.total || 0,
      currency: 'INR',
      status: 'pending',
      payment_method: paymentMethod,
      metadata: { proofUrl },
    });

    return NextResponse.json({ success: true, message: 'Payment submitted for verification' });
  } catch (error: any) {
    console.error('Manual Payment Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
