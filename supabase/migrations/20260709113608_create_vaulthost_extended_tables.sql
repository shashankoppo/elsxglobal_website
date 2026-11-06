/*
# VaultHost Extended — Domains, Add-ons, DNS, Email, Databases, SSL, Backups

## Overview
Extends the VaultHost hosting platform with Hostinger-style features:
domain registration, add-on marketplace, DNS zone management, email accounts,
MySQL/PostgreSQL databases, SSL certificates, and backup snapshots.

## New Tables

1. **hosting_addons** — Public catalog of purchasable add-ons (SSL, backup, CDN, etc.)
   - Public read (catalog visible to all visitors)
   - Admin-only writes (no insert/update/delete policies for anon/authenticated)

2. **hosting_order_addons** — Junction table linking orders to add-ons (many-to-many)
   - Owner-scoped via parent order ownership check

3. **domain_registrations** — Registered domains tied to a user
   - Owner-scoped, tracks registration, expiry, auto-renew, status

4. **dns_zones** — DNS zones for domains owned by a user
   - Owner-scoped via domain ownership check

5. **dns_records** — Individual DNS records (A, AAAA, CNAME, MX, TXT, etc.)
   - Owner-scoped via parent zone ownership check

6. **email_accounts** — Mailboxes tied to a domain
   - Owner-scoped via domain ownership check

7. **hosting_databases** — MySQL/PostgreSQL databases for hosting services
   - Owner-scoped, linked to hosting_services

8. **ssl_certificates** — SSL certificates (free Let's Encrypt + paid premium)
   - Owner-scoped, linked to domains

9. **backup_snapshots** — Backup snapshots for hosting services
   - Owner-scoped, linked to hosting_services

## Security
- `hosting_addons`: public read (anon + authenticated), no writes from app
- All user data tables: owner-scoped via `auth.uid() = user_id` or parent ownership
- RLS enabled on every table
- Owner columns default to `auth.uid()` so inserts work without explicit user_id
*/

-- ============================================================
-- HOSTING ADDONS (public catalog)
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

-- ============================================================
-- HOSTING ORDER ADDONS (junction)
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

-- ============================================================
-- DOMAIN REGISTRATIONS
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

-- ============================================================
-- DNS ZONES
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

-- ============================================================
-- DNS RECORDS
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

-- ============================================================
-- EMAIL ACCOUNTS
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

-- ============================================================
-- HOSTING DATABASES (MySQL/PostgreSQL)
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

-- ============================================================
-- SSL CERTIFICATES
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

-- ============================================================
-- BACKUP SNAPSHOTS
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

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hosting_addons_active ON hosting_addons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_order_addons_order ON hosting_order_addons(order_id);
CREATE INDEX IF NOT EXISTS idx_domains_user ON domain_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domain_registrations(domain);
CREATE INDEX IF NOT EXISTS idx_dns_zones_user ON dns_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_zone ON dns_records(zone_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_domain ON email_accounts(domain);
CREATE INDEX IF NOT EXISTS idx_hosting_databases_user ON hosting_databases(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_databases_service ON hosting_databases(service_id);
CREATE INDEX IF NOT EXISTS idx_ssl_certs_user ON ssl_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_ssl_certs_domain ON ssl_certificates(domain);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_user ON backup_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_service ON backup_snapshots(service_id);
