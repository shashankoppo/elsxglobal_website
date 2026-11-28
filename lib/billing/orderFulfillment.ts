import { createClient } from '@supabase/supabase-js';
import { ProvisioningEngine } from '@/lib/provisioning/ProvisioningEngine';
import { CORE_HOSTING_PLANS } from '@/lib/data/all-plans';
import {
  pgFindOneByColumn,
  pgInsertRow,
  pgUpdateWhere,
} from '@/lib/db/pgFallback';

export interface FulfillmentResult {
  success: boolean;
  message?: string;
  serviceId?: string;
  invoiceId?: string;
  error?: string;
}

export interface FulfillOptions {
  /** If true, marks service active without invoking automated hypervisor adapters (for manual/custom builds) */
  manualOnly?: boolean;
}

/**
 * Centralized utility to fulfill an order once payment is verified.
 */
export async function fulfillOrder(
  orderId: string,
  paymentMethod: string,
  transactionId: string,
  opts: FulfillOptions = {}
): Promise<FulfillmentResult> {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'http://api-gw:8000';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Fulfillment Error: Missing Supabase credentials');
    return { success: false, error: 'Server configuration error' };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // ── ATOMIC CLAIM ──────────────────────────────────────────────────────────
    // claim_order_for_fulfillment() does:
    //   UPDATE hosting_orders SET status='provisioning', payment_status='paid'
    //   WHERE id=$1 AND status IN ('pending','processing') RETURNING *
    // If another worker (webhook vs /verify race) got here first, returns null.
    let order: any = null;
    try {
      const { data: claimed, error: claimErr } = await supabaseAdmin
        .rpc('claim_order_for_fulfillment', { p_order_id: orderId });
      if (!claimErr && claimed) order = claimed;
    } catch {}

    // Fallback: direct PG if PostgREST is unavailable
    if (!order) {
      const { withPgClient } = await import('@/lib/db/pgFallback');
      await withPgClient(async (client: any) => {
        const res = await client.query(
          `UPDATE public.hosting_orders
           SET status = 'provisioning', payment_status = 'paid', updated_at = now()
           WHERE id = $1 AND status IN ('pending', 'processing')
           RETURNING *`,
          [orderId]
        );
        if (res.rowCount > 0) order = res.rows[0];
      }).catch(() => {});
    }

    // No row returned = already claimed by another worker or order doesn't exist
    if (!order) {
      // Check if it already exists and is fulfilled (idempotent success)
      let existingOrder: any = null;
      try {
        const { data } = await supabaseAdmin.from('hosting_orders').select('id,status').eq('id', orderId).maybeSingle();
        existingOrder = data;
      } catch {}
      if (existingOrder && ['provisioning','paid','active','completed'].includes(existingOrder.status)) {
        return { success: true, message: 'Order already fulfilled' };
      }
      return { success: false, error: 'Order not found or already being processed' };
    }

    // Now patch remaining billing columns (payment_method, transaction_id)
    // These are not in the atomic claim — update them separately
    const billingPatch = {
      payment_method: paymentMethod,
      transaction_id: transactionId,
      updated_at: new Date().toISOString(),
    };
    const { error: billErr } = await supabaseAdmin
      .from('hosting_orders')
      .update(billingPatch)
      .eq('id', order.id);
    if (billErr) {
      // Non-fatal — the claim already succeeded
      console.warn('[fulfillOrder] billing patch warn:', billErr.message);
    }

    // 2. Parse Notes for configuration
    let config: Record<string, any> = {};
    try {
      if (order.notes) {
        config = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
      }
    } catch (e) {
      console.error('Failed to parse order notes:', e);
    }

    // Resolve specs from custom configuration or catalog plan
    let specsJson: Record<string, any> = {};
    if (config.custom_vcpu || config.custom_ram || config.custom_storage) {
      specsJson = {
        vcpu: Number(config.custom_vcpu || 4),
        ram_gb: Number(config.custom_ram || 8),
        storage_gb: Number(config.custom_storage || 100),
      };
    } else if (order.plan_id && CORE_HOSTING_PLANS[order.plan_id]) {
      const planFeatures = CORE_HOSTING_PLANS[order.plan_id].features || [];
      specsJson = { features: planFeatures };
    }

    // 4. Provision or fetch Service Record
    const renewalDate = new Date();
    if (order.billing_cycle === 'annual') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else if (order.billing_cycle === 'semi_annual') {
      renewalDate.setMonth(renewalDate.getMonth() + 6);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    // Check if a service record already exists for this order (idempotency)
    let existingServiceId: string | null = null;
    try {
      const { data: svcCheck } = await supabaseAdmin
        .from('hosting_services')
        .select('id')
        .eq('order_id', order.id)
        .maybeSingle();
      if (svcCheck?.id) existingServiceId = svcCheck.id;
    } catch {}

    let serviceId = existingServiceId;

    if (!serviceId) {
      const svcPayload = {
        user_id: order.user_id,
        order_id: orderId,
        plan_name: order.plan_name,
        tier: order.plan_tier || 'cloud',
        billing_cycle: order.billing_cycle,
        status: opts.manualOnly ? 'active' : 'pending_provisioning',
        renewal_date: renewalDate.toISOString(),
        domain: order.domain || null,
        hostname: config.hostname || order.domain || null,
        os_template: config.os_selection || order.os_selection || 'ubuntu-22.04',
        ssh_public_key: config.ssh_public_key || null,
        location: config.server_location || order.server_location || 'pune',
        provisioning_mode: opts.manualOnly ? 'manual' : 'auto',
        setup_status: opts.manualOnly ? 'awaiting_credentials' : 'provisioning',
        specs_json: specsJson,
        ssh_port: 22,
        control_panel_url: null,
      };
      const { data: service, error: svcError } = await supabaseAdmin
        .from('hosting_services')
        .insert(svcPayload)
        .select('id')
        .single();

      if (svcError || !service) {
        const pgService = await pgInsertRow('hosting_services', svcPayload).catch(() => null);
        if (pgService?.id) {
          serviceId = pgService.id;
        } else if (svcError) {
          console.error('Service provision DB error:', svcError.message);
        }
      } else {
        serviceId = service.id;
      }
    }

    // 5. Generate Invoice if not already present for this order
    let existingInvoice: any = null;
    try {
      const { data: invData, error: invCheckErr } = await supabaseAdmin
        .from('hosting_invoices')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();
      if (!invCheckErr && invData) existingInvoice = invData;
    } catch {}
    if (!existingInvoice) {
      existingInvoice = await pgFindOneByColumn('hosting_invoices', 'order_id', orderId).catch(() => null);
    }

    let invoiceId: string | undefined = existingInvoice?.id;
    if (!existingInvoice) {
      const invoiceNumber = 'INV-' + Date.now().toString().slice(-8);
      const invoicePayload = {
        user_id: order.user_id,
        order_id: orderId,
        invoice_number: invoiceNumber,
        amount: order.subtotal ?? order.total,
        tax_amount: order.tax_amount || 0,
        total: order.total,
        currency: order.currency || 'INR',
        status: 'paid',
        payment_method: paymentMethod,
        transaction_id: transactionId,
        due_date: new Date().toISOString(),
        paid_date: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      };
      const { data: createdInvoice, error: invoiceError } = await supabaseAdmin
        .from('hosting_invoices')
        .insert(invoicePayload)
        .select('id')
        .maybeSingle();

      if (invoiceError || !createdInvoice) {
        const pgInvoice = await pgInsertRow('hosting_invoices', invoicePayload).catch(() => null);
        if (pgInvoice?.id) {
          invoiceId = pgInvoice.id;
        } else if (invoiceError) {
          console.error('Failed to create invoice:', invoiceError.message);
        }
      } else {
        invoiceId = createdInvoice.id;
      }
    }

    // 6. Trigger Automated Provisioning unless manualOnly was selected
    if (serviceId && !opts.manualOnly) {
      ProvisioningEngine.provisionService(serviceId).catch((err) => {
        console.error(`Background provisioning failed for service ${serviceId}:`, err);
      });
    }

    console.log(`✅ Order ${orderId} fulfilled via ${paymentMethod} (manualOnly=${Boolean(opts.manualOnly)}).`);

    // 7. Send confirmation email (non-blocking)
    const userEmail = config?.user_email || order.user_email || null;
    if (userEmail) {
      const supabasePublicUrl =
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        'http://api-gw:8000';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.ANON_KEY;
      if (supabasePublicUrl && supabaseAnonKey) {
        fetch(`${supabasePublicUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            template: 'order-approved',
            to: userEmail,
            orderId,
            planName: order.plan_name,
          }),
        }).catch((err) => {
          console.error('Failed to send fulfillment email:', err);
        });
      }
    }

    return {
      success: true,
      message: opts.manualOnly ? 'Order fulfilled for manual setup' : 'Order fulfilled & provisioning started',
      serviceId: serviceId ?? undefined,
      invoiceId,
    };

  } catch (error: any) {
    console.error(`Fulfillment Error for order ${orderId}:`, error);
    return { success: false, error: error.message || 'Internal Fulfillment Error' };
  }
}
