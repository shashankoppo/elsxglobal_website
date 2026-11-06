-- ================================================================
-- ELSxGlobal + VaultHost — COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT everywhere
-- ================================================================

-- ============================================================
-- 1. ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  password_hash text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_admin_users" ON admin_users;
CREATE POLICY "read_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (false);

DROP POLICY IF EXISTS "insert_admin_users_service" ON admin_users;
CREATE POLICY "insert_admin_users_service" ON admin_users
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "update_admin_users_service" ON admin_users;
CREATE POLICY "update_admin_users_service" ON admin_users
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "delete_admin_users_service" ON admin_users;
CREATE POLICY "delete_admin_users_service" ON admin_users
  FOR DELETE TO authenticated USING (false);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- ============================================================
-- 2. ADMIN SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  revoked boolean NOT NULL DEFAULT false
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- ============================================================
-- 3. LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  work_email text NOT NULL,
  company text,
  phone text,
  intent text NOT NULL DEFAULT 'consultation',
  message text,
  status text NOT NULL DEFAULT 'new',
  source text,
  metadata jsonb
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_leads_public" ON leads;
CREATE POLICY "insert_leads_public" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_intent_idx ON leads (intent);

-- ============================================================
-- 4. INTEGRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_integrations_service_only" ON integrations;
DROP POLICY IF EXISTS "Admins can view integrations" ON integrations;
CREATE POLICY "Admins can view integrations" ON integrations FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

DROP POLICY IF EXISTS "Admins can insert integrations" ON integrations;
CREATE POLICY "Admins can insert integrations" ON integrations FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

DROP POLICY IF EXISTS "Admins can update integrations" ON integrations;
CREATE POLICY "Admins can update integrations" ON integrations FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

INSERT INTO integrations (key, value) VALUES
  ('odoo_api_key', '86c3fd4322589a1bdbd605869e4222dfbcd89568'),
  ('odoo_url', 'https://elsxglobal.com'),
  ('odoo_db', 'elsxglobal')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ============================================================
-- 5. LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text,
  country text NOT NULL,
  country_code text NOT NULL DEFAULT 'IN',
  region text,
  slug text UNIQUE NOT NULL,
  meta_title text,
  meta_description text,
  h1_title text,
  population_tier text DEFAULT 'tier-1',
  is_active boolean DEFAULT true,
  is_hub boolean DEFAULT false,
  h1_custom text,
  meta_title_custom text,
  meta_description_custom text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "locations_public_read" ON locations;
CREATE POLICY "locations_public_read" ON locations FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);

-- ============================================================
-- 6. SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  short_description text,
  long_description text,
  features jsonb DEFAULT '[]',
  benefits jsonb DEFAULT '[]',
  technologies jsonb DEFAULT '[]',
  industries jsonb DEFAULT '[]',
  meta_title text,
  meta_description text,
  h1_title text,
  cta_text text DEFAULT 'Get Started',
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_public_read" ON services;
CREATE POLICY "services_public_read" ON services FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- ============================================================
-- 7. SERVICE_LOCATIONS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  custom_title text,
  custom_description text,
  local_phone text,
  local_address text,
  meta_title text,
  meta_description text,
  UNIQUE(service_id, location_id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_locations_public_read" ON service_locations;
CREATE POLICY "service_locations_public_read" ON service_locations FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_service_locations_service ON service_locations(service_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_location ON service_locations(location_id);

-- ============================================================
-- 8. ARTICLES (blog)
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  author_name text DEFAULT 'ELSxGlobal Team',
  author_title text,
  read_time integer DEFAULT 5,
  featured_image text,
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  meta_title text,
  meta_description text,
  lead_magnet_url text,
  lead_magnet_title text
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles_public_read" ON articles;
CREATE POLICY "articles_public_read" ON articles FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);

-- ============================================================
-- 9. CASE STUDIES
-- ============================================================
CREATE TABLE IF NOT EXISTS case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  client_name text,
  client_industry text,
  challenge text,
  solution text,
  results jsonb DEFAULT '{}',
  technologies text[] DEFAULT '{}',
  testimonial text,
  testimonial_author text,
  testimonial_title text,
  featured_image text,
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  meta_title text,
  meta_description text
);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_studies_public_read" ON case_studies;
CREATE POLICY "case_studies_public_read" ON case_studies FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(client_industry);

