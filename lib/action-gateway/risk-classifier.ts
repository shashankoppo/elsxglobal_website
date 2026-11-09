import { ActionIntent, RiskTier, TargetService } from './types';

export interface TenantPolicyOverride {
  id?: string;
  tenantId: string;
  targetService?: TargetService;
  actionVerbPattern?: string; // Regex or exact match, e.g. 'deploy.*' or 'delete'
  enforceMinimumTier?: RiskTier;
  enforceTier?: RiskTier;
  denyAiAgents?: boolean;
  requireStaffApprovalForAi?: boolean;
}

export type BlastRadiusLevel = 'local' | 'medium' | 'high' | 'critical';

export interface RiskClassificationResult {
  riskTier: RiskTier;
  reason: string;
  blastRadius: BlastRadiusLevel;
  appliedOverrides: string[];
}

// Canonical categorization of verbs
const TIER_0_VERBS = new Set([
  'get',
  'list',
  'read',
  'describe',
  'fetch',
  'status',
  'query',
  'metrics',
  'logs',
  'ping',
  'check',
  'inspect',
  'diff',
  'preview_read',
  'validate'
]);

const TIER_1_VERBS = new Set([
  'create',
  'create_record',
  'add',
  'insert',
  'set',
  'update_metadata',
  'tag',
  'untag',
  'upload',
  'stage',
  'preview',
  'enable_feature',
  'disable_feature',
  'generate_token',
  'add_dns_record',
  'upload_asset'
]);

const TIER_2_VERBS = new Set([
  'update',
  'deploy',
  'deploy_worker',
  'scale',
  'restart',
  'reboot',
  'rollback',
  'modify',
  'bind',
  'unbind',
  'sync',
  'rotate_secret',
  'upgrade',
  'patch',
  'pause',
  'resume',
  'switch_traffic',
  'modify_firewall_rule',
  'update_dns_zone'
]);

const TIER_3_VERBS = new Set([
  'delete',
  'drop',
  'drop_table',
  'destroy',
  'purge',
  'purge_cache',
  'purge_all_dns',
  'terminate',
  'terminate_cluster',
  'wipe',
  'remove_zone',
  'delete_database',
  'delete_bucket',
  'delete_tenant',
  'revoke_all',
  'factory_reset',
  'deprovision',
  'force_kill'
]);

/**
 * Deterministic Risk Classification Engine
 * Evaluates action verb, parameters, environment scope, actor type, and tenant security policies.
 */
