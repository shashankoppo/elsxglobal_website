# PHASE 0 GROUND-TRUTH PLATFORM AUDIT REPORT
**ELSxGlobal Platform & VaultHost Cloud Infrastructure**
**Repository:** `github.com/shashankoppo/elsxglobal_website`  
**Audit Date:** 2026-11-14  
**Audit Status:** COMPLETE (Read-Only Verification)  
**Lead Architect & Build Agent:** Antigravity  

---

## EXECUTIVE SUMMARY

A rigorous, ground-truth audit of the entire ELSxGlobal and VaultHost codebase was conducted without modifying any application code.

### Summary of Key Findings:
1. **Build & Type Health is Clean:** `tsc --noEmit` exits `0` (0 errors), `next lint` exits `0` (0 warnings/errors), and `next build` compiles and generates all **178 routes** with exit code `0`.
2. **Two Critical Security Backdoors Discovered:**
   - `app/api/admin-reset/route.ts`: Completely unauthenticated public endpoint that wipes all rows from `admin_users` and creates a new superadmin account.
   - `lib/billing/adminAuth.ts`: Hardcoded header bypass `x-admin-secret: vaulthost-admin-supersecret` which grants full administrative service-role access in all environments.
3. **Pseudo / Hand-Rolled Post-Quantum Cryptography:**
   - `lib/crypto/hybrid-pqc.ts` simulates NIST ML-DSA-65 and ML-KEM-768 using HMAC-SHA3-512, and signature verification merely checks whether a string begins with `mldsa65_`.
4. **Cloud Plane Uses Ephemeral In-Memory Fallbacks:**
   - `/api/cloud/vps`, `/api/cloud/dns`, `/api/cloud/workers`, `/api/cloud/storage`, `/api/cloud/kv`, and `/api/cloud/ai-gateway` mutate Node.js in-memory variables (`fallbackRecords`, `fallbackWorkers`, etc.) when database rows are absent, rather than executing mutations on real daemons.
5. **No Automated Test Suites:**
   - There are zero unit, integration, or end-to-end tests (no Jest, Vitest, Playwright, or Cypress).
6. **Deceptive Demo Data in Customer Portal:**
   - If an authenticated user has zero services, invoices, or tickets, the dashboard displays mock instances (`svc-001`, `svc-002`), paid invoices, and tickets as if they are live resources belonging to that user.
7. **Stripe Integration is Completely Missing:**
   - Stripe is not installed in `package.json` (`@stripe/stripe-js` and `stripe` are absent). Only Razorpay is installed.

---

## 1. REAL STACK & EXACT VERSIONS

All versions verified directly against `package.json`, `tsconfig.json`, and environment configs:

| Category | Component / Library | Version | Health / Notes |
|---|---|---|---|
| **Core Framework** | Next.js (`next`) | `13.5.1` | App Router enabled; pinned to Node 20 LTS due to SWC binary compatibility |
| **Runtime & Language**| React / React DOM | `18.2.0` | Client & server components |
| | TypeScript | `^5.3.3` | Strict mode enabled, 0 compiler errors |
| | Node Runtime | `20-slim` | Configured in Dockerfile (`node:20-slim`) |
| **Styling & Motion** | Tailwind CSS | `3.3.3` | `tailwindcss-animate: ^1.0.7`, `postcss: 8.4.30`, `autoprefixer: 10.4.15` |
| | Framer Motion | `^12.42.2` | Used across marketing, portal, and storefront pages |
| **Database & Auth** | Supabase JS | `^2.58.0` | Primary database and authentication client |
| | Supabase SSR | `^0.12.4` | Cookie-based session management in middleware and server clients |
| | Drizzle ORM | `^0.45.2` | Installed, schema exists but drifted from Supabase tables |
| | PostgreSQL Drivers | `pg: ^8.23.0`, `postgres: ^3.4.9` | Installed for direct Postgres connections |
| | Password Hashing | `bcryptjs: ^3.0.3` | Installed |
| **Payments** | Razorpay SDK | `^2.9.8` | Installed and configured (`app/api/razorpay/*`, webhooks) |
| | Stripe SDK | **NOT INSTALLED** | Absent from `package.json`. No Stripe routes or webhooks exist |
| **UI Components** | Radix UI | Various (`^1.1.0` - `^2.2.1`)| 23 `@radix-ui/react-*` primitive packages |
| | Lucide React | `^0.446.0` | Comprehensive icon set |
| | Sonner | `^1.5.0` | Toast notifications |
| | Recharts | `^2.12.7` | Dashboard metrics visualization |
| | Embla Carousel | `^8.3.0` | Marketing sliders |
| **Testing** | Test Runner | **NONE** | No Jest, Vitest, Playwright, or Cypress installed |

