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
 */
async function runQuery(sql) {
  if (SUPABASE_URL && SERVICE_ROLE_KEY && !SERVICE_ROLE_KEY.includes('placeholder')) {
    try {
      return await executeViaHttp(SUPABASE_URL, SERVICE_ROLE_KEY, sql);
    } catch (err) {
      if (DATABASE_URL && !DATABASE_URL.includes('placeholder')) {
        console.warn(`[migration] HTTP query failed (${err.message}). Falling back to direct PostgreSQL connection...`);
        return await executeViaPg(DATABASE_URL, sql);
      }
      throw err;
    }
  }

  if (DATABASE_URL && !DATABASE_URL.includes('placeholder')) {
    return await executeViaPg(DATABASE_URL, sql);
  }

  throw new Error(
    'No valid Supabase credentials found. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL.'
  );
}

/**
 * Check connection with retries for container boot synchronization
 */
async function waitForDatabase(maxRetries = 5, delayMs = 3000) {
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
 * Notify PostgREST to reload its schema cache
 */
async function reloadPostgrestSchema() {
  try {
    await runQuery(`NOTIFY pgrst, 'reload schema';`);
    console.log(`[migration] PostgREST schema cache reload signal dispatched.`);
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
    await reloadPostgrestSchema();
  }

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
