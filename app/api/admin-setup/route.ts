export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

/**
 * Direct PostgreSQL execution helper
 */
async function initAdminViaPg(connectionString: string, email: string, password: string, name: string) {
  // @ts-ignore
  const pg: any = await import('pg');
  const Client = pg.default?.Client || pg.Client;
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl:
      connectionString.includes('sslmode=require') ||
      connectionString.includes('supabase.co') ||
      connectionString.includes('aws.')
        ? { rejectUnauthorized: false }
        : undefined,
  });

  await client.connect();
  try {
    // 1. Ensure schemas and extensions exist
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE SCHEMA IF NOT EXISTS public;
      CREATE SCHEMA IF NOT EXISTS storage;
      CREATE SCHEMA IF NOT EXISTS graphql_public;
      CREATE SCHEMA IF NOT EXISTS extensions;
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
      CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

      -- Ensure roles exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
          CREATE ROLE authenticator NOINHERIT LOGIN;
        END IF;
      END
      $$;

      GRANT anon, authenticated, service_role TO authenticator;

      -- PostgREST role and schema grants
      GRANT USAGE, CREATE ON SCHEMA public TO authenticator, anon, authenticated, service_role, postgres;
      GRANT USAGE, CREATE ON SCHEMA storage TO authenticator, anon, authenticated, service_role, postgres;
      GRANT USAGE, CREATE ON SCHEMA graphql_public TO authenticator, anon, authenticated, service_role, postgres;
      GRANT USAGE ON SCHEMA auth TO authenticator, anon, authenticated, service_role, postgres;

      GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator, anon, authenticated, service_role, postgres;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticator, anon, authenticated, service_role, postgres;
      GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticator, anon, authenticated, service_role, postgres;

      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticator, anon, authenticated, service_role, postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticator, anon, authenticated, service_role, postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO authenticator, anon, authenticated, service_role, postgres;
    `);

    // 2. Ensure public.admin_users table exists with correct permissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid,
        email text NOT NULL UNIQUE,
        role text NOT NULL DEFAULT 'superadmin',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      GRANT ALL ON public.admin_users TO authenticator, anon, authenticated, service_role, postgres;
    `);

    // 3. Ensure auth.instances has default instance
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.instances (
        id uuid PRIMARY KEY,
        uuid uuid,
        raw_base_config text,
        created_at timestamptz,
        updated_at timestamptz
      );
      INSERT INTO auth.instances (id, uuid, raw_base_config, created_at, updated_at)
      VALUES ('00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, '{}', now(), now())
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Generate bcrypt hash
    const passwordHash = bcrypt.hashSync(password, 10);

    // 5. Check if user already exists in auth.users
    const checkUserRes = await client.query(
      `SELECT id FROM auth.users WHERE lower(email) = lower($1) LIMIT 1;`,
      [email]
    );

    let userId: string;

    if (checkUserRes.rows && checkUserRes.rows.length > 0) {
      userId = checkUserRes.rows[0].id;
      await client.query(
        `
        UPDATE auth.users
        SET encrypted_password = $1,
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            confirmed_at = COALESCE(confirmed_at, now()),
            raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
            raw_user_meta_data = jsonb_build_object('full_name', $2, 'role', 'superadmin'),
            is_super_admin = true,
            updated_at = now()
        WHERE id = $3;
      `,
        [passwordHash, name, userId]
      );
    } else {
      userId = 'a0000000-0000-0000-0000-000000000001';
      await client.query(
        `
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password,
          email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data,
          is_super_admin, created_at, updated_at
        ) VALUES (
          $1::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated',
          $2, $3, now(), now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $4, 'role', 'superadmin'),
          true, now(), now()
        )
        ON CONFLICT (id) DO UPDATE SET
          encrypted_password = $3,
          email_confirmed_at = now(),
          confirmed_at = now(),
          is_super_admin = true;
      `,
        [userId, email.toLowerCase(), passwordHash, name]
      );
    }

    // 6. Ensure identity exists in auth.identities
    await client.query(
      `
      CREATE TABLE IF NOT EXISTS auth.identities (
        provider_id text NOT NULL,
        user_id uuid NOT NULL,
        identity_data jsonb NOT NULL,
        provider text NOT NULL,
        last_sign_in_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider)
      );
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2::uuid,
        json_build_object('sub', $1, 'email', $3)::jsonb,
        'email', now(), now(), now()
      )
      ON CONFLICT (provider_id, provider) DO UPDATE SET
        identity_data = json_build_object('sub', $1, 'email', $3)::jsonb,
        updated_at = now();
    `,
      [userId, userId, email.toLowerCase()]
    );

    // 7. Ensure public.admin_users has the active superadmin record
    await client.query(
      `
      INSERT INTO public.admin_users (user_id, email, role, is_active, created_at, updated_at)
      VALUES ($1::uuid, $2, 'superadmin', true, now(), now())
      ON CONFLICT (email) DO UPDATE SET
        user_id = $1::uuid,
        role = 'superadmin',
        is_active = true,
        updated_at = now();
    `,
      [userId, email.toLowerCase()]
    );

    // 8. Notify PostgREST to reload schema
    await client.query(`NOTIFY pgrst, 'reload schema';`).catch(() => {});

    return { success: true, userId, method: 'direct_postgres' };
  } finally {
    await client.end().catch(() => {});
  }
}

