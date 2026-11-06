-- ============================================================
-- Enterprise Cloud Fleet Schema Migration
-- VaultHost by ELSxGlobal — Complete Backend Infrastructure
-- Created: 2026-09-28
-- ============================================================

-- ─── 1. DNS Subsystem ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_dns_zones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  domain           TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_delegation', 'suspended', 'degraded')),
  nameservers      TEXT[] NOT NULL DEFAULT ARRAY['ns1.vaulthost.cloud', 'ns2.vaulthost.cloud'],
  dnssec_status    TEXT NOT NULL DEFAULT 'disabled' CHECK (dnssec_status IN ('disabled', 'active', 'pending')),
  query_count_24h  BIGINT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_dns_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id          UUID NOT NULL REFERENCES cloud_dns_zones(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA', 'PTR')),
  name             TEXT NOT NULL,
  content          TEXT NOT NULL,
  ttl              INTEGER NOT NULL DEFAULT 300,
  proxied          BOOLEAN NOT NULL DEFAULT true,
  priority         INTEGER,
  comment          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dns_zones_tenant      ON cloud_dns_zones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_zone      ON cloud_dns_records(zone_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_tenant    ON cloud_dns_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_name_type ON cloud_dns_records(name, type);

-- ─── 2. Edge Compute & Workers Subsystem ───────────────────────

CREATE TABLE IF NOT EXISTS cloud_workers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  route_pattern    TEXT NOT NULL,
  script_code      TEXT NOT NULL,
  runtime          TEXT NOT NULL DEFAULT 'v8_isolate' CHECK (runtime IN ('v8_isolate', 'wasm', 'python_edge')),
  memory_limit_mb  INTEGER NOT NULL DEFAULT 128,
  cpu_limit_ms     INTEGER NOT NULL DEFAULT 50,
  replicas         TEXT NOT NULL DEFAULT 'global_anycast' CHECK (replicas IN ('global_anycast', 'regional_apac', 'regional_eu', 'regional_us')),
  status           TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'throttled', 'suspended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS cloud_worker_deployments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES cloud_workers(id) ON DELETE CASCADE,
  version          TEXT NOT NULL,
  code_hash        TEXT NOT NULL,
  deployed_by      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rollback', 'superseded')),
  deployed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_worker_bindings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES cloud_workers(id) ON DELETE CASCADE,
  binding_type     TEXT NOT NULL CHECK (binding_type IN ('kv_namespace', 'r2_bucket', 'd1_database', 'ai_gateway', 'queue', 'secret')),
  binding_name     TEXT NOT NULL,
  target_resource  TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, binding_name)
);

CREATE TABLE IF NOT EXISTS cloud_worker_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES cloud_workers(id) ON DELETE CASCADE,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  level            TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  method           TEXT NOT NULL DEFAULT 'GET',
  path             TEXT NOT NULL,
  status_code      INTEGER NOT NULL DEFAULT 200,
  colo             TEXT NOT NULL DEFAULT 'BOM',
  duration_ms      NUMERIC(8, 2) NOT NULL DEFAULT 1.5,
  message          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workers_tenant       ON cloud_workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workers_status       ON cloud_workers(status);
CREATE INDEX IF NOT EXISTS idx_worker_deployments   ON cloud_worker_deployments(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_logs_worker   ON cloud_worker_logs(worker_id, timestamp DESC);

-- ─── 3. VaultR2 Object Storage Subsystem ───────────────────────

CREATE TABLE IF NOT EXISTS cloud_storage_buckets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL UNIQUE,
  region           TEXT NOT NULL DEFAULT 'auto_anycast' CHECK (region IN ('auto_anycast', 'ap_south_mumbai', 'eu_west_frankfurt', 'us_east_virginia')),
  object_count     BIGINT NOT NULL DEFAULT 0,
  size_bytes       BIGINT NOT NULL DEFAULT 0,
  public_access    BOOLEAN NOT NULL DEFAULT false,
  cors_enabled     BOOLEAN NOT NULL DEFAULT true,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_storage_objects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id        UUID NOT NULL REFERENCES cloud_storage_buckets(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL,
  object_key       TEXT NOT NULL,
  size_bytes       BIGINT NOT NULL DEFAULT 0,
  content_type     TEXT NOT NULL DEFAULT 'application/octet-stream',
  etag             TEXT NOT NULL,
  storage_class    TEXT NOT NULL DEFAULT 'standard' CHECK (storage_class IN ('standard', 'infrequent_access', 'archive')),
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bucket_id, object_key)
);

