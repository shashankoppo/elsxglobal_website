import { createClient } from '@supabase/supabase-js';
import { provisionService } from '@/lib/provisioning';

export interface FulfillmentResult {
  success: boolean;
  message?: string;
  serviceId?: string;
  error?: string;
}

/**
 * Centralized utility to fulfill an order once payment is verified.
 * 
 * @param orderId The UUID of the hosting_orders record
 * @param paymentMethod The gateway used (e.g. 'stripe', 'razorpay', 'upi_manual', 'bank_transfer')
 * @param transactionId The ID from the payment gateway (e.g. payment_intent or razorpay_payment_id)
 * @returns FulfillmentResult
 */
export async function fulfillOrder(
  orderId: string,
  paymentMethod: string,
  transactionId: string
): Promise<FulfillmentResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Fulfillment Error: Missing Supabase credentials');
    return { success: false, error: 'Server configuration error' };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('hosting_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.status === 'completed' || order.status === 'paid' || order.status === 'provisioning') {
      return { success: true, message: 'Order already fulfilled' };
    }

    // 2. Parse Notes for configuration
    let config: any = {};
    try {
      if (order.notes) {
        config = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
      }
    } catch (e) {
      console.error('Failed to parse order notes:', e);
    }

    // 3. Update Order Status
    const { error: updateError } = await supabaseAdmin
      .from('hosting_orders')
      .update({
        status: 'provisioning', // Ready for Phase 3
        payment_status: 'paid',
        payment_method: paymentMethod,
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error(`Failed to update order status: ${updateError.message}`);
    }

    // 4. Provision the Service Record
    const renewalDate = new Date();
    // Default to adding 1 month if billing_cycle isn't annual/semi_annual
    if (order.billing_cycle === 'annual') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else if (order.billing_cycle === 'semi_annual') {
      renewalDate.setMonth(renewalDate.getMonth() + 6);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const { data: service, error: svcError } = await supabaseAdmin
      .from('hosting_services')
      .insert({
        user_id: order.user_id,
        order_id: orderId,
        plan_name: order.plan_name,
        tier: order.plan_tier || 'cloud',
        billing_cycle: order.billing_cycle,
        status: 'pending_provisioning', // Will be changed to active by the Provisioning Engine in Phase 3
        renewal_date: renewalDate.toISOString(),
        domain: order.domain || null,
        // We will update the control_panel_url later once provisioning succeeds
        control_panel_url: null,
      })
      .select('id')
      .single();

    if (svcError) {
      console.error('Service provision DB error:', svcError.message);
      // We log but don't fail, manual intervention can fix this if the order was marked paid
    }

    // 5. Generate Invoice
    const invoiceNumber = 'INV-' + Date.now().toString().slice(-8);
    const { error: invoiceError } = await supabaseAdmin
      .from('hosting_invoices')
      .insert({
        user_id: order.user_id,
        order_id: orderId,
        invoice_number: invoiceNumber,
        amount: order.total,
        status: 'paid',
        payment_method: paymentMethod,
        transaction_id: transactionId,
        due_date: new Date().toISOString(),
        paid_date: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      });

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError.message);
    }

    // 6. Trigger Automated Provisioning
    if (service?.id) {
      // Run asynchronously so we don't block the checkout webhook response
      provisionService(service.id).catch((err) => {
        console.error(`Background provisioning failed for service ${service.id}:`, err);
      });
    }

    console.log(`✅ Order ${orderId} successfully fulfilled via ${paymentMethod}.`);

    return { 
      success: true, 
      message: 'Order fulfilled successfully',
      serviceId: service?.id
    };

  } catch (error: any) {
    console.error(`Fulfillment Error for order ${orderId}:`, error);
    return { success: false, error: error.message || 'Internal Fulfillment Error' };
  }
}