---

## 2. MODULE INVENTORY ACROSS ALL PLANES

Status Definitions:
- `[REAL]`: Backed by real database queries, active handlers, or functional code.
- `[PARTIAL]`: Implemented in UI and partially in API, but relies on in-memory mocks, volatile state, or unintegrated daemons.
- `[BROKEN]`: Implementation exists but is broken, backdoored, non-functional, or contradictory.
- `[MISSING]`: Referenced in product UI or docs but has no backend implementation, API route, or dependency.

### 2.1 Marketing Plane (`app/(marketing)/*`)
| Route / Module | Status | Evidence / Notes |
|---|---|---|
| `/` (ELSxGlobal Home) | `[REAL]` | Complete, framer-motion animations, marquee, stats counters, 3D tilt cards. |
| `/about` | `[REAL]` | Company story, values, team, ISO certifications. |
| `/services` | `[REAL]` | Service catalog overview and enterprise solutions. |
| `/software` | `[REAL]` | Custom software development solutions. |
| `/ai-solutions` | `[REAL]` | AI engineering and enterprise automation landing. |
| `/careers` | `[REAL]` | Culture, benefits, and open engineering positions. |
| `/case-studies` | `[REAL]` | Client success stories with filterable categories. |
| `/blog` | `[REAL]` | Blog listing with category filters (static/client state). |
| `/industries` | `[REAL]` | Industry vertical overviews (BFSI, Healthcare, Retail, etc.). |
| `/contact` | `[REAL]` | Wires to Supabase `leads` table and triggers `send-email` edge function. |
| `/docs` | `[REAL]` | Docs-as-Code entry point linking to `/docs` repo tree. |
| `/privacy`, `/terms`, `/sla` | `[REAL]` | Complete legal, compliance, and SLA terms. |
| `/website-development`, `/erp-crm` | `[REAL]` | Sub-service marketing landing pages. |
| Dynamic `/services/[slug]`, `/industries/[slug]`, `/locations/[slug]` | `[REAL]` | Dynamic pages backed by `lib/data/verticals-extended.ts` and `service-deep.ts`. |

### 2.2 VaultHost Storefront & Product Plane (`app/(vaulthost)/*`)
| Route / Module | Status | Evidence / Notes |
|---|---|---|
| `/vaulthost` (Cloud Homepage) | `[REAL]` | Complete cloud platform product homepage with CLI terminal preview. |
| `/vaulthost/pricing` | `[REAL]` | Backed by `lib/data/pricing.ts` and `hosting_plans` table. |
| `/vaulthost/checkout` | `[REAL]` | Integrates with Razorpay SDK, coupon codes, and manual UPI flow. |
| `/vaulthost/compare` | `[REAL]` | 8-criteria competitive comparison matrix vs AWS, GCP, Hostinger, etc. |
| `/vaulthost/status` | `[PARTIAL]` | UI complete with 12 services and 90-day grid, but relies on static uptime data. |
| `/vaulthost/migration` | `[REAL]` | Zero-downtime migration landing; form saves to `leads` table. |
| `/vaulthost/kb`, `/vaulthost/kb/[slug]` | `[REAL]` | 12 technical knowledge base articles backed by `lib/data/kb-content.ts`. |
| 18+ Cloud Product Pages (`/workers`, `/storage`, `/database`, `/dns`, `/ai-gateway`, `/stream`, `/images`, `/analytics`, `/email-routing`, `/monitoring`, `/domains`, `/cloud`, `/edge`, `/serverless`, `/ai-ops`, `/ci-cd`, `/email`, `/website-builder`, `/wordpress`) | `[REAL]` | Complete v4 design system pages, 180-260 lines each, with specs, pricing, and CTAs. |

