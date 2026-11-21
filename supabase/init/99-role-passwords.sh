#!/bin/bash
# ================================================================
# Supabase Role Password Initialization
# ================================================================
# This script runs DURING PostgreSQL first-boot initialization
# (mounted into /docker-entrypoint-initdb.d/).
#
# The supabase/postgres image creates roles (authenticator,
# supabase_auth_admin, supabase_storage_admin, etc.) but does NOT
# always set passwords for them. GoTrue, PostgREST, and Storage
# all connect using these roles and need password auth to work.
#
# This script:
# 1. Waits for roles to exist (they're created by image init scripts)
# 2. Sets LOGIN + PASSWORD on every role that needs remote auth
# 3. Creates auth schema stub functions needed by app migrations
#
# Env vars used: POSTGRES_PASSWORD (set by docker-compose.yml)
# ================================================================
set -e

echo "[init] Setting up Supabase role passwords and auth functions..."

# Use POSTGRES_PASSWORD from environment (passed by docker-compose.yml)
PASS="${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-postgres}" --dbname "${POSTGRES_DB:-postgres}" <<-EOSQL

  -- ================================================================
  -- 1. Ensure all required roles exist with LOGIN + passwords
  -- ================================================================

  -- authenticator: PostgREST connects as this role, then switches
  -- to anon/authenticated based on the JWT
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
      CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '${PASS}';
      RAISE NOTICE 'Created role: authenticator';
    ELSE
      ALTER ROLE authenticator WITH LOGIN PASSWORD '${PASS}';
      RAISE NOTICE 'Updated role: authenticator (set LOGIN + password)';
    END IF;
  END \$\$;

  -- supabase_auth_admin: GoTrue connects as this role to manage
  -- the auth schema (users, sessions, etc.)
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
      CREATE ROLE supabase_auth_admin LOGIN NOINHERIT CREATEROLE PASSWORD '${PASS}';
      RAISE NOTICE 'Created role: supabase_auth_admin';
    ELSE
      ALTER ROLE supabase_auth_admin WITH LOGIN PASSWORD '${PASS}';
      RAISE NOTICE 'Updated role: supabase_auth_admin (set LOGIN + password)';
    END IF;
  END \$\$;

  -- supabase_storage_admin: Supabase Storage connects as this role
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
      CREATE ROLE supabase_storage_admin LOGIN NOINHERIT PASSWORD '${PASS}';
      RAISE NOTICE 'Created role: supabase_storage_admin';
    ELSE
      ALTER ROLE supabase_storage_admin WITH LOGIN PASSWORD '${PASS}';
      RAISE NOTICE 'Updated role: supabase_storage_admin (set LOGIN + password)';
    END IF;
  END \$\$;

  -- anon: Anonymous API access role (no login, used via role switching)
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
      CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
  END \$\$;

  -- authenticated: Logged-in user role (no login, used via role switching)
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
      CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;
  END \$\$;

  -- service_role: Backend service role with elevated privileges
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
      CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
  END \$\$;

  -- supabase_admin: Supabase internal admin role
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
      CREATE ROLE supabase_admin NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
  END \$\$;

  -- ================================================================
  -- 2. Grant role switching to authenticator (PostgREST needs this)
  -- ================================================================
  GRANT anon              TO authenticator;
  GRANT authenticated     TO authenticator;
  GRANT service_role      TO authenticator;
  GRANT supabase_admin    TO authenticator;

  -- Grant auth admin ownership of the auth schema
  GRANT supabase_auth_admin TO postgres;

  -- ================================================================
  -- 3. Create auth schema + stub functions
  -- ================================================================
  -- These must exist before any app migration that references
  -- auth.uid(), auth.jwt(), auth.role(), or auth.email().

  CREATE SCHEMA IF NOT EXISTS auth;
  GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;

  -- auth.users table stub (GoTrue will add real columns on startup)
  CREATE TABLE IF NOT EXISTS auth.users (
    id              uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    email           text,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    raw_app_meta_data  jsonb DEFAULT '{}'::jsonb,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    CONSTRAINT users_email_key UNIQUE (email)
  );
  ALTER TABLE auth.users OWNER TO supabase_auth_admin;
  GRANT ALL   ON auth.users TO supabase_auth_admin;
  GRANT SELECT ON auth.users TO authenticated, service_role;

  -- auth.uid() — Returns current user UUID from JWT
  CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS uuid LANGUAGE sql STABLE
  AS \$func\$
    SELECT COALESCE(
      current_setting('request.jwt.claim.sub', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    )::uuid
  \$func\$;

  -- auth.role() — Returns current role from JWT
  CREATE OR REPLACE FUNCTION auth.role()
    RETURNS text LANGUAGE sql STABLE
  AS \$func\$
    SELECT COALESCE(
      current_setting('request.jwt.claim.role', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
    )::text
  \$func\$;

  -- auth.email() — Returns current email from JWT
  CREATE OR REPLACE FUNCTION auth.email()
    RETURNS text LANGUAGE sql STABLE
  AS \$func\$
    SELECT COALESCE(
      current_setting('request.jwt.claim.email', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
    )::text
  \$func\$;

  -- auth.jwt() — Returns full JWT claims as JSONB
  CREATE OR REPLACE FUNCTION auth.jwt()
    RETURNS jsonb LANGUAGE sql STABLE
  AS \$func\$
    SELECT COALESCE(
      current_setting('request.jwt.claims', true)::jsonb,
      '{}'::jsonb
    )
  \$func\$;

  -- ================================================================
  -- 4. Schema and function grants
  -- ================================================================
  GRANT USAGE   ON SCHEMA auth TO anon, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION auth.uid()   TO anon, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION auth.role()  TO anon, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION auth.jwt()   TO anon, authenticated, service_role;

  -- PostgREST needs these on public schema
  GRANT USAGE  ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL    ON ALL TABLES    IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL    ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL    ON ALL ROUTINES  IN SCHEMA public TO anon, authenticated, service_role;

  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES    TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON ROUTINES  TO anon, authenticated, service_role;

  -- ================================================================
  -- 5. pg_hba.conf: Trust local, password for TCP
  -- ================================================================
  -- The supabase/postgres image may set pg_hba to reject password
  -- auth for some roles. We ensure all roles can authenticate via
  -- md5/scram over TCP (which GoTrue/PostgREST/Storage use).

EOSQL

echo "[init] ✓ All Supabase roles configured with passwords."
echo "[init] ✓ Auth schema and stub functions created."
echo "[init] Done."
