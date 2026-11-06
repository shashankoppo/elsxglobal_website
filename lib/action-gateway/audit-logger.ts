import crypto from 'crypto';
import { AuditLogEntry, RiskTier, TargetService, ActionActor } from './types';
import { supabase } from '@/lib/supabase';

// Secret key for HMAC audit signing (in production, loaded from Vault / KMS / HSM)
const AUDIT_SECRET = process.env.AUDIT_SIGNING_KEY || 'vaulthost_audit_immutable_secret_key_v1_pqc_ready';

declare global {
  // eslint-disable-next-line no-var
  var __vaulthost_audit_logs: AuditLogEntry[] | undefined;
  // eslint-disable-next-line no-var
  var __vaulthost_last_log_hash: string | undefined;
}

// In-memory ring buffer of audit logs (retains last 1,000 entries across Next.js dev bundles)
const inMemoryAuditLogs: AuditLogEntry[] = globalThis.__vaulthost_audit_logs ?? (globalThis.__vaulthost_audit_logs = []);
let lastLogHash = globalThis.__vaulthost_last_log_hash ?? (globalThis.__vaulthost_last_log_hash = '0000000000000000000000000000000000000000000000000000000000000000');

export interface CreateAuditLogParams {
  actor: ActionActor;
  clientIp?: string;
  intentId: string;
  targetService: TargetService;
  actionVerb: string;
  resourceUri: string;
  riskTier: RiskTier;
  diff?: {
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  };
  outcome: 'executed' | 'denied' | 'enqueued_approval' | 'confirmed' | 'rejected';
  approverId?: string;
}

/**
 * Calculates a cryptographic SHA-256 HMAC signature linking the current log entry
 * to the previous log entry's hash, forming an immutable tamper-evident chain.
 */
function computeSignature(payload: string, previousHash: string): string {
  const hmac = crypto.createHmac('sha256', AUDIT_SECRET);
  hmac.update(`${previousHash}:${payload}`);
  return hmac.digest('hex');
}

/**
 * Records an immutable, cryptographically signed audit log entry.
 */
export async function recordAuditLog(params: CreateAuditLogParams): Promise<AuditLogEntry> {
  const logId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const clientIp = params.clientIp || params.actor.clientIp || '127.0.0.1';

  const entryPayload = JSON.stringify({
    logId,
    timestamp,
    actor: {
      id: params.actor.id,
      type: params.actor.type,
      tenantId: params.actor.tenantId,
      email: params.actor.email,
    },
    clientIp,
    intentId: params.intentId,
    targetService: params.targetService,
    actionVerb: params.actionVerb,
    resourceUri: params.resourceUri,
    riskTier: params.riskTier,
    outcome: params.outcome,
    approverId: params.approverId,
    diff: params.diff,
  });

  const signature = computeSignature(entryPayload, lastLogHash);
  lastLogHash = signature; // Advance cryptographic chain

  const entry: AuditLogEntry = {
    logId,
    timestamp,
    actor: params.actor,
    clientIp,
    intentId: params.intentId,
    targetService: params.targetService,
    actionVerb: params.actionVerb,
    resourceUri: params.resourceUri,
    riskTier: params.riskTier,
    diff: params.diff,
    outcome: params.outcome,
    approverId: params.approverId,
    signature,
  };

  // 1. Store in memory buffer
  inMemoryAuditLogs.unshift(entry);
  if (inMemoryAuditLogs.length > 1000) {
    inMemoryAuditLogs.pop();
  }

  // 2. Persist to Supabase if table exists (fail gracefully to memory)
  try {
    const { error } = await supabase.from('action_gateway_audit_logs').insert([
      {
        log_id: entry.logId,
        timestamp: entry.timestamp,
        tenant_id: entry.actor.tenantId,
        actor_id: entry.actor.id,
        actor_type: entry.actor.type,
        client_ip: entry.clientIp,
        intent_id: entry.intentId,
        target_service: entry.targetService,
        action_verb: entry.actionVerb,
        resource_uri: entry.resourceUri,
        risk_tier: entry.riskTier,
        outcome: entry.outcome,
        approver_id: entry.approverId || null,
        diff_payload: entry.diff || null,
        signature: entry.signature,
      },
    ]);

    if (error && error.code !== '42P01') {
      // 42P01 is table does not exist
      console.warn('[AuditLogger] Supabase persist warning:', error.message);
    }
  } catch (err) {
    // Graceful fallback: memory log is always preserved
    console.debug('[AuditLogger] Falling back to in-memory store:', err);
  }

  return entry;
}

export interface AuditLogFilter {
  tenantId?: string;
  actorId?: string;
  targetService?: TargetService;
  riskTier?: RiskTier;
  outcome?: string;
  limit?: number;
}

/**
 * Retrieves audit logs matching criteria (from database with fallback to in-memory store).
 */
export async function queryAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLogEntry[]> {
  const limit = filter.limit || 50;

  try {
    let query = supabase
      .from('action_gateway_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (filter.tenantId) query = query.eq('tenant_id', filter.tenantId);
    if (filter.actorId) query = query.eq('actor_id', filter.actorId);
    if (filter.targetService) query = query.eq('target_service', filter.targetService);
    if (filter.riskTier !== undefined) query = query.eq('risk_tier', filter.riskTier);
    if (filter.outcome) query = query.eq('outcome', filter.outcome);

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        logId: row.log_id,
        timestamp: row.timestamp,
        actor: {
          id: row.actor_id,
          type: row.actor_type,
          tenantId: row.tenant_id,
          roles: [],
        },
        clientIp: row.client_ip,
        intentId: row.intent_id,
        targetService: row.target_service,
        actionVerb: row.action_verb,
        resourceUri: row.resource_uri,
        riskTier: row.risk_tier,
        diff: row.diff_payload,
        outcome: row.outcome,
        approverId: row.approver_id,
        signature: row.signature,
      }));
    }
  } catch {
    // Use fallback
  }

  // Fallback to in-memory logs
  return inMemoryAuditLogs
    .filter((log) => {
      if (filter.tenantId && log.actor.tenantId !== filter.tenantId) return false;
      if (filter.actorId && log.actor.id !== filter.actorId) return false;
      if (filter.targetService && log.targetService !== filter.targetService) return false;
      if (filter.riskTier !== undefined && log.riskTier !== filter.riskTier) return false;
      if (filter.outcome && log.outcome !== filter.outcome) return false;
      return true;
    })
    .slice(0, limit);
}