-- ============================================================
-- 10. LEAD MAGNETS
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_magnets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  file_url text,
  file_type text,
  category text,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_magnets_public_read" ON lead_magnets;
CREATE POLICY "lead_magnets_public_read" ON lead_magnets FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_lead_magnets_slug ON lead_magnets(slug);

-- ============================================================
-- 11. COUNTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  region text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "countries_public_read" ON countries;
CREATE POLICY "countries_public_read" ON countries FOR SELECT TO anon, authenticated USING (is_active = true);

-- ============================================================
-- 12. HOSTING PLANS (public catalog)
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

CREATE INDEX IF NOT EXISTS idx_hosting_plans_tier ON hosting_plans(tier);
CREATE INDEX IF NOT EXISTS idx_hosting_plans_active ON hosting_plans(is_active) WHERE is_active = true;

-- ============================================================
-- 13. HOSTING ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES hosting_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  plan_tier text NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  amount numeric(10,2) NOT NULL DEFAULT 0,
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
  os_selection text DEFAULT 'ubuntu-22.04',
  panel_selection text DEFAULT 'none',
  server_location text DEFAULT 'pune',
  user_email text,
  payment_proof_url text,
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

CREATE INDEX IF NOT EXISTS idx_hosting_orders_user ON hosting_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_orders_status ON hosting_orders(status);

-- ============================================================
-- 14. HOSTING SUBSCRIPTIONS
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

CREATE INDEX IF NOT EXISTS idx_hosting_subscriptions_user ON hosting_subscriptions(user_id);

-- ============================================================
-- 15. HOSTING INVOICES
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

CREATE INDEX IF NOT EXISTS idx_hosting_invoices_user ON hosting_invoices(user_id);

-- ============================================================
-- 16. SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  category text,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);

-- ============================================================
-- 17. TICKET REPLIES
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

CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON ticket_replies(ticket_id);

-- ============================================================
-- 18. HOSTING SERVICES (provisioned instances)
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

CREATE INDEX IF NOT EXISTS idx_hosting_services_user ON hosting_services(user_id);

