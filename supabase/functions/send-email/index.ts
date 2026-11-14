import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, to, subject, body: emailBodyRaw, template, relatedId, relatedType, orderId, status, userEmail, planName } = body;

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return json({ error: "Valid recipient email required" }, 400);
    }

    const tmpl = template || action;
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const isServiceRole = token && token === serviceKey;
    const isContactForm = tmpl === "contact-form";

    let targetRecipient = to;

    if (!isServiceRole) {
      if (isContactForm) {
        // Force contact form emails strictly to official contact address
        targetRecipient = "contact@elsxglobal.cloud";
      } else {
        if (!token) {
          return json({ error: "Authentication required" }, 401);
        }
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) {
          return json({ error: "Invalid authentication token" }, 401);
        }
        if (targetRecipient !== user.email && !targetRecipient.endsWith("@elsxglobal.cloud")) {
          const { data: adminRecord } = await supabase
            .from("admin_users")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          if (!adminRecord) {
            return json({ error: "Forbidden: Recipient unauthorized" }, 403);
          }
        }
      }
    }

    const adminEmail = "admin@elsxglobal.cloud";
    const fromEmail = "noreply@elsxglobal.cloud";
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // Build email content based on template/action
    let emailSubject = subject || "VaultHost Notification";
    let emailBody = emailBodyRaw || "";

    if (tmpl === "contact-form") {
      emailSubject = `New Contact Form Lead: ${body.name || "Website Visitor"}`;
      emailBody = `Name: ${body.name || "N/A"}\nEmail: ${body.email || "N/A"}\nCompany: ${body.company || "N/A"}\nService: ${body.service || "General Inquiry"}\nMessage:\n${body.message || ""}`;
    } else if (tmpl === "order-placed") {
      emailSubject = `Order Received — ${planName || "VaultHost Plan"}`;
      emailBody = `Hi,\n\nYour order for ${planName || "a VaultHost plan"} has been received and is now pending payment verification.\n\nOrder ID: ${orderId || "N/A"}\nStatus: Pending\n\nOnce your payment is verified, your service will be activated within 2-4 hours.\n\nYou can track your order status in your client portal at https://elsxglobal.cloud/portal\n\n— VaultHost Team`;
    } else if (tmpl === "order-approved") {
      emailSubject = `Service Activated — ${planName || "VaultHost Plan"}`;
      emailBody = `Hi,\n\nGreat news! Your payment has been verified and your service is now active.\n\nOrder ID: ${orderId || "N/A"}\nPlan: ${planName || "VaultHost Plan"}\nStatus: Active\n\nYou can now access your service from the client portal:\nhttps://elsxglobal.cloud/portal\n\nWelcome aboard!\n\n— VaultHost Team`;
    } else if (tmpl === "order-cancelled") {
      emailSubject = `Order Cancelled — ${planName || "VaultHost Plan"}`;
      emailBody = `Hi,\n\nYour order ${orderId || ""} has been cancelled.\n\nIf you believe this was in error, please contact our support team.\n\n— VaultHost Team`;
    } else if (tmpl === "ticket-reply") {
      emailSubject = subject || "Support Ticket Update";
      emailBody = emailBodyRaw || "Your support ticket has been updated. Please check your portal for details.";
    } else if (tmpl === "ticket-created") {
      emailSubject = "Support Ticket Received";
      emailBody = `Hi,\n\nWe've received your support ticket and will respond within 4 business hours.\n\nYou can track the status in your portal at https://elsxglobal.cloud/portal/notifications\n\n— VaultHost Team`;
    }

    // Determine the correct related_type
    const finalRelatedType = relatedType || (tmpl?.startsWith("ticket") ? "ticket" : "order");

    // Send via Resend if configured
    let sendStatus = "logged";
    let errorMsg: string | null = null;

    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: targetRecipient,
            subject: emailSubject,
            text: emailBody,
          }),
        });
        if (res.ok) {
          sendStatus = "sent";
        } else {
          sendStatus = "failed";
          errorMsg = `Resend API error: ${await res.text()}`;
        }
      } catch (err) {
        sendStatus = "failed";
        errorMsg = String(err);
      }
    } else {
      console.log(`[EMAIL] To: ${targetRecipient} | Subject: ${emailSubject}`);
    }

    // Log to email_log table
    const { error: logError } = await supabase.from("email_log").insert({
      recipient: targetRecipient,
      subject: emailSubject,
      body: emailBody,
      template: tmpl || null,
      related_id: relatedId || orderId || null,
      related_type: finalRelatedType,
      status: sendStatus,
      error: errorMsg,
    });

    if (logError) console.error("Failed to log email:", logError.message);

    // If order-approved, also send admin notification
    if (action === "order-approved" && userEmail) {
      const adminBody = `An order has been approved and activated.\n\nOrder ID: ${orderId}\nPlan: ${planName}\nCustomer: ${to}\n\nView in admin panel: https://elsxglobal.cloud/admin`;
      const { error: adminLogError } = await supabase.from("email_log").insert({
        recipient: adminEmail,
        subject: `[Admin] Order Approved — ${planName}`,
        body: adminBody,
        template: "admin-notification",
        related_id: orderId,
        related_type: "order",
        status: "logged",
      });
      if (adminLogError) console.error("Failed to log admin email:", adminLogError.message);
    }

    return json({
      success: true,
      status: sendStatus,
      message: sendStatus === "sent" ? "Email sent" : sendStatus === "logged" ? "Email logged (SMTP not configured)" : "Email failed",
    });
  } catch (err) {
    console.error("send-email error:", err);
    return json({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
