-- Official Supabase roles initialization
-- Sets passwords for all internal service roles using POSTGRES_PASSWORD
\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator WITH LOGIN PASSWORD :'pgpass';
ALTER USER pgbouncer WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_functions_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER supabase_admin WITH LOGIN PASSWORD :'pgpass';
ALTER USER postgres WITH PASSWORD :'pgpass';

-- Ensure role switching for PostgREST
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_admin TO authenticator;
