/*
# VaultHost Hosting Platform — Database Schema

## Overview
Creates the complete database schema for the VaultHost hosting marketplace, commerce engine, and client portal.

## New Tables

1. **hosting_plans** — Catalog of all hosting plans (shared, VPS, cloud, dedicated, etc.)
   - Public read (catalog is visible to all visitors)
   - Admin-only writes

2. **hosting_orders** — Orders placed by users for hosting plans
   - Owner-scoped (users see only their own orders)
   - Status tracking: pending → paid → provisioning → active

3. **hosting_subscriptions** — Active subscriptions tied to orders
   - Owner-scoped, tracks billing cycle and renewal dates

4. **hosting_invoices** — Invoices generated from orders/subscriptions
   - Owner-scoped, downloadable PDF references

5. **support_tickets** — Client portal support tickets
   - Owner-scoped, with status and priority tracking

6. **ticket_replies** — Threaded replies on support tickets
   - Owner-scoped via parent ticket ownership check

7. **hosting_services** — Provisioned hosting instances tied to orders
   - Owner-scoped, tracks provisioning status and renewal

## Security
- `hosting_plans`: public read (anon + authenticated), admin-only writes
- All user data tables: owner-scoped via `auth.uid() = user_id`
- RLS enabled on every table
- Owner columns default to `auth.uid()` so inserts work without explicit user_id
*/

-- ============================================================
-- HOSTING PLANS (public catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  tier text NOT NULL DEFAULT 'shared',
  name text NOT NULL,
  short_description text,
  long_description text,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_annual numeric(10,2) NOT NULL DEFAULT 0,
  cpu text,
  ram text,
  storage text,
  bandwidth text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_popular boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hosting_plans" ON hosting_plans;
CREATE POLICY "public_read_hosting_plans" ON hosting_plans FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- HOSTING ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES hosting_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  plan_tier text NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  quantity int NOT NULL DEFAULT 1,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_id text,
  domain text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_orders" ON hosting_orders;
CREATE POLICY "select_own_hosting_orders" ON hosting_orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_orders" ON hosting_orders;
CREATE POLICY "insert_own_hosting_orders" ON hosting_orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_orders" ON hosting_orders;
CREATE POLICY "update_own_hosting_orders" ON hosting_orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HOSTING SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES hosting_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  auto_renew boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_subscriptions" ON hosting_subscriptions;
CREATE POLICY "select_own_hosting_subscriptions" ON hosting_subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_subscriptions" ON hosting_subscriptions;
CREATE POLICY "insert_own_hosting_subscriptions" ON hosting_subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_subscriptions" ON hosting_subscriptions;
CREATE POLICY "update_own_hosting_subscriptions" ON hosting_subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HOSTING INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES hosting_subscriptions(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'draft',
  due_date timestamptz,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_invoices" ON hosting_invoices;
CREATE POLICY "select_own_hosting_invoices" ON hosting_invoices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_invoices" ON hosting_invoices;
CREATE POLICY "insert_own_hosting_invoices" ON hosting_invoices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_invoices" ON hosting_invoices;
CREATE POLICY "update_own_hosting_invoices" ON hosting_invoices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_support_tickets" ON support_tickets;
CREATE POLICY "select_own_support_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_support_tickets" ON support_tickets;
CREATE POLICY "insert_own_support_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_support_tickets" ON support_tickets;
CREATE POLICY "update_own_support_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TICKET REPLIES
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'user',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ticket_replies" ON ticket_replies;
CREATE POLICY "select_own_ticket_replies" ON ticket_replies FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_ticket_replies" ON ticket_replies;
CREATE POLICY "insert_own_ticket_replies" ON ticket_replies FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- ============================================================
-- HOSTING SERVICES (provisioned instances)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES hosting_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  domain text,
  status text NOT NULL DEFAULT 'provisioning',
  control_panel_url text,
  ip_address text,
  renewal_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_services" ON hosting_services;
CREATE POLICY "select_own_hosting_services" ON hosting_services FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_services" ON hosting_services;
CREATE POLICY "insert_own_hosting_services" ON hosting_services FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_services" ON hosting_services;
CREATE POLICY "update_own_hosting_services" ON hosting_services FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hosting_plans_tier ON hosting_plans(tier);
CREATE INDEX IF NOT EXISTS idx_hosting_plans_active ON hosting_plans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hosting_orders_user ON hosting_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_orders_status ON hosting_orders(status);
CREATE INDEX IF NOT EXISTS idx_hosting_subscriptions_user ON hosting_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_invoices_user ON hosting_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_hosting_services_user ON hosting_services(user_id);
