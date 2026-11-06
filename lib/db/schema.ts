import { timestamp, pgTable, text, primaryKey, integer, boolean, numeric, bigint } from "drizzle-orm/pg-core"
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
