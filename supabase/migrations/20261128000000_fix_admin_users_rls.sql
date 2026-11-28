-- ================================================================
-- Fix admin_users RLS: USING(false) blocked ALL reads including
-- service_role, breaking every subquery that checks admin status.
-- Correct policy: authenticated = no access; service_role = full access.
-- ================================================================

-- Remove the broken policy that was USING(false) for authenticated
-- (which also implicitly blocked service_role in some PG configs)
DROP POLICY IF EXISTS "read_admin_users" ON admin_users;

-- service_role reads all (needed for internal admin-auth checks)
CREATE POLICY "admin_users_service_role_all" ON admin_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- authenticated users: NO access (can never read admin roster via PostgREST)
CREATE POLICY "admin_users_authenticated_deny" ON admin_users
  FOR ALL TO authenticated USING (false);

-- anon: NO access
CREATE POLICY "admin_users_anon_deny" ON admin_users
  FOR ALL TO anon USING (false);
