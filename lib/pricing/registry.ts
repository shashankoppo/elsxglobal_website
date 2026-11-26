import {
  ANNUAL_DISCOUNT,
  SEMI_ANNUAL_DISCOUNT,
  isFixedAnnualProductTier,
} from '@/lib/billing/pricingMath';
import {
  GST_RATE,
  type BillingCycle,
  type PricingPlan,
} from './types';

/**
 * Canonical VaultHost Pricing Registry
 *
 * Single source of truth for plan prices in integer paise (INR), ex-GST.
 * Aligned with billing cycle rules from `lib/billing/pricingMath.ts`:
 * - Monthly: 1x base price
 * - Quarterly: 3x base price
 * - Semi-annual: 6x base price with 5% discount (`SEMI_ANNUAL_DISCOUNT`)
 * - Annual: 12x base price with ~16.7% discount (`ANNUAL_DISCOUNT`), except
 *   fixed-annual products (`domain`, `ssl`) whose `pricePaise` is already 1-year total.
 * - Core VPS / Shared / Domain / SSL plans are `ga`; cloud/edge products default to `beta` (D-08).
 */
export const PRICING_REGISTRY: Record<string, PricingPlan> = {
  // --- Core VPS Plans (GA) ---
  'vps-starter': {
    id: 'vps-starter',
    name: 'VPS Starter',
    product: 'vps',
    pricePaise: 39900,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'ga',
    features: [
      '1 vCPU Core',
      '2 GB DDR5 RAM',
      '40 GB NVMe Storage',
      'Full Root SSH Access',
      'IPv4 + /64 IPv6',
      'Automated Snapshots',
    ],
    sortOrder: 10,
  },
  'vps-business': {
    id: 'vps-business',
    name: 'VPS Business',
    product: 'vps',
    pricePaise: 99900,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'ga',
    features: [
      '2 vCPU Cores',
      '4 GB DDR5 RAM',
      '80 GB NVMe Storage',
      'Full Root SSH Access',
      'DDoS Protection',
      'Automated Backups',
    ],
    isPopular: true,
    sortOrder: 20,
  },
  'vps-pro': {
    id: 'vps-pro',
    name: 'VPS Pro',
    product: 'vps',
    pricePaise: 199900,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'ga',
    features: [
      '4 vCPU Cores',
      '8 GB DDR5 RAM',
      '160 GB NVMe Storage',
      'Full Root SSH Access',
      'DDoS Protection & Snapshots',
      'Priority Support',
    ],
    sortOrder: 30,
  },
  'vps-enterprise': {
    id: 'vps-enterprise',
    name: 'VPS Enterprise',
    product: 'vps',
    pricePaise: 499900,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'ga',
    features: [
      '8 vCPU Cores',
      '16 GB DDR5 RAM',
      '320 GB NVMe Storage',
      'Dedicated IPv4',
      'DDoS Protection',
      '24/7 Priority Support',
    ],
    sortOrder: 40,
  },

  // --- Shared Hosting Plans (GA) ---
  'shared-starter': {
    id: 'shared-starter',
    name: 'Shared Hosting Starter',
    product: 'shared',
    pricePaise: 9900,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'ga',
    features: [
      '1 Website',
      '10 GB NVMe Storage',
      'Free SSL Certificate',
      '5 Email Accounts',
      'Daily Backups',
    ],
    sortOrder: 50,
  },
  'shared-business': {
    id: 'shared-business',
    name: 'Shared Hosting Business',
    product: 'shared',
    pricePaise: 29900,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'ga',
    features: [
      'Multiple Websites',
      '50 GB NVMe Storage',
      'Free Wildcard SSL',
      'Daily Automated Backups',
      'Priority Support',
    ],
    isPopular: true,
    sortOrder: 60,
  },

  // --- Domains & SSL Certificates (GA, fixed annual billing) ---
  'domain-registration': {
    id: 'domain-registration',
    name: 'Domain Registration',
    product: 'domain',
    pricePaise: 79900,
    billingCycle: 'annual',
    currency: 'INR',
    maturity: 'ga',
    features: [
      '1-Year Domain Registration',
      'Free WHOIS Privacy',
      'Anycast DNS Management',
      'DNSSEC Support',
      'Auto-Renewal',
    ],
    sortOrder: 70,
  },
  'ssl-certificate': {
    id: 'ssl-certificate',
    name: 'SSL Certificate',
    product: 'ssl',
    pricePaise: 99900,
    billingCycle: 'annual',
    currency: 'INR',
    maturity: 'ga',
    features: [
      'Domain Validated (DV) SSL',
      '256-Bit Encryption',
      'Automated Renewal',
      'Free Re-issuance',
      'Browser-Trusted Seal',
    ],
    sortOrder: 80,
  },

  // --- Cloud & Edge Platform Products (Beta per Decision D-08) ---
  'workers-free': {
    id: 'workers-free',
    name: 'VaultWorkers Free',
    product: 'workers',
    pricePaise: 0,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '100K requests / day',
      '10ms CPU limit per request',
      'Basic KV store access',
      'Community support',
    ],
    sortOrder: 100,
  },
  'workers-pro': {
    id: 'workers-pro',
    name: 'VaultWorkers Pro',
    product: 'workers',
    pricePaise: 163000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      'Unlimited requests (fair use)',
      '30s CPU limit per request',
      'KV + Storage + D1 native bindings',
      'Custom domains & SSL',
    ],
    isPopular: true,
    sortOrder: 110,
  },
  'workers-business': {
    id: 'workers-business',
    name: 'VaultWorkers Business',
    product: 'workers',
    pricePaise: 489000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      'Unlimited requests',
      'Extended CPU execution limits',
      'Private network peering',
      'Priority engineering support',
    ],
    sortOrder: 120,
  },
  'storage-free': {
    id: 'storage-free',
    name: 'VaultStorage Free',
    product: 'storage',
    pricePaise: 0,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '10 GB NVMe object storage',
      'Zero data egress fees',
      '1M API operations / month',
      'S3 API compatibility',
    ],
    sortOrder: 130,
  },
  'storage-pro': {
    id: 'storage-pro',
    name: 'VaultStorage Pro',
    product: 'storage',
    pricePaise: 185000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '1 TB NVMe object storage',
      'Zero data egress fees',
      '10M API operations / month',
      'Custom bucket domains & CDN caching',
    ],
    isPopular: true,
    sortOrder: 140,
  },
  'storage-business': {
    id: 'storage-business',
    name: 'VaultStorage Business',
    product: 'storage',
    pricePaise: 890000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '5 TB NVMe object storage',
      'Zero data egress fees',
      'Unlimited API operations',
      'Multi-region replication & versioning',
    ],
    sortOrder: 150,
  },
  'ai-gateway-free': {
    id: 'ai-gateway-free',
    name: 'VaultAI Gateway Free',
    product: 'ai-gateway',
    pricePaise: 0,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '10K requests / month',
      '1 connected AI provider',
      'Basic request logging & analytics',
    ],
    sortOrder: 160,
  },
  'ai-gateway-pro': {
    id: 'ai-gateway-pro',
    name: 'VaultAI Gateway Pro',
    product: 'ai-gateway',
    pricePaise: 249000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '1M requests / month',
      'Unlimited AI providers',
      'Semantic caching & automated fallback',
      'Custom rate limits & budget alerts',
    ],
    isPopular: true,
    sortOrder: 170,
  },
  'ai-gateway-business': {
    id: 'ai-gateway-business',
    name: 'VaultAI Gateway Business',
    product: 'ai-gateway',
    pricePaise: 799000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '10M requests / month',
      'Unlimited AI providers',
      'Dedicated proxy instances',
      'Enterprise RBAC & prompt security audit',
    ],
    sortOrder: 180,
  },
  'dns-free': {
    id: 'dns-free',
    name: 'VaultDNS Free',
    product: 'dns',
    pricePaise: 0,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '500K queries / month',
      'Up to 5 DNS zones',
      'Standard DDoS protection',
    ],
    sortOrder: 190,
  },
  'dns-pro': {
    id: 'dns-pro',
    name: 'VaultDNS Pro',
    product: 'dns',
    pricePaise: 149000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      '10M queries / month',
      'Up to 50 DNS zones',
      'DNSSEC 1-click signing',
      'Health checks & failover routing',
    ],
    isPopular: true,
    sortOrder: 200,
  },
  'dns-business': {
    id: 'dns-business',
    name: 'VaultDNS Business',
    product: 'dns',
    pricePaise: 489000,
    billingCycle: 'monthly',
    currency: 'INR',
    maturity: 'beta',
    features: [
      'Unlimited queries / month',
      'Unlimited DNS zones',
      'Custom vanity nameservers',
      'Anycast BGP routing',
    ],
    sortOrder: 210,
  },
};

