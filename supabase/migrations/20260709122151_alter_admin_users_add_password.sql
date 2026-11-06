
-- Add password_hash column to admin_users for standalone auth
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name text;

-- Drop the restrictive insert policy so the edge function (service role) can insert
DROP POLICY IF EXISTS "insert_admin_users" ON admin_users;
DROP POLICY IF EXISTS "update_admin_users" ON admin_users;
DROP POLICY IF EXISTS "delete_admin_users" ON admin_users;

-- Service role bypasses RLS, so these policies are for authenticated users
-- Allow authenticated users to read (for admin check)
-- Keep insert/update/delete restricted to service role (which bypasses RLS)
CREATE POLICY "insert_admin_users_service" ON admin_users
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "update_admin_users_service" ON admin_users
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "delete_admin_users_service" ON admin_users
  FOR DELETE TO authenticated USING (false);