CREATE TABLE IF NOT EXISTS cloud_s3_credentials (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  access_key_id    TEXT NOT NULL UNIQUE,
  secret_key_hash  TEXT NOT NULL,
  permissions      TEXT NOT NULL DEFAULT 'Read-Write' CHECK (permissions IN ('Read-Write', 'Read-Only', 'Admin')),
  ip_allowlist     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  last_accessed_ip TEXT,
  last_active      TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buckets_tenant       ON cloud_storage_buckets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_objects_bucket       ON cloud_storage_objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_objects_tenant       ON cloud_storage_objects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_s3_creds_tenant      ON cloud_s3_credentials(tenant_id);

-- ─── 4. Security & DDoS Subsystem ──────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_security_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  rule_type        TEXT NOT NULL CHECK (rule_type IN ('IP_CIDR', 'COUNTRY', 'ASN', 'WAF_OWASP', 'RATE_LIMIT', 'BOT_MANAGEMENT')),
  target_domain    TEXT NOT NULL DEFAULT '*',
  action           TEXT NOT NULL CHECK (action IN ('Block', 'Managed Challenge', 'JS Challenge', 'Allow', 'Log')),
  expression       TEXT NOT NULL,
  description      TEXT,
  hits_count       BIGINT NOT NULL DEFAULT 0,
  enabled          BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_attack_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_domain    TEXT NOT NULL,
  vector           TEXT NOT NULL,
  peak_rate        TEXT NOT NULL,
  layer            TEXT NOT NULL DEFAULT 'L7' CHECK (layer IN ('L3/L4', 'L7')),
  scrubbing_center TEXT NOT NULL DEFAULT 'BOM-01',
  mitigation       TEXT NOT NULL,
  packets_dropped  TEXT NOT NULL DEFAULT '0',
  status           TEXT NOT NULL DEFAULT 'mitigated' CHECK (status IN ('mitigated', 'absorbing', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_security_rules_tenant ON cloud_security_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attack_events_time    ON cloud_attack_events(timestamp DESC);

-- ─── 5. AI Gateway Governance Subsystem ─────────────────────────

CREATE TABLE IF NOT EXISTS cloud_ai_providers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  provider_id      TEXT NOT NULL,
  provider_name    TEXT NOT NULL,
  default_model    TEXT NOT NULL,
  spend_limit_usd  NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  spend_current_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  rate_limit_tpm   TEXT NOT NULL DEFAULT '1,000,000 TPM',
  rate_limit_rpm   TEXT NOT NULL DEFAULT '5,000 RPM',
  api_key_masked   TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'degraded', 'maintenance')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, provider_id)
);

CREATE TABLE IF NOT EXISTS cloud_ai_cache_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  prompt_hash      TEXT NOT NULL,
  prompt_preview   TEXT NOT NULL,
  response_text    TEXT NOT NULL,
  model            TEXT NOT NULL,
  provider         TEXT NOT NULL,
  tokens_saved     INTEGER NOT NULL DEFAULT 0,
  cost_saved_usd   NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
  hit_count        INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(tenant_id, prompt_hash)
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_hash         ON cloud_ai_cache_entries(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_tenant       ON cloud_ai_cache_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_providers_tenant   ON cloud_ai_providers(tenant_id);

-- ─── 6. VPS & Dedicated Server Subsystem ───────────────────────

CREATE TABLE IF NOT EXISTS cloud_vps_instances (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  hostname         TEXT NOT NULL,
  plan_name        TEXT NOT NULL,
  ip_address       TEXT NOT NULL,
  ipv6_address     TEXT,
  vcpu             INTEGER NOT NULL DEFAULT 2,
  ram_gb           INTEGER NOT NULL DEFAULT 4,
  storage_gb       INTEGER NOT NULL DEFAULT 80,
  bandwidth_tb     INTEGER NOT NULL DEFAULT 3,
  os               TEXT NOT NULL DEFAULT 'Ubuntu 24.04 LTS',
  location         TEXT NOT NULL DEFAULT 'Mumbai, India (BOM-01)',
  status           TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'rebuilding', 'suspended')),
  cpu_usage_pct    NUMERIC(5, 2) NOT NULL DEFAULT 14.5,
  ram_usage_pct    NUMERIC(5, 2) NOT NULL DEFAULT 42.1,
  disk_usage_pct   NUMERIC(5, 2) NOT NULL DEFAULT 28.0,
  renewal_date     TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_vps_snapshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id      UUID NOT NULL REFERENCES cloud_vps_instances(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  size_gb          NUMERIC(8, 2) NOT NULL DEFAULT 5.4,
  status           TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vps_tenant            ON cloud_vps_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vps_snapshots         ON cloud_vps_snapshots(instance_id);

-- ─── 7. Row Level Security & Access Policies ───────────────────

ALTER TABLE cloud_dns_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_dns_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_worker_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_worker_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_worker_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_s3_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_ai_cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_vps_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_vps_snapshots ENABLE ROW LEVEL SECURITY;

-- Admins full access policy template
CREATE POLICY "Admins full access dns_zones" ON cloud_dns_zones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Tenants read own dns_zones" ON cloud_dns_zones FOR SELECT TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own dns_records" ON cloud_dns_records FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own workers" ON cloud_workers FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants read own worker_logs" ON cloud_worker_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM cloud_workers WHERE cloud_workers.id = cloud_worker_logs.worker_id AND cloud_workers.tenant_id = auth.uid()::text));

CREATE POLICY "Tenants manage own storage_buckets" ON cloud_storage_buckets FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own storage_objects" ON cloud_storage_objects FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own s3_credentials" ON cloud_s3_credentials FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own security_rules" ON cloud_security_rules FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own ai_providers" ON cloud_ai_providers FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own vps_instances" ON cloud_vps_instances FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);
