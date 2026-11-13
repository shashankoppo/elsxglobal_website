-- ============================================================
-- VaultHost Billing Control Plane & Metering Infrastructure
-- Migration: 20261113000000_add_billing_control_plane.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. Usage Metering Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES hosting_services(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL, -- 'workers','storage','ai_tokens','bandwidth','containers' etc
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- 'requests','gb_hours','tokens','gb','pod_hours'
  unit_price_paise INTEGER NOT NULL, -- price per unit in paise (1 INR = 100 paise)
  amount_paise INTEGER NOT NULL, -- quantity * unit_price_paise
  billing_period_start TIMESTAMPTZ NOT NULL,
  billing_period_end TIMESTAMPTZ NOT NULL,
  invoiced BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Credit Ledger Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL, -- positive = credit added, negative = credit used
  balance_after_paise INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup','refund','promo','usage_deduction','adjustment')),
  description TEXT NOT NULL,
  reference_id TEXT, -- invoice_id or order_id
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. Customer Credit Balance View / Table ─────────────────
CREATE TABLE IF NOT EXISTS credit_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_paise INTEGER NOT NULL DEFAULT 0,
  lifetime_credited_paise INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. Subscriptions (Recurring Billing) ─────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES hosting_plans(id),
  service_id UUID REFERENCES hosting_services(id),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','paused','cancelled','expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','annual')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  next_invoice_amount_paise INTEGER,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. Reseller Accounts ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS resellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  margin_percent NUMERIC(5,2) NOT NULL DEFAULT 20.00, -- reseller margin
  credit_limit_paise INTEGER NOT NULL DEFAULT 1000000, -- 10,000 INR default credit limit
  balance_paise INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
  gst_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. Reseller Customers (Sub-accounts) ────────────────────
CREATE TABLE IF NOT EXISTS reseller_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
  customer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, customer_user_id)
);

-- ─── 7. Tax Records (GST for India) ──────────────────────────
CREATE TABLE IF NOT EXISTS tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT,
  user_id UUID NOT NULL,
  gst_number TEXT,
  cgst_paise INTEGER NOT NULL DEFAULT 0,
  sgst_paise INTEGER NOT NULL DEFAULT 0,
  igst_paise INTEGER NOT NULL DEFAULT 0,
  total_tax_paise INTEGER NOT NULL DEFAULT 0,
  tax_period TEXT NOT NULL, -- 'YYYY-MM'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 8. Service Quotas and Limits ────────────────────────────
CREATE TABLE IF NOT EXISTS service_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  quota_limit NUMERIC NOT NULL,
  quota_used NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  reset_period TEXT NOT NULL DEFAULT 'monthly',
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_type)
);

-- ─── 9. Foreign Key Verification for tax_records ─────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hosting_invoices' AND column_name = 'id' AND data_type = 'text'
  ) THEN
    ALTER TABLE tax_records ADD CONSTRAINT fk_tax_records_invoice FOREIGN KEY (invoice_id) REFERENCES hosting_invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── 10. Indexes for Performance & Partition Queries ─────────
CREATE INDEX IF NOT EXISTS idx_usage_records_user ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_period_start ON usage_records(billing_period_start);
CREATE INDEX IF NOT EXISTS idx_usage_records_created ON usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_service ON usage_records(service_id);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created ON credit_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_ref ON credit_ledger(reference_id);

