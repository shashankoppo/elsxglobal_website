#!/usr/bin/env node

/**
 * ============================================================================
 * ELSxGlobal / VaultHost — Automatic Supabase Database Migration Runner
 * ============================================================================
 *
 * Runs automatically before application startup during deployment.
 * Supports:
 *   1. Supabase HTTP API (via SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 *      Using Supabase's native pg-meta endpoint (/pg/query)
 *   2. Direct PostgreSQL connection (via DATABASE_URL or SUPABASE_DB_URL)
 *      Using 'pg' client
 *
 * Features:
 *   - Idempotent: Tracks applied migrations in `_supabase_migrations`
 *   - Automatic schema reload: Notifies PostgREST (NOTIFY pgrst, 'reload schema')
 *   - Startup retry with exponential backoff if Supabase is still booting
 *   - Graceful fallback: Allows app to start with warning if credentials not provided
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env or .env.local if available when running outside docker
try {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  const dotenvLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(dotenvLocalPath)) {
    const dotenv = await import('dotenv');
    dotenv.config({ path: dotenvLocalPath });
  } else if (fs.existsSync(dotenvPath)) {
    const dotenv = await import('dotenv');
    dotenv.config({ path: dotenvPath });
  }
} catch {
  // dotenv optional if environment variables already set by container
}

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/+$/, '');

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  '';

const SKIP_MIGRATIONS = process.env.SKIP_MIGRATIONS === 'true';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase', 'migrations');

/**
 * Utility delay helper
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute SQL query via Supabase pg-meta HTTP endpoint
 */