### 2.3 Customer Portal Plane (`app/(portal)/*`)
| Route / Module | Status | Evidence / Notes |
|---|---|---|
| `/portal/login`, `/signup`, `/forgot-password`, `/reset-password` | `[REAL]` | Real Supabase auth with SSR cookies and redirect guards. |
| `/portal/dashboard` | `[BROKEN]` | Displays hardcoded `DEMO_DASHBOARD_SERVICES` (`svc-001`, `svc-002`) and paid invoices if DB is empty instead of an empty state. |
| `/portal/billing` | `[PARTIAL]` | Fetches `hosting_invoices`, but falls back to hardcoded `DEMO_INVOICES`. Payment method management is static UI. |
| `/portal/profile` | `[REAL]` | Supabase user metadata update, password change, and API keys UI. |
| `/portal/service` | `[PARTIAL]` | Lists `hosting_services`, falls back to `DEMO_SERVICES`. Action buttons (Reboot, SSH console) are not connected to daemons. |
| `/portal/invoice`, `/portal/invoice/[id]` | `[REAL]` | Invoice list and detail drawer/view with print support. |
| `/portal/support`, `/portal/support/[id]` | `[REAL]` | Real support ticket create and reply thread backed by `support_tickets` and `support_replies`. |
| `/portal/notifications` | `[REAL]` | Backed by `notifications` table with demo fallback and filter tabs. |
| `/portal/cloud/vps` | `[PARTIAL]` | Backed by `app/api/cloud/vps`, but falls back to `fallbackInstances`. |
| `/portal/cloud/dns` | `[PARTIAL]` | Mutates in-memory `fallbackRecords` array. |
| `/portal/cloud/workers` | `[PARTIAL]` | Mutates in-memory `fallbackWorkers` array. |
| `/portal/cloud/storage` | `[PARTIAL]` | Mutates in-memory `fallbackBuckets` array. |
| `/portal/cloud/ai` | `[PARTIAL]` | Static provider metrics and hardcoded routing rules. |

### 2.4 Admin Control Plane (`app/(admin)/*`)
| Route / Module | Status | Evidence / Notes |
|---|---|---|
| `/admin/login` | `[REAL]` | Supabase Auth login verified against `admin_users` table. |
| `/admin` (Dashboard) | `[REAL]` | Real KPI stats from `hosting_orders`, `admin_users`, `hosting_plans`, `support_tickets`, `hosting_invoices`. |
| `/admin/orders` | `[REAL]` | Order listing, payment verification, and manual approval/rejection. |
| `/admin/services` | `[REAL]` | Service lifecycle view (active, suspended, provisioning). |
| `/admin/plans` | `[REAL]` | Full CRUD for `hosting_plans` with Zod validation. |
| `/admin/addons`, `/admin/coupons` | `[REAL]` | Full CRUD for add-ons and promotional coupons. |
| `/admin/tickets` | `[REAL]` | Support ticket triage and staff responses. |
| `/admin/invoices` | `[REAL]` | Invoice management and payment marking. |
| `/admin/users` | `[REAL]` | Supabase user list view and role assignment. |
| `/admin/settings` | `[REAL]` | Payment gateway & provisioning settings editor. |
| `/admin/audit` | `[REAL]` | Audit log viewer for platform events. |
| `/admin/cloud` | `[PARTIAL]` | Multi-tab cloud infrastructure visualizer, but displays in-memory state. |
| `/admin/setup` | `[BROKEN / VULNERABLE]` | Public admin creation if `admin_users` table is empty (`app/api/admin-setup/route.ts`). |
| `/admin/reset` | `[BROKEN / CRITICAL BACKDOOR]` | Public admin takeover backdoor route (`app/api/admin-reset/route.ts`). |

### 2.5 Backend Service Adapters & Libraries (`lib/*`)
| Library / Connector | Status | Evidence / Notes |
|---|---|---|
| `lib/provisioning/proxmox.ts` | `[REAL]` | Proxmox VE REST API client with VM creation, cloning, task polling, snapshots, and metrics. |
| `lib/provisioning/cyberpanel.ts` | `[REAL]` | CyberPanel REST API connector (`createWebsite`, `suspendWebsite`). |
| `lib/provisioning/hestiacp.ts` | `[REAL]` | HestiaCP API connector (`v-add-user`, `v-add-web-domain`). |
| `lib/provisioning/pterodactyl.ts`| `[REAL]` | Pterodactyl Application API connector for game servers. |
| `lib/provisioning/domains/index.ts`| `[REAL]` | Namecheap API connector for domain registration and DNS records. |
| `lib/dns/powerdns.ts` | `[REAL]` | PowerDNS Authoritative REST API client (`createZone`, `addRecord`, DNSSEC). |
| `lib/storage/minio.ts` | `[REAL]` | MinIO S3-compatible client with direct AWS SigV4 signing. |
| `lib/tunnel/frp.ts` | `[REAL]` | FRP reverse proxy admin API client. |
| `lib/workers/workerd.ts` | `[REAL]` | Cloudflare `workerd` daemon bridge. |
| `lib/containers/k3s.ts` | `[REAL]` | K3s Kubernetes API client. |
| `lib/queue/rabbitmq.ts` | `[REAL]` | RabbitMQ Management REST API client. |
| `lib/ai/litellm.ts` | `[REAL]` | LiteLLM proxy client for model discovery and chat completions. |
| `lib/saas/*` (Gitea, Mattermost, Metabase, n8n, Plausible) | `[REAL]` | API client implementations for self-hosted SaaS. |
| `lib/action-gateway/*` | `[BROKEN / PARTIAL]` | Architecture implemented, but state stored in volatile global Maps, 2FA/staff auth hardcoded with trivial bypasses (`123456`, `length >= 6`), and execution returns simulated mock output. |
| `lib/crypto/hybrid-pqc.ts` | `[BROKEN / FAKE CRYPTO]` | Simulated ML-DSA-65 with HMAC-SHA3-512; verification only checks `startsWith('mldsa65_')`. |
| `lib/billing/adminAuth.ts` | `[BROKEN / BACKDOOR]` | Hardcoded bypass `x-admin-secret: vaulthost-admin-supersecret`. |
| `lib/billing/orderFulfillment.ts`| `[REAL]` | Centralized order fulfillment updating orders, services, invoices, and triggering async provisioning. |
| `lib/db/schema.ts` | `[BROKEN / DRIFTED]` | Drizzle schema defines NextAuth tables, completely mismatched with actual Supabase tables. |