-- ============================================================
-- 19. HOSTING ADDONS (public catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'security',
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_annual numeric(10,2) NOT NULL DEFAULT 0,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hosting_addons" ON hosting_addons;
CREATE POLICY "public_read_hosting_addons" ON hosting_addons FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_hosting_addons_active ON hosting_addons(is_active) WHERE is_active = true;

-- ============================================================
-- 20. HOSTING ORDER ADDONS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_order_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES hosting_orders(id) ON DELETE CASCADE,
  addon_id uuid NOT NULL REFERENCES hosting_addons(id) ON DELETE RESTRICT,
  addon_name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_order_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_addons" ON hosting_order_addons;
CREATE POLICY "select_own_order_addons" ON hosting_order_addons FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM hosting_orders WHERE hosting_orders.id = hosting_order_addons.order_id AND hosting_orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_order_addons" ON hosting_order_addons;
CREATE POLICY "insert_own_order_addons" ON hosting_order_addons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM hosting_orders WHERE hosting_orders.id = hosting_order_addons.order_id AND hosting_orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_order_addons" ON hosting_order_addons;
CREATE POLICY "delete_own_order_addons" ON hosting_order_addons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM hosting_orders WHERE hosting_orders.id = hosting_order_addons.order_id AND hosting_orders.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_order_addons_order ON hosting_order_addons(order_id);

-- ============================================================
-- 21. DOMAIN REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS domain_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  tld text NOT NULL,
  registration_period int NOT NULL DEFAULT 1,
  registered_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  nameservers jsonb DEFAULT '[]'::jsonb,
  privacy_protected boolean NOT NULL DEFAULT false,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE domain_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_domains" ON domain_registrations;
CREATE POLICY "select_own_domains" ON domain_registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_domains" ON domain_registrations;
CREATE POLICY "insert_own_domains" ON domain_registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_domains" ON domain_registrations;
CREATE POLICY "update_own_domains" ON domain_registrations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_domains" ON domain_registrations;
CREATE POLICY "delete_own_domains" ON domain_registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_domains_user ON domain_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domain_registrations(domain);

-- ============================================================
-- 22. DNS ZONES
-- ============================================================
CREATE TABLE IF NOT EXISTS dns_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id uuid REFERENCES domain_registrations(id) ON DELETE CASCADE,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dns_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dns_zones" ON dns_zones;
CREATE POLICY "select_own_dns_zones" ON dns_zones FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_dns_zones" ON dns_zones;
CREATE POLICY "insert_own_dns_zones" ON dns_zones FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_dns_zones" ON dns_zones;
CREATE POLICY "update_own_dns_zones" ON dns_zones FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_dns_zones" ON dns_zones;
CREATE POLICY "delete_own_dns_zones" ON dns_zones FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dns_zones_user ON dns_zones(user_id);

-- ============================================================
-- 23. DNS RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS dns_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES dns_zones(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL DEFAULT '@',
  value text NOT NULL,
  ttl int NOT NULL DEFAULT 3600,
  priority int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dns_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dns_records" ON dns_records;
CREATE POLICY "select_own_dns_records" ON dns_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_dns_records" ON dns_records;
CREATE POLICY "insert_own_dns_records" ON dns_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_dns_records" ON dns_records;
CREATE POLICY "update_own_dns_records" ON dns_records FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_dns_records" ON dns_records;
CREATE POLICY "delete_own_dns_records" ON dns_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_dns_records_zone ON dns_records(zone_id);

-- ============================================================
-- 24. EMAIL ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id uuid REFERENCES domain_registrations(id) ON DELETE CASCADE,
  domain text NOT NULL,
  local_part text NOT NULL,
  password_hash text,
  storage_quota_mb int NOT NULL DEFAULT 1024,
  storage_used_mb numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  forward_to text,
  is_catch_all boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_email_accounts" ON email_accounts;
CREATE POLICY "select_own_email_accounts" ON email_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_email_accounts" ON email_accounts;
CREATE POLICY "insert_own_email_accounts" ON email_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_email_accounts" ON email_accounts;
CREATE POLICY "update_own_email_accounts" ON email_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_email_accounts" ON email_accounts;
CREATE POLICY "delete_own_email_accounts" ON email_accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_domain ON email_accounts(domain);

-- ============================================================
-- 25. HOSTING DATABASES (MySQL/PostgreSQL)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES hosting_services(id) ON DELETE CASCADE,
  db_name text NOT NULL,
  db_type text NOT NULL DEFAULT 'mysql',
  db_user text NOT NULL,
  db_host text,
  db_port int DEFAULT 3306,
  size_mb numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_databases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_databases" ON hosting_databases;
CREATE POLICY "select_own_hosting_databases" ON hosting_databases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_databases" ON hosting_databases;
CREATE POLICY "insert_own_hosting_databases" ON hosting_databases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_databases" ON hosting_databases;
CREATE POLICY "update_own_hosting_databases" ON hosting_databases FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_hosting_databases" ON hosting_databases;
CREATE POLICY "delete_own_hosting_databases" ON hosting_databases FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_hosting_databases_user ON hosting_databases(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_databases_service ON hosting_databases(service_id);

-- ============================================================
-- 26. SSL CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS ssl_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  cert_type text NOT NULL DEFAULT 'lets_encrypt',
  issuer text,
  valid_from timestamptz,
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'active',
  auto_renew boolean NOT NULL DEFAULT true,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ssl_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "select_own_ssl_certs" ON ssl_certificates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "insert_own_ssl_certs" ON ssl_certificates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "update_own_ssl_certs" ON ssl_certificates FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "delete_own_ssl_certs" ON ssl_certificates FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ssl_certs_user ON ssl_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_ssl_certs_domain ON ssl_certificates(domain);

-- ============================================================
-- 27. BACKUP SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS backup_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES hosting_services(id) ON DELETE CASCADE,
  backup_type text NOT NULL DEFAULT 'daily',
  size_mb numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  storage_url text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE backup_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_backups" ON backup_snapshots;
CREATE POLICY "select_own_backups" ON backup_snapshots FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_backups" ON backup_snapshots;
CREATE POLICY "insert_own_backups" ON backup_snapshots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_backups" ON backup_snapshots;
CREATE POLICY "delete_own_backups" ON backup_snapshots FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_backup_snapshots_user ON backup_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_service ON backup_snapshots(service_id);

-- ============================================================
-- 28. PAYMENT SETTINGS (single-row config)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_settings (
  id int PRIMARY KEY DEFAULT 1,
  razorpay_enabled boolean NOT NULL DEFAULT false,
  razorpay_key_id text DEFAULT '',
  razorpay_key_secret text DEFAULT '',
  razorpay_mode text NOT NULL DEFAULT 'sandbox',
  upi_enabled boolean NOT NULL DEFAULT true,
  upi_id text DEFAULT '',
  upi_display_name text DEFAULT 'ELSxGlobal',
  bank_transfer_enabled boolean NOT NULL DEFAULT false,
  bank_details jsonb DEFAULT '{}'::jsonb,
  custom_qr_image_url text DEFAULT '',
  stripe_enabled boolean NOT NULL DEFAULT false,
  stripe_publishable_key text DEFAULT '',
  stripe_secret_key text DEFAULT '',
  stripe_webhook_secret text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_settings_single_row CHECK (id = 1)
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_payment_settings" ON payment_settings;
CREATE POLICY "admin_read_payment_settings" ON payment_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "admin_write_payment_settings" ON payment_settings;
CREATE POLICY "admin_write_payment_settings" ON payment_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "admin_insert_payment_settings" ON payment_settings;
CREATE POLICY "admin_insert_payment_settings" ON payment_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

INSERT INTO payment_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Public view (hides secrets)
DROP VIEW IF EXISTS public_payment_settings;
CREATE OR REPLACE VIEW public_payment_settings AS
SELECT
  id,
  razorpay_enabled,
  razorpay_key_id,
  razorpay_mode,
  stripe_enabled,
  stripe_publishable_key,
  upi_enabled,
  upi_id,
  upi_display_name,
  bank_transfer_enabled,
  bank_details,
  custom_qr_image_url,
  updated_at
FROM payment_settings;

GRANT SELECT ON public_payment_settings TO anon, authenticated;

-- ============================================================
-- 29. SITE SETTINGS (single-row config)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  org_name text NOT NULL DEFAULT 'EvolucentSphere',
  tagline text DEFAULT 'Enterprise Technology Solutions',
  support_email text DEFAULT 'contact@elsxglobal.com',
  support_phone text DEFAULT '+917247558873',
  trust_badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_defaults jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = (auth.jwt() ->> 'email') AND admin_users.is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = (auth.jwt() ->> 'email') AND admin_users.is_active = true)
  );

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = (auth.jwt() ->> 'email') AND admin_users.is_active = true)
  );

