import { z } from 'zod';

/**
 * Represents the blast radius and required authorization level for an action.
 * - `0`: Read-only/cache — auto-execute
 * - `1`: Reversible writes — logged + snapshot
 * - `2`: Irreversible writes — TOTP 2FA required
 * - `3`: Catastrophic blast radius — dual-staff quorum quarantine
 */
export type RiskTier = 0 | 1 | 2 | 3;

export const RiskTierSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3)
]);

export interface ActionActor {
  id: string;
  type: 'user' | 'ai_agent' | 'system';
  tenantId: string;
  email?: string;
  roles: string[];
  delegationToken?: string;
  clientIp?: string;
}

export const ActionActorSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['user', 'ai_agent', 'system']),
  tenantId: z.string().min(1),
  email: z.string().email().optional(),
  roles: z.array(z.string()),
  delegationToken: z.string().optional(),
  clientIp: z.string().optional(),
});

export type TargetService = 
  | 'compute' 
  | 'storage' 
  | 'database' 
  | 'dns' 
  | 'ai_gateway' 
  | 'network' 
  | 'billing' 
  | 'iam';

/**
 * Core interface representing a planned action emitted by an AI agent or user.
 * Must be signed and validated by the Action Gateway before reaching the infrastructure plane.
 */
export interface ActionIntent {
  intentId: string;
  actor: ActionActor;
  targetService: TargetService;
  actionVerb: string;
  resourceUri: string;
  parameters: Record<string, unknown>;
  idempotencyKey: string;
  reasoningTrace?: string;
  confidenceScore?: number;
  createdAt: string;
}

export const ActionIntentSchema = z.object({
  intentId: z.string().uuid(),
  actor: ActionActorSchema,
  targetService: z.enum(['compute', 'storage', 'database', 'dns', 'ai_gateway', 'network', 'billing', 'iam']),
  actionVerb: z.string().min(1),
  resourceUri: z.string().min(1),
  parameters: z.record(z.unknown()),
  idempotencyKey: z.string().min(8),
  reasoningTrace: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  createdAt: z.string().datetime(),
});

export interface DiffPreview {
  resourceUri: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  deltaSummary: string;
  confirmationToken: string;
  expiresAt: string;
}

export interface StepUpAuthChallenge {
  challengeId: string;
  challengeType: 'totp_2fa' | 'password_reauth' | 'webauthn';
  targetAction: string;
  resourceUri: string;
  expiresAt: string;
}

export interface ApprovalRequest {
  requestId: string;
  intent: ActionIntent;
  riskTier: 3;
  status: 'pending_staff_approval' | 'approved' | 'rejected' | 'expired';
  diff: DiffPreview;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ActionExecutionResult {
  status: 
    | 'executed' 
    | 'require_confirmation' 
    | 'require_step_up_auth' 
    | 'enqueued_for_approval' 
    | 'rejected';
  intentId: string;
  riskTier: RiskTier;
  diffPreview?: DiffPreview;
  stepUpChallenge?: StepUpAuthChallenge;
  approvalRequestId?: string;
  executionOutput?: unknown;
  auditLogId: string;
  timestamp: string;
  message: string;
}

export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  actor: ActionActor;
  clientIp: string;
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
  signature: string;
}