### 2.6 API Route Plane (`app/api/*`)
| Endpoint | Status | Evidence / Notes |
|---|---|---|
| `app/api/admin-reset/route.ts` | `[BROKEN / CRITICAL]` | Unauthenticated superadmin account wipe and takeover backdoor. |
| `app/api/admin-setup/route.ts` | `[BROKEN / HIGH]` | Unauthenticated superadmin creation if `admin_users` table has 0 rows. |
| `app/api/admin/route.ts` | `[REAL]` | Admin actions authenticated via Supabase session cookie and checked against `admin_users`. |
| `app/api/admin/billing/*` | `[BROKEN]` | Uses `verifyAdminRequest`, which contains the hardcoded secret backdoor. |
| `app/api/checkout/create/route.ts` | `[REAL / PARTIAL]` | Order creation authenticated via JWT, but missing Zod validation and domain sanitization. |
| `app/api/razorpay/create-order/route.ts` | `[REAL]` | Creates Razorpay order and stores `razorpay_order_id` on `hosting_orders`. |
| `app/api/razorpay/verify/route.ts` | `[REAL / VULNERABLE]` | Verifies signature, but uses non-constant-time comparison and lacks order ownership check. |
| `app/api/webhooks/razorpay/route.ts` | `[REAL / VULNERABLE]` | Verifies webhook signature, but uses non-constant-time string comparison (`!==`). |
| `app/api/cloud/*` (vps, dns, workers, storage, kv, ai-gateway) | `[PARTIAL / BROKEN]` | Mutates volatile in-memory process globals; unauthenticated callers can trigger mutations. |
| `app/api/action-gateway/*` | `[PARTIAL]` | ActionIntent ingestion and approval endpoints, but backed by in-memory Maps. |
| `app/api/openapi/route.ts` | `[REAL]` | Dynamic OpenAPI 3.1.0 JSON specification endpoint. |

### 2.7 Supabase Migrations & Edge Functions (`supabase/*`)
| Component | Status | Evidence / Notes |
|---|---|---|
| `supabase/migrations/` (26 files) | `[REAL]` | Comprehensive SQL schema for orders, services, plans, payment settings, action gateway, billing control plane. |
| Edge Function: `send-email` | `[REAL / VULNERABLE]` | Resend integration, but has NO authentication check (open mail relay). |
| Edge Function: `admin-auth` | `[BROKEN / CONFLICTING]` | Legacy custom SHA-256 password hashing and `admin_sessions` table; conflicting with Supabase Auth used in Next.js. |
| Edge Function: `vaulthost-payments` | `[REAL / VULNERABLE]` | Razorpay order creation; ownership check is bypassed if `Authorization` header is omitted. |
| Edge Function: `odoo-sync-lead` | `[REAL]` | Syncs leads to Odoo CRM via XML-RPC. |

### 2.8 Deployment & Infrastructure (`deploy/*`, `docker/*`)
| File / Component | Status | Evidence / Notes |
|---|---|---|
| `Dockerfile` | `[REAL]` | Pinned to `node:20-slim`, multi-stage build, `--include=dev` during build to ensure Tailwind compiles. |
| `docker-compose.yml` | `[REAL]` | Exposes port 80 internally without host port conflict for Traefik proxy. |
| `deploy/docker-compose.*.yml` | `[REAL]` | Standalone Compose stacks for PowerDNS, MinIO, FRP, LiteLLM, RabbitMQ, K3s, Coolify. |
| `deploy/ansible/*` | `[REAL]` | Playbooks for automated LXC container creation and service deployment on Proxmox VE. |

