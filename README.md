# ELSxGlobal / VaultHost — Enterprise Hosting Platform

A production-grade, enterprise hosting & reseller SaaS platform built under the parent brand **EvolucentSphere**. VaultHost provides managed hosting (Shared, VPS, Cloud, Dedicated, WordPress, Reseller) with a full checkout flow, payment gateway integration (Razorpay, UPI, Bank Transfer), admin panel, and customer portal.

## Tech Stack

- **Frontend**: Next.js 13 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + custom glassmorphism design system
- **Icons**: Lucide React (unified across every component)
- **Animations**: Framer Motion
- **Backend/DB**: Supabase (PostgreSQL + Auth + Row Level Security + Storage)
- **QR Generation**: qrcode.react (client-side, dynamic UPI payload)
- **Charts**: Recharts (admin dashboard)
- **Build/Deploy**: Multi-stage Docker (Alpine Node build → Alpine Nginx serve)

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- A Supabase project (already provisioned — credentials in `.env`)

## Local Development Setup

```bash
# Clone and install
npm install

# Environment variables are pre-populated in .env:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY (server-side only)

# Start dev server (runs automatically in Bolt environment)
npm run dev
```

## Database Migrations

All migrations are in `supabase/migrations/` and are applied via the Supabase MCP `apply_migration` tool. Key migrations:

| Migration | Description |
|-----------|-------------|
| `create_leads_table` | Lead capture from contact forms |
| `create_vaulthost_tables` | Core hosting schema (plans, orders, subscriptions) |
| `create_admin_users_table` | Admin authentication table |
| `create_payment_and_site_settings_tables` | Payment gateway config, site settings, transactions |

### Creating the First Admin User

The `admin_users` table starts empty. To create the master admin:

1. Navigate to `/admin/setup` in the browser
2. Enter your full name, email, and a strong password (min 8 characters)
3. Click "Initialize Master Admin"
4. The system creates a Supabase Auth user and inserts a record into `admin_users` with `role='super_admin'`
5. You will be redirected to `/admin/login` to sign in

**Why manual setup?** For security, the admin initialization is a one-time operation. After the first admin is created, the setup page locks and shows "Admin Already Initialized."

### Setting Admin Role Manually (Alternative)

If you need to promote an existing Supabase Auth user to admin:

```sql
-- Run in Supabase SQL Editor
INSERT INTO admin_users (user_id, email, full_name, role, is_active)
VALUES (
  'auth-user-uuid-here',
  'admin@elsxglobal.com',
  'Admin Name',
  'super_admin',
  true
);
```

## Docker Deployment

### Ubuntu / Alpine / Any Linux with Docker

```bash
# Build and start
docker-compose up -d --build

# Verify the container is healthy
docker ps
# Look for vaulthost_app with status "Up (healthy)"

# Check logs
docker logs vaulthost_app

# Stop
docker-compose down
```

The app will be available at `http://localhost:80`.

### Health Check

```bash
curl http://localhost/health
# Returns: {"status":"healthy","service":"elsxglobal"}
```

### Docker Architecture

- **Stage 1 (builder)**: `node:20-alpine` — installs dependencies and builds the Next.js app
- **Stage 2 (serve)**: `nginx:alpine` — serves the static export with gzip, security headers, and caching

### Environment Variables for Docker

The `docker-compose.yml` reads from `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

**Note**: Supabase service role keys and Razorpay key secrets stay server-side only (in Supabase Edge Functions environment, not in the frontend build).

## Payment Gateway Activation

### Razorpay

1. **Get API Keys**: Sign up at [razorpay.com](https://razorpay.com). Navigate to Settings → API Keys → Generate Key.
2. **Configure in Admin Panel**:
   - Go to `/admin` → Payment Settings tab
   - Toggle "Enable Razorpay"
   - Select mode: Sandbox (testing) or Live (production)
   - Enter Key ID and Key Secret
   - Click "Save Payment Settings"
3. **Webhook Setup** (optional, for payment verification):
   - In Razorpay Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/functions/v1/vaulthost-payments`
   - Events: `payment.captured`, `payment.failed`
4. **Status Indicator**: The admin panel shows "Connected" when Key ID is set and enabled.

### UPI Manual Payment

