-- Official Supabase roles initialization
-- Ensures all roles exist (creates if missing) and sets passwords using POSTGRES_PASSWORD
\set pgpass `printf '%s' "${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"`

-- Create all roles if they don't exist yet
DO $$
BEGIN
  -- Superuser postgres
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  END IF;

  -- Anon / Authenticated / Service roles
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;

  -- Supabase admin
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  END IF;

  -- Authenticator for PostgREST
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN;
  END IF;

  -- GoTrue auth admin (granted SUPERUSER to guarantee schema migrations succeed under PG 15+)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  ELSE
    ALTER ROLE supabase_auth_admin WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  END IF;

  -- Storage admin (granted SUPERUSER to guarantee bucket & object operations succeed under PG 15+)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  ELSE
    ALTER ROLE supabase_storage_admin WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  END IF;

  -- Edge functions admin
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_functions_admin') THEN
    CREATE ROLE supabase_functions_admin SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  ELSE
    ALTER ROLE supabase_functions_admin WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS LOGIN;
  END IF;

  -- PgBouncer
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pgbouncer') THEN
    CREATE ROLE pgbouncer LOGIN;
  END IF;
END $$;

-- Set passwords for all login roles using psql variable with fallback
ALTER USER authenticator WITH LOGIN PASSWORD :'pgpass';
ALTER USER pgbouncer WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_functions_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER postgres WITH LOGIN PASSWORD :'pgpass';

-- Ensure schemas exist with proper authorization
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS graphql_public;

ALTER SCHEMA auth OWNER TO supabase_auth_admin;
ALTER SCHEMA storage OWNER TO supabase_storage_admin;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'auth' LOOP
    EXECUTE format('ALTER TABLE auth.%I OWNER TO supabase_auth_admin', r.tablename);
  END LOOP;
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'storage' LOOP
    EXECUTE format('ALTER TABLE storage.%I OWNER TO supabase_storage_admin', r.tablename);
  END LOOP;
END $$;

-- Grant role membership to authenticator for PostgREST JWT switching
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_admin TO authenticator;

-- Storage admin membership to authenticator
GRANT authenticator TO supabase_storage_admin;

-- Schema and database privileges (critical for PostgreSQL 15+ permission model)
GRANT ALL ON SCHEMA public TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA graphql_public TO postgres, supabase_admin, authenticator, anon, authenticated, service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin, postgres, service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin, postgres, service_role;
GRANT ALL PRIVILEGES ON DATABASE postgres TO supabase_auth_admin, supabase_storage_admin;

-- Default search paths
ALTER ROLE supabase_auth_admin SET search_path TO auth, public, extensions;
ALTER ROLE supabase_storage_admin SET search_path TO storage, public, extensions;

-- Table, sequence, routine permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, supabase_admin, supabase_auth_admin, supabase_storage_admin, anon, authenticated, service_role;