INSERT INTO site_settings (id, trust_badges) VALUES (
  1,
  '[{"id":"meta-partner","name":"Meta Business Partner","logo_url":"","verify_url":"https://www.facebook.com/business/partner-directory","verified":true,"display":true},{"id":"godaddy-reseller","name":"GoDaddy Authorized Reseller","logo_url":"","verify_url":"https://godaddy.com","verified":true,"display":true},{"id":"aws-partner","name":"AWS Partner Network","logo_url":"","verify_url":"https://aws.amazon.com/partners","verified":true,"display":true},{"id":"microsoft-partner","name":"Microsoft Cloud Partner","logo_url":"","verify_url":"https://partner.microsoft.com","verified":true,"display":true},{"id":"google-cloud","name":"Google Cloud Partner","logo_url":"","verify_url":"https://cloud.google.com/partners","verified":true,"display":true},{"id":"iso-27001","name":"ISO 27001 Certified","logo_url":"","verify_url":"","verified":true,"display":true}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 30. TRANSACTIONS (payment audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES hosting_orders(id) ON DELETE CASCADE,
  user_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  gateway text,
  gateway_transaction_id text,
  status text NOT NULL DEFAULT 'initiated',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_read_transactions" ON transactions;
CREATE POLICY "owner_read_transactions" ON transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_read_transactions" ON transactions;
CREATE POLICY "admin_read_transactions" ON transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = (auth.jwt() ->> 'email') AND admin_users.is_active = true)
  );

DROP POLICY IF EXISTS "owner_insert_transactions" ON transactions;
CREATE POLICY "owner_insert_transactions" ON transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================================
-- 31. EMAIL LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  body text,
  template text,
  related_id uuid,
  related_type text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_email_log" ON email_log;
CREATE POLICY "admin_read_email_log" ON email_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.email = (auth.jwt() ->> 'email') AND admin_users.is_active = true)
  );

