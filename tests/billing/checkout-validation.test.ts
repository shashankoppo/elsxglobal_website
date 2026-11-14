import { describe, it, expect } from 'vitest';
import { checkoutSchema } from '@/lib/billing/checkoutSchema';

describe('Checkout Validation Schema', () => {
  it('accepts valid order configurations with all fields', () => {
    const validPayload = {
      planId: 'vps-pro-8gb',
      planName: 'VPS Pro 8GB',
      planTier: 'vps',
      billingCycle: 'monthly',
      domain: 'api.example.com',
      os: 'ubuntu-24-04',
      panel: 'docker',
      location: 'bom-01',
      addons: ['backup-daily', 'ddos-advanced'],
      custom_vcpu: 4,
      custom_ram: 8,
      custom_storage: 160,
    };

    const result = checkoutSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.addons).toEqual(['backup-daily', 'ddos-advanced']);
    }
  });

  it('safely defaults omitted addons to an empty array without crashing', () => {
    const payloadWithoutAddons = {
      planId: 'shared-starter',
      planName: 'Shared Starter',
    };

    const result = checkoutSchema.safeParse(payloadWithoutAddons);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.addons)).toBe(true);
      expect(result.data.addons.length).toBe(0);
      expect(result.data.billingCycle).toBe('monthly');
    }
  });

  it('rejects invalid domain formats to prevent injection attacks', () => {
    const invalidPayload = {
      planId: 'vps-basic',
      planName: 'VPS Basic',
      domain: 'malicious.com; rm -rf /',
    };

    const result = checkoutSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('rejects payloads missing mandatory planId or planName', () => {
    const missingPlanId = {
      planName: 'VPS Basic',
    };
    expect(checkoutSchema.safeParse(missingPlanId).success).toBe(false);

    const missingPlanName = {
      planId: 'vps-basic',
    };
    expect(checkoutSchema.safeParse(missingPlanName).success).toBe(false);
  });
});
