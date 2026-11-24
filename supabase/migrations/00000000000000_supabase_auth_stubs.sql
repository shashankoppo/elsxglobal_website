-- ================================================================
-- Supabase Auth Stubs (Safe Idempotent Migration)
-- ================================================================
-- This migration runs from the APP container's migration runner.
-- By this point, 99-role-passwords.sh has already created roles,
-- auth schema, functions, and grants during DB first-boot.
--
-- This file is kept as a SAFETY NET for cases where:
-- 1. The DB was initialized without the init script
-- 2. The init script didn't run (non-first-boot)
-- 3. Functions need updating after a schema change
--
-- Everything here uses IF NOT EXISTS / CREATE OR REPLACE,
-- so it's fully idempotent and safe to run multiple times.
-- ================================================================

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Ensure roles exist (passwords NOT set here — that's the init script's job)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS;
  ELSE
    ALTER ROLE supabase_auth_admin WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS;
  ELSE
    ALTER ROLE supabase_storage_admin WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN;
  END IF;
END
$$;

-- Role switching grants (idempotent)
GRANT anon           TO authenticator;
GRANT authenticated  TO authenticator;
GRANT service_role   TO authenticator;
GRANT supabase_admin TO authenticator;

-- auth.users table definition matching official GoTrue schema
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id     uuid NULL,
  id              uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  aud             varchar(255) NULL,
  "role"          varchar(255) NULL,
  email           text,
  encrypted_password varchar(255) NULL,
  confirmed_at    timestamptz NULL,
  invited_at      timestamptz NULL,
  confirmation_token varchar(255) NULL,
  confirmation_sent_at timestamptz NULL,
  recovery_token  varchar(255) NULL,
  recovery_sent_at timestamptz NULL,
  email_change_token varchar(255) NULL,
  email_change    varchar(255) NULL,
  email_change_sent_at timestamptz NULL,
  last_sign_in_at timestamptz NULL,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_app_meta_data  jsonb DEFAULT '{}'::jsonb,
  is_super_admin  bool NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  CONSTRAINT users_email_key UNIQUE (email)
);

-- Ensure all columns exist even if table was previously created with minimal columns
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS instance_id uuid;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS aud varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS "role" varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS encrypted_password varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS invited_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmation_token varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS recovery_token varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS recovery_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_token varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_super_admin bool;

GRANT ALL    ON auth.users TO supabase_auth_admin;
GRANT SELECT ON auth.users TO authenticated, service_role;

-- auth.uid()
CREATE OR REPLACE FUNCTION auth.uid()
  RETURNS uuid LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  )::uuid
$$;

-- auth.role()
CREATE OR REPLACE FUNCTION auth.role()
  RETURNS text LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
  )::text
$$;

-- auth.email()
CREATE OR REPLACE FUNCTION auth.email()
  RETURNS text LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.email', true),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
  )::text
$$;

-- auth.jwt()
CREATE OR REPLACE FUNCTION auth.jwt()
  RETURNS jsonb LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb,
    '{}'::jsonb
  )
$$;

-- Schema and function grants
GRANT USAGE   ON SCHEMA auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid()   TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.role()  TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.jwt()   TO anon, authenticated, service_role;

-- Public schema grants for PostgREST & Auth/Storage services
GRANT ALL    ON SCHEMA public TO postgres, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
GRANT ALL    ON ALL TABLES    IN SCHEMA public TO postgres, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
GRANT ALL    ON ALL SEQUENCES IN SCHEMA public TO postgres, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
GRANT ALL    ON ALL ROUTINES  IN SCHEMA public TO postgres, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES    TO postgres, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO postgres, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON ROUTINES  TO postgres, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
