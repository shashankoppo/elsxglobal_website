import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return json({ error: message }, status);
}

async function getPaymentSettings() {
  const { data, error } = await supabase
    .from("payment_settings")
    .select("razorpay_key_id, razorpay_key_secret, razorpay_enabled, razorpay_sandbox_mode, upi_enabled, bank_transfer_enabled")
    .eq("id", 1)
    .maybeSingle();
  if (error) return null;
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    // ─── CREATE RAZORPAY ORDER ─────────────────────────────────
    if (action === "create-razorpay-order") {
      const { orderId } = body;
      if (!orderId) return errorResponse("orderId required");

      // Get the anon-key client to check ownership via RLS
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userToken = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();

      // Use service role to fetch the order (we'll verify ownership separately)
      const { data: order, error: orderError } = await supabase
        .from("hosting_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (orderError || !order) return errorResponse("Order not found", 404);

      // Verify the caller is authenticated and owns this order
      if (!userToken || userToken === anonKey) {
        return errorResponse("Authentication required to create payment order", 401);
      }

      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${userToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userOrder, error: userErr } = await userClient
        .from("hosting_orders")
        .select("id")
        .eq("id", orderId)
        .maybeSingle();
      if (userErr || !userOrder) return errorResponse("Order not found or access denied", 403);

      // Prevent duplicate Razorpay order creation
      if (order.payment_id && order.status !== "pending_payment") {
        return errorResponse("Order already has a payment in progress", 400);
      }

      const settings = await getPaymentSettings();
      if (!settings || !settings.razorpay_enabled) return errorResponse("Razorpay payments are not enabled", 400);
      if (!settings.razorpay_key_id || !settings.razorpay_key_secret) return errorResponse("Razorpay keys not configured", 500);

      const amountInPaise = Math.round(Number(order.total) * 100);
      const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(`${settings.razorpay_key_id}:${settings.razorpay_key_secret}`),
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: orderId.slice(0, 40),
          notes: { orderId, planName: order.plan_name },
        }),
      });

      if (!razorpayResponse.ok) {
        const errBody = await razorpayResponse.text();
        console.error("Razorpay order creation failed:", errBody);
        return errorResponse("Failed to create Razorpay order", 502);
      }

      const razorpayOrder = await razorpayResponse.json();

      // Store the Razorpay order ID on the order
      const { error: updateError } = await supabase
        .from("hosting_orders")
        .update({ payment_id: razorpayOrder.id, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (updateError) console.error("Failed to store Razorpay order ID:", updateError.message);

      // Record initiated transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: order.user_id,
        order_id: orderId,
        amount: Number(order.total),
        currency: "INR",
        status: "initiated",
        payment_method: "razorpay",
        gateway_transaction_id: razorpayOrder.id,
      });
      if (txError) console.error("Failed to record transaction:", txError.message);

      return json({
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: settings.razorpay_key_id,
        amount: amountInPaise,
        currency: "INR",
      });
    }

    // ─── VERIFY RAZORPAY PAYMENT ───────────────────────────────
    if (action === "verify-razorpay-payment") {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return errorResponse("Missing required payment verification fields");
      }

      const { data: order, error: orderError } = await supabase
        .from("hosting_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (orderError || !order) return errorResponse("Order not found", 404);

      // CRITICAL: Verify the razorpayOrderId matches what was stored on this order
      if (order.payment_id !== razorpayOrderId) {
        return errorResponse("Payment order ID mismatch", 400);
      }

      const settings = await getPaymentSettings();
      if (!settings || !settings.razorpay_key_secret) return errorResponse("Payment configuration error", 500);

      // Verify the signature
      const expectedSignature = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(`${razorpayOrderId}|${razorpayPaymentId}|${settings.razorpay_key_secret}`),
      );
      const expectedSigHex = Array.from(new Uint8Array(expectedSignature)).map((b) => b.toString(16).padStart(2, "0")).join("");

      if (expectedSigHex !== razorpaySignature) {
        return errorResponse("Invalid payment signature", 400);
      }

      // Payment verified — update order
      const { error: updateError } = await supabase
        .from("hosting_orders")
        .update({ status: "paid", payment_id: razorpayPaymentId, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (updateError) return errorResponse("Failed to update order status");

      // Update transaction
      const { error: txUpdateError } = await supabase
        .from("transactions")
        .update({ status: "completed", gateway_transaction_id: razorpayPaymentId })
        .eq("gateway_transaction_id", razorpayOrderId);
      if (txUpdateError) console.error("Failed to update transaction:", txUpdateError.message);

      // Provision service
      const { error: svcError } = await supabase.from("hosting_services").insert({
        user_id: order.user_id,
        order_id: orderId,
        plan_name: order.plan_name,
        tier: order.tier,
        billing_cycle: order.billing_cycle,
        status: "active",
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        domain: order.domain_name || null,
        control_panel_url: `https://cp.vaulthost.com/${orderId.slice(0, 8)}`,
      });
      if (svcError) console.error("Service provision error:", svcError.message);

      // Generate invoice
      const invoiceNumber = "INV-" + Date.now().toString().slice(-8);
      const { error: invError } = await supabase.from("hosting_invoices").insert({
        user_id: order.user_id,
        order_id: orderId,
        invoice_number: invoiceNumber,
        amount: order.total,
        status: "paid",
        due_date: new Date().toISOString(),
        paid_date: new Date().toISOString(),
      });
      if (invError) console.error("Invoice creation error:", invError.message);

      return json({ success: true, message: "Payment verified and service provisioned", invoiceNumber });
    }

    // ─── MARK MANUAL PAYMENT ───────────────────────────────────
    if (action === "mark-manual-payment") {
      const { orderId, paymentMethod, proofUrl } = body;
      if (!orderId) return errorResponse("orderId required");
      if (!paymentMethod) return errorResponse("paymentMethod required");
      if (!["upi", "bank_transfer"].includes(paymentMethod)) return errorResponse("Invalid payment method");

      const { data: order, error: orderError } = await supabase
        .from("hosting_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (orderError || !order) return errorResponse("Order not found", 404);

      // Verify ownership via user JWT
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userToken = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
      if (userToken && userToken !== anonKey) {
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${userToken}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userOrder, error: userErr } = await userClient
          .from("hosting_orders")
          .select("id")
          .eq("id", orderId)
          .maybeSingle();
        if (userErr || !userOrder) return errorResponse("Access denied", 403);
      }

      // Validate proofUrl is a Supabase storage URL
      if (proofUrl && !proofUrl.includes("supabase.co/storage")) {
        return errorResponse("Invalid proof URL", 400);
      }

      const { error: updateError } = await supabase
        .from("hosting_orders")
        .update({
          status: "pending_verification",
          payment_method: paymentMethod,
          payment_proof_url: proofUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
      if (updateError) return errorResponse("Failed to update order");

      // Record pending transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: order.user_id,
        order_id: orderId,
        amount: Number(order.total),
        currency: "INR",
        status: "pending",
        payment_method: paymentMethod,
        metadata: { proofUrl },
      });
      if (txError) console.error("Failed to record transaction:", txError.message);

      return json({ success: true, message: "Payment submitted for verification" });
    }

    return errorResponse("Unknown action", 404);
  } catch (err) {
    console.error("vaulthost-payments error:", err);
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500);
  }
});
