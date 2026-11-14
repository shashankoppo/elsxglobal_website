import { timestamp, pgTable, text, primaryKey, integer, boolean, numeric, bigint, jsonb } from "drizzle-orm/pg-core"
import type { AdapterAccount } from "@auth/core/adapters"

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("client").notNull(), // 'admin' | 'client'
  organizationId: text("organizationId"),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

export const organizations = pgTable("organization", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})

export const vaultHostDeployments = pgTable("vaultHostDeployment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  projectName: text("projectName").notNull(),
  framework: text("framework").default("nextjs"),
  status: text("status").default("active"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})

export const invoices = pgTable("invoice", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // stored in cents
  status: text("status").default("pending"), // 'pending' | 'paid' | 'overdue'
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
})

// ─── Cloud DNS Fleet ──────────────────────────────────────────

export const cloudDnsZones = pgTable("cloud_dns_zones", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull(),
  domain: text("domain").notNull().unique(),
  status: text("status").default("active").notNull(),
  dnssecStatus: text("dnssec_status").default("disabled").notNull(),
  queryCount24h: bigint("query_count_24h", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const cloudDnsRecords = pgTable("cloud_dns_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  zoneId: text("zone_id").notNull().references(() => cloudDnsZones.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  ttl: integer("ttl").default(300).notNull(),
  proxied: boolean("proxied").default(true).notNull(),
  priority: integer("priority"),
  comment: text("comment"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ─── Cloud Edge Workers ───────────────────────────────────────

export const cloudWorkers = pgTable("cloud_workers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  routePattern: text("route_pattern").notNull(),
  scriptCode: text("script_code").notNull(),
  runtime: text("runtime").default("v8_isolate").notNull(),
  memoryLimitMb: integer("memory_limit_mb").default(128).notNull(),
  cpuLimitMs: integer("cpu_limit_ms").default(50).notNull(),
  replicas: text("replicas").default("global_anycast").notNull(),
  status: text("status").default("running").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const cloudWorkerLogs = pgTable("cloud_worker_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workerId: text("worker_id").notNull().references(() => cloudWorkers.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
  level: text("level").default("info").notNull(),
  method: text("method").default("GET").notNull(),
  path: text("path").notNull(),
  statusCode: integer("status_code").default(200).notNull(),
  colo: text("colo").default("BOM").notNull(),
  durationMs: numeric("duration_ms").default("1.5").notNull(),
  message: text("message").notNull(),
})

// ─── Cloud Storage Buckets ────────────────────────────────────

export const cloudStorageBuckets = pgTable("cloud_storage_buckets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull().unique(),
  region: text("region").default("auto_anycast").notNull(),
  objectCount: bigint("object_count", { mode: "number" }).default(0).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).default(0).notNull(),
  publicAccess: boolean("public_access").default(false).notNull(),
  corsEnabled: boolean("cors_enabled").default(true).notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ─── Cloud VPS Instances ──────────────────────────────────────

export const cloudVpsInstances = pgTable("cloud_vps_instances", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  hostname: text("hostname").notNull(),
  planName: text("plan_name").notNull(),
  ipAddress: text("ip_address").notNull(),
  ipv6Address: text("ipv6_address"),
  vcpu: integer("vcpu").default(2).notNull(),
  ramGb: integer("ram_gb").default(4).notNull(),
  storageGb: integer("storage_gb").default(80).notNull(),
  bandwidthTb: integer("bandwidth_tb").default(3).notNull(),
  os: text("os").default("Ubuntu 24.04 LTS").notNull(),
  location: text("location").default("Mumbai, India (BOM-01)").notNull(),
  status: text("status").default("running").notNull(),
  cpuUsagePct: numeric("cpu_usage_pct").default("14.5").notNull(),
  ramUsagePct: numeric("ram_usage_pct").default("42.1").notNull(),
  diskUsagePct: numeric("disk_usage_pct").default("28.0").notNull(),
  renewalDate: timestamp("renewal_date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ─── Hosting & Provisioning Fleet (Canonical Supabase Tables) ──────

export const hostingPlans = pgTable("hosting_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tier: text("tier").default("vps").notNull(),
  priceMonthly: integer("price_monthly").notNull(),
  priceYearly: integer("price_yearly"),
  cpu: text("cpu"),
  ram: text("ram"),
  storage: text("storage"),
  bandwidth: text("bandwidth"),
  specs: jsonb("specs").$type<Record<string, any>>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const hostingOrders = pgTable("hosting_orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  planId: text("plan_id"),
  status: text("status").default("pending_payment").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR").notNull(),
  billingCycle: text("billing_cycle").default("monthly").notNull(),
  domain: text("domain"),
  paymentGateway: text("payment_gateway"),
  transactionId: text("transaction_id"),
  razorpayOrderId: text("razorpay_order_id"),
  notes: text("notes"),
  customSpecs: jsonb("custom_specs").$type<Record<string, any>>(),
  addons: jsonb("addons").$type<string[]>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const hostingServices = pgTable("hosting_services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  orderId: text("order_id"),
  planId: text("plan_id"),
  planName: text("plan_name").notNull(),
  domain: text("domain"),
  status: text("status").default("provisioning").notNull(),
  ipAddress: text("ip_address"),
  controlPanelUrl: text("control_panel_url"),
  externalId: text("external_id"),
  adapter: text("adapter").default("proxmox"),
  tier: text("tier").default("vps"),
  location: text("location").default("Mumbai, India (BOM-01)"),
  renewalDate: timestamp("renewal_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const hostingInvoices = pgTable("hosting_invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  orderId: text("order_id"),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: integer("amount").notNull(),
  status: text("status").default("paid").notNull(),
  period: text("period"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  role: text("role").default("admin").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const paymentSettings = pgTable("payment_settings", {
  id: integer("id").primaryKey(),
  isActive: boolean("is_active").default(true).notNull(),
  razorpayEnabled: boolean("razorpay_enabled").default(true).notNull(),
  razorpayKeyId: text("razorpay_key_id"),
  razorpayKeySecret: text("razorpay_key_secret"),
  razorpayWebhookSecret: text("razorpay_webhook_secret"),
  upiEnabled: boolean("upi_enabled").default(true).notNull(),
  upiVpa: text("upi_vpa"),
  currency: text("currency").default("INR").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const provisioningSettings = pgTable("provisioning_settings", {
  id: integer("id").primaryKey(),
  proxmoxUrl: text("proxmox_url"),
  proxmoxTokenId: text("proxmox_token_id"),
  proxmoxTokenSecret: text("proxmox_token_secret"),
  powerdnsUrl: text("powerdns_url"),
  powerdnsApiKey: text("powerdns_api_key"),
  minioEndpoint: text("minio_endpoint"),
  minioAccessKey: text("minio_access_key"),
  minioSecretKey: text("minio_secret_key"),
  workerdUrl: text("workerd_url"),
  litellmBaseUrl: text("litellm_base_url"),
  litellmMasterKey: text("litellm_master_key"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const supportTickets = pgTable("support_tickets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: text("priority").default("medium").notNull(),
  status: text("status").default("open").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const supportReplies = pgTable("support_replies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ticketId: text("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  isStaff: boolean("is_staff").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const leads = pgTable("leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  serviceInterest: text("service_interest"),
  message: text("message"),
  source: text("source").default("contact_form").notNull(),
  status: text("status").default("new").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("system").notNull(),
  severity: text("severity").default("info").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash"),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name"),
  phone: text("phone"),
  country: text("country"),
  company: text("company"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const creditBalances = pgTable("credit_balances", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  balancePaise: integer("balance_paise").default(0).notNull(),
  lifetimeCreditedPaise: integer("lifetime_credited_paise").default(0).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const backupSnapshots = pgTable("backup_snapshots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  serviceId: text("service_id").notNull().references(() => hostingServices.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").default("completed").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})