---

## 3. VERIFIED BUG & FLAW MATRIX

Every finding below has been directly observed and verified in the source code:

| # | File Path & Line | Severity | Flaw Description | Observed Impact | Proposed Fix |
|---|---|---|---|---|---|
| **1** | `app/api/admin-reset/route.ts:8-32` | **CRITICAL** | **Unauthenticated Admin Takeover Backdoor** | Anyone on the public internet can send a POST request with `{"confirmReset": "RESET_ADMIN_CONFIRMED", "email": "...", "password": "..."}`. The handler deletes all existing `admin_users` and `admin_sessions` and inserts the attacker as superadmin without any authentication or secret key check. | **Delete the file completely** or require a server-only environment flag / local CLI invocation that cannot be triggered via HTTP. |
| **2** | `lib/billing/adminAuth.ts:38-42` | **CRITICAL** | **Hardcoded Admin Secret Backdoor** | Passing the HTTP header `x-admin-secret: vaulthost-admin-supersecret` bypasses all authentication in all environments, granting full administrative privileges and returning the Supabase service client. | Remove the hardcoded string check. Only allow matching against `process.env.ADMIN_SECRET` using `crypto.timingSafeEqual`. |
| **3** | `lib/action-gateway/gateway.ts:437-455` | **CRITICAL** | **Hardcoded 2FA & Staff Authorization Bypasses** | `verifyStepUpAuth` accepts `'123456'`, `'2FA-VERIFIED-2026'`, or any token starting with `'totp_'`. `verifyStaffAuthorization` accepts any token with `length >= 6`. Any attacker can bypass Tier 2 (2FA) and Tier 3 (Human Staff Approval) checks. | Implement genuine RFC 6238 TOTP verification (e.g. `otplib`) and verify staff credentials against the database `admin_users` table with session tokens. |
| **4** | `middleware.ts:110-115` | **HIGH** | **Unprotected API Routes in Middleware** | The middleware matcher is configured as `matcher: ['/portal/:path*', '/admin/:path*']`. It does NOT match `/api/:path*`. As a result, all API routes (including admin APIs and cloud APIs) bypass middleware authentication entirely. | Expand matcher to include `/api/admin/:path*`, `/api/cloud/:path*`, and `/api/portal/:path*`, or enforce centralized token validation in middleware. |
| **5** | `supabase/functions/send-email/index.ts:23-33` | **HIGH** | **Open Mail Relay via `send-email` Edge Function** | There is no authentication check on incoming requests. Any anonymous client knowing the Supabase anon key can trigger POST `/functions/v1/send-email` with arbitrary `to`, `subject`, and `body`, using the server's `RESEND_API_KEY` to send spam. | Add JWT verification (`supabase.auth.getUser(token)`) and restrict arbitrary email sending to internal server role callers. |
| **6** | `supabase/functions/vaulthost-payments/index.ts:62-73` | **HIGH** | **Payment Verification Bypass when Header Omitted** | The check `if (userToken && userToken !== anonKey)` only verifies order ownership if a user token is provided. If the `Authorization` header is omitted, the check is skipped and the function generates a Razorpay order for any arbitrary `orderId`. | Invert check: `if (!userToken \|\| userToken === anonKey) return errorResponse("Authentication required", 401);`. |
| **7** | `app/api/cloud/vps/route.ts:267-275, 309-337` | **HIGH** | **Unauthenticated VPS Mutation Execution** | When calling POST `/api/cloud/vps`, if no Authorization header is passed, `actorId` defaults to `'user_active_session'`. Coupled with the bypass in `verifyStepUpAuth`, an anonymous caller can terminate or suspend any server by passing its UUID. | Enforce user session authentication, verify the user owns the `serviceId`, and reject unauthenticated requests with `401 Unauthorized`. |
| **8** | `lib/crypto/hybrid-pqc.ts:105-107, 140-145` | **HIGH** | **Simulated / Fake Post-Quantum Cryptography** | ML-DSA-65 and ML-KEM-768 are simulated with HMAC-SHA3-512. The verification function only checks `signature.pqcSignature.startsWith('mldsa65_')`. Violates architectural guidelines against hand-rolled crypto. | Replace with genuine NIST FIPS 203 / 204 WebAssembly implementation or remove pseudo-PQC claims until real WASM crystals libraries are integrated. |
| **9** | `app/api/webhooks/razorpay/route.ts:50` | **MEDIUM** | **Timing Attack in Webhook Signature Verification** | The webhook verifies HMAC-SHA256 using standard string equality `if (expectedSignature !== signature)`, which is vulnerable to timing attacks. | Use `crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf8'), Buffer.from(signature, 'utf8'))`. |
| **10** | `app/api/razorpay/verify/route.ts:44` | **MEDIUM** | **Timing Attack & Missing Caller Order Ownership Check** | Uses `generated_signature !== razorpay_signature` and accepts any `orderId` in the POST body without verifying that the authenticated user owns that order. | Use `crypto.timingSafeEqual` and verify `order.user_id === user.id`. |
| **11** | `app/api/cloud/*` (dns, workers, storage, kv) | **MEDIUM** | **Volatile In-Memory Process State for Cloud Resources** | Mutations to DNS, Workers, Storage, and KV mutate module-level arrays (`fallbackRecords`, `fallbackWorkers`, `fallbackBuckets`, `fallbackNamespaces`). Changes vanish on process restart and do not persist across multiple workers. | Wire each route to its corresponding client adapter (`lib/dns/powerdns.ts`, `lib/workers/workerd.ts`, `lib/storage/minio.ts`, Redis/PostgreSQL) and database tables. |
| **12** | `app/api/checkout/create/route.ts:48, 63` | **MEDIUM** | **Missing Input Validation & Crash on Undefined Addons** | If `addons` is undefined, `addons.reduce(...)` throws an unhandled TypeError. The `domain` field is unvalidated before being stored and passed to shell provisioning scripts. | Add Zod schema validation: default `addons` to `[]` and validate `domain` against regex `^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`. |
| **13** | `app/(portal)/portal/dashboard/page.tsx:75-100` | **MEDIUM** | **Deceptive Demo Data Presented to Logged-In Users** | When a newly registered customer logs in with 0 services, the dashboard displays mock servers (`svc-001`, `svc-002`) and paid invoices as if they belong to that customer. | Display proper empty states ("You have no active services. Launch your first VPS") when queries return empty arrays. |
| **14** | `supabase/functions/admin-auth/index.ts:21-25` | **MEDIUM** | **Weak Password Hashing in Legacy Admin Auth Function** | Passwords are hashed using single-round `SHA-256(password + SUPABASE_URL)`. `SUPABASE_URL` is public. Single-round unsalted/weakly-salted SHA-256 is vulnerable to rainbow table attacks. | Deprecate legacy `admin-auth` edge function in favor of Supabase Auth with bcrypt / argon2. |
| **15** | `lib/db/schema.ts:4-60` | **LOW** | **Drizzle Schema Drifted from Supabase Database** | The Drizzle schema defines NextAuth tables (`user`, `account`, `session`) which do not correspond to the real Supabase schema (`hosting_orders`, `hosting_services`, etc.). Running Drizzle migrations would create conflicting tables. | Update `lib/db/schema.ts` to reflect the canonical Supabase schema. |
| **16** | `project/test_rls.js:5-15` | **LOW** | **RLS Test Script Connects with Service Role** | `test_rls.js` connects using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS by definition, making the test ineffective. | Update script to test queries with `NEXT_PUBLIC_SUPABASE_ANON_KEY` and authenticated user JWTs. |

