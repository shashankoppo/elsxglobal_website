/*
# Create payment_settings, site_settings, and transactions tables

1. New Tables
- `payment_settings` (single-row, admin-controlled config for Razorpay/UPI/Bank/Custom QR)
- `site_settings` (single-row, org metadata + trust badges JSON)
- `transactions` (payment audit log per order)

2. payment_settings columns
- id int primary key default 1 (enforces single row)
- razorpay_enabled, razorpay_key_id, razorpay_key_secret, razorpay_mode
- upi_enabled, upi_id, upi_display_name
- bank_transfer_enabled, bank_details jsonb
- custom_qr_image_url text (Supabase Storage URL, overrides dynamic QR)
- updated_at timestamptz

3. site_settings columns
- id int primary key default 1
- org_name, tagline, support_email, support_phone
- trust_badges jsonb (array of {id, name, logo_url, verify_url, verified, display})
- seo_defaults jsonb, updated_at

4. transactions columns
- id uuid, order_id (FK to hosting_orders), user_id, amount, currency
- gateway, gateway_transaction_id, status, metadata, created_at

5. Security (RLS)
- payment_settings: admin-only via auth.jwt() email match against admin_users.
  A public view `public_payment_settings` exposes non-secret columns to anon/authenticated.
- site_settings: public read; admin write.
- transactions: owner read own; admin read all; owner insert own.

6. Important notes
- Single-row enforced via CHECK(id=1).
- Admin check uses auth.jwt() ->> 'email' to match admin_users.email.
- The public view never exposes razorpay_key_secret.
*/

-- payment_settings
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

INSERT INTO payment_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Public view (no secret)
CREATE OR REPLACE VIEW public_payment_settings AS
SELECT
  id,
  razorpay_enabled,
  razorpay_key_id,
  razorpay_mode,
  upi_enabled,
  upi_id,
  upi_display_name,
  bank_transfer_enabled,
  bank_details,
  custom_qr_image_url,
  updated_at
FROM payment_settings;

GRANT SELECT ON public_payment_settings TO anon, authenticated;

-- site_settings
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

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

INSERT INTO site_settings (id, trust_badges) VALUES (
  1,
  '[{"id":"meta-partner","name":"Meta Business Partner","logo_url":"","verify_url":"https://www.facebook.com/business/partner-directory","verified":true,"display":true},{"id":"godaddy-reseller","name":"GoDaddy Authorized Reseller","logo_url":"","verify_url":"https://godaddy.com","verified":true,"display":true},{"id":"aws-partner","name":"AWS Partner Network","logo_url":"","verify_url":"https://aws.amazon.com/partners","verified":true,"display":true},{"id":"microsoft-partner","name":"Microsoft Cloud Partner","logo_url":"","verify_url":"https://partner.microsoft.com","verified":true,"display":true},{"id":"google-cloud","name":"Google Cloud Partner","logo_url":"","verify_url":"https://cloud.google.com/partners","verified":true,"display":true},{"id":"iso-27001","name":"ISO 27001 Certified","logo_url":"","verify_url":"","verified":true,"display":true}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- transactions
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
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_read_transactions" ON transactions;
CREATE POLICY "admin_read_transactions" ON transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "owner_insert_transactions" ON transactions;
CREATE POLICY "owner_insert_transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