/** Retrieves a pricing plan by canonical plan ID. */
export function getPlan(id: string): PricingPlan | undefined {
  if (!Object.prototype.hasOwnProperty.call(PRICING_REGISTRY, id)) {
    return undefined;
  }
  return PRICING_REGISTRY[id];
}

/**
 * Formats integer paise as an INR string (`₹X,XXX` using Indian numbering).
 * Fractional rupee amounts include two decimal places.
 */
export function formatPrice(paise: number): string {
  if (!Number.isFinite(paise)) {
    return '₹0';
  }
  const roundedPaise = Math.round(paise);
  const sign = roundedPaise < 0 ? '-' : '';
  const absPaise = Math.abs(roundedPaise);
  const rupees = absPaise / 100;

  if (absPaise % 100 === 0) {
    return `${sign}₹${rupees.toLocaleString('en-IN')}`;
  }
  return `${sign}₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Returns integer paise including 18% GST (`GST_RATE`). */
export function getPriceWithGST(paise: number): number {
  if (!Number.isFinite(paise) || paise <= 0) {
    return 0;
  }
  return Math.round(paise * (1 + GST_RATE));
}

/** Returns all plans for a given product key sorted by `sortOrder`. */
export function getPlansForProduct(product: string): PricingPlan[] {
  const normalized = product.trim().toLowerCase();
  return Object.values(PRICING_REGISTRY)
    .filter((plan) => plan.product.toLowerCase() === normalized)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Computes ex-GST term price in integer paise for a given billing cycle,
 * matching `lib/billing/pricingMath.ts` multipliers and cycle discounts.
 */
export function getTermPricePaise(
  plan: PricingPlan,
  cycle: BillingCycle = plan.billingCycle
): number {
  if (isFixedAnnualProductTier(plan.product) || plan.billingCycle === 'annual') {
    return plan.pricePaise;
  }

  switch (cycle) {
    case 'quarterly':
      return Math.round(plan.pricePaise * 3);
    case 'semi_annual':
      return Math.round(plan.pricePaise * 6 * (1 - SEMI_ANNUAL_DISCOUNT));
    case 'annual':
      return Math.round(plan.pricePaise * 12 * (1 - ANNUAL_DISCOUNT));
    case 'pay_as_you_go':
    case 'monthly':
    default:
      return plan.pricePaise;
  }
}