---

## 4. SECURITY & CRYPTOGRAPHY REVIEW

### 4.1 Authentication & Authorization
- **Customer Portal:** Properly authenticated via Supabase Auth using `@supabase/ssr` with HttpOnly cookies. Session checks in middleware guard `/portal/*` (redirecting unauthenticated users to `/portal/login`).
- **Admin Control Plane:** Conflicted state:
  - `middleware.ts` checks Supabase Auth user session against `admin_users` table where `user_id = user.id`.
  - However, `admin-reset/route.ts` creates admin rows with `password_hash` and `admin_sessions`, leaving `user_id` null. This causes an admin created via `admin-reset` to fail middleware checks.
  - Public routes `/admin/setup` and `/admin/reset` are explicitly exempted from middleware protection (`middleware.ts:72-75`).
- **API Plane:** Completely unguarded by `middleware.ts`. All protection must be performed inside each individual route handler, leading to inconsistencies.

### 4.2 Row-Level Security (RLS) Policies
- Verified enabled on: `hosting_orders`, `hosting_services`, `hosting_invoices`, `support_tickets`, `admin_users`, `admin_sessions`, `leads`.
- Gaps identified:
  - `admin_users`: Has `USING (false)` for authenticated non-admins, which prevents customer accounts from listing admins. Correct.
  - `payment_settings` & `provisioning_settings`: Tables contain sensitive API credentials (Proxmox tokens, Razorpay secrets, MinIO keys). They rely on application-level access controls rather than explicit RLS policies that restrict access solely to service-role clients.

