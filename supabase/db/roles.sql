-- Official Supabase roles initialization
-- Ensures all roles exist (creates if missing) and sets passwords using POSTGRES_PASSWORD
\set pgpass `echo "${POSTGRES_PASSWORD:-postgres_standalone_pwd_2026}"`

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

  -- GoTrue auth admin
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin LOGIN NOINHERIT CREATEROLE;
  END IF;

  -- Storage admin
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin LOGIN NOINHERIT CREATEROLE;
  END IF;

  -- Edge functions admin
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_functions_admin') THEN
    CREATE ROLE supabase_functions_admin LOGIN NOINHERIT CREATEROLE;
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

-- Grant role membership to authenticator for PostgREST JWT switching
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_admin TO authenticator;

-- Storage admin membership to authenticator
GRANT authenticator TO supabase_storage_admin;

-- Schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
