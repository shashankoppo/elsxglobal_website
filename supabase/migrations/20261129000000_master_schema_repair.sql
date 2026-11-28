-- ================================================================
-- Master Schema Repair Migration
-- Fixes all column mismatches found in production audit 2026-11-28
-- Adds missing billing columns, cloud_databases table, tenant_id,
-- atomic fulfillment lock function, and hosting_services extended cols
-- ================================================================

-- ── 1. hosting_orders: missing billing columns ─────────────────────
-- fulfillOrder() writes payment_status, transaction_id but they don't exist
ALTER TABLE public.hosting_orders
  ADD COLUMN IF NOT EXISTS payment_status    TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS transaction_id    TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Index for webhook lookups by razorpay_order_id (already added in 20261107, safe)
CREATE INDEX IF NOT EXISTS idx_hosting_orders_razorpay ON public.hosting_orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hosting_orders_payment_status ON public.hosting_orders(payment_status);

-- ── 2. hosting_services: missing columns that fulfillOrder() inserts ──
-- fulfillOrder writes: tier, billing_cycle, hostname, os_template, ssh_public_key,
-- location, provisioning_mode, setup_status, specs_json, ssh_port
ALTER TABLE public.hosting_services
  ADD COLUMN IF NOT EXISTS tier              TEXT NOT NULL DEFAULT 'cloud',
  ADD COLUMN IF NOT EXISTS billing_cycle     TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS hostname          TEXT,
  ADD COLUMN IF NOT EXISTS os_template       TEXT DEFAULT 'ubuntu-22.04',
  ADD COLUMN IF NOT EXISTS ssh_public_key    TEXT,
  ADD COLUMN IF NOT EXISTS location          TEXT DEFAULT 'pune',
  ADD COLUMN IF NOT EXISTS provisioning_mode TEXT DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS setup_status      TEXT DEFAULT 'provisioning',
  ADD COLUMN IF NOT EXISTS specs_json        JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ssh_port          INTEGER DEFAULT 22,
  ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_hosting_services_order ON public.hosting_services(order_id);
CREATE INDEX IF NOT EXISTS idx_hosting_services_status ON public.hosting_services(status);

-- ── 3. api_keys: missing tenant_id column ─────────────────────────
-- app/api/v1/[...path]/route.ts queries api_keys.tenant_id
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'ten_portal_default';

-- ── 4. api_key_usage: route inserts client_ip but column is ip_address ─
-- Column ip_address already exists per schema. No action needed.
-- Route fix applied separately (already fixed in prior commit).

-- ── 5. cloud_databases table (missing entirely) ────────────────────
-- app/api/cloud/managed-db/route.ts queries/inserts/deletes cloud_databases
CREATE TABLE IF NOT EXISTS public.cloud_databases (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id     TEXT        NOT NULL DEFAULT 'ten_portal_default',
  name          TEXT        NOT NULL,
  engine        TEXT        NOT NULL DEFAULT 'postgres' CHECK (engine IN ('postgres','mysql','redis','mongodb')),
  version       TEXT        NOT NULL DEFAULT '17',
  plan          TEXT        NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro','enterprise')),
  status        TEXT        NOT NULL DEFAULT 'provisioning' CHECK (status IN ('provisioning','active','stopped','error','deleted')),
  host          TEXT,
  port          INTEGER,
  database_name TEXT,
  username      TEXT,
  -- password_hash is stored hashed — never return plaintext in API
  password_hash TEXT,
  storage_gb    INTEGER     NOT NULL DEFAULT 10,
  max_connections INTEGER   NOT NULL DEFAULT 25,
  backup_enabled BOOLEAN    NOT NULL DEFAULT true,
  region        TEXT        NOT NULL DEFAULT 'ap-south-1',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cloud_databases ENABLE ROW LEVEL SECURITY;

-- Users can only see their own databases
CREATE POLICY "cloud_db_select_own" ON public.cloud_databases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "cloud_db_insert_own" ON public.cloud_databases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cloud_db_update_own" ON public.cloud_databases FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cloud_db_delete_own" ON public.cloud_databases FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "cloud_db_service_role" ON public.cloud_databases FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cloud_databases_user ON public.cloud_databases(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_databases_status ON public.cloud_databases(status);

-- ── 6. cloud_tunnels: route inserts tenant_id but schema lacks it ──
ALTER TABLE public.cloud_tunnels
  ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'ten_portal_default',
  ADD COLUMN IF NOT EXISTS target TEXT;  -- target upstream URL for the tunnel

-- ── 7. cloud_containers: route inserts tenant_id, name, cluster, region ─
-- Schema has: namespace, display_name, cluster, region... but route inserts
-- tenant_id (missing), name (not namespace), cluster, region
ALTER TABLE public.cloud_containers
  ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'ten_portal_default';

-- Note: 'name' in route maps to 'namespace' in schema — adding alias column
ALTER TABLE public.cloud_containers
  ADD COLUMN IF NOT EXISTS name TEXT;

-- ── 8. cloud_pages_projects: route inserts tenant_id ─────────────
ALTER TABLE public.cloud_pages_projects
  ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'ten_portal_default';

-- ── 9. cloud_queues: add tenant_id ───────────────────────────────
ALTER TABLE public.cloud_queues
  ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'ten_portal_default';

-- ── 10. Atomic fulfillment lock function ──────────────────────────
-- Prevents double-provisioning race between /razorpay/verify and /webhooks/razorpay
-- Returns the order row if successfully claimed (status changed pending→provisioning),
-- returns NULL if another worker already claimed it.
CREATE OR REPLACE FUNCTION public.claim_order_for_fulfillment(p_order_id UUID)
RETURNS public.hosting_orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order public.hosting_orders;
BEGIN
  UPDATE public.hosting_orders
  SET
    status         = 'provisioning',
    payment_status = 'paid',
    updated_at     = now()
  WHERE id = p_order_id
    AND status IN ('pending', 'processing')
  RETURNING * INTO v_order;

  RETURN v_order; -- NULL if no row matched (already claimed)
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_order_for_fulfillment TO service_role, authenticated;

-- ── 11. hosting_orders UPDATE RLS: restrict sensitive column writes ─
-- Authenticated users should NOT be able to self-update status, total, payment columns.
-- Drop the overly-permissive UPDATE policy and replace with restricted one.
DROP POLICY IF EXISTS "update_own_hosting_orders" ON public.hosting_orders;
-- Note: PostgREST/Supabase doesn't support column-level RLS policies directly.
-- Use a WITH CHECK that prevents status manipulation:
CREATE POLICY "update_own_hosting_orders" ON public.hosting_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (
    auth.uid() = user_id
    -- Only allow updating draft fields before payment
    AND status = 'pending'
  );

-- ── 12. hosting_order_addons: restore ON DELETE CASCADE on order_id FK ─
-- Migration 20260816214331 re-added this FK without CASCADE
ALTER TABLE public.hosting_order_addons
  DROP CONSTRAINT IF EXISTS hosting_order_addons_order_id_fkey;
ALTER TABLE public.hosting_order_addons
  ADD CONSTRAINT hosting_order_addons_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.hosting_orders(id) ON DELETE CASCADE;

-- ── 13. Grant table access to service_role ───────────────────────
GRANT ALL ON public.cloud_databases TO service_role, authenticator, authenticated;
GRANT ALL ON public.hosting_services TO service_role;
GRANT ALL ON public.hosting_orders TO service_role;
GRANT ALL ON public.api_keys TO service_role;