### 4.3 Webhook Security & Payment Verification
- **Razorpay:** Signature verification is implemented in `app/api/webhooks/razorpay/route.ts` using HMAC-SHA256. It pulls secrets from environment variables or `payment_settings` row id=1. Timing-attack vulnerability present due to standard string equality (`!==`).
- **Stripe:** **0% Implementation.** The package `stripe` is not in `package.json`, and no webhook or checkout routes exist.

### 4.4 SSRF & Injection Surfaces in Provisioning Connectors
- `lib/provisioning/hestiacp.ts`: Executes commands by POSTing `cmd` and `arg1...argN` to HestiaCP's API. Because `params.domain` originates from unvalidated user input during checkout, lack of sanitization creates command injection risk on the remote HestiaCP server.
- `lib/provisioning/cyberpanel.ts`: Passes `this.config.cyberpanel_url` directly to `fetch()`. If an attacker updates provisioning settings via compromised admin credentials, they can point this URL to cloud metadata endpoints (`http://169.254.169.254/latest/meta-data/`) to extract host IAM credentials (SSRF).

### 4.5 Post-Quantum Cryptography & Zero-Fake-Crypto Policy
- `lib/crypto/hybrid-pqc.ts` claims compliance with NIST FIPS 203 (ML-KEM) and NIST FIPS 204 (ML-DSA).
- Inspection of lines 65-75 and 105-145 proves that PQC keys and signatures are generated using Node.js `crypto.randomBytes(64)` and `crypto.createHmac('sha3-512')`.
- Verification performs no mathematical lattice checks; it only verifies `signature.pqcSignature.startsWith('mldsa65_')`.
- This violates the explicit architectural rule: *"Do not hand-roll crypto; use vetted libraries."*

### 4.6 Rate Limiting
- **Zero rate limiting exists anywhere in the application.**
- Endpoints like `/api/checkout/create`, `/api/razorpay/create-order`, `/api/cloud/*`, and `/api/admin/*` can be spammed without throttling.

---

## 5. BUILD HEALTH & TEST EVIDENCE

All commands executed directly in the project workspace with verified outputs:

### 5.1 Typecheck (`npm run typecheck`)
```
> nextjs@0.1.0 typecheck
> tsc --noEmit

[Exit Code: 0] (0 errors)
```

### 5.2 Lint (`npm run lint`)
```
> nextjs@0.1.0 lint
> next lint

✔ No ESLint warnings or errors

[Exit Code: 0]
```

### 5.3 Production Build (`npm run build`)
```
> nextjs@0.1.0 build
> next build

   Creating an optimized production build...
 ✓ Compiled successfully
   Collecting page data...
   Generating static pages (178/178)
 ✓ Generating static pages (178/178)
 ✓ Finalizing page optimization...

Route (app)                                Size     First Load JS
├ ○ /                                      17.8 kB         153 kB
├ ○ /vaulthost                             18.1 kB         222 kB
├ ○ /portal/dashboard                      16.5 kB         180 kB
├ ○ /admin                                 12.4 kB         174 kB
... (178 routes compiled)
+ First Load JS shared by all              79.5 kB
ƒ Middleware                               223 kB

[Exit Code: 0]
```

### 5.4 Automated Test Suite
- `npm test`: **NOT CONFIGURED** (No script in `package.json`).
- Automated test coverage: **0%**.
- Existing root scripts (`test-admin.js`, `test_api.js`, `test_rls.js`) are manual, ad-hoc, and `test_rls.js` is flawed (uses service-role key).

---

## 6. INVENTORY OF FAKE / DEMO DATA PRESENTED AS LIVE

