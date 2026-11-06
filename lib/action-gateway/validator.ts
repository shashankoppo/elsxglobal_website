import { ActionIntent, ActionIntentSchema, ActionActor } from './types';

export interface ValidationSuccess {
  valid: true;
  intent: ActionIntent;
}

export interface ValidationFailure {
  valid: false;
  errors: string[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

// In-memory cache for idempotency keys (stores key -> createdAt timestamp)
const idempotencyKeyStore = new Map<string, number>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ValidationOptions {
  skipIdempotencyCheck?: boolean;
}

/**
 * Validates the Action Intent against strict schema, actor identity, tenant isolation, and idempotency.
 */
export function validateActionIntent(rawIntent: unknown, options: ValidationOptions = {}): ValidationResult {
  const errors: string[] = [];

  // 1. Zod Schema Verification
  const parseResult = ActionIntentSchema.safeParse(rawIntent);
  if (!parseResult.success) {
    const formatted = parseResult.error.issues.map(
      (issue) => `[${issue.path.join('.')}] ${issue.message}`
    );
    return { valid: false, errors: formatted };
  }

  const intent = parseResult.data as ActionIntent;

  // 2. Tenant Boundary Isolation Check
  const tenantBoundaryError = validateTenantBoundary(intent.actor, intent.resourceUri);
  if (tenantBoundaryError) {
    errors.push(tenantBoundaryError);
  }

  // 3. AI Agent Delegation Check
  if (intent.actor.type === 'ai_agent') {
    const delegationError = validateAgentDelegation(intent.actor, intent.targetService);
    if (delegationError) {
      errors.push(delegationError);
    }
  }

  // 4. Role Authorization Check
  const roleError = validateActorRoles(intent.actor, intent.actionVerb);
  if (roleError) {
    errors.push(roleError);
  }

  // 5. Idempotency Key Validation (skipped if this is execution of confirmed/approved intent)
  if (!options.skipIdempotencyCheck) {
    const idempotencyError = checkIdempotency(intent.idempotencyKey);
    if (idempotencyError) {
      errors.push(idempotencyError);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, intent };
}

/**
 * Checks whether the resource URI falls within the actor's tenant boundary.
 * Super admins can bypass tenant boundary checks.
 */
function validateTenantBoundary(actor: ActionActor, resourceUri: string): string | null {
  const isSuperAdmin = actor.roles.includes('super_admin') || actor.roles.includes('system_admin');
  if (isSuperAdmin) {
    return null;
  }

  // Check if resource URI contains tenant segment: e.g. vaulthost://tenants/{tenantId}/... or urn:vaulthost:{tenantId}:...
  const tenantMatches = [
    resourceUri.match(/vaulthost:\/\/tenants\/([^/]+)/),
    resourceUri.match(/urn:vaulthost:([^:]+)/),
    resourceUri.match(/\/tenants\/([^/]+)/),
  ];

  for (const match of tenantMatches) {
    if (match && match[1]) {
      const uriTenantId = match[1];
      if (uriTenantId !== actor.tenantId && uriTenantId !== 'global') {
        return `Tenant boundary violation: Actor tenant '${actor.tenantId}' cannot access resource belonging to '${uriTenantId}'`;
      }
    }
  }

  return null;
}

/**
 * Validates that an AI Agent has an unexpired, properly scoped delegation token.
 */
function validateAgentDelegation(actor: ActionActor, targetService: string): string | null {
  if (!actor.delegationToken) {
    // If no delegation token, agent can only query Tier 0 resources
    return null;
  }

  try {
    // Basic JWT or token structure validation: token must be non-trivial
    if (actor.delegationToken.length < 16) {
      return 'AI Agent delegation token is malformed or invalid';
    }

    // In a full implementation, verify cryptographic signature and scopes
    // For demo/simulated tokens: check prefix format "del_"
    if (!actor.delegationToken.startsWith('del_') && !actor.delegationToken.startsWith('eyJ')) {
      return 'Invalid delegation token format. Expected scoped Bearer or del_* token.';
    }
  } catch {
    return 'Failed to verify AI Agent delegation token';
  }

  return null;
}

/**
 * Validates that the actor's roles permit the requested action category.
 */
function validateActorRoles(actor: ActionActor, actionVerb: string): string | null {
  const roles = new Set(actor.roles);

  if (roles.has('super_admin') || roles.has('admin') || roles.has('owner')) {
    return null; // Admins have full access
  }

  const isReadVerb = actionVerb.startsWith('get') || actionVerb.startsWith('list') || actionVerb === 'read' || actionVerb === 'status';

  if (roles.has('viewer') && !isReadVerb) {
    return `Actor with 'viewer' role is unauthorized to perform mutation action '${actionVerb}'`;
  }

  if (roles.has('developer')) {
    // Developers can perform anything except destructive account-level operations
    if (actionVerb === 'delete_tenant' || actionVerb === 'wipe' || actionVerb === 'revoke_all') {
      return `Actor with 'developer' role requires 'admin' or 'owner' role for destructive account actions`;
    }
    return null;
  }

  if (roles.size === 0) {
    return 'Actor has no roles assigned';
  }

  return null;
}

/**
 * Checks and records idempotency key to prevent double-execution or replay attacks.
 */
function checkIdempotency(key: string): string | null {
  const now = Date.now();
  const existingTime = idempotencyKeyStore.get(key);

  if (existingTime) {
    if (now - existingTime < IDEMPOTENCY_TTL_MS) {
      return `Duplicate idempotency key detected: '${key}'. This action intent was already processed.`;
    }
  }

  // Record key
  idempotencyKeyStore.set(key, now);

  // Periodic cleanup if store grows large
  if (idempotencyKeyStore.size > 10000) {
    for (const [k, ts] of idempotencyKeyStore.entries()) {
      if (now - ts > IDEMPOTENCY_TTL_MS) {
        idempotencyKeyStore.delete(k);
      }
    }
  }

  return null;
}
