import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { classifyRisk } from '@/lib/action-gateway/risk-classifier';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';

describe('Action Gateway Risk Tiers & Quorum Engine', () => {
  const baseIntent: ActionIntent = {
    intentId: '00000000-0000-0000-0000-000000000001',
    actor: {
      id: 'usr_test_123',
      type: 'user',
      tenantId: 'ten_enterprise',
      roles: ['admin'],
    },
    targetService: 'compute',
    actionVerb: 'get',
    resourceUri: 'compute://vps/svc-001',
    parameters: {},
    idempotencyKey: 'idemp_key_00000001',
    createdAt: new Date().toISOString(),
  };

  describe('Deterministic Risk Classification', () => {
    it('classifies read actions as Tier 0 with local blast radius', () => {
      const intent: ActionIntent = { ...baseIntent, actionVerb: 'get' };
      const classification = classifyRisk(intent);
      expect(classification.riskTier).toBe(0);
      expect(classification.blastRadius).toBe('local');
    });

    it('classifies simple resource creation as Tier 1', () => {
      const intent: ActionIntent = { ...baseIntent, actionVerb: 'create_record' };
      const classification = classifyRisk(intent);
      expect(classification.riskTier).toBe(1);
    });

    it('classifies modifications and deployments as Tier 2', () => {
      const intent: ActionIntent = { ...baseIntent, actionVerb: 'deploy_worker' };
      const classification = classifyRisk(intent);
      expect(classification.riskTier).toBe(2);
    });

    it('classifies deletions and cluster terminations as Tier 3', () => {
      const intent: ActionIntent = { ...baseIntent, actionVerb: 'terminate_cluster' };
      const classification = classifyRisk(intent);
      expect(classification.riskTier).toBe(3);
    });

    it('escalates risk when production blast radius is detected', () => {
      const intent: ActionIntent = {
        ...baseIntent,
        actionVerb: 'restart',
        resourceUri: 'compute://vps/production-cluster-primary',
        parameters: { environment: 'production', affectedTenants: 50 },
      };
      const classification = classifyRisk(intent);
      expect(classification.riskTier).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Action Gateway Execution Flow', () => {
    it('immediately executes Tier 0 read operations', async () => {
      const intent: ActionIntent = {
        ...baseIntent,
        intentId: crypto.randomUUID(),
        actionVerb: 'describe',
        idempotencyKey: `read_${crypto.randomUUID()}`,
      };
      const result = await processActionIntent(intent);
      expect(result.status).toBe('executed');
      expect(result.riskTier).toBe(0);
    });

    it('requires confirmation token for Tier 1 mutations', async () => {
      const intent: ActionIntent = {
        ...baseIntent,
        intentId: crypto.randomUUID(),
        actionVerb: 'add_dns_record',
        idempotencyKey: `create_${crypto.randomUUID()}`,
      };
      const result = await processActionIntent(intent);
      expect(result.status).toBe('require_confirmation');
      expect(result.riskTier).toBe(1);
      expect(result.diffPreview?.confirmationToken).toBeDefined();
    });

    it('requires 2FA step-up auth for Tier 2 operations', async () => {
      const intent: ActionIntent = {
        ...baseIntent,
        intentId: crypto.randomUUID(),
        actionVerb: 'deploy_worker',
        idempotencyKey: `deploy_${crypto.randomUUID()}`,
      };
      const result = await processActionIntent(intent);
      expect(result.status).toBe('require_step_up_auth');
      expect(result.riskTier).toBe(2);
    });

    it('places catastrophic Tier 3 operations into dual-control quarantine', async () => {
      const intent: ActionIntent = {
        ...baseIntent,
        intentId: crypto.randomUUID(),
        actionVerb: 'terminate_cluster',
        idempotencyKey: `term_${crypto.randomUUID()}`,
      };
      const result = await processActionIntent(intent);
      expect(result.status).toBe('enqueued_for_approval');
      expect(result.riskTier).toBe(3);
      expect(result.approvalRequestId).toBeDefined();
    });
  });
});
