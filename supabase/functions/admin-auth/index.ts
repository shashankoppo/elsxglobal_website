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

const TOKEN_EXPIRY_HOURS = 24;
const VALID_ORDER_STATUSES = ["pending_payment", "pending_verification", "paid", "active", "cancelled", "refunded", "failed", "suspended"];
const VALID_SERVICE_STATUSES = ["active", "suspended", "pending", "terminated"];
const VALID_TICKET_STATUSES = ["open", "pending", "resolved", "closed"];

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + Deno.env.get("SUPABASE_URL"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateToken(): Promise<string> {
  return crypto.randomUUID() + "-" + Date.now();
}

async function createSession(adminId: string): Promise<string> {
  const token = await generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("admin_sessions").insert({
    admin_id: adminId,
    token,
    expires_at: expiresAt,
  });
  if (error) throw new Error("Failed to create session");
  return token;
}

async function verifyToken(token: string): Promise<{ adminId: string; email: string; name: string; role: string } | null> {
  if (!token) return null;
  const { data: session, error } = await supabase
    .from("admin_sessions")
    .select("admin_id, expires_at, revoked, admin_users!inner(email, name, role, is_active)")
    .eq("token", token)
    .maybeSingle();
  if (error || !session) return null;
  if (session.revoked) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  const admin = session.admin_users as unknown as { email: string; name: string; role: string; is_active: boolean };
  if (!admin.is_active) return null;
  return { adminId: session.admin_id as string, email: admin.email, name: admin.name, role: admin.role };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return json({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    // ─── PUBLIC ACTIONS (no token needed) ──────────────────────
    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) return errorResponse("Email and password required");
      const passwordHash = await hashPassword(password);
      const { data: admin, error } = await supabase
        .from("admin_users")
        .select("id, email, name, role, is_active")
        .eq("email", email.toLowerCase())
        .eq("password_hash", passwordHash)
        .maybeSingle();
      if (error || !admin) return errorResponse("Invalid credentials", 401);
      if (!admin.is_active) return errorResponse("Account deactivated", 403);
      const token = await createSession(admin.id);
      return json({ token, admin: { email: admin.email, name: admin.name, role: admin.role } });
    }

    if (action === "setup") {
      const { email, password, name } = body;
      if (!email || !password) return errorResponse("Email and password required");
      if (password.length < 8) return errorResponse("Password must be at least 8 characters");
      const { count } = await supabase.from("admin_users").select("*", { count: "exact", head: true });
      if (count && count > 0) return errorResponse("Admin account already exists", 403);
      const passwordHash = await hashPassword(password);
      const { data: newAdmin, error: insertError } = await supabase
        .from("admin_users")
        .insert({ email: email.toLowerCase(), password_hash: passwordHash, name: name || "Administrator", role: "superadmin", is_active: true })
        .select("id, email, name, role")
        .single();
      if (insertError) return errorResponse("Failed to create admin account");
      const token = await createSession(newAdmin.id);
      return json({ token, admin: { email: newAdmin.email, name: newAdmin.name, role: newAdmin.role } });
    }

    if (action === "reset-admin") {
      const { email, password, name, confirmReset } = body;
      if (confirmReset !== "RESET_ADMIN_CONFIRMED") return errorResponse("Invalid reset confirmation", 403);
      if (!email || !password) return errorResponse("Email and password required");
      if (password.length < 8) return errorResponse("Password must be at least 8 characters");
      await supabase.from("admin_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("admin_users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const passwordHash = await hashPassword(password);
      const { data: newAdmin, error: insertError } = await supabase
        .from("admin_users")
        .insert({ email: email.toLowerCase(), password_hash: passwordHash, name: name || "Administrator", role: "superadmin", is_active: true })
        .select("id, email, name, role")
        .single();
      if (insertError) return errorResponse("Failed to create admin account: " + insertError.message);
      const token = await createSession(newAdmin.id);
      return json({ token, admin: { email: newAdmin.email, name: newAdmin.name, role: newAdmin.role } });
    }

    // ─── AUTHENTICATED ACTIONS ─────────────────────────────────
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const adminUser = await verifyToken(token);
    if (!adminUser) return errorResponse("Unauthorized", 401);

    switch (action) {
      // ─── VERIFY ───────────────────────────────────────────
      case "verify": {
        return json({ valid: true, admin: adminUser });
      }

      // ─── STATS ────────────────────────────────────────────
      case "stats": {
        const [orders, services, invoices, tickets, plans, addons, transactions] = await Promise.all([
          supabase.from("hosting_orders").select("status, total"),
          supabase.from("hosting_services").select("status"),
          supabase.from("hosting_invoices").select("status, total"),
          supabase.from("support_tickets").select("status"),
          supabase.from("hosting_plans").select("is_active"),
          supabase.from("hosting_addons").select("is_active"),
          supabase.from("transactions").select("amount, status"),
        ]);

        const stats = {
          totalOrders: orders.data?.length || 0,
          totalRevenue: (orders.data || []).filter((o: { status: string }) => o.status === "active" || o.status === "paid").reduce((s: number, o: { total: number }) => s + (o.total || 0), 0),
          pendingOrders: (orders.data || []).filter((o: { status: string }) => ["pending_payment", "pending_verification"].includes(o.status)).length,
          activeServices: (services.data || []).filter((s: { status: string }) => s.status === "active").length,
          totalServices: services.data?.length || 0,
          openTickets: (tickets.data || []).filter((t: { status: string }) => ["open", "pending"].includes(t.status)).length,
          totalTickets: tickets.data?.length || 0,
          unpaidInvoices: (invoices.data || []).filter((i: { status: string }) => i.status === "sent" || i.status === "overdue").length,
          totalInvoices: invoices.data?.length || 0,
          activePlans: (plans.data || []).filter((p: { is_active: boolean }) => p.is_active).length,
          totalPlans: plans.data?.length || 0,
          activeAddons: (addons.data || []).filter((a: { is_active: boolean }) => a.is_active).length,
          totalAddons: addons.data?.length || 0,
          totalTransactions: transactions.data?.length || 0,
        };
        return json(stats);
      }

      // ─── APPROVE ORDER ─────────────────────────────────────
      case "approve-order": {
        const { orderId, newStatus } = body;
        if (!orderId || !newStatus) return errorResponse("orderId and newStatus required");
        if (!VALID_ORDER_STATUSES.includes(newStatus)) return errorResponse("Invalid status");

        const { data: order, error: orderError } = await supabase.from("hosting_orders").select("*").eq("id", orderId).maybeSingle();
        if (orderError || !order) return errorResponse("Order not found", 404);

        const { error: updateError } = await supabase.from("hosting_orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
        if (updateError) return errorResponse("Failed to update order");

        // If approving to active, provision a service
        if (newStatus === "active") {
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
            ip_address: null,
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
        }

        return json({ success: true, message: `Order ${newStatus}` });
      }

      // ─── REFUND ORDER ──────────────────────────────────────
      case "refund-order": {
        const { orderId, refundReason } = body;
        if (!orderId) return errorResponse("orderId required");

        const { data: order, error: orderError } = await supabase.from("hosting_orders").select("*").eq("id", orderId).maybeSingle();
        if (orderError || !order) return errorResponse("Order not found", 404);

        const { error: updateError } = await supabase.from("hosting_orders").update({ status: "refunded", updated_at: new Date().toISOString() }).eq("id", orderId);
        if (updateError) return errorResponse("Failed to refund order");

        // Suspend associated services
        const { error: svcError } = await supabase.from("hosting_services").update({ status: "suspended" }).eq("order_id", orderId);
        if (svcError) console.error("Service suspension error:", svcError.message);

        // Record refund transaction
        const { error: txError } = await supabase.from("transactions").insert({
          user_id: order.user_id,
          order_id: orderId,
          amount: -Number(order.total || 0),
          currency: "INR",
          status: "refunded",
          payment_method: order.payment_method || "unknown",
          gateway_transaction_id: order.payment_id || null,
          metadata: { refundReason: refundReason || "Admin initiated refund", adminEmail: adminUser.email },
        });
        if (txError) console.error("Refund transaction error:", txError.message);

        return json({ success: true, message: "Order refunded and service suspended" });
      }

      // ─── ORDER DETAIL ──────────────────────────────────────
      case "order-detail": {
        const { orderId } = body;
        if (!orderId) return errorResponse("orderId required");

        const [orderRes, servicesRes, transactionsRes, ticketsRes] = await Promise.all([
          supabase.from("hosting_orders").select("*").eq("id", orderId).maybeSingle(),
          supabase.from("hosting_services").select("*").eq("order_id", orderId),
          supabase.from("transactions").select("*").eq("order_id", orderId),
          supabase.from("support_tickets").select("*").eq("order_id", orderId),
        ]);

        return json({
          order: orderRes.data,
          services: servicesRes.data || [],
          transactions: transactionsRes.data || [],
          tickets: ticketsRes.data || [],
        });
      }

      // ─── SAVE PLAN ─────────────────────────────────────────
      case "save-plan": {
        const { id, name, slug, tier, description, price_monthly, price_annually, cpu_cores, ram_gb, storage_gb, bandwidth, features, is_popular, sort_order, is_active } = body;
        if (!name || !slug) return errorResponse("name and slug required");

        const payload = {
          name, slug, tier: tier || "shared", description: description || "",
          price_monthly: Number(price_monthly) || 0, price_annually: Number(price_annually) || 0,
          cpu_cores: cpu_cores || "1", ram_gb: ram_gb || "1", storage_gb: storage_gb || "10", bandwidth: bandwidth || "1TB",
          features: Array.isArray(features) ? features : (typeof features === "string" ? features.split("\n").filter((f: string) => f.trim()) : []),
          is_popular: Boolean(is_popular), sort_order: Number(sort_order) || 0, is_active: is_active !== false,
        };

        if (id) {
          const { error } = await supabase.from("hosting_plans").update(payload).eq("id", id);
          if (error) return errorResponse("Failed to update plan");
          return json({ success: true, message: "Plan updated" });
        } else {
          const { error } = await supabase.from("hosting_plans").insert(payload);
          if (error) return errorResponse("Failed to create plan");
          return json({ success: true, message: "Plan created" });
        }
      }

      // ─── DELETE PLAN ───────────────────────────────────────
      case "delete-plan": {
        const { planId } = body;
        if (!planId) return errorResponse("planId required");
        const { error } = await supabase.from("hosting_plans").delete().eq("id", planId);
        if (error) return errorResponse("Failed to delete plan");
        return json({ success: true, message: "Plan deleted" });
      }

      // ─── SAVE ADDON ────────────────────────────────────────
      case "save-addon": {
        const { id, name, slug, category, description, price_monthly, price_annually, icon, sort_order, is_active } = body;
        if (!name || !slug) return errorResponse("name and slug required");

        const payload = {
          name, slug, category: category || "performance", description: description || "",
          price_monthly: Number(price_monthly) || 0, price_annually: Number(price_annually) || 0,
          icon: icon || "Plus", sort_order: Number(sort_order) || 0, is_active: is_active !== false,
        };

        if (id) {
          const { error } = await supabase.from("hosting_addons").update(payload).eq("id", id);
          if (error) return errorResponse("Failed to update addon");
          return json({ success: true, message: "Add-on updated" });
        } else {
          const { error } = await supabase.from("hosting_addons").insert(payload);
          if (error) return errorResponse("Failed to create addon");
          return json({ success: true, message: "Add-on created" });
        }
      }

      // ─── DELETE ADDON ───────────────────────────────────────
      case "delete-addon": {
        const { addonId } = body;
        if (!addonId) return errorResponse("addonId required");
        const { error } = await supabase.from("hosting_addons").delete().eq("id", addonId);
        if (error) return errorResponse("Failed to delete addon");
        return json({ success: true, message: "Add-on deleted" });
      }

      // ─── LIST SERVICES ──────────────────────────────────────
      case "list-services": {
        const { status } = body;
        let query = supabase.from("hosting_services").select("*").order("created_at", { ascending: false }).limit(200);
        if (status && status !== "all") query = query.eq("status", status);
        const { data, error } = await query;
        if (error) return errorResponse("Failed to fetch services");
        return json({ services: data });
      }

      // ─── UPDATE SERVICE ─────────────────────────────────────
      case "update-service": {
        const { serviceId, status, ipAddress, controlPanelUrl, renewalDate } = body;
        if (!serviceId) return errorResponse("serviceId required");
        const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (status) {
          if (!VALID_SERVICE_STATUSES.includes(status)) return errorResponse("Invalid service status");
          update.status = status;
        }
        if (ipAddress !== undefined) update.ip_address = ipAddress;
        if (controlPanelUrl !== undefined) update.control_panel_url = controlPanelUrl;
        if (renewalDate !== undefined) update.renewal_date = renewalDate;
        const { error } = await supabase.from("hosting_services").update(update).eq("id", serviceId);
        if (error) return errorResponse("Failed to update service");
        return json({ success: true, message: "Service updated" });
      }

      // ─── REPLY TICKET ──────────────────────────────────────
      case "reply-ticket": {
        const { ticketId, message } = body;
        if (!ticketId || !message) return errorResponse("ticketId and message required");

        const { data: ticket, error: ticketError } = await supabase.from("support_tickets").select("user_id").eq("id", ticketId).maybeSingle();
        if (ticketError || !ticket) return errorResponse("Ticket not found", 404);

        const { error: replyError } = await supabase.from("ticket_replies").insert({
          ticket_id: ticketId,
          user_id: ticket.user_id,
          sender_type: "admin",
          message,
        });
        if (replyError) return errorResponse("Failed to send reply");

        // Update ticket status to "pending" (awaiting customer response)
        if (!VALID_TICKET_STATUSES.includes("pending")) return errorResponse("Invalid ticket status");
        const { error: statusError } = await supabase.from("support_tickets").update({ status: "pending", updated_at: new Date().toISOString() }).eq("id", ticketId);
        if (statusError) console.error("Ticket status update error:", statusError.message);

        return json({ success: true, message: "Reply sent" });
      }

      // ─── GET PAYMENT SETTINGS ───────────────────────────────
      case "get-payment-settings": {
        const { data, error } = await supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
        if (error) return errorResponse("Failed to fetch payment settings");
        return json({ settings: data || {} });
      }

      // ─── SAVE PAYMENT SETTINGS ──────────────────────────────
      case "save-payment-settings": {
        const { settings } = body;
        if (!settings || typeof settings !== "object") return errorResponse("settings object required");

        // Allowlist of fields
        const allowed = [
          "razorpay_enabled", "razorpay_key_id", "razorpay_key_secret", "razorpay_webhook_secret",
          "razorpay_sandbox_mode", "upi_enabled", "upi_id", "upi_display_name", "upi_qr_image_url",
          "bank_transfer_enabled", "bank_account_name", "bank_account_number", "bank_ifsc", "bank_name",
          "trust_badges",
        ];
        const payload: Record<string, unknown> = { id: 1 };
        for (const key of allowed) {
          if (key in settings) payload[key] = settings[key];
        }

        const { error } = await supabase.from("payment_settings").upsert(payload).eq("id", 1);
        if (error) return errorResponse("Failed to save payment settings");
        return json({ success: true, message: "Payment settings saved" });
      }

      // ─── GET SITE SETTINGS ──────────────────────────────────
      case "get-site-settings": {
        const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
        if (error) return errorResponse("Failed to fetch site settings");
        return json({ settings: data || {} });
      }

      // ─── SAVE SITE SETTINGS ─────────────────────────────────
      case "save-site-settings": {
        const { settings } = body;
        if (!settings || typeof settings !== "object") return errorResponse("settings object required");

        const allowed = ["org_name", "tagline", "support_email", "support_phone", "logo_url", "primary_color"];
        const payload: Record<string, unknown> = { id: 1 };
        for (const key of allowed) {
          if (key in settings) payload[key] = settings[key];
        }

        const { error } = await supabase.from("site_settings").upsert(payload).eq("id", 1);
        if (error) return errorResponse("Failed to save site settings");
        return json({ success: true, message: "Site settings saved" });
      }

      // ─── LIST USERS ─────────────────────────────────────────
      case "list-users": {
        const [ordersRes, servicesRes, ticketsRes] = await Promise.all([
          supabase.from("hosting_orders").select("user_id, total, status"),
          supabase.from("hosting_services").select("user_id, status"),
          supabase.from("support_tickets").select("user_id, status"),
        ]);

        const userMap = new Map<string, { user_id: string; orderCount: number; totalSpent: number; activeServices: number; openTickets: number }>();

        for (const o of ordersRes.data || []) {
          const uid = o.user_id as string;
          if (!uid) continue;
          if (!userMap.has(uid)) userMap.set(uid, { user_id: uid, orderCount: 0, totalSpent: 0, activeServices: 0, openTickets: 0 });
          const u = userMap.get(uid)!;
          u.orderCount++;
          if (o.status === "active" || o.status === "paid") u.totalSpent += o.total || 0;
        }
        for (const s of servicesRes.data || []) {
          const uid = s.user_id as string;
          if (!uid || !userMap.has(uid)) continue;
          if (s.status === "active") userMap.get(uid)!.activeServices++;
        }
        for (const t of ticketsRes.data || []) {
          const uid = t.user_id as string;
          if (!uid || !userMap.has(uid)) continue;
          if (["open", "pending"].includes(t.status)) userMap.get(uid)!.openTickets++;
        }

        return json({ users: Array.from(userMap.values()) });
      }

      // ─── SIGN OUT ───────────────────────────────────────────
      case "sign-out": {
        if (token) {
          await supabase.from("admin_sessions").update({ revoked: true }).eq("token", token);
        }
        return json({ success: true });
      }

      default:
        return errorResponse("Unknown action", 404);
    }
  } catch (err) {
    console.error("admin-auth error:", err);
    return errorResponse(err instanceof Error ? err.message : "Internal server error", 500);
  }
});