1. Go to `/admin` → Payment Settings tab
2. Toggle "Enable UPI Manual"
3. Enter your UPI ID (e.g., `business@axisbank`)
4. Enter Display Name (shown on QR payment screen, e.g., "ELSxGlobal")
5. A live QR preview renders with a Rs 1 test amount — scan with any UPI app to verify
6. Click "Save Payment Settings"
7. **Checkout Flow**: Customers see a dynamic UPI QR with the exact order amount. They scan, pay, and upload a screenshot as proof. The order goes to `pending_verification` status for admin approval.

### Bank Transfer

1. Go to `/admin` → Payment Settings tab
2. Toggle "Enable Bank Transfer"
3. Fill in: Account Name, Account Number, IFSC Code, Bank Name
4. Click "Save Payment Settings"
5. **Checkout Flow**: Customers see bank details, transfer via NEFT/IMPS, upload proof. Order goes to `pending_verification`.

## Custom QR Upload Guide

The admin panel supports uploading a custom QR image that overrides the dynamic UPI QR in checkout:

1. Go to `/admin` → Payment Settings tab → UPI section
2. Under "Custom QR Image", click the upload area
3. Select a PNG or JPEG file (max 2MB)
4. The image uploads to the `qr-uploads` Supabase Storage bucket
5. Click "Save Payment Settings" to apply
6. **Reverting**: Click the trash icon on the uploaded QR to remove it. The system reverts to the dynamic UPI QR.

**When to use custom QR**: If you have a pre-designed QR with your logo/branding, or a static QR linked to a specific merchant account.

## Trust Badge Activation

Trust badges (Meta Partner, GoDaddy Reseller, AWS Partner, etc.) are managed in `/admin` → Site Settings tab:

1. Each badge has fields: Name, Logo URL, Verification URL, Verified toggle, Display toggle
2. **Only badges with `verified=true` AND `display=true` appear on the public site**
3. To activate a badge:
   - Set "Verified" to true (after confirming your partnership credentials)
   - Set "Display on site" to true
4. To add a new badge: Click "Add Badge", fill in details, save
5. To remove: Click the trash icon on the badge card

Default seeded badges: Meta Business Partner, GoDaddy Authorized Reseller, AWS Partner Network, Microsoft Cloud Partner, Google Cloud Partner, ISO 27001 Certified.

## Database Schema (Text ERD)

```
auth.users (Supabase managed)
  └── admin_users (id, user_id, email, role, full_name, is_active)
  └── hosting_orders (user_id → auth.users.id)

hosting_plans
  ├── hosting_orders (plan_id → hosting_plans.id)
  └── hosting_order_addons (order_id → hosting_orders.id)

hosting_orders
  ├── transactions (order_id → hosting_orders.id)
  ├── hosting_subscriptions (order_id → hosting_orders.id)
  └── hosting_invoices (order_id → hosting_orders.id)

support_tickets
  └── ticket_replies (ticket_id → support_tickets.id)

payment_settings (single-row, id=1)
  ├── razorpay_enabled, razorpay_key_id, razorpay_key_secret, razorpay_mode
  ├── upi_enabled, upi_id, upi_display_name
  ├── bank_transfer_enabled, bank_details (jsonb)
  └── custom_qr_image_url

site_settings (single-row, id=1)
  ├── org_name, tagline, support_email, support_phone
  └── trust_badges (jsonb array)

leads → Odoo CRM sync (via edge function)
```

### RLS Policy Summary

| Table | Read | Write |
|-------|------|-------|
| payment_settings | Admin only | Admin only |
| public_payment_settings (view) | Public (anon) | N/A |
| site_settings | Public (anon) | Admin only |
| transactions | Owner + Admin | Owner (insert), Admin (update) |
| hosting_orders | Owner + Admin | Owner (insert), Admin (update) |
| admin_users | Self (own row) | Self (update own) |

## Folder Structure