export async function POST(request: Request) {
  try {
    const { action, email, password, name = 'Master Admin' } = await request.json();

    if (action !== 'setup') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Attempt 1: Direct PostgreSQL connection (most reliable, zero hairpin NAT risk)
    const dbPassword = process.env.POSTGRES_PASSWORD || 'postgres_standalone_pwd_2026';
    const candidateDbUrls = [
      process.env.DATABASE_URL,
      process.env.SUPABASE_DB_URL,
      process.env.POSTGRES_URL,
      `postgresql://postgres:${dbPassword}@db:5432/postgres`,
      `postgresql://postgres:${dbPassword}@supabase-db:5432/postgres`,
      `postgresql://postgres:${dbPassword}@10.0.7.2:5432/postgres`,
      `postgresql://postgres:${dbPassword}@172.17.0.1:5432/postgres`,
      `postgresql://postgres:${dbPassword}@127.0.0.1:5432/postgres`,
      `postgresql://postgres:${dbPassword}@localhost:5432/postgres`,
    ].filter(Boolean) as string[];

    let lastPgError: Error | null = null;
    for (const dbUrl of candidateDbUrls) {
      if (dbUrl.includes('placeholder')) continue;
      try {
        const result = await initAdminViaPg(dbUrl, email, password, name);
        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Master Admin account initialized successfully via direct database!',
            userId: result.userId,
          });
        }
      } catch (err: any) {
        lastPgError = err;
        console.warn(`[admin-setup] PG attempt with ${dbUrl.replace(/:[^:@]+@/, ':***@')} failed: ${err.message}`);
      }
    }

    // Attempt 2: Fallback to Supabase Admin API
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'http://api-gw:8000';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        lastPgError
          ? `Direct database setup failed: ${lastPgError.message}. Supabase service key also not configured.`
          : 'Server configuration error: missing Supabase credentials'
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let userId = '';

    // Check existing auth users
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && listData?.users) {
      const existing = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (existing) {
        userId = existing.id;
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });
        if (updateErr) throw updateErr;
      }
    }

    if (!userId) {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
      });

      if (authError) {
        throw authError;
      }
      userId = authUser.user.id;
    }

    // Upsert into admin_users table
    const { error: upsertError } = await supabaseAdmin.from('admin_users').upsert(
      {
        user_id: userId,
        email: email.toLowerCase(),
        role: 'superadmin',
        is_active: true,
      },
      { onConflict: 'email' }
    );

    if (upsertError) {
      console.warn('[admin-setup] Warning upserting admin_users via API:', upsertError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Master Admin account initialized successfully!',
      userId,
    });
  } catch (err: any) {
    console.error('[admin-setup] Error:', err);
    return NextResponse.json({ error: err.message || 'Initialization failed' }, { status: 500 });
  }
}
