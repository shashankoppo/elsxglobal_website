# Phase 0 Baseline Data Collection Report

**Project:** ELSxGlobal + VaultHost  
**Workspace:** `c:\Users\Shashank patel\Desktop\elsxglobal website + vaulthost\project`  
**Git Commit (`HEAD`):** `7b34336` (`fix(db,rest): repair PostgREST PGRST002 schema cache and add direct PG fallback for admin APIs`)  
**Baseline Timestamp:** `2026-11-26T16:08:23+05:30`  
**Mode:** Read-only baseline collection (no source files modified)

---

## 1. Typecheck Result

- **Command Executed:** `npx tsc --noEmit 2>&1` (verified also directly via `.\node_modules\.bin\tsc --noEmit`)
- **Exit Code:** `0`
- **Errors:** `0` TypeScript errors (`npx` emitted only an `npm notice` for npm `11.6.2 -> 11.21.3`; direct `tsc --noEmit` produced empty output with exit code `0`).
- **Compiler Configuration (`tsconfig.json`):**
  - `strict: true`, `noEmit: true`, `allowJs: true`, `skipLibCheck: true`, `incremental: true`, `isolatedModules: true`, `jsx: "preserve"`.
  - Excludes: `node_modules`, `supabase/functions`, `supabase-production`, `supabase-docker`.
  - Note: `next.config.js` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`, delegating typecheck and lint enforcement to CI.

---

## 2. Next.js Version & Security Status

- **Installed Version (`package.json`):** `next: "13.5.1"` (paired with `@next/swc-wasm-nodejs: "13.5.1"` and `eslint-config-next: "13.5.1"`).
- **Security Status:** **VULNERABLE — Multiple High & Critical CVEs affect `13.5.1`.**

Because the application is self-hosted (`next start` inside Docker behind Traefik/Nginx) and relies on `middleware.ts` for authentication and authorization across `/portal`, `/admin`, `/api/admin`, and `/api/cloud`, running `13.5.1` exposes significant risk:

| CVE / Advisory | Severity | Affected Versions | Patched In | Summary & Relevance |
|---|---|---|---|---|
| **CVE-2025-29927** (`GHSA-f82v-jwr5-mffw`) | **Critical** (CVSS ~9.1) | `13.x` `< 13.5.9` | `13.5.9` (13.x), `14.2.25`, `15.2.3` | **Middleware authorization bypass:** External requests injecting the `x-middleware-subrequest` header can skip Next.js middleware execution entirely on self-hosted deployments. Directly impacts `middleware.ts` route protection. |
| **CVE-2024-51479** | **High** (CVSS ~7.5) | `9.5.5` `< 14.2.15` | `14.2.15` | Path-based middleware authorization bypass affecting root-level routes via malformed query/path handling. |
| **CVE-2024-46982** (`GHSA-gp8f-8m3g-qvj9`) | **High** (CVSS ~7.5–8.7) | `13.5.1` – `14.2.9` | `13.5.7`, `14.2.10` | Pages Router SSR cache poisoning via crafted HTTP requests forcing `Cache-Control: s-maxage=1` behavior on uncacheable routes. |
| **CVE-2024-34351** | **High** (CVSS ~7.5) | `< 14.1.1` | `14.1.1` | SSRF in self-hosted Server Actions via crafted `Host` header combined with relative `/` redirects. |
| **CVE-2024-56332** (`GHSA-7m27-7ghc-44w9`) | **Medium** (CVSS 5.3) | `< 13.5.8` | `13.5.8` | Denial of Service / hanging connections in Server Actions invocations. |
| **CVE-2025-30218** (`GHSA-223j-4rm8-mrmf`) | **Low/Medium** (CVSS ~1.7–5.9) | `13.5.9` patch regression | `13.5.10` | Leaked `x-middleware-subrequest-id` header to external `fetch()` calls initiated inside middleware. |

*(Note: `13.5.1` already included the fix for `CVE-2024-34350` affecting `< 13.5.1`. However, the Next.js 13.x branch is past active maintenance; minimum patch level within 13.5.x is `13.5.11`, and upgrading to a supported 14.2.x/15.x release is recommended. As an interim proxy-level mitigation for `CVE-2025-29927`, reverse proxies/Traefik/Nginx should strip incoming `x-middleware-subrequest` headers.)*

---

## 3. Route Inventory (`app/`)

- **Pages (`page.tsx`):** `176`
- **API Routes (`route.ts`):** `38`
- **Total Route Entrypoints (`page.tsx` + `route.ts`):** `214`
- **Client-Only Pages (`'use client'` in `page.tsx`):** `151` of `176` pages (`85.8%`; `25` Server Component pages)
- **Additional Special App Router Files:** `13` `layout.tsx`, `1` `error.tsx`, `1` `loading.tsx`, `1` `not-found.tsx`

*(Note: PowerShell `Get-Content -LiteralPath` was used for the `'use client'` check so bracketed dynamic route directories like `[...slug]` and `[id]` were read accurately without wildcard expansion errors; both line-1 and top-5-line checks returned `151`.)*

---

## 4. File Size Hotspots (Top 15 `.ts` / `.tsx` in `app/`, `lib/`, `components/`)

| Rank | Size (KB) | Size (Bytes) | Relative Path |
|---:|---:|---:|---|
| 1 | 94 | 95,807 | `app\admin\billing\page.tsx` |
| 2 | 69 | 70,524 | `lib\data\hosting-tiers-extended.ts` |
| 3 | 68 | 69,652 | `app\(portal)\portal\service\[id]\page.tsx` |
| 4 | 63 | 64,857 | `app\(vaulthost)\vaulthost\vaulthost-home-content.tsx` |
| 5 | 54 | 55,429 | `app\api\admin\route.ts` |
| 6 | 51 | 52,546 | `app\admin\components\tickets-users-tab.tsx` |
| 7 | 50 | 51,285 | `lib\data\service-deep.ts` |
| 8 | 46 | 46,827 | `app\(vaulthost)\vaulthost\checkout\checkout-client.tsx` |
| 9 | 43 | 44,113 | `app\admin\components\ai-governance-tab.tsx` |
| 10 | 42 | 42,885 | `app\(portal)\portal\billing\page.tsx` |
| 11 | 41 | 42,475 | `lib\data\kb-content.ts` |
| 12 | 41 | 42,242 | `app\admin\components\provisioning-settings-tab.tsx` |
| 13 | 40 | 41,335 | `app\admin\components\payments-settings-tab.tsx` |
| 14 | 40 | 40,466 | `app\admin\components\storage-tab.tsx` |
| 15 | 38 | 39,387 | `app\(portal)\portal\service\page.tsx` |

---

## 5. Key Config Findings

### `next.config.js`
- **Build Guard Bypasses:** Sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` so Docker/Coolify builds rely on CI for linting/typechecking.
- **Images & Routing:** `images.remotePatterns` permits any HTTPS host (`hostname: '**'`); enables `trailingSlash: true` and `skipTrailingSlashRedirect: true`.
- **Supabase Gateway Rewrites:** Proxies `/auth/v1/:path*`, `/rest/v1/:path*`, and `/storage/v1/:path*` to `process.env.SUPABASE_URL || 'http://api-gw:8000'`.
- **Security Headers (`/(.*)`):** Configures `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `HSTS` (2-year `preload`), and `Content-Security-Policy`. Notably, CSP includes `'unsafe-eval'` and `'unsafe-inline'` in `script-src` and `'unsafe-inline'` in `style-src` alongside Razorpay, Google Fonts, `*.supabase.co`, and `lottie.host`.
- **Windows Workarounds:** When `process.platform === 'win32'`, sets `experimental: { workerThreads: false, cpus: 4 }`, disables webpack cache, and forces `config.parallelism = 1`.

### `package.json`
- **Package Identity:** `name: "nextjs"`, `version: "0.1.0"`, `private: true`.
- **Core Stack:** `next: "13.5.1"`, `react: "18.2.0"`, `react-dom: "18.2.0"`, `typescript: "^5.3.3"`.
- **Key Dependencies:**
  - Auth/DB: `@supabase/ssr: "^0.12.4"`, `@supabase/supabase-js: "^2.58.0"`, `@auth/core: "^0.41.3"`, `drizzle-orm: "^0.45.2"`, `pg: "^8.23.0"`, `postgres: "^3.4.9"`, `bcryptjs: "^3.0.3"`.
  - Payments: `razorpay: "^2.9.8"` (no Stripe SDK installed).
  - UI/Forms/Validation: 27 `@radix-ui/react-*` primitives, `tailwindcss: "3.3.3"`, `framer-motion: "^12.42.2"`, `lucide-react: "^0.446.0"`, `recharts: "^2.12.7"`, `react-hook-form: "^7.53.0"`, `zod: "^3.23.8"`, `qrcode.react: "^4.2.0"`, `sonner: "^1.5.0"`, `cmdk: "^1.0.0"`, `vaul: "^0.9.9"`.
  - Tooling/Tests (`devDependencies`): `vitest: "^5.1.0"`, `eslint: "8.49.0"`, `eslint-config-next: "13.5.1"`, `drizzle-kit: "^0.31.10"`, `@types/node: "26.1.1"`.
- **Scripts:** `dev`, `dev:port` (3001), `build`, `build:analyze`, `migrate` (`node scripts/migrate.mjs`), `start` (`node scripts/migrate.mjs && next start`), `lint`, `lint:fix`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `ci` (`typecheck && test && lint && build`).

### `middleware.ts`
- **Protected Matchers:** `['/portal/:path*', '/admin/:path*', '/api/admin/:path*', '/api/cloud/:path*']`. Other `/api/*` paths (e.g., `/api/checkout/*`, `/api/razorpay/*`, `/api/webhooks/*`, `/api/admin-reset`, `/api/admin-setup`, `/api/action-gateway/*`) are outside middleware scope.
- **Session Extraction & Auth:**
  - Uses `@supabase/ssr` `createServerClient` with cookie name `elsxglobal-auth-token` (plus legacy `sb-elsxglobal-auth-token` / `sb-api-gw-auth-token` aliasing) and calls `supabase.auth.getUser()`.
  - If `getUser()` fails or returns null, `extractUserFromCookies()` base64url-decodes the JWT payload from cookies directly and checks only `exp` (60s skew) **without verifying the JWT signature**.
- **Route Enforcement Rules:**
  - `/portal/*`: Redirects unauthenticated visitors to `/portal/login?redirect=...`, excluding `/portal/login`, `/portal/signup`, `/portal/forgot-password`, `/portal/reset-password` (which redirect authenticated users to `redirect` param or `/portal`).
  - `/admin/*` (excluding `/admin/login`, `/admin/setup`, `/admin/reset`): Requires authenticated user; allows `isMasterAdmin` (`email === 'admin@elsxglobal.com'`, `app_metadata.role === 'superadmin'`, `user_metadata.role === 'superadmin'`, or `app_metadata.claims_admin === true`), otherwise queries `admin_users.is_active` via Supabase service-role client.
  - `/api/admin/*`: Accepts `x-admin-secret` matching `ADMIN_SECRET || SUPABASE_SERVICE_ROLE_KEY`, otherwise enforces authenticated session + `isMasterAdmin` or active `admin_users` record (`401`/`403` JSON).
  - `/api/cloud/*`: Requires cookie `user`, OR any `Authorization: Bearer ` header (prefix check only in middleware), OR valid `x-admin-secret` (`401` JSON).
- **Security Note:** Lines 4–7 embed hardcoded fallback `DEFAULT_ANON_KEY` and `DEFAULT_SERVICE_KEY` JWT literals directly in `middleware.ts`.

### `app/layout.tsx`
- **Fonts:** Loads `Inter` (`--font-sans`), `IBM_Plex_Mono` (`--font-mono`, weights 400/500/600), and `Space_Grotesk` (`--font-display`) via `next/font/google` (`Sora` is imported on line 3 but unused).
- **Metadata & SEO:** Sets `metadataBase` (`https://elsxglobal.com`), `%s | ELSxGlobal` title template, OpenGraph/Twitter card metadata (`/og-image.jpg`), `robots: { index: true, follow: true }`, canonical URL, and `organization:*` meta tags for parent `EvolucentSphere Pvt. Ltd.`.
- **Global DOM Structure:** `<html lang="en" suppressHydrationWarning>` includes `<JsonLd>` structured data (`defaultOrganization`, `parentOrganization`, `WebSite` search action). `<body>` wraps `{children}` inside `ThemeProvider` (`defaultTheme="dark"`, `enableSystem={false}`, storage key `elsxglobal-theme`) and `LeadProvider`, rendering global components `<LeadDialog />`, `<EnterpriseAssistant />`, `<WhatsAppButton />`, and `<ScrollToTop />`.

### `.github/workflows/ci.yml`
- **Triggers & Runtime:** Runs on `push` (`main`, `develop`, `staging`) and `pull_request` (`main`, `develop`) using Node `22` with concurrency cancellation.
- **Jobs:**
  1. `quality`: Runs `npm install --prefer-offline`, `npm run typecheck`, `npm run lint` (does **not** run `npm test` / `vitest`).
  2. `build` (`needs: quality`): Runs `npm run build` (`NODE_OPTIONS='--max-old-space-size=4096'`, placeholder env fallbacks for Supabase/DB) and uploads `.next/` + `public/` artifacts (7-day retention).
  3. `deploy-staging` (`develop` push) & `deploy-production` (`main` push): Download the build artifact and currently execute placeholder `echo` deploy stubs.

### `Dockerfile`
- **Build Strategy:** Two-stage `node:20-slim` (Debian Bookworm for native `@next/swc-linux-x64-gnu`) container build.
  - **Stage 1 (`builder`):** Accepts build args (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_SITE_URL` with placeholder defaults), runs `npm install --include=dev --prefer-offline --no-audit` (retaining Tailwind/PostCSS devDeps), and runs `npm run build` with `4096 MB` heap.
  - **Stage 2 (`runner`):** Installs `curl` (healthchecks), sets `PORT=80` and `HOSTNAME="0.0.0.0"`, copies `.next`, `public`, `node_modules` (entire tree from builder), `next.config.js`, `package.json`, `supabase`, and `scripts`. Entrypoint `scripts/entrypoint.sh` executes `node /app/scripts/migrate.mjs` (warns without aborting on failure) and starts `next start -p 80 -H 0.0.0.0`.

### `.env.example`
- **Expected Environment Variables (21 total):**
  - **Supabase & Auth:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (pre-populated with standalone stack values for `http://api-gw:8000` matching `middleware.ts` fallbacks).
  - **Database:** `DATABASE_URL`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`.
  - **Application:** `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`, `PORT`.
  - **Security & Secrets:** `JWT_SECRET`, `ADMIN_SECRET`, `ACTION_GATEWAY_SECRET`, `PG_META_CRYPTO_KEY` (all populated with sample/default strings rather than empty values).
  - **Payments (Razorpay):** `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (placeholder values).
  - **Migration / Backup Control:** `SKIP_MIGRATIONS`, `MIGRATIONS_STRICT`, `BACKUP_KEEP_DAYS`.

---

## 6. Supabase Migrations Count

- **Total `.sql` files in `supabase/migrations/`:** **`28`**
- Range spans `00000000000000_supabase_auth_stubs.sql` through `20261125000000_calibrate_enterprise_plans_and_access.sql`.

---

## 7. Secret Scan Results

- **Files Scanned:** `443` files (`*.ts`, `*.tsx`, `*.js`, `*.mjs`, `*.env*`, excluding `node_modules`, `.next`, and `*.example`).
- **Pattern:** `sk_live|sk_test|rzp_live|SUPABASE_SERVICE_ROLE_KEY\s*=\s*ey|-----BEGIN (RSA |EC )?PRIVATE KEY`
- **Matches Found:** `5` files (`3` git-tracked source files containing benign UI/code-sample strings; `2` untracked, gitignored local env files):

| File Path | Line | Git Tracked | Classification | Redacted Context |
|---|---:|:---:|---|---|
| `app/(marketing)/ai-solutions/page.tsx` | 225 | Yes | Benign docs snippet | `client = EnterpriseClient(api_key="sk_live_...[REDACTED]")` |
| `app/admin/components/ai-governance-tab.tsx` | 172 | Yes | Benign UI prefix generator | `... : p.id === 'groq' ? 'gsk_live_' : 'sk-proj-'` |
| `app/admin/components/payments-settings-tab.tsx` | 290 | Yes | Benign input placeholder | `placeholder="sk_test_...[REDACTED]"` |
| `.env` | 3 | No (`.gitignore` L10) | Local runtime env (untracked) | `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIU...[REDACTED]` |
| `supabase/.temp/start-secrets/supabase_edge_runtime_project/env/docker.env` | 3 | No (`.gitignore` L41) | Local Supabase temp env (untracked) | `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIU...[REDACTED]` |

- **Additional Observation Outside Regex:** `middleware.ts` lines 4–7 commit hardcoded `DEFAULT_ANON_KEY` and `DEFAULT_SERVICE_KEY` JWT literals (`role: "service_role"`) directly in source control, matching the standalone defaults in `.env.example`.

---

## 8. Existing Documentation Summary

- **`AUDIT.md`:** Prior Phase 0 audit report dated `2026-11-14` (commit `89ef38a`). Recorded 178 routes, 26 migrations, 0 tests, and 16 verified flaws (including `app/api/admin-reset`, `lib/billing/adminAuth.ts` hardcoded secret, `lib/action-gateway/gateway.ts` 2FA bypasses, `lib/crypto/hybrid-pqc.ts` simulated PQC, middleware missing `/api/*`, open mail relay in `send-email`, unauthenticated `/api/cloud/*` in-memory fallbacks, and portal demo data). *Delta observed vs current `HEAD` (`7b34336`):* `vitest` has since been added to `package.json`, `middleware.ts` now includes `/api/admin/:path*` and `/api/cloud/:path*`, commits indicate demo data removal and pricing calibration, route entrypoints now total `214` (`176` pages + `38` API routes), and migrations total `28`.
- **`OPERATIONS.md`:** Production runbook for Next.js 13 + self-hosted Supabase + PostgreSQL 17 + Nginx API Gateway (`api-gw:8000`) hosted via Coolify on Proxmox (`https://www.elsxglobal.com`). Documents container topology, `./scripts/manage.sh` operations, nightly backups & S3 restore, deployment/rollback, health monitoring, secret rotation, and DB troubleshooting.
- **`README.md`:** Developer and platform overview detailing tech stack, local setup, migration summary, one-time `/admin/setup` flow, Razorpay/UPI/Bank activation, custom QR upload, trust badges, text ERD, RLS summary, and checkout state machine. *(Note: Its Docker section describes an older `node:20-alpine` + `nginx:alpine` static export setup, whereas `Dockerfile` and `OPERATIONS.md` now use `node:20-slim` + `next start` SSR.)*
- **`CHANGELOG.md`:** Keep-a-Changelog log covering `1.0.0` (2025-09-20) through `2.5.0` (2025-09-28) with an empty `[Unreleased]` section; recent 2026 commits and migrations are not yet reflected in `CHANGELOG.md`.