DROP POLICY IF EXISTS "owner_read_email_log" ON email_log;
CREATE POLICY "owner_read_email_log" ON email_log
  FOR SELECT TO authenticated
  USING (related_id IN (SELECT id FROM hosting_orders WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "service_insert_email_log" ON email_log;
CREATE POLICY "service_insert_email_log" ON email_log
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log(created_at);
CREATE INDEX IF NOT EXISTS idx_email_log_related_id ON email_log(related_id);

-- ============================================================
-- 32. PROVISIONING SETTINGS (single-row config)
-- ============================================================
CREATE TABLE IF NOT EXISTS provisioning_settings (
  id integer PRIMARY KEY CHECK (id = 1),

  -- Pterodactyl Config
  pterodactyl_enabled boolean DEFAULT false,
  pterodactyl_url text,
  pterodactyl_api_key text,

  -- Proxmox Config
  proxmox_enabled boolean DEFAULT false,
  proxmox_url text,
  proxmox_token_id text,
  proxmox_secret text,
  proxmox_node text,

  -- HestiaCP Config
  hestiacp_enabled boolean DEFAULT false,
  hestiacp_url text,
  hestiacp_username text,
  hestiacp_password text,

  -- CyberPanel Config
  cyberpanel_enabled boolean DEFAULT false,
  cyberpanel_url text,
  cyberpanel_admin_user text,
  cyberpanel_admin_pass text,

  -- Domain registration Config
  domains_enabled boolean DEFAULT false,
  domains_provider text DEFAULT 'namesilo',
  domains_api_key text,
  domains_username text,

  -- Default mapping for tiers
  default_game_adapter text DEFAULT 'pterodactyl',
  default_vps_adapter text DEFAULT 'proxmox',
  default_shared_adapter text DEFAULT 'hestiacp',

  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO provisioning_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE provisioning_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view provisioning settings" ON provisioning_settings;
CREATE POLICY "Admins can view provisioning settings"
  ON provisioning_settings FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

DROP POLICY IF EXISTS "Admins can update provisioning settings" ON provisioning_settings;
CREATE POLICY "Admins can update provisioning settings"
  ON provisioning_settings FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- ============================================================
-- 33. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-uploads', 'qr-uploads', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "public_read_qr_uploads" ON storage.objects;
CREATE POLICY "public_read_qr_uploads" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'qr-uploads');

DROP POLICY IF EXISTS "auth_upload_qr_uploads" ON storage.objects;
CREATE POLICY "auth_upload_qr_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'qr-uploads');

DROP POLICY IF EXISTS "public_read_payment_proofs" ON storage.objects;
CREATE POLICY "public_read_payment_proofs" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "auth_upload_payment_proofs" ON storage.objects;
CREATE POLICY "auth_upload_payment_proofs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

-- ============================================================
-- 34. SEED DATA — Locations
-- ============================================================
INSERT INTO locations (city, state, country, country_code, region, slug, population_tier) VALUES
('Mumbai', 'Maharashtra', 'India', 'IN', 'West', 'mumbai', 'tier-1'),
('Delhi', 'Delhi', 'India', 'IN', 'North', 'delhi', 'tier-1'),
('Bangalore', 'Karnataka', 'India', 'IN', 'South', 'bangalore', 'tier-1'),
('Chennai', 'Tamil Nadu', 'India', 'IN', 'South', 'chennai', 'tier-1'),
('Hyderabad', 'Telangana', 'India', 'IN', 'South', 'hyderabad', 'tier-1'),
('Kolkata', 'West Bengal', 'India', 'IN', 'East', 'kolkata', 'tier-1'),
('Pune', 'Maharashtra', 'India', 'IN', 'West', 'pune', 'tier-1'),
('Ahmedabad', 'Gujarat', 'India', 'IN', 'West', 'ahmedabad', 'tier-1'),
('Jaipur', 'Rajasthan', 'India', 'IN', 'North', 'jaipur', 'tier-1'),
('Lucknow', 'Uttar Pradesh', 'India', 'IN', 'North', 'lucknow', 'tier-2'),
('Chandigarh', 'Chandigarh', 'India', 'IN', 'North', 'chandigarh', 'tier-2'),
('Indore', 'Madhya Pradesh', 'India', 'IN', 'Central', 'indore', 'tier-2'),
('Coimbatore', 'Tamil Nadu', 'India', 'IN', 'South', 'coimbatore', 'tier-2'),
('Nagpur', 'Maharashtra', 'India', 'IN', 'West', 'nagpur', 'tier-2'),
('Surat', 'Gujarat', 'India', 'IN', 'West', 'surat', 'tier-1'),
('Bhopal', 'Madhya Pradesh', 'India', 'IN', 'Central', 'bhopal', 'tier-2'),
('Visakhapatnam', 'Andhra Pradesh', 'India', 'IN', 'South', 'visakhapatnam', 'tier-2'),
('Mysore', 'Karnataka', 'India', 'IN', 'South', 'mysore', 'tier-2'),
('Kochi', 'Kerala', 'India', 'IN', 'South', 'kochi', 'tier-2'),
('Trivandrum', 'Kerala', 'India', 'IN', 'South', 'trivandrum', 'tier-2'),
('New York', 'NY', 'United States', 'US', 'North America', 'new-york', 'tier-1'),
('San Francisco', 'CA', 'United States', 'US', 'North America', 'san-francisco', 'tier-1'),
('London', 'England', 'United Kingdom', 'GB', 'Europe', 'london', 'tier-1'),
('Dubai', 'Dubai', 'United Arab Emirates', 'AE', 'Middle East', 'dubai', 'tier-1'),
('Singapore', 'Singapore', 'Singapore', 'SG', 'Asia Pacific', 'singapore', 'tier-1'),
('Sydney', 'NSW', 'Australia', 'AU', 'Oceania', 'sydney', 'tier-1'),
('Toronto', 'ON', 'Canada', 'CA', 'North America', 'toronto', 'tier-1'),
('Berlin', 'Berlin', 'Germany', 'DE', 'Europe', 'berlin', 'tier-1'),
('Tokyo', 'Tokyo', 'Japan', 'JP', 'Asia Pacific', 'tokyo', 'tier-1')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 35. SEED DATA — Countries
-- ============================================================
INSERT INTO countries (name, code, region) VALUES
('India', 'IN', 'Asia'),
('United States', 'US', 'North America'),
('United Kingdom', 'GB', 'Europe'),
('United Arab Emirates', 'AE', 'Middle East'),
('Singapore', 'SG', 'Asia Pacific'),
('Australia', 'AU', 'Oceania'),
('Canada', 'CA', 'North America'),
('Germany', 'DE', 'Europe'),
('Japan', 'JP', 'Asia Pacific'),
('Netherlands', 'NL', 'Europe'),
('Switzerland', 'CH', 'Europe'),
('France', 'FR', 'Europe'),
('Saudi Arabia', 'SA', 'Middle East'),
('South Africa', 'ZA', 'Africa'),
('Malaysia', 'MY', 'Asia Pacific'),
('Indonesia', 'ID', 'Asia Pacific'),
('Philippines', 'PH', 'Asia Pacific'),
('Brazil', 'BR', 'South America'),
('Mexico', 'MX', 'North America'),
('New Zealand', 'NZ', 'Oceania')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 36. SEED DATA — Services
-- ============================================================
INSERT INTO services (name, slug, category, short_description, is_featured, sort_order) VALUES
('Custom Software Development', 'custom-software-development', 'Development', 'Enterprise-grade custom software solutions built for scale, security, and performance.', true, 1),
('Website Development', 'website-development', 'Development', 'High-performance websites engineered for conversions, SEO, and user experience.', true, 2),
('AI & Machine Learning Solutions', 'ai-solutions', 'AI & Data', 'AI solutions that automate decisions, predict outcomes, and unlock business value from data.', true, 3),
('ERP & CRM Implementation', 'erp-crm', 'Enterprise Systems', 'Unified enterprise systems that connect every function and drive operational excellence.', true, 4),
('Cloud Infrastructure', 'cloud-infrastructure', 'Infrastructure', 'Scalable cloud infrastructure designed for performance, security, and cost optimization.', false, 5),
('Cybersecurity', 'cybersecurity', 'Security', 'Zero-trust security architecture that protects enterprise assets and ensures compliance.', false, 6),
('Digital Marketing', 'digital-marketing', 'Marketing', 'Data-driven digital marketing that generates qualified leads and accelerates growth.', false, 7),
('BPO & KPO Services', 'bpo-kpo', 'Operations', 'Outsourced business operations that reduce costs while maintaining quality and compliance.', false, 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- DONE! All 32 tables, views, policies, indexes, storage
-- buckets, and seed data are now created.
-- ============================================================