| File Path | Component / Route | Fake Data Observed | Problem |
|---|---|---|---|
| `app/(portal)/portal/dashboard/page.tsx:17-65` | `/portal/dashboard` | `DEMO_DASHBOARD_SERVICES` (`svc-001`, `svc-002`, `svc-003`), `DEMO_DASHBOARD_INVOICES`, `DEMO_DASHBOARD_TICKETS` | Real logged-in customers with 0 services are presented with fake active VPSs and paid invoices as if they own them. |
| `app/(portal)/portal/billing/page.tsx:13-18` | `/portal/billing` | `DEMO_INVOICES` (4 fake paid invoices totaling ₹19,996), mock storage/bandwidth meters | Shows fake billing history and usage percentages when real invoice list is empty. |
| `app/(portal)/portal/service/page.tsx:16-33` | `/portal/service` | `DEMO_SERVICES` (`svc-001` api.myapp.io, `svc-002` myblog.elsxglobal.com) | Shows fake hosting services to any customer without active services. |
| `app/(portal)/portal/profile/page.tsx:28-40` | `/portal/profile` | Fake active sessions (Chrome on Windows, Chrome on Android), mock API keys (`vh_live_9f83...`) | Fake security telemetry shown to users. |
| `app/(portal)/portal/notifications/page.tsx:10-18`| `/portal/notifications` | `DEMO_NOTIFICATIONS` (7 mock notifications about invoices and logins) | Fake notifications displayed if table is empty. |
| `app/(vaulthost)/vaulthost/status/page.tsx:16-48` | `/vaulthost/status` | Static 90-day uptime bars (100% green squares) and hardcoded regional latencies (Mumbai 8ms, etc.) | Static HTML masquerading as live telemetry. |
| `app/api/cloud/vps/route.ts:36-63` | `/api/cloud/vps` | `fallbackInstances` (`svc-001`, `svc-002`) | API returns hardcoded VPS instances when database returns 0 rows. |
| `app/api/cloud/dns/route.ts:34-42` | `/api/cloud/dns` | `fallbackRecords` (`rec-01` to `rec-07`) | DNS records stored in memory and returned as live edge DNS data. |
| `app/api/cloud/workers/route.ts:39-60` | `/api/cloud/workers` | `fallbackWorkers` (`wrk-001` edge-auth-router) | Fake worker code and metrics stored in memory. |
| `app/api/cloud/storage/route.ts:29-60` | `/api/cloud/storage` | `fallbackBuckets` (`bkt-01`, `bkt-02`, `bkt-03`) | Fake S3 buckets with fake size/egress savings data. |
| `app/api/cloud/kv/route.ts:26-46` | `/api/cloud/kv` | `fallbackNamespaces`, `fallbackEntries` | Mock key-value store in process memory. |
| `app/api/cloud/ai-gateway/route.ts:33-60` | `/api/cloud/ai-gateway` | `providers` (OpenAI, Anthropic, Google Vertex with fake spend and latency) | Hardcoded AI metrics returned to clients. |

---

## 7. RECOMMENDATIONS FOR PHASE 1 EXECUTION

Upon your explicit approval of this audit, Phase 1 should proceed in the following prioritized order:

1. **Security Remediation (Immediate):**
   - Completely delete `app/api/admin-reset/route.ts`.
   - Remove the `vaulthost-admin-supersecret` bypass from `lib/billing/adminAuth.ts`.
   - Update `middleware.ts` to protect `/api/admin/:path*` and `/api/cloud/:path*`.
   - Secure `supabase/functions/send-email/index.ts` and `vaulthost-payments/index.ts` with strict JWT verification.
   - Replace non-constant-time signature comparisons with `crypto.timingSafeEqual` in `webhooks/razorpay/route.ts` and `razorpay/verify/route.ts`.
2. **Cryptographic Remediation:**
   - Remove simulated/fake PQC from `lib/crypto/hybrid-pqc.ts`. Replace with genuine NIST FIPS 203 / 204 implementations using audited WebAssembly packages or revert to classical Ed25519/X25519 until audited PQC modules are imported.
3. **Action Gateway Hardening:**
   - Remove hardcoded bypasses (`'123456'`, `'2FA-VERIFIED-2026'`, `length >= 6`) from `lib/action-gateway/gateway.ts`.
   - Wire Action Gateway state persistence to PostgreSQL tables (`action_intents`, `action_approvals`, `action_audit_logs`) instead of in-memory Maps.
4. **Data Fidelity & Portal Polish:**
   - Replace demo fallback arrays in customer portal pages (`/portal/dashboard`, `/portal/billing`, `/portal/service`, `/portal/notifications`) with proper empty states and launch CTAs.
5. **Cloud Plane Real Daemon Integration:**
   - Connect `/api/cloud/dns` to `lib/dns/powerdns.ts`.
   - Connect `/api/cloud/storage` to `lib/storage/minio.ts`.
   - Connect `/api/cloud/workers` to `lib/workers/workerd.ts`.
   - Connect `/api/cloud/ai-gateway` to `lib/ai/litellm.ts`.
6. **Testing & QA Infrastructure:**
   - Install Vitest and Playwright to establish automated regression and security test suites.

---
*Report generated and verified against live workspace commit `89ef38a`.*
