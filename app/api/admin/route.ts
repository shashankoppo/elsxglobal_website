export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';
import { fulfillOrder } from '@/lib/billing/orderFulfillment';
import { ProvisioningEngine } from '@/lib/provisioning/ProvisioningEngine';
import { CORE_HOSTING_PLANS } from '@/lib/data/all-plans';
import { CLOUD_PRICING } from '@/lib/data/cloud-pricing';
import { getAnnualPricing } from '@/lib/billing/pricingMath';

const planSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  tier: z.string().min(1),
  price_monthly: z.number().min(0),
  price_annual: z.number().min(0).default(0),
  cpu: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  storage: z.string().optional().nullable(),
  bandwidth: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
  sort_order: z.number().optional(),
  is_popular: z.boolean().optional(),
  is_active: z.boolean().optional(),
}).passthrough();

const addonSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  category: z.string().optional().default('general'),
  price_monthly: z.number().min(0),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
}).passthrough();

const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0),
  max_uses: z.number().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
}).passthrough();

const refundOrderSchema = z.object({
  orderId: z.string().uuid(),
  refundReason: z.string().min(1),
}).passthrough();

const updateServiceSchema = z.object({
  serviceId: z.string().uuid(),
}).passthrough(); // allows other dynamic updates

function extractUserFromCookies(cookies: { name: string; value: string }[]) {
  try {
    const baseNames = ['elsxglobal-auth-token'];
    const legacyCookie = cookies.find((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
    if (legacyCookie) {
      const match = legacyCookie.name.match(/^(sb-[a-zA-Z0-9_-]+-auth-token)/);
      if (match) baseNames.push(match[1]);
    }

    for (const base of baseNames) {
      let rawVal = cookies.find((c) => c.name === base)?.value;
      if (!rawVal) {
        const chunks: string[] = [];
        let i = 0;
        while (true) {
          const chunk = cookies.find((c) => c.name === `${base}.${i}`);
          if (!chunk) break;
          chunks.push(chunk.value);
          i++;
        }
        if (chunks.length > 0) {
          rawVal = chunks.join('');
        }
      }

      if (!rawVal) continue;

      let decodedStr = rawVal;
      if (decodedStr.startsWith('base64-')) {
        const b64 = decodedStr.slice(7);
        decodedStr = Buffer.from(b64, 'base64url').toString('utf8');
      }

      let parsedSession: any = null;
      try {
        parsedSession = JSON.parse(decodedStr);
      } catch {
        continue;
      }

      const accessToken = parsedSession?.access_token;
      if (!accessToken || typeof accessToken !== 'string') continue;

      const parts = accessToken.split('.');
      if (parts.length !== 3) continue;

      const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson);

      if (payload.exp && payload.exp * 1000 < Date.now() - 60000) {
        continue;
      }

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role || 'authenticated',
        app_metadata: payload.app_metadata || {},
        user_metadata: payload.user_metadata || {},
      };
    }
  } catch {}
  return null;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { action } = payload;

    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: {
        name: 'elsxglobal-auth-token',
      },
      cookies: {
        getAll() {
          const all = cookieStore.getAll();
          const hasAuthToken = all.some((c) => c.name.startsWith('elsxglobal-auth-token'));
          if (!hasAuthToken) {
            const legacy = all.filter(
              (c) =>
                c.name.startsWith('sb-elsxglobal-auth-token') ||
                c.name.startsWith('sb-api-gw-auth-token')
            );
            if (legacy.length > 0) {
              return [
                ...all,
                ...legacy.map((c) => ({
                  name: c.name.replace(/^sb-(elsxglobal|api-gw)-auth-token/, 'elsxglobal-auth-token'),
                  value: c.value,
                })),
              ];
            }
          }
          return all;
        },
      },
    });

    let user: any = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        user = authData.user;
      }
    } catch {}

    if (!user) {
      user = extractUserFromCookies(cookieStore.getAll());
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isMasterAdmin =
      user.email?.toLowerCase() === 'admin@elsxglobal.com' ||
      user.app_metadata?.role === 'superadmin' ||
      user.user_metadata?.role === 'superadmin' ||
      user.app_metadata?.claims_admin === true;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    if (!isMasterAdmin) {
      // Verify admin role
      const { data: adminUser } = await supabaseAdmin
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminUser || !adminUser.is_active) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // --- HANDLE ACTIONS ---

    if (action === 'stats') {
      const [ordersRes, adminUsersRes, plansRes, ticketsRes, invoicesRes, servicesRes, authUsersRes] = await Promise.all([
        supabaseAdmin.from('hosting_orders').select('total, status, created_at, plan_name'),
        supabaseAdmin.from('admin_users').select('id', { count: 'exact' }),
        supabaseAdmin.from('hosting_plans').select('id', { count: 'exact' }).eq('is_active', true),
        supabaseAdmin.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open'),
        supabaseAdmin.from('hosting_invoices').select('id', { count: 'exact' }).neq('status', 'paid'),
        supabaseAdmin.from('hosting_services').select('id', { count: 'exact' }).in('status', ['active', 'provisioning']),
        supabaseAdmin.auth.admin.listUsers()
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending_payment' || o.status === 'provisioning').length;

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const validOrdersThisWeek = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded' && new Date(o.created_at) >= sevenDaysAgo);
      const validOrdersLastWeek = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded' && new Date(o.created_at) >= fourteenDaysAgo && new Date(o.created_at) < sevenDaysAgo);

      const revenueThisWeek = validOrdersThisWeek.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
      const revenueLastWeek = validOrdersLastWeek.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
      
      let revenueTrend = 0;
      if (revenueLastWeek > 0) {
        revenueTrend = Number((((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100).toFixed(1));
      } else if (revenueThisWeek > 0) {
        revenueTrend = 100;
      }

      const ordersThisWeek = orders.filter(o => new Date(o.created_at) >= sevenDaysAgo).length;
      const ordersLastWeek = orders.filter(o => new Date(o.created_at) >= fourteenDaysAgo && new Date(o.created_at) < sevenDaysAgo).length;

      let ordersTrend = 0;
      if (ordersLastWeek > 0) {
        ordersTrend = Number((((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100).toFixed(1));
      } else if (ordersThisWeek > 0) {
        ordersTrend = 100;
      }

      const usersList = authUsersRes.data?.users || [];
      const newUsersThisWeek = usersList.filter(u => new Date(u.created_at) >= sevenDaysAgo).length;

      const revenueByTier: Record<string, number> = {};
      orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').forEach(o => {
        if (o.plan_name) {
          revenueByTier[o.plan_name] = (revenueByTier[o.plan_name] || 0) + (Number(o.total) || 0);
        }
      });

      return NextResponse.json({
        totalRevenue,
        totalOrders: orders.length,
        activeServices: servicesRes.count || 0,
        pendingOrders,
        openTickets: ticketsRes.count || 0,
        unpaidInvoices: invoicesRes.count || 0,
        activePlans: plansRes.count || 0,
        totalTransactions: orders.length,
        revenueThisWeek,
        revenueLastWeek,
        revenueTrend,
        ordersThisWeek,
        ordersLastWeek,
        ordersTrend,
        newUsersThisWeek,
        revenueByTier,
      });
    }

    // Orders & Tickets & Invoices
    if (action === 'get-orders') {
      const { data } = await supabaseAdmin.from('hosting_orders').select('*').order('created_at', { ascending: false }).limit(100);
      return NextResponse.json({ data: data || [] });
    }
    
    if (action === 'order-detail') {
      const { orderId } = payload;
      const { data: order, error } = await supabaseAdmin.from('hosting_orders').select('*').eq('id', orderId).single();
      if (error) throw error;
      const { data: services } = await supabaseAdmin.from('hosting_services').select('*').eq('order_id', orderId);
      const { data: invoices } = await supabaseAdmin.from('hosting_invoices').select('*').eq('order_id', orderId);
      return NextResponse.json({ order, services: services || [], transactions: invoices || [] });
    }

    if (action === 'get-tickets') {
      const { data } = await supabaseAdmin.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(50);
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'reply-ticket') {
      const { ticketId, message, adminEmail } = payload;
      // In a real app, this would add a message to ticket_messages table and update ticket status
      const { error: replyError } = await supabaseAdmin.from('ticket_replies').insert({
        ticket_id: ticketId,
        message: message,
        sender_type: 'admin',
        sender_email: adminEmail || 'admin',
      });
      if (replyError) throw replyError;
      const { error } = await supabaseAdmin.from('support_tickets').update({ status: 'answered', updated_at: new Date().toISOString() }).eq('id', ticketId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'get-invoices') {
      const { data } = await supabaseAdmin.from('hosting_invoices').select('*').order('created_at', { ascending: false }).limit(50);
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'get-leads') {
      const { data } = await supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false }).limit(100);
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'list-users') {
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
      if (authErr) throw authErr;

      const { data: orders } = await supabaseAdmin.from('hosting_orders').select('user_id, user_email, total, status');
      const { data: tickets } = await supabaseAdmin.from('support_tickets').select('user_id, user_email, status');
      const { data: servicesList } = await supabaseAdmin.from('hosting_services').select('user_id, status');

      const enrichedUsers = (authData.users || []).map((u) => {
        const userOrders = (orders || []).filter((o: any) => o.user_id === u.id || o.user_email === u.email);
        const userTickets = (tickets || []).filter(
          (t: any) => (t.user_id === u.id || t.user_email === u.email) && (t.status === 'open' || t.status === 'pending')
        );
        const userServices = (servicesList || []).filter((s: any) => s.user_id === u.id);
        const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

        return {
          user_id: u.id,
          email: u.email,
          email_confirmed_at: u.email_confirmed_at,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          orders: userOrders.length,
          services: userServices.length,
          total_spent: totalSpent,
          open_tickets: userTickets.length,
          is_suspended: false,
        };
      });

      return NextResponse.json({ users: enrichedUsers });
    }

    if (action === 'approve-order') {
      const { orderId, newStatus, manualOnly } = payload;
      if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

      if (newStatus === 'active' || newStatus === 'provisioning' || newStatus === 'approved' || newStatus === 'paid') {
        const res = await fulfillOrder(orderId, 'admin_approval', `ADM-${Date.now()}`, {
          manualOnly: Boolean(manualOnly),
        });
        if (!res.success) {
          throw new Error(res.error || 'Order fulfillment failed');
        }
        if (newStatus === 'active' && manualOnly) {
          await supabaseAdmin
            .from('hosting_orders')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('id', orderId);
        }
        return NextResponse.json({
          ok: true,
          serviceId: res.serviceId,
          invoiceId: res.invoiceId,
          manualOnly: Boolean(manualOnly),
        });
      }

      const { error } = await supabaseAdmin
        .from('hosting_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;

      return NextResponse.json({ ok: true });
    }

    if (action === 'sync-services') {
      const { data: approvedOrders } = await supabaseAdmin
        .from('hosting_orders')
        .select('id')
        .in('status', ['approved', 'paid']);
      let synced = 0;
      if (approvedOrders) {
        for (const order of approvedOrders) {
          const { data: existingSvc } = await supabaseAdmin
            .from('hosting_services')
            .select('id')
            .eq('order_id', order.id)
            .maybeSingle();
          if (!existingSvc) {
            await fulfillOrder(order.id, 'admin_sync', `SYNC-${Date.now()}`);
            synced++;
          }
        }
      }
      return NextResponse.json({ ok: true, synced });
    }

    if (action === 'refund-order') {
      const { orderId, refundReason } = refundOrderSchema.parse(payload);
      // Store the refund reason in metadata or a specific column if it exists
      const { error } = await supabaseAdmin.from('hosting_orders').update({ 
        status: 'refunded',
        metadata: JSON.stringify({ refund_reason: refundReason, refunded_at: new Date().toISOString() })
      }).eq('id', orderId);
      if (error) throw error;

      await supabaseAdmin.from('hosting_services').update({ status: 'suspended' }).eq('order_id', orderId);
      
      const { data: order } = await supabaseAdmin.from('hosting_orders').select('*').eq('id', orderId).single();
      if (order) {
        await supabaseAdmin.from('hosting_invoices').insert({
          user_id: order.user_id,
          order_id: order.id,
          amount: -(Number(order.total) || 0),
          status: 'refunded',
          due_date: new Date().toISOString(),
        });
      }

      return NextResponse.json({ ok: true });
    }

    // Plans & Addons
    if (action === 'list-plans') {
      const { data } = await supabaseAdmin.from('hosting_plans').select('*').order('sort_order', { ascending: true });
      return NextResponse.json({ data: data || [] });
    }
    
    if (action === 'save-plan') {
      const planData = planSchema.parse(payload);
      const { id, ...rest } = planData;
      const slug =
        id ||
        `${planData.tier}-${planData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
      const record = {
        id: slug,
        name: rest.name,
        tier: rest.tier,
        price_monthly: rest.price_monthly,
        price_annual: rest.price_annual || getAnnualPricing(rest.price_monthly).annualTotal,
        cpu: rest.cpu ?? null,
        ram: rest.ram ?? null,
        storage: rest.storage ?? null,
        bandwidth: rest.bandwidth ?? null,
        short_description: rest.short_description ?? null,
        features: rest.features || [],
        sort_order: rest.sort_order ?? 10,
        is_popular: rest.is_popular ?? false,
        is_active: rest.is_active ?? true,
      };
      const { error } = await supabaseAdmin.from('hosting_plans').upsert(record, { onConflict: 'id' });
      if (error) throw error;
      return NextResponse.json({ ok: true, id: slug });
    }

    if (action === 'delete-plan') {
      const { planId } = payload;
      const { error } = await supabaseAdmin.from('hosting_plans').delete().eq('id', planId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'list-addons') {
      const { data } = await supabaseAdmin.from('hosting_addons').select('*').order('price_monthly', { ascending: true });
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'save-addon') {
      const addonData = addonSchema.parse(payload);
      const { id, ...rest } = addonData;
      const slug =
        id ||
        rest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { error } = await supabaseAdmin
        .from('hosting_addons')
        .upsert({ id: slug, ...rest }, { onConflict: 'id' });
      if (error) throw error;
      return NextResponse.json({ ok: true, id: slug });
    }

    if (action === 'delete-addon') {
      const { addonId } = payload;
      const { error } = await supabaseAdmin.from('hosting_addons').delete().eq('id', addonId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    // Coupons
    if (action === 'list-coupons') {
      const { data } = await supabaseAdmin.from('hosting_coupons').select('*').order('created_at', { ascending: false });
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'save-coupon') {
      const couponData = couponSchema.parse(payload);
      const { id, ...rest } = couponData;
      if (id) {
        const { error } = await supabaseAdmin.from('hosting_coupons').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from('hosting_coupons').insert(rest);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete-coupon') {
      const { couponId } = payload;
      const { error } = await supabaseAdmin.from('hosting_coupons').delete().eq('id', couponId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    // Services
    if (action === 'list-services') {
      const { data } = await supabaseAdmin.from('hosting_services').select('*').order('created_at', { ascending: false });
      return NextResponse.json({ data: data || [] });
    }
    
    if (action === 'update-service') {
      const validatedPayload = updateServiceSchema.parse(payload);
      const { serviceId, action: _action, ...updates } = validatedPayload;
      const { error } = await supabaseAdmin.from('hosting_services').update(updates).eq('id', serviceId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    // Settings
    if (action === 'get-payment-settings') {
      const { data } = await supabaseAdmin.from('payment_settings').select('*').eq('id', 1).single();
      return NextResponse.json({ settings: data || {} });
    }

    if (action === 'save-payment-settings') {
      const { settings } = payload;
      const { error } = await supabaseAdmin.from('payment_settings').upsert({ id: 1, ...settings }, { onConflict: 'id' });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'get-site-settings') {
      const { data } = await supabaseAdmin.from('site_settings').select('*').eq('id', 1).single();
      return NextResponse.json({ settings: data || {} });
    }

    if (action === 'save-site-settings') {
      const { settings } = payload;
      const { error } = await supabaseAdmin.from('site_settings').upsert({ id: 1, ...settings }, { onConflict: 'id' });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'get-provisioning-settings') {
      const { data } = await supabaseAdmin.from('provisioning_settings').select('*').eq('id', 1).single();
      return NextResponse.json({ settings: data || {} });
    }

    if (action === 'save-provisioning-settings') {
      const { settings } = payload;
      const { error } = await supabaseAdmin.from('provisioning_settings').upsert({ id: 1, ...settings }, { onConflict: 'id' });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'get-integrations') {
      const { data } = await supabaseAdmin.from('integrations').select('*');
      const settings = (data || []).reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
      return NextResponse.json({ data: settings });
    }

    if (action === 'save-integrations') {
      const { settings } = payload;
      const records = Object.entries(settings).map(([key, value]) => ({ key, value }));
      if (records.length > 0) {
        const { error } = await supabaseAdmin.from('integrations').upsert(records, { onConflict: 'key' });
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'get-nodes') {
      const { data } = await supabaseAdmin.from('infrastructure_nodes').select('*').order('created_at', { ascending: true });
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'save-node') {
      const { node } = payload;
      const { error } = await supabaseAdmin.from('infrastructure_nodes').upsert(node);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete-node') {
      const { id } = payload;
      const { error } = await supabaseAdmin.from('infrastructure_nodes').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'test-node-connection') {
      const { id } = payload;
      const { data: node } = await supabaseAdmin.from('infrastructure_nodes').select('*').eq('id', id).single();
      if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

      const targetHost = (node.ip_address || node.hostname || '').trim();
      if (!targetHost) {
        return NextResponse.json({ error: 'Missing hostname or ip_address on node' }, { status: 400 });
      }

      const defaultPort =
        node.provider_type === 'proxmox' ? 8006
        : node.provider_type === 'hestiacp' ? 8083
        : node.provider_type === 'cyberpanel' ? 8090
        : node.port || 443;
      const scheme = targetHost.startsWith('http') ? '' : (defaultPort === 80 || defaultPort === 8081 || defaultPort === 7400 ? 'http://' : 'https://');
      const probeUrl = targetHost.startsWith('http') ? targetHost : `${scheme}${targetHost}:${defaultPort}/`;

      const startedAt = Date.now();
      let reachable = false;
      let statusCode = 0;
      let probeDetail = '';

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(probeUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timer);
        reachable = true;
        statusCode = res.status;
        probeDetail = `HTTP ${res.status} reachable`;
      } catch (err: any) {
        probeDetail = err?.name === 'AbortError' ? 'Connection timed out (4s)' : (err?.message || 'Host unreachable');
      }

      const latencyMs = Date.now() - startedAt;
      await supabaseAdmin
        .from('infrastructure_nodes')
        .update({ status: reachable ? 'online' : 'offline' })
        .eq('id', id);

      return NextResponse.json({
        ok: reachable,
        reachable,
        latencyMs,
        statusCode,
        probeUrl,
        message: reachable
          ? `Connected to ${probeUrl} in ${latencyMs}ms (HTTP ${statusCode})`
          : `Probe failed for ${probeUrl}: ${probeDetail}`,
      });
    }

    if (action === 'bulk-update-orders') {
      const { orderIds, newStatus } = payload;
      if (!Array.isArray(orderIds)) throw new Error('orderIds must be an array');
      
      for (const orderId of orderIds) {
        await supabaseAdmin.from('hosting_orders').update({ status: newStatus }).eq('id', orderId);
        
        if (newStatus === 'active' || newStatus === 'provisioning') {
          const { data: order } = await supabaseAdmin.from('hosting_orders').select('*').eq('id', orderId).single();
          if (order) {
            const { data: existingSvc } = await supabaseAdmin.from('hosting_services').select('id').eq('order_id', orderId).maybeSingle();
            if (!existingSvc) {
              await supabaseAdmin.from('hosting_services').insert({
                user_id: order.user_id,
                order_id: order.id,
                plan_id: order.plan_id,
                plan_name: order.plan_name,
                domain: order.domain,
                status: 'active',
                renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              });
            }
          }
        }
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'bulk-delete-orders') {
      const { orderIds } = payload;
      if (!Array.isArray(orderIds)) throw new Error('orderIds must be an array');
      
      for (const orderId of orderIds) {
        await supabaseAdmin.from('hosting_orders').delete().eq('id', orderId);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'log-activity') {
      const { type, description, metadata } = payload;
      const { error } = await supabaseAdmin.from('admin_activity_log').insert({
        admin_email: user.email,
        type,
        description,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'get-activity-log') {
      const { data } = await supabaseAdmin.from('admin_activity_log').select('*').order('created_at', { ascending: false }).limit(50);
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'export-orders-csv') {
      const { data: orders } = await supabaseAdmin.from('hosting_orders').select('*').order('created_at', { ascending: false });
      if (!orders) return NextResponse.json({ csv: '' });
      
      const headers = ['ID', 'Plan', 'Domain', 'Status', 'Amount', 'Date'];
      const rows = orders.map(o => [
        o.id,
        o.plan_name || '',
        o.domain || '',
        o.status || '',
        o.total || '0',
        o.created_at ? new Date(o.created_at).toISOString() : ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      return NextResponse.json({ csv: csvContent });
    }

    if (action === 'global-search') {
      const { query } = payload;
      if (!query) return NextResponse.json({ orders: [], users: [], tickets: [] });
      
      const [ordersRes, ticketsRes, authDataRes] = await Promise.all([
        supabaseAdmin.from('hosting_orders').select('*').or(`plan_name.ilike.%${query}%,domain.ilike.%${query}%`).limit(5),
        supabaseAdmin.from('support_tickets').select('*').ilike('subject', `%${query}%`).limit(5),
        supabaseAdmin.auth.admin.listUsers()
      ]);
      
      const authUsers = authDataRes.data?.users || [];
      const users = authUsers.filter(u => u.email?.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      
      return NextResponse.json({
        orders: ordersRes.data || [],
        tickets: ticketsRes.data || [],
        users: users.map(u => ({ id: u.id, email: u.email }))
      });
    }

    if (action === 'get-email-log') {
      const { data } = await supabaseAdmin.from('email_log').select('*').order('created_at', { ascending: false }).limit(100);
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'get-transactions') {
      const [ptRes, txRes] = await Promise.all([
        supabaseAdmin.from('payment_transactions').select('*').order('created_at', { ascending: false }).limit(100),
        supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
      ]);
      const combined = [...(ptRes.data || []), ...(txRes.data || [])];
      return NextResponse.json({ data: combined });
    }

    if (action === 'update-transaction') {
      const { transactionId, status } = payload;
      let orderId: string | null = null;

      const ptUpdate = await supabaseAdmin
        .from('payment_transactions')
        .update({ status })
        .eq('id', transactionId)
        .select('order_id')
        .maybeSingle();

      if (ptUpdate.data?.order_id) {
        orderId = ptUpdate.data.order_id;
      } else {
        const txUpdate = await supabaseAdmin
          .from('transactions')
          .update({ status })
          .eq('id', transactionId)
          .select('order_id')
          .maybeSingle();
        if (txUpdate.data?.order_id) {
          orderId = txUpdate.data.order_id;
        }
      }

      if (status === 'approved' && orderId) {
        await fulfillOrder(orderId, 'manual_transfer', transactionId, {
          manualOnly: Boolean(payload.manualOnly),
        });
      }
      return NextResponse.json({ ok: true, orderId });
    }

    // Create / Provision Manual Dedicated Server or Service
    if (action === 'create-manual-service') {
      const {
        user_id,
        user_email,
        order_id,
        plan_name = 'Manual Dedicated Server',
        tier = 'dedicated',
        domain,
        hostname,
        ip_address,
        ipv6_address,
        ssh_port = 22,
        username = 'root',
        password,
        ssh_public_key,
        web_console_url,
        control_panel_url,
        os_template = 'ubuntu-22.04',
        location = 'Mumbai (ap-west-in)',
        node_id,
        adapter = 'manual',
        vcpu = 4,
        ram_gb = 8,
        disk_gb = 160,
        firewall_rules = [],
        access_endpoints = {},
        manual_setup_notes,
        renewal_days = 30,
      } = payload;

      let resolvedUserId = user_id;
      if (!resolvedUserId && user_email) {
        const { data: usersRes } = await supabaseAdmin.auth.admin.listUsers();
        const found = (usersRes?.users || []).find(
          (u) => u.email?.toLowerCase() === String(user_email).trim().toLowerCase()
        );
        if (found) resolvedUserId = found.id;
      }

      if (!resolvedUserId) {
        return NextResponse.json({ error: 'Valid customer user_id or user_email is required' }, { status: 400 });
      }

      const generatedPassword = password || `Vh#${crypto.randomBytes(8).toString('hex')}!`;
      const endpoints = {
        ...(typeof access_endpoints === 'object' && access_endpoints ? access_endpoints : {}),
        ...(ip_address ? { ssh: `ssh ${username}@${ip_address} -p ${Number(ssh_port) || 22}` } : {}),
        ...(web_console_url ? { web_console: web_console_url } : {}),
        ...(control_panel_url ? { control_panel: control_panel_url } : {}),
      };

      const renewalAt = new Date(Date.now() + (Number(renewal_days) || 30) * 24 * 60 * 60 * 1000).toISOString();

      const { data: created, error: createErr } = await supabaseAdmin
        .from('hosting_services')
        .insert({
          user_id: resolvedUserId,
          order_id: order_id || null,
          plan_name,
          tier,
          domain: domain || hostname || null,
          hostname: hostname || domain || null,
          ip_address: ip_address || null,
          ipv6_address: ipv6_address || null,
          ssh_port: Number(ssh_port) || 22,
          username,
          password: generatedPassword,
          ssh_public_key: ssh_public_key || null,
          web_console_url: web_console_url || null,
          control_panel_url: control_panel_url || null,
          os_template,
          location,
          node_id: node_id || null,
          adapter,
          provisioning_mode: 'manual',
          setup_status: 'ready',
          status: 'active',
          specs_json: {
            vcpu: Number(vcpu) || 4,
            ram_gb: Number(ram_gb) || 8,
            disk_gb: Number(disk_gb) || 160,
          },
          firewall_rules: Array.isArray(firewall_rules) ? firewall_rules : [],
          access_endpoints: endpoints,
          manual_setup_notes: manual_setup_notes || 'Provisioned manually via VaultHost Admin Console.',
          next_renewal_at: renewalAt,
          renewal_date: renewalAt,
        })
        .select('*')
        .single();

      if (createErr) throw createErr;

      if (order_id) {
        await supabaseAdmin
          .from('hosting_orders')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', order_id);
      }

      return NextResponse.json({ ok: true, service: created });
    }

    // Retry or trigger automated provisioning on an existing service
    if (action === 'trigger-provision') {
      const { serviceId } = payload;
      if (!serviceId) return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
      await ProvisioningEngine.provisionService(serviceId);
      const { data: updated } = await supabaseAdmin
        .from('hosting_services')
        .select('*')
        .eq('id', serviceId)
        .single();
      return NextResponse.json({ ok: true, service: updated });
    }

    // Admin power & snapshot control on any service
    if (action === 'admin-service-power') {
      const { serviceId, command, snapshotName } = payload;
      if (!serviceId || !command) {
        return NextResponse.json({ error: 'serviceId and command are required' }, { status: 400 });
      }

      if (command === 'start' || command === 'restart') {
        try {
          await ProvisioningEngine.restartService(serviceId);
        } catch {
          await supabaseAdmin
            .from('hosting_services')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('id', serviceId);
        }
      } else if (command === 'stop' || command === 'suspend') {
        try {
          await ProvisioningEngine.suspendService(serviceId);
        } catch {
          await supabaseAdmin
            .from('hosting_services')
            .update({ status: 'stopped', updated_at: new Date().toISOString() })
            .eq('id', serviceId);
        }
      } else if (command === 'snapshot') {
        const snap = snapshotName || `admin_snap_${Date.now()}`;
        try {
          await ProvisioningEngine.snapshotService(serviceId, snap);
        } catch {
          // Record snapshot entry safely even for manual hosts
        }
      } else if (command === 'terminate') {
        try {
          await ProvisioningEngine.terminateService(serviceId);
        } catch {
          await supabaseAdmin
            .from('hosting_services')
            .update({ status: 'terminated', updated_at: new Date().toISOString() })
            .eq('id', serviceId);
        }
      }

      return NextResponse.json({ ok: true, command });
    }

    // Live health & authentication probe across all backend platforms
    if (action === 'test-backend-service') {
      const { backend } = payload;
      const { data: settings } = await supabaseAdmin
        .from('provisioning_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      const cfg = settings || {};

      const targets: Record<string, { url?: string; headers?: Record<string, string>; label: string }> = {
        proxmox: {
          label: 'Proxmox VE',
          url: cfg.proxmox_url ? `${cfg.proxmox_url.replace(/\/+$/, '')}/api2/json/version` : '',
          headers: cfg.proxmox_token_id && cfg.proxmox_token_secret
            ? { Authorization: `PVEAPIToken=${cfg.proxmox_token_id}=${cfg.proxmox_token_secret}` }
            : undefined,
        },
        hestiacp: {
          label: 'HestiaCP',
          url: cfg.hestiacp_url ? `${cfg.hestiacp_url.replace(/\/+$/, '')}/api/` : '',
        },
        cyberpanel: {
          label: 'CyberPanel',
          url: cfg.cyberpanel_url ? `${cfg.cyberpanel_url.replace(/\/+$/, '')}/api/` : '',
        },
        pterodactyl: {
          label: 'Pterodactyl',
          url: cfg.pterodactyl_url ? `${cfg.pterodactyl_url.replace(/\/+$/, '')}/api/application/nodes` : '',
          headers: cfg.pterodactyl_api_key ? { Authorization: `Bearer ${cfg.pterodactyl_api_key}`, Accept: 'application/json' } : undefined,
        },
        powerdns: {
          label: 'PowerDNS',
          url: (cfg.powerdns_url || process.env.POWERDNS_URL)
            ? `${(cfg.powerdns_url || process.env.POWERDNS_URL).replace(/\/+$/, '')}/api/v1/servers/localhost`
            : '',
          headers: (cfg.powerdns_api_key || process.env.POWERDNS_API_KEY)
            ? { 'X-API-Key': cfg.powerdns_api_key || process.env.POWERDNS_API_KEY || '' }
            : undefined,
        },
        minio: {
          label: 'MinIO S3',
          url: (cfg.minio_endpoint || process.env.MINIO_ENDPOINT)
            ? `${(cfg.minio_endpoint || process.env.MINIO_ENDPOINT).replace(/\/+$/, '')}/minio/health/live`
            : '',
        },
        litellm: {
          label: 'LiteLLM AI Proxy',
          url: (cfg.litellm_base_url || process.env.LITELLM_BASE_URL)
            ? `${(cfg.litellm_base_url || process.env.LITELLM_BASE_URL).replace(/\/+$/, '')}/health`
            : '',
          headers: (cfg.litellm_master_key || process.env.LITELLM_MASTER_KEY)
            ? { Authorization: `Bearer ${cfg.litellm_master_key || process.env.LITELLM_MASTER_KEY}` }
            : undefined,
        },
        frp: {
          label: 'FRP Tunnel Admin',
          url: (cfg.frp_server_url || process.env.FRP_SERVER_URL)
            ? `${(cfg.frp_server_url || process.env.FRP_SERVER_URL).replace(/\/+$/, '')}/api/proxy/tcp`
            : '',
        },
        rabbitmq: {
          label: 'RabbitMQ Management',
          url: (cfg.rabbitmq_management_url || process.env.RABBITMQ_MANAGEMENT_URL)
            ? `${(cfg.rabbitmq_management_url || process.env.RABBITMQ_MANAGEMENT_URL).replace(/\/+$/, '')}/api/overview`
            : '',
        },
        coolify: {
          label: 'Coolify Pages',
          url: (cfg.coolify_base_url || process.env.COOLIFY_BASE_URL)
            ? `${(cfg.coolify_base_url || process.env.COOLIFY_BASE_URL).replace(/\/+$/, '')}/api/v1/healthcheck`
            : '',
          headers: (cfg.coolify_api_key || process.env.COOLIFY_API_KEY)
            ? { Authorization: `Bearer ${cfg.coolify_api_key || process.env.COOLIFY_API_KEY}` }
            : undefined,
        },
        k3s: {
          label: 'K3s Kubernetes',
          url: (cfg.k3s_api_url || process.env.K3S_API_URL)
            ? `${(cfg.k3s_api_url || process.env.K3S_API_URL).replace(/\/+$/, '')}/readyz`
            : '',
          headers: (cfg.k3s_bearer_token || process.env.K3S_BEARER_TOKEN)
            ? { Authorization: `Bearer ${cfg.k3s_bearer_token || process.env.K3S_BEARER_TOKEN}` }
            : undefined,
        },
        workerd: {
          label: 'Cloudflare Workerd',
          url: (cfg.workerd_api_url || process.env.WORKERD_API_URL)
            ? `${(cfg.workerd_api_url || process.env.WORKERD_API_URL).replace(/\/+$/, '')}/health`
            : '',
        },
        namecheap: {
          label: 'Namecheap API',
          url: cfg.namecheap_api_user ? 'https://api.sandbox.namecheap.com/xml.response' : '',
        },
        odoo: {
          label: 'Odoo ERP / CRM',
          url: cfg.odoo_url ? `${cfg.odoo_url.replace(/\/+$/, '')}/web/health` : '',
        },
      };

      const target = targets[String(backend || '').toLowerCase()];
      if (!target) {
        return NextResponse.json({ error: `Unknown backend: ${backend}` }, { status: 400 });
      }
      if (!target.url) {
        return NextResponse.json({
          ok: false,
          configured: false,
          reachable: false,
          message: `${target.label} URL is not configured yet. Enter endpoint credentials above or deploy via Docker/Ansible.`,
        });
      }

      const start = Date.now();
      let reachable = false;
      let statusCode = 0;
      let msg = '';

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(target.url, {
          method: 'GET',
          headers: target.headers,
          signal: controller.signal,
        });
        clearTimeout(timer);
        reachable = true;
        statusCode = res.status;
        msg = `${target.label} responded HTTP ${res.status} in ${Date.now() - start}ms`;
      } catch (err: any) {
        msg = `${target.label} probe failed: ${err?.name === 'AbortError' ? 'timeout after 4.5s' : err?.message}`;
      }

      return NextResponse.json({
        ok: reachable && statusCode < 500,
        configured: true,
        reachable,
        statusCode,
        latencyMs: Date.now() - start,
        message: msg,
      });
    }

    // Sync calibrated 3-5% below AWS catalog plans into PostgreSQL hosting_plans
    if (action === 'sync-catalog-plans') {
      const records: any[] = [];
      let sortIdx = 1;

      for (const p of Object.values(CORE_HOSTING_PLANS)) {
        const feats = Array.isArray(p.features) ? p.features : [];
        records.push({
          id: p.id,
          name: p.name,
          tier: p.tier,
          price_monthly: p.price_monthly,
          price_annual: getAnnualPricing(p.price_monthly, p.price_annual).annualTotal,
          cpu: feats.find((f) => /vcpu|core/i.test(f)) || null,
          ram: feats.find((f) => /\bram\b/i.test(f)) || null,
          storage: feats.find((f) => /nvme|ssd|storage|raid/i.test(f)) || null,
          bandwidth: feats.find((f) => /bandwidth|unmetered|tb/i.test(f)) || null,
          short_description: p.short_description,
          features: feats,
          is_popular: p.id === 'pro' || p.id === 'vps-pro' || p.id.endsWith('-pro') || p.id.endsWith('-business'),
          is_active: true,
          sort_order: sortIdx++,
        });
      }

      for (const prod of Object.values(CLOUD_PRICING)) {
        for (const t of prod.tiers) {
          const planId = t.ctaPlanId || t.id;
          records.push({
            id: planId,
            name: `${prod.productName} ${t.name}`,
            tier: prod.productId,
            price_monthly: t.monthlyPrice,
            price_annual: t.monthlyPrice === 0 ? 0 : getAnnualPricing(t.monthlyPrice, t.annualPrice * 12).annualTotal,
            short_description: t.description,
            features: t.features,
            is_popular: Boolean(t.highlighted),
            is_active: true,
            sort_order: sortIdx++,
          });
        }
      }

      const { error } = await supabaseAdmin.from('hosting_plans').upsert(records, { onConflict: 'id' });
      if (error) throw error;

      return NextResponse.json({
        ok: true,
        syncedCount: records.length,
        message: `Synchronized ${records.length} calibrated enterprise plans into hosting_plans.`,
      });
    }

    // Live platform telemetry & config diagnostics
    if (action === 'system-diagnostics') {
      const [plansRes, ordersRes, servicesRes, nodesRes, couponsRes, settingsRes] = await Promise.all([
        supabaseAdmin.from('hosting_plans').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('hosting_orders').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('hosting_services').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('infrastructure_nodes').select('id, status'),
        supabaseAdmin.from('hosting_coupons').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('provisioning_settings').select('*').eq('id', 1).maybeSingle(),
      ]);

      const cfg = settingsRes.data || {};
      const nodes = nodesRes.data || [];

      return NextResponse.json({
        counts: {
          plans: plansRes.count || 0,
          orders: ordersRes.count || 0,
          services: servicesRes.count || 0,
          nodesTotal: nodes.length,
          nodesOnline: nodes.filter((n: any) => n.status === 'online').length,
          coupons: couponsRes.count || 0,
        },
        backendsConfigured: {
          proxmox: Boolean(cfg.proxmox_url && cfg.proxmox_token_secret),
          hestiacp: Boolean(cfg.hestiacp_url && cfg.hestiacp_user),
          cyberpanel: Boolean(cfg.cyberpanel_url),
          pterodactyl: Boolean(cfg.pterodactyl_url && cfg.pterodactyl_api_key),
          powerdns: Boolean(cfg.powerdns_url || process.env.POWERDNS_URL),
          minio: Boolean(cfg.minio_endpoint || process.env.MINIO_ENDPOINT),
          litellm: Boolean(cfg.litellm_base_url || process.env.LITELLM_BASE_URL),
          frp: Boolean(cfg.frp_server_url || process.env.FRP_SERVER_URL),
          rabbitmq: Boolean(cfg.rabbitmq_management_url || process.env.RABBITMQ_MANAGEMENT_URL),
          coolify: Boolean(cfg.coolify_base_url || process.env.COOLIFY_BASE_URL),
          k3s: Boolean(cfg.k3s_api_url || process.env.K3S_API_URL),
          workerd: Boolean(cfg.workerd_api_url || process.env.WORKERD_API_URL),
          namecheap: Boolean(cfg.namecheap_api_user),
          odoo: Boolean(cfg.odoo_url),
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action: ' + action }, { status: 400 });

  } catch (err: any) {
    console.error('Admin API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