export function classifyRisk(
  intent: ActionIntent,
  tenantOverrides: TenantPolicyOverride[] = []
): RiskClassificationResult {
  const verb = intent.actionVerb.toLowerCase().trim();
  const params = intent.parameters || {};
  const uri = intent.resourceUri.toLowerCase();
  const appliedOverrides: string[] = [];

  // 1. Initial verb-based baseline determination
  let tier: RiskTier = 1; // Default fallback to mutation preview
  let blastRadius: BlastRadiusLevel = 'local';
  let reason = 'Standard mutation';

  if (TIER_0_VERBS.has(verb) || verb.startsWith('get_') || verb.startsWith('list_')) {
    tier = 0;
    blastRadius = 'local';
    reason = `Read-only action (${verb}) executed without mutation`;
  } else if (TIER_3_VERBS.has(verb) || verb.startsWith('delete_') || verb.startsWith('purge_') || verb.startsWith('drop_')) {
    tier = 3;
    blastRadius = 'critical';
    reason = `Destructive action (${verb}) classified as Tier 3 requiring dual-authorization staff approval`;
  } else if (TIER_2_VERBS.has(verb) || verb.startsWith('deploy_') || verb.startsWith('scale_') || verb.startsWith('restart_')) {
    tier = 2;
    blastRadius = 'high';
    reason = `Service-modifying or deployment action (${verb}) requiring step-up authentication`;
  } else if (TIER_1_VERBS.has(verb) || verb.startsWith('add_') || verb.startsWith('create_')) {
    tier = 1;
    blastRadius = 'medium';
    reason = `Low-risk configuration addition (${verb}) requiring diff preview & confirmation`;
  }

  // 2. Blast Radius & Scope Evaluation
  const isProduction = 
    params.environment === 'production' || 
    params.env === 'production' || 
    uri.includes('/production/') || 
    uri.includes('/prod/') ||
    uri.endsWith('/prod') ||
    uri.endsWith('/production');

  const hasWildcardTarget = 
    uri.includes('*') || 
    params.all === true || 
    params.target === 'all' ||
    params.pattern === '*';

  const isBatchOperation = 
    Array.isArray(params.batch) && params.batch.length > 5;

  if (isProduction && tier > 0) {
    if (tier === 1) {
      tier = 2;
      blastRadius = 'high';
      reason += ' | Escalated to Tier 2 because target scope is PRODUCTION';
    } else if (tier === 2) {
      tier = 3;
      blastRadius = 'critical';
      reason += ' | Escalated to Tier 3 because high-impact changes in PRODUCTION require staff approval';
    }
  }

  if ((hasWildcardTarget || isBatchOperation) && tier > 0 && tier < 3) {
    tier = Math.min(3, tier + 1) as RiskTier;
    blastRadius = tier === 3 ? 'critical' : 'high';
    reason += ' | Escalated due to broad blast radius (wildcard target or batch size > 5)';
  }

  // 3. AI Agent Constraints
  if (intent.actor.type === 'ai_agent') {
    // Autonomous agents cannot execute Tier 2+ without explicit human delegation check or escalation to approval
    if (tier >= 2 && !intent.actor.delegationToken) {
      tier = 3;
      blastRadius = 'critical';
      reason += ' | AI agent attempting Tier 2+ action without delegation token: routed to staff approval queue';
    }
  }

  // 4. Tenant Policy Overrides
  for (const policy of tenantOverrides) {
    if (policy.tenantId && policy.tenantId !== intent.actor.tenantId && policy.tenantId !== '*') {
      continue;
    }

    // Service matching
    if (policy.targetService && policy.targetService !== intent.targetService) {
      continue;
    }

    // Verb pattern matching
    if (policy.actionVerbPattern) {
      const regex = new RegExp(`^${policy.actionVerbPattern}$`, 'i');
      if (!regex.test(verb)) {
        continue;
      }
    }

    // Agent denial check
    if (policy.denyAiAgents && intent.actor.type === 'ai_agent') {
      tier = 3;
      blastRadius = 'critical';
      appliedOverrides.push(`Policy ${policy.id || 'deny-ai'}: AI agents prohibited from executing ${verb}`);
      reason = `Prohibited by tenant policy for AI agents; routed to staff approval`;
      break;
    }

    if (policy.requireStaffApprovalForAi && intent.actor.type === 'ai_agent' && tier > 0) {
      tier = 3;
      blastRadius = 'critical';
      appliedOverrides.push(`Policy ${policy.id || 'ai-staff-req'}: AI agent requires staff approval`);
      reason += ' | Tenant policy requires staff approval for all AI agent mutations';
    }

    // Explicit Tier Enforcement
    if (policy.enforceTier !== undefined) {
      tier = policy.enforceTier;
      appliedOverrides.push(`Policy ${policy.id || 'force-tier'}: Enforced Tier ${tier}`);
      reason += ` | Tenant policy explicitly set Tier ${tier}`;
    }

    // Minimum Tier Enforcement
    if (policy.enforceMinimumTier !== undefined && policy.enforceMinimumTier > tier) {
      tier = policy.enforceMinimumTier;
      appliedOverrides.push(`Policy ${policy.id || 'min-tier'}: Enforced minimum Tier ${tier}`);
      reason += ` | Tenant policy enforced minimum Tier ${tier}`;
    }
  }

  return {
    riskTier: tier,
    reason,
    blastRadius,
    appliedOverrides
  };
}
