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

-- Ensure pgcrypto extension exists for password hashing and UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Enums used by Supabase GoTrue
DO $$ BEGIN
  CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn', 'phone');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. auth.instances
CREATE TABLE IF NOT EXISTS auth.instances (
  id uuid PRIMARY KEY,
  uuid uuid,
  raw_base_config text,
  created_at timestamptz,
  updated_at timestamptz
);

-- 2. auth.users table definition matching official GoTrue schema
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id     uuid NULL,
  id              uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  aud             varchar(255) DEFAULT 'authenticated',
  "role"          varchar(255) DEFAULT 'authenticated',
  email           text,
  encrypted_password varchar(255) NULL,
  email_confirmed_at timestamptz DEFAULT now(),
  invited_at      timestamptz NULL,
  confirmation_token varchar(255) NULL,
  confirmation_sent_at timestamptz NULL,
  recovery_token  varchar(255) NULL,
  recovery_sent_at timestamptz NULL,
  email_change_token varchar(255) NULL,
  email_change_token_new varchar(255) NULL,
  email_change    varchar(255) NULL,
  email_change_sent_at timestamptz NULL,
  last_sign_in_at timestamptz NULL,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  raw_app_meta_data  jsonb DEFAULT '{"provider":"email","providers":["email"]}'::jsonb,
  is_super_admin  bool DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  phone           text DEFAULT NULL,
  phone_confirmed_at timestamptz,
  phone_change    text DEFAULT '',
  phone_change_token varchar(255) DEFAULT '',
  phone_change_sent_at timestamptz,
  confirmed_at    timestamptz DEFAULT now(),
  email_change_token_current varchar(255) DEFAULT '',
  email_change_confirm_status smallint DEFAULT 0,
  banned_until    timestamptz,
  reauthentication_token varchar(255) DEFAULT '',
  reauthentication_sent_at timestamptz,
  is_sso_user     bool DEFAULT false,
  deleted_at      timestamptz,
  is_anonymous    bool DEFAULT false,
  CONSTRAINT users_email_key UNIQUE (email)
);

-- Ensure all columns exist even if table was previously created with minimal columns
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS instance_id uuid;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS aud varchar(255) DEFAULT 'authenticated';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS "role" varchar(255) DEFAULT 'authenticated';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS encrypted_password varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_confirmed_at timestamptz DEFAULT now();
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmed_at timestamptz DEFAULT now();
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS invited_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmation_token varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS recovery_token varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS recovery_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_token varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_token_new varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change varchar(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_app_meta_data jsonb DEFAULT '{"provider":"email","providers":["email"]}'::jsonb;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_super_admin bool DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone text DEFAULT NULL;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_confirmed_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change text DEFAULT '';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change_token varchar(255) DEFAULT '';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_change_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_token_current varchar(255) DEFAULT '';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_change_confirm_status smallint DEFAULT 0;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS banned_until timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS reauthentication_token varchar(255) DEFAULT '';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS reauthentication_sent_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_sso_user bool DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_anonymous bool DEFAULT false;

-- 3. auth.identities
CREATE TABLE IF NOT EXISTS auth.identities (
  provider_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email text GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider)
);

-- 4. auth.sessions
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  factor_id uuid,
  aal auth.aal_level,
  not_after timestamptz,
  refreshed_at timestamptz,
  user_agent text,
  ip inet,
  tag text
);

-- 5. auth.refresh_tokens
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  instance_id uuid,
  id bigserial PRIMARY KEY,
  token varchar(255) UNIQUE,
  user_id varchar(255),
  revoked boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  parent varchar(255),
  session_id uuid REFERENCES auth.sessions(id) ON DELETE CASCADE
);

-- 6. auth.audit_log_entries
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  instance_id uuid,
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  payload json,
  created_at timestamptz DEFAULT now(),
  ip_address varchar(64) DEFAULT ''
);

-- 7. auth.mfa_factors
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friendly_name text,
  factor_type auth.factor_type NOT NULL,
  status auth.factor_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  secret text,
  phone text,
  last_challenged_at timestamptz
);

-- 8. auth.mfa_challenges
CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_id uuid NOT NULL REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  ip_address inet NOT NULL,
  otp_code text
);

-- 9. auth.mfa_amr_claims
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
  session_id uuid NOT NULL REFERENCES auth.sessions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  authentication_method text NOT NULL,
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method)
);

-- 10. auth.flow_state
CREATE TABLE IF NOT EXISTS auth.flow_state (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  auth_code text NOT NULL,
  code_challenge_method auth.code_challenge_method NOT NULL,
  code_challenge text NOT NULL,
  provider_type text NOT NULL,
  provider_access_token text,
  provider_refresh_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  authentication_method text NOT NULL,
  auth_code_issued_at timestamptz
);

-- Seed Master Admin & Demo Client with verified bcrypt credentials
DO $$
DECLARE
  v_admin_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_client_id uuid := 'c0000000-0000-0000-0000-000000000001'::uuid;
  v_admin_hash text;
  v_client_hash text;
BEGIN
  -- Generate bcrypt hashes with blowfish (standard GoTrue bcrypt)
  v_admin_hash := crypt('Admin@2026!', gen_salt('bf', 10));
  v_client_hash := crypt('Demo@2026!', gen_salt('bf', 10));

  -- Seed admin user in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@elsxglobal.com') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
      'admin@elsxglobal.com', v_admin_hash, now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Master Admin","role":"superadmin"}'::jsonb,
      true, now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = v_admin_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmed_at = COALESCE(confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        is_super_admin = true
    WHERE email = 'admin@elsxglobal.com';
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@elsxglobal.com';
  END IF;

  -- Ensure identity exists for admin
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_admin_id AND provider = 'email') THEN
    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_admin_id, v_admin_id::text, v_admin_id,
      json_build_object('sub', v_admin_id::text, 'email', 'admin@elsxglobal.com')::jsonb,
      'email', now(), now(), now()
    );
  END IF;

  -- Seed client user in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@elsxglobal.com') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at
    ) VALUES (
      v_client_id, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
      'client@elsxglobal.com', v_client_hash, now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Client"}'::jsonb,
      false, now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = v_client_hash,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmed_at = COALESCE(confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb
    WHERE email = 'client@elsxglobal.com';
    SELECT id INTO v_client_id FROM auth.users WHERE email = 'client@elsxglobal.com';
  END IF;

  -- Ensure identity exists for client
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_client_id AND provider = 'email') THEN
    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_client_id, v_client_id::text, v_client_id,
      json_build_object('sub', v_client_id::text, 'email', 'client@elsxglobal.com')::jsonb,
      'email', now(), now(), now()
    );
  END IF;
END $$;

-- Table permissions for auth service
GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
GRANT SELECT ON auth.users TO authenticated, service_role, anon;
GRANT SELECT ON auth.identities TO authenticated, service_role;
GRANT SELECT ON auth.sessions TO authenticated, service_role;

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