```
elsxglobal/
├── app/
│   ├── admin/              # Admin panel (dashboard, orders, plans, tickets, settings)
│   │   ├── login/          # Admin login
│   │   ├── setup/          # One-time admin initialization
│   │   └── page.tsx        # Admin dashboard with all tabs
│   ├── blog/              # Blog with dynamic [slug] routes
│   ├── industries/        # Industry pages with [slug] routes
│   ├── locations/         # Location pages with [slug] routes
│   ├── portal/            # Customer portal (dashboard, orders, tickets, billing)
│   ├── vaulthost/          # Hosting platform
│   │   ├── checkout/      # 5-step checkout wizard
│   │   ├── pricing/       # Pricing page with AWS/Azure comparison
│   │   ├── shared/         # Shared hosting tier page
│   │   ├── vps/            # VPS hosting tier page
│   │   ├── cloud/          # Cloud hosting tier page
│   │   ├── dedicated/       # Dedicated server tier page
│   │   ├── wordpress/       # WordPress hosting tier page
│   │   ├── domains/        # Domain registration
│   │   ├── ssl/            # SSL certificates
│   │   ├── email/          # Business email
│   │   ├── website-builder/ # AI website builder
│   │   └── kb/             # Knowledge base with [slug] routes
│   ├── about/             # About page
│   ├── contact/           # Contact form
│   ├── services/          # Services overview
│   └── ...                # Other marketing pages
├── components/
│   ├── hosting/           # Hosting-specific components
│   │   ├── plan-card.tsx          # Plan card with glassmorphism
│   │   ├── tier-page.tsx         # Tier page layout
│   │   ├── qr-payment-canvas.tsx # UPI QR + proof upload
│   │   └── comparison-matrix.tsx # AWS/Azure comparison table
│   ├── sections/          # Homepage sections
│   ├── site/              # Site-wide components (navbar, footer, logo)
│   └── ui/                # shadcn/ui primitives
├── lib/
│   ├── supabase.ts        # Client-side Supabase singleton
│   ├── supabase-server.ts # Server-side Supabase client
│   ├── seo.ts             # SEO metadata + JSON-LD schemas
│   └── utils.ts           # Utility functions
├── supabase/
│   ├── migrations/        # SQL migrations (applied via MCP tool)
│   └── functions/         # Edge functions
│       ├── admin-auth/    # Admin authentication + setup
│       ├── vaulthost-payments/ # Payment processing
│       └── odoo-sync-lead/   # Lead sync to Odoo CRM
├── docker/
│   └── nginx.conf         # Nginx production config
├── Dockerfile             # Multi-stage build
├── docker-compose.yml     # Container orchestration
└── .env                   # Environment variables (pre-populated)
```

## Environment Variable Reference

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key (edge functions) |
| `SUPABASE_DB_URL` | Server only | Direct Postgres connection string |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Frontend | Razorpay public key ID |
| `RAZORPAY_KEY_SECRET` | Server only | Razorpay secret key (edge functions) |

## Checkout Flow (State Machine)

```
Step 1: Plan + Cycle Selection
  → Create order row (status=pending_payment)
Step 2: Domain & Addons
  → PATCH order (domain, addons, recalculated amount)
Step 3: Account (skip if logged in)
  → Supabase Auth signup
Step 4: Payment Method
  → Razorpay: checkout modal → success/failure
  → UPI Manual: dynamic QR + proof upload → pending_verification
  → Bank Transfer: bank details + proof upload → pending_verification
Step 5: Confirmation
  → Show order ID, expected activation timeline
```

### Order Status Flow

```
pending_payment → pending_verification → active
                                    ↓
                              cancelled (rejected)
active → suspended → active (reactivated)
```

## Admin Panel Features

- **Dashboard**: Live stats (revenue, active subscriptions, pending verifications, open tickets) from Supabase
- **Orders**: Full order management with approve/suspend/reject + audit log
- **Plans**: CRUD for hosting plans (edit pricing, features, specs)
- **Addons**: Manage optional addons (SSL, backup, managed support)
- **Users**: Customer management
- **Tickets**: Threaded support ticket replies
- **Invoices**: Invoice management
- **Payments**: Transaction audit log with receipt viewer
- **Payment Settings**: Razorpay + UPI + Bank + Custom QR configuration
- **Site Settings**: Trust badges manager + org metadata
- **Leads**: Odoo CRM lead sync status

## Known Limitations & Future Roadmap

### Current Limitations
- Razorpay checkout uses client-side integration (server-side verification via edge function recommended for production)
- No real-time admin dashboard updates (planned: Supabase real-time subscriptions)
- Custom QR image upload requires manual storage bucket setup in Supabase

### Roadmap
- Server-side Razorpay payment verification
- Supabase real-time dashboard updates
- Automated provisioning webhook (cPanel/WHM integration)
- Multi-currency support (USD, EUR)
- White-label reseller dashboard
- Mobile app (React Native)
- AI-powered support chatbot
- Advanced analytics with cohort retention

## License

Proprietary — EvolucentSphere / ELSxGlobal. All rights reserved.
