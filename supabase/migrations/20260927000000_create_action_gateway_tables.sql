-- ============================================================
-- Action Gateway Tables Migration
-- VaultHost by ELSxGlobal — Phase 2 Infrastructure
-- Created: 2026-09-27
-- ============================================================

-- ─── Action Gateway Audit Logs ───────────────────────────────
-- Immutable, HMAC-SHA256 chained audit ledger
CREATE TABLE IF NOT EXISTS action_gateway_audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id        TEXT NOT NULL,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id         TEXT NOT NULL,
  actor_type       TEXT NOT NULL CHECK (actor_type IN ('human_user', 'ai_agent', 'system', 'scheduled_job')),
  actor_role       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  action_verb      TEXT NOT NULL,
  resource_type    TEXT NOT NULL,
  resource_id      TEXT NOT NULL,
  risk_tier        INTEGER NOT NULL CHECK (risk_tier BETWEEN 0 AND 3),
  outcome          TEXT NOT NULL CHECK (outcome IN ('executed', 'rejected', 'confirmed', 'cancelled', 'enqueued', 'approved', 'timed_out')),
  parameters       JSONB NOT NULL DEFAULT '{}',
  diff_preview     JSONB,
  approver_staff_id TEXT,
  confirmation_token TEXT,
  step_up_token    TEXT,
  hmac_signature   TEXT NOT NULL,
  previous_log_hash TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id       ON action_gateway_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id        ON action_gateway_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_intent_id       ON action_gateway_audit_logs(intent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at      ON action_gateway_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_tier       ON action_gateway_audit_logs(risk_tier);
CREATE INDEX IF NOT EXISTS idx_audit_logs_outcome         ON action_gateway_audit_logs(outcome);

-- Row Level Security
ALTER TABLE action_gateway_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins (super_admin, system_admin, staff) can read all logs
CREATE POLICY "Admins can read all audit logs" ON action_gateway_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'system_admin', 'staff')
    )
  );

-- Tenants can read their own logs
CREATE POLICY "Tenants can read own audit logs" ON action_gateway_audit_logs
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid()::text);

-- No direct INSERT for regular users — only via service_role (Action Gateway server)
-- INSERT allowed via service_role key only (no policy = deny for anon/authenticated)

-- ─── Action Gateway Approvals (Tier 3 Queue) ─────────────────
-- Persistent queue for Tier 3 staff approval requests
CREATE TABLE IF NOT EXISTS action_gateway_approvals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id        TEXT NOT NULL UNIQUE,
  tenant_id        TEXT NOT NULL,
  actor_id         TEXT NOT NULL,
  actor_type       TEXT NOT NULL,
  actor_role       TEXT NOT NULL,
  action_verb      TEXT NOT NULL,
  resource_type    TEXT NOT NULL,
  resource_id      TEXT NOT NULL,
  parameters       JSONB NOT NULL DEFAULT '{}',
  diff_preview     JSONB,
  ai_reasoning     TEXT,
  risk_tier        INTEGER NOT NULL DEFAULT 3,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
  approver_staff_id TEXT,
  approver_note    TEXT,
  approved_at      TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approvals_tenant_id    ON action_gateway_approvals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status       ON action_gateway_approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at   ON action_gateway_approvals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_expires_at   ON action_gateway_approvals(expires_at);

ALTER TABLE action_gateway_approvals ENABLE ROW LEVEL SECURITY;

-- Admins can read and update approvals
CREATE POLICY "Admins can manage approvals" ON action_gateway_approvals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'system_admin', 'staff')
    )
  );

-- Tenants can see their own pending approvals (read-only)
CREATE POLICY "Tenants can read own approvals" ON action_gateway_approvals
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid()::text);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_action_gateway_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_approvals_updated_at
  BEFORE UPDATE ON action_gateway_approvals
  FOR EACH ROW EXECUTE FUNCTION update_action_gateway_approvals_updated_at();

-- ─── Action Gateway Idempotency Keys ─────────────────────────
-- 24-hour TTL cache for idempotency enforcement
CREATE TABLE IF NOT EXISTS action_gateway_idempotency (
  key              TEXT PRIMARY KEY,
  intent_id        TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  outcome          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON action_gateway_idempotency(expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_tenant_id  ON action_gateway_idempotency(tenant_id);

ALTER TABLE action_gateway_idempotency ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage idempotency keys (no user policies = deny for all roles)

-- ─── Comments / Documentation ────────────────────────────────
COMMENT ON TABLE action_gateway_audit_logs IS
  'Immutable HMAC-SHA256 chained audit log for all Action Gateway mutations. Every record is cryptographically linked to the previous (blockchain-style ledger). Append-only via service_role.';

COMMENT ON TABLE action_gateway_approvals IS
  'Persistent queue for Tier 3 (staff-authorized) Action Gateway intents. Entries expire after 48 hours. Approved entries trigger execution via the Action Gateway.';

COMMENT ON TABLE action_gateway_idempotency IS
  'Short-lived idempotency key store for Action Gateway. Prevents duplicate mutations from retried requests. TTL = 24 hours.';

COMMENT ON COLUMN action_gateway_audit_logs.hmac_signature IS
  'HMAC-SHA256(secret, intentId + timestamp + actorId + outcome + previousLogHash). Provides tamper-evidence.';

COMMENT ON COLUMN action_gateway_audit_logs.previous_log_hash IS
  'SHA-256 hash of the previous audit log entry. Creates a cryptographic chain (like a blockchain) for tamper detection.';