CREATE INDEX IF NOT EXISTS idx_credit_balances_user ON credit_balances(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created ON subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_resellers_user ON resellers(user_id);
CREATE INDEX IF NOT EXISTS idx_resellers_status ON resellers(status);

CREATE INDEX IF NOT EXISTS idx_reseller_customers_reseller ON reseller_customers(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_customers_customer ON reseller_customers(customer_user_id);

CREATE INDEX IF NOT EXISTS idx_tax_records_user ON tax_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_invoice ON tax_records(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_period ON tax_records(tax_period);
CREATE INDEX IF NOT EXISTS idx_tax_records_created ON tax_records(created_at);

CREATE INDEX IF NOT EXISTS idx_service_quotas_user ON service_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_service_quotas_product ON service_quotas(product_type);

-- ─── 11. Security Helper Functions ───────────────────────────
CREATE OR REPLACE FUNCTION is_admin_user(p_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = p_uid AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION is_reseller_for_customer(p_reseller_uid UUID, p_customer_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM reseller_customers rc
    JOIN resellers r ON rc.reseller_id = r.id
    WHERE r.user_id = p_reseller_uid AND rc.customer_user_id = p_customer_uid
  );
$$;

-- ─── 12. Row Level Security (RLS) ────────────────────────────

-- Enable RLS on all new tables
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_quotas ENABLE ROW LEVEL SECURITY;

-- 12.1. usage_records
DROP POLICY IF EXISTS "usage_records_select_policy" ON usage_records;
CREATE POLICY "usage_records_select_policy" ON usage_records
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "usage_records_admin_all" ON usage_records;
CREATE POLICY "usage_records_admin_all" ON usage_records
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "usage_records_service_role" ON usage_records;
CREATE POLICY "usage_records_service_role" ON usage_records
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.2. credit_ledger
DROP POLICY IF EXISTS "credit_ledger_select_policy" ON credit_ledger;
CREATE POLICY "credit_ledger_select_policy" ON credit_ledger
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "credit_ledger_admin_all" ON credit_ledger;
CREATE POLICY "credit_ledger_admin_all" ON credit_ledger
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "credit_ledger_service_role" ON credit_ledger;
CREATE POLICY "credit_ledger_service_role" ON credit_ledger
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.3. credit_balances
DROP POLICY IF EXISTS "credit_balances_select_policy" ON credit_balances;
CREATE POLICY "credit_balances_select_policy" ON credit_balances
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "credit_balances_admin_all" ON credit_balances;
CREATE POLICY "credit_balances_admin_all" ON credit_balances
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "credit_balances_service_role" ON credit_balances;
CREATE POLICY "credit_balances_service_role" ON credit_balances
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.4. subscriptions
DROP POLICY IF EXISTS "subscriptions_select_policy" ON subscriptions;
CREATE POLICY "subscriptions_select_policy" ON subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "subscriptions_user_update" ON subscriptions;
CREATE POLICY "subscriptions_user_update" ON subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions_admin_all" ON subscriptions;
CREATE POLICY "subscriptions_admin_all" ON subscriptions
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "subscriptions_service_role" ON subscriptions;
CREATE POLICY "subscriptions_service_role" ON subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.5. resellers
DROP POLICY IF EXISTS "resellers_select_policy" ON resellers;
CREATE POLICY "resellers_select_policy" ON resellers
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
  );

DROP POLICY IF EXISTS "resellers_admin_all" ON resellers;
CREATE POLICY "resellers_admin_all" ON resellers
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "resellers_service_role" ON resellers;
CREATE POLICY "resellers_service_role" ON resellers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.6. reseller_customers
DROP POLICY IF EXISTS "reseller_customers_select_policy" ON reseller_customers;
CREATE POLICY "reseller_customers_select_policy" ON reseller_customers
  FOR SELECT TO authenticated
  USING (
    customer_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM resellers r WHERE r.id = reseller_customers.reseller_id AND r.user_id = auth.uid())
    OR is_admin_user(auth.uid())
  );

DROP POLICY IF EXISTS "reseller_customers_admin_all" ON reseller_customers;
CREATE POLICY "reseller_customers_admin_all" ON reseller_customers
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "reseller_customers_service_role" ON reseller_customers;
CREATE POLICY "reseller_customers_service_role" ON reseller_customers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.7. tax_records
DROP POLICY IF EXISTS "tax_records_select_policy" ON tax_records;
CREATE POLICY "tax_records_select_policy" ON tax_records
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "tax_records_admin_all" ON tax_records;
CREATE POLICY "tax_records_admin_all" ON tax_records
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "tax_records_service_role" ON tax_records;
CREATE POLICY "tax_records_service_role" ON tax_records
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.8. service_quotas
DROP POLICY IF EXISTS "service_quotas_select_policy" ON service_quotas;
CREATE POLICY "service_quotas_select_policy" ON service_quotas
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "service_quotas_admin_all" ON service_quotas;
CREATE POLICY "service_quotas_admin_all" ON service_quotas
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "service_quotas_service_role" ON service_quotas;
CREATE POLICY "service_quotas_service_role" ON service_quotas
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