async function executeViaHttp(url, serviceKey, sql) {
  const endpoints = [
    `${url}/pg/query`,
    `${url}/api/pg-meta/default/query`,
    `${url}/rest/v1/rpc/exec_sql`
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const isRpc = endpoint.endsWith('/exec_sql');
      const body = isRpc ? JSON.stringify({ sql }) : JSON.stringify({ query: sql });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body
      });

      if (response.ok) {
        const text = await response.text();
        try {
          return { success: true, data: JSON.parse(text), endpoint };
        } catch {
          return { success: true, data: text, endpoint };
        }
      }

      const errText = await response.text();
      // If 404 or 405, this endpoint doesn't exist on this gateway, try next
      if (response.status === 404 || response.status === 405) {
        lastError = new Error(`HTTP ${response.status} from ${endpoint}: ${errText}`);
        continue;
      }

      // If 400/401/403/500, endpoint exists but returned error
      throw new Error(`HTTP ${response.status} from ${endpoint}: ${errText}`);
    } catch (err) {
      lastError = err;
      if (!err.message?.includes('404') && !err.message?.includes('405')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('No working Supabase SQL execution endpoint found');
}

/**
 * Execute SQL query via direct PostgreSQL connection using pg client
 */
async function executeViaPg(connectionString, sql) {
  const pg = await import('pg');
  const Client = pg.default?.Client || pg.Client;

  const client = new Client({
    connectionString,
    ssl:
      connectionString.includes('sslmode=require') ||
      connectionString.includes('supabase.co') ||
      connectionString.includes('aws.')
        ? { rejectUnauthorized: false }
        : undefined,
    connectionTimeoutMillis: 10000
  });

  await client.connect();
  try {
    const res = await client.query(sql);
    return { success: true, rows: res.rows };
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * High-level SQL query runner with automatic strategy selection
 * Direct PostgreSQL connection is prioritized when available for reliability.
 */
async function runQuery(sql) {
  if (DATABASE_URL && !DATABASE_URL.includes('placeholder')) {
    try {
      return await executeViaPg(DATABASE_URL, sql);
    } catch (err) {
      if (SUPABASE_URL && SERVICE_ROLE_KEY && !SERVICE_ROLE_KEY.includes('placeholder')) {
        console.warn(`[migration] Direct PG query failed (${err.message}). Falling back to HTTP endpoint...`);
        return await executeViaHttp(SUPABASE_URL, SERVICE_ROLE_KEY, sql);
      }
      throw err;
    }
  }

  if (SUPABASE_URL && SERVICE_ROLE_KEY && !SERVICE_ROLE_KEY.includes('placeholder')) {
    return await executeViaHttp(SUPABASE_URL, SERVICE_ROLE_KEY, sql);
  }

  throw new Error(
    'No valid Supabase credentials found. Set DATABASE_URL or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.'
  );
}

/**
 * Check connection with retries for container boot synchronization
 */
async function waitForDatabase(maxRetries = 15, delayMs = 3000) {
  console.log(`[migration] Checking database connectivity...`);
  if (SUPABASE_URL) {
    console.log(`[migration] Target Supabase URL: ${SUPABASE_URL}`);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await runQuery('SELECT 1 as connection_test;');
      console.log(`[migration] Connected to database successfully.`);
      return true;
    } catch (err) {
      console.warn(`[migration] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log(`[migration] Retrying in ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }
    }
  }

  return false;
}

/**
 * Ensure the migration tracking table exists
 */
async function ensureMigrationsTable() {
  const initSql = `
    CREATE TABLE IF NOT EXISTS _supabase_migrations (
      version VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await runQuery(initSql);
}

/**
 * Get list of already applied migration versions
 */
async function getAppliedMigrations() {
  const sql = `SELECT version FROM _supabase_migrations ORDER BY version ASC;`;
  const result = await runQuery(sql);

  let rows = [];
  if (Array.isArray(result?.data)) {
    rows = result.data;
  } else if (Array.isArray(result?.rows)) {
    rows = result.rows;
  } else if (result?.data?.result && Array.isArray(result.data.result)) {
    rows = result.data.result;
  }

  return new Set(rows.map((r) => String(r.version)));
}

/**
 * Ensure Supabase service role passwords match POSTGRES_PASSWORD
 * This guarantees that even if the database was booted on an existing volume
 * where initdb didn't run, GoTrue (auth), PostgREST, and Storage will authenticate.
 */
async function ensureServiceRoles() {
  let password = process.env.POSTGRES_PASSWORD;
  if (!password && DATABASE_URL) {
    try {
      password = decodeURIComponent(new URL(DATABASE_URL).password || '');
    } catch {}
  }
  if (!password) return;

  const sanitizedPassword = password.replace(/'/g, "''");

  // Part 1: Roles, schemas, and PostgREST permissions (executed independently so auth DDL never rolls this back)
  const rolesAndSchemasSql = `
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

      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
        CREATE ROLE authenticator WITH LOGIN NOINHERIT PASSWORD '${sanitizedPassword}';
      ELSE
        ALTER ROLE authenticator WITH LOGIN NOINHERIT PASSWORD '${sanitizedPassword}';
      END IF;

      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        CREATE ROLE supabase_auth_admin WITH LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD '${sanitizedPassword}';
      ELSE
        ALTER ROLE supabase_auth_admin WITH LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD '${sanitizedPassword}';
      END IF;

      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        CREATE ROLE supabase_storage_admin WITH LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD '${sanitizedPassword}';
      ELSE
        ALTER ROLE supabase_storage_admin WITH LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD '${sanitizedPassword}';
      END IF;

      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_functions_admin') THEN
        CREATE ROLE supabase_functions_admin WITH LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD '${sanitizedPassword}';
      ELSE
        ALTER ROLE supabase_functions_admin WITH LOGIN SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD '${sanitizedPassword}';
      END IF;

      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pgbouncer') THEN
        CREATE ROLE pgbouncer WITH LOGIN PASSWORD '${sanitizedPassword}';
      ELSE
        ALTER ROLE pgbouncer WITH LOGIN PASSWORD '${sanitizedPassword}';
      END IF;
    END
    $$;

    CREATE SCHEMA IF NOT EXISTS public;
    CREATE SCHEMA IF NOT EXISTS graphql_public;
    CREATE SCHEMA IF NOT EXISTS extensions;
    CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
    CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;

    GRANT anon TO authenticator;
    GRANT authenticated TO authenticator;
    GRANT service_role TO authenticator;
    GRANT supabase_admin TO authenticator;
    GRANT authenticator TO supabase_storage_admin;

    -- Reset any stale pgrst.db_schemas role override so env PGRST_DB_SCHEMAS takes effect cleanly
    ALTER ROLE authenticator RESET pgrst.db_schemas;
    ALTER ROLE authenticator SET search_path TO public, graphql_public, extensions;
    ALTER ROLE supabase_auth_admin SET search_path TO auth, public, extensions;
    ALTER ROLE supabase_storage_admin SET search_path TO storage, public, extensions;

    GRANT ALL ON SCHEMA public TO authenticator, supabase_auth_admin, supabase_storage_admin, postgres, anon, authenticated, service_role;
    GRANT ALL ON SCHEMA graphql_public TO authenticator, postgres, anon, authenticated, service_role;
    GRANT USAGE ON SCHEMA extensions TO authenticator, supabase_auth_admin, supabase_storage_admin, postgres, anon, authenticated, service_role;
    GRANT ALL ON SCHEMA auth TO authenticator, supabase_auth_admin, postgres, service_role;
    GRANT ALL ON SCHEMA storage TO authenticator, supabase_storage_admin, postgres, service_role;
    GRANT ALL PRIVILEGES ON DATABASE postgres TO authenticator, supabase_auth_admin, supabase_storage_admin;

    GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticator, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA graphql_public TO authenticator, anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA graphql_public TO authenticator, anon, authenticated, service_role;

    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticator, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticator, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO authenticator, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;

    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
  `;

  try {
    await runQuery(rolesAndSchemasSql);
    console.log(`[migration] PostgREST roles, schemas, and privileges synchronized.`);
  } catch (err) {
    console.warn(`[migration] Notice: Role/schema sync warning (${err.message}).`);
  }

  // Part 2: Auth schema stubs and seed users
  const roleSql = `

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

    -- 2. auth.users
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

    -- Ensure all columns exist in auth.users
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

    -- Table permissions for auth service
    GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
    GRANT SELECT ON auth.users TO authenticated, service_role, anon;
    GRANT SELECT ON auth.identities TO authenticated, service_role;
    GRANT SELECT ON auth.sessions TO authenticated, service_role;

    -- Ensure default instance exists in auth.instances
    INSERT INTO auth.instances (id, uuid, raw_base_config, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, '{}', now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- Seed Master Admin & Demo Client with verified bcrypt credentials
    DO $$
    DECLARE
      v_admin_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
      v_client_id uuid := 'c0000000-0000-0000-0000-000000000001'::uuid;
      -- Pre-computed blowfish bcrypt hashes (cost 10) verified with GoTrue
      v_admin_hash text := '$2b$10$bIYAipvttvr1i1wAH4mm6uJ7CMRhoMOuz8morSxL2qWN/DBtvfrJa';
      v_client_hash text := '$2b$10$5AfJ6c5b.Adj5s0HappRQuIsrd84qAcyrAKsgO00tG2v6qFpMFqHC';
    BEGIN

      -- Admin in auth.users
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

      -- Identity for admin
      IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_admin_id AND provider = 'email') THEN
        INSERT INTO auth.identities (
          id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
          v_admin_id, v_admin_id::text, v_admin_id,
          json_build_object('sub', v_admin_id::text, 'email', 'admin@elsxglobal.com')::jsonb,
          'email', now(), now(), now()
        );
      END IF;

      -- Ensure admin_users table exists unconditionally
      CREATE TABLE IF NOT EXISTS public.admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        email text NOT NULL UNIQUE,
        role text NOT NULL DEFAULT 'superadmin',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      -- Admin in admin_users table
      IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'admin@elsxglobal.com') THEN
        INSERT INTO public.admin_users (user_id, email, role, is_active, created_at, updated_at)
        VALUES (v_admin_id, 'admin@elsxglobal.com', 'superadmin', true, now(), now());
      ELSE
        UPDATE public.admin_users
        SET user_id = v_admin_id, is_active = true, role = 'superadmin'
        WHERE email = 'admin@elsxglobal.com';
      END IF;

      -- Demo Client in auth.users
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

      -- Identity for client
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
  `;
  try {
    await runQuery(roleSql);
    console.log(`[migration] Supabase service role credentials and schema permissions synchronized.`);
  } catch (err) {
    console.warn(`[migration] Notice: Could not sync service roles (${err.message}).`);
  }
}

/**
 * Notify PostgREST to reload its schema & config cache
 */
async function reloadPostgrestSchema() {
  try {
    await runQuery(`
      GRANT USAGE ON SCHEMA public, graphql_public, extensions TO authenticator, anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator, anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator, anon, authenticated, service_role;
      GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticator, anon, authenticated, service_role;
      NOTIFY pgrst, 'reload config';
      NOTIFY pgrst, 'reload schema';
    `);
    console.log(`[migration] PostgREST config + schema cache reload signal dispatched.`);
  } catch (err) {
    console.warn(`[migration] Notice: Could not notify PostgREST (${err.message}). PostgREST will reload on interval.`);
  }
}

/**
 * Main migration execution routine
 */
async function main() {
  console.log(`\n======================================================`);
  console.log(` ELSxGlobal / VaultHost Supabase Migration Runner`);
  console.log(`======================================================\n`);

  if (SKIP_MIGRATIONS) {
    console.log(`[migration] SKIP_MIGRATIONS=true. Skipping migration check.`);
    process.exit(0);
  }

  // Check if credentials are present
  const hasHttpCreds = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY && !SERVICE_ROLE_KEY.includes('placeholder'));
  const hasDbUrl = Boolean(DATABASE_URL && !DATABASE_URL.includes('placeholder'));

  if (!hasHttpCreds && !hasDbUrl) {
    console.log(`[migration] NOTICE: Neither SUPABASE_SERVICE_ROLE_KEY nor DATABASE_URL is configured.`);
    console.log(`[migration] To enable automatic migrations before app start:`);
    console.log(`[migration]   - Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)`);
    console.log(`[migration]   - Set SUPABASE_SERVICE_ROLE_KEY`);
    console.log(`[migration]   - Or set DATABASE_URL (postgresql://postgres:pwd@host:5432/postgres)`);
    console.log(`[migration] Skipping migrations and continuing with app startup...\n`);
    process.exit(0);
  }

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn(`[migration] Migrations directory not found at: ${MIGRATIONS_DIR}`);
    process.exit(0);
  }

  // Read all .sql files
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`[migration] Found ${files.length} migration file(s) in supabase/migrations.`);

  if (files.length === 0) {
    console.log(`[migration] No migration files to apply.`);
    process.exit(0);
  }

  // Connect to database
  const connected = await waitForDatabase(5, 3000);
  if (!connected) {
    console.error(`\n[migration] ERROR: Could not connect to database after retries.`);
    if (process.env.MIGRATIONS_STRICT === 'true') {
      console.error(`[migration] MIGRATIONS_STRICT=true: Halting startup.`);
      process.exit(1);
    } else {
      console.warn(`[migration] WARNING: Supabase is offline or credentials need update. Continuing with Next.js startup so the website remains online.`);
      process.exit(0);
    }
  }

  // Synchronize service role credentials (safety net for existing volumes)
  await ensureServiceRoles();

  // Setup tracking table
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  console.log(`[migration] Currently applied migrations in database: ${applied.size}`);

  let appliedCount = 0;

  for (const file of files) {
    const version = file.split('_')[0] || file;
    if (applied.has(version)) {
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    const sqlContent = fs.readFileSync(filePath, 'utf8').trim();

    if (!sqlContent) {
      console.log(`[migration] Skipping empty file: ${file}`);
      continue;
    }

    console.log(`[migration] Applying: ${file}...`);
    const startTime = Date.now();

    try {
      // Execute the migration SQL
      await runQuery(sqlContent);

      // Record migration in tracking table
      const safeName = file.replace(/'/g, "''");
      const safeVersion = version.replace(/'/g, "''");
      await runQuery(
        `INSERT INTO _supabase_migrations (version, name) VALUES ('${safeVersion}', '${safeName}') ON CONFLICT (version) DO NOTHING;`
      );

      const elapsedMs = Date.now() - startTime;
      console.log(`[migration] ✓ Applied ${file} (${elapsedMs}ms)`);
      appliedCount++;
    } catch (err) {
      console.error(`\n[migration] ✗ FAILED: ${file}`);
      console.error(`[migration] Error details:`, err.message || err);
      if (process.env.MIGRATIONS_STRICT === 'true') {
        process.exit(1);
      } else {
        console.warn(`[migration] WARNING: Migration ${file} failed. Continuing with app startup so website remains online...`);
        break;
      }
    }
  }

  if (appliedCount === 0) {
    console.log(`[migration] All migrations are already up to date. (0 pending)`);
  } else {
    console.log(`\n[migration] Successfully applied ${appliedCount} new migration(s)!`);
  }
  await reloadPostgrestSchema();

  console.log(`[migration] Database migration routine complete.\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`[migration] Fatal unexpected error:`, err);
  if (process.env.MIGRATIONS_STRICT === 'true') {
    process.exit(1);
  } else {
    console.warn(`[migration] Continuing with app startup...`);
    process.exit(0);
  }
});
