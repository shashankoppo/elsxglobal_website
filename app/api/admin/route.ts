export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const planSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  tier: z.string().min(1),
  price_monthly: z.number().min(0),
  price_yearly: z.number().min(0),
  ram_gb: z.number().min(0),
  storage_gb: z.number().min(0),
  bandwidth_gb: z.number().min(0),
  features: z.array(z.string()).optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
}).passthrough();

const addonSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  billing_cycle: z.enum(['monthly', 'yearly', 'once']),
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
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify admin role
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

      const { data: orders } = await supabaseAdmin.from('hosting_orders').select('user_email, total');
      const { data: tickets } = await supabaseAdmin.from('support_tickets').select('user_email, status');
      
      const enrichedUsers = (authData.users || []).map(u => {
        const userOrders = (orders || []).filter(o => o.user_email === u.email);
        const userTickets = (tickets || []).filter(t => t.user_email === u.email && (t.status === 'open' || t.status === 'pending'));
        const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        
        return {
          user_id: u.id,
          email: u.email,
          email_confirmed_at: u.email_confirmed_at,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          orders: userOrders.length,
          total_spent: totalSpent,
          open_tickets: userTickets.length,
          is_suspended: false // Or fetch from a custom profile table
        };
      });

      return NextResponse.json({ users: enrichedUsers });
    }

    if (action === 'approve-order') {
      const { orderId, newStatus } = payload;
      const { error } = await supabaseAdmin.from('hosting_orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      
      // Auto-provision service if approved (button sets to active)
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
              status: 'active', // Set to active so they show up as active immediately
              renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            });
          }
        }
      }
      
      return NextResponse.json({ ok: true });
    }

    if (action === 'sync-services') {
      const { data: approvedOrders } = await supabaseAdmin.from('hosting_orders').select('*').eq('status', 'approved');
      if (approvedOrders) {
        for (const order of approvedOrders) {
          const { data: existingSvc } = await supabaseAdmin.from('hosting_services').select('id').eq('order_id', order.id).maybeSingle();
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
      return NextResponse.json({ ok: true });
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
      if (id) {
        const { error } = await supabaseAdmin.from('hosting_plans').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from('hosting_plans').insert(rest);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete-plan') {
      const { planId } = payload;
      const { error } = await supabaseAdmin.from('hosting_plans').delete().eq('id', planId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'list-addons') {
      const { data } = await supabaseAdmin.from('hosting_addons').select('*').order('price', { ascending: true });
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'save-addon') {
      const addonData = addonSchema.parse(payload);
      const { id, ...rest } = addonData;
      if (id) {
        const { error } = await supabaseAdmin.from('hosting_addons').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from('hosting_addons').insert(rest);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
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
      
      // TODO: Implement actual connection testing per provider_type (SSH, API health check, etc.)
      // For now, validate that required config fields are present
      const missingFields = [];
      if (!node.hostname) missingFields.push('hostname');
      if (!node.api_key) missingFields.push('api_key');
      
      if (missingFields.length > 0) {
        return NextResponse.json({ error: `Missing configuration: ${missingFields.join(', ')}` }, { status: 400 });
      }
      return NextResponse.json({ ok: true, message: 'Configuration validated (live connection test not yet implemented)' });
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
      const { data } = await supabaseAdmin.from('payment_transactions').select('*').order('created_at', { ascending: false }).limit(100);
      return NextResponse.json({ data: data || [] });
    }

    if (action === 'update-transaction') {
      const { transactionId, status } = payload;
      const { error } = await supabaseAdmin.from('payment_transactions').update({ status }).eq('id', transactionId);
      if (error) throw error;
      
      if (status === 'approved') {
        const { data: tx } = await supabaseAdmin.from('payment_transactions').select('*').eq('id', transactionId).single();
        if (tx && tx.order_id) {
          await supabaseAdmin.from('hosting_orders').update({ status: 'approved' }).eq('id', tx.order_id);
        }
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action: ' + action }, { status: 400 });

  } catch (err: any) {
    console.error('Admin API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
