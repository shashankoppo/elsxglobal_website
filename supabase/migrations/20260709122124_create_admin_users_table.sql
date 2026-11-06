
-- Admin users table for admin panel access control
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can read the table (to check their own admin status)
-- Also allow authenticated users to check if they are admin (for login redirect)
CREATE POLICY "read_admin_users" ON admin_users
  FOR SELECT TO authenticated USING (true);

-- Only service role can insert/update/delete (via edge functions or SQL)
CREATE POLICY "insert_admin_users" ON admin_users
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "update_admin_users" ON admin_users
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "delete_admin_users" ON admin_users
  FOR DELETE TO authenticated USING (false);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
