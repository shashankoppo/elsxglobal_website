/*
# Fix Admin Schema and Security

1. New Tables
- `admin_sessions` — stores issued admin tokens for server-side validation.
  - `id` (uuid, PK)
  - `admin_id` (uuid, FK to admin_users)
  - `token` (text, unique, not null) — the token string
  - `expires_at` (timestamptz, not null)
  - `created_at` (timestamptz, default now())
  - `revoked` (boolean, default false)

2. Modified Tables
- `support_tickets` — add `order_id` column (uuid, nullable, FK to hosting_orders) so tickets can be linked to orders.

3. Security Changes
- Enable RLS on `admin_sessions`.
- `admin_sessions` has no SELECT/INSERT/UPDATE/DELETE policies for any role — only the service role (edge functions) can access it.
- Fix `admin_users` SELECT policy: change from `USING (true)` (which leaks all admin emails to any authenticated user) to `USING (false)` — only the service role can read admin users.
- Add index on `admin_sessions.token` for fast lookups.

4. Important Notes
- The admin_sessions table replaces the previous forgeable token scheme. The admin-auth edge function will now store issued tokens here and verify them on every request.
- The support_tickets.order_id column fixes the schema mismatch where admin-auth's order-detail action queried a non-existent column.
- The admin_users RLS fix prevents any logged-in non-admin user from reading the admin roster.
*/

-- Add order_id to support_tickets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  revoked boolean NOT NULL DEFAULT false
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- No policies: only service role can access admin_sessions

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- Fix admin_users SELECT policy: was USING(true), now USING(false)
DROP POLICY IF EXISTS "read_admin_users" ON admin_users;
CREATE POLICY "read_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (false);

-- Keep the service-role-only insert/update/delete policies as-is
-- (they already have WITH CHECK (false) / USING (false) which is correct)
