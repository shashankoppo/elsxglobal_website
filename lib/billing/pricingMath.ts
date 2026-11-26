/**
 * Centralized Pricing & Billing Math Engine
 *
 * Single source of truth for:
 * - Hourly Pay-As-You-Go (730 hrs/mo — AWS/GCP/Azure standard)
 * - 1 Month, 6 Months (5% off), 12 Months (~16.7% off / 2 Months Free)
 * - Custom Compute enterprise INR pricing
 * - Fixed-term products (domains / SSL billed annually, not multiplied x12)
 * - Coupons, GST/Tax breakdown, and Prepaid Wallet Credits
 */

export type CanonicalBillingCycle = 'pay_as_you_go' | 'monthly' | 'semi_annual' | 'annual';
export type ShortBillingCycle = 'payg' | 'monthly' | 'semi_annual' | 'annual';

export const HOURS_PER_MONTH = 730;
export const SEMI_ANNUAL_DISCOUNT = 0.05; // 5% off
export const ANNUAL_DISCOUNT = 0.167;     // ~16.7% off (2 months free)

export const CYCLE_CONFIG: Record<
  CanonicalBillingCycle,
  {
    id: CanonicalBillingCycle;
    shortId: ShortBillingCycle;
    label: string;
    multiplier: number;
    discount: number;
    suffix: string;
    badge?: string;
  }
> = {
  pay_as_you_go: {
    id: 'pay_as_you_go',
    shortId: 'payg',
    label: 'Pay As You Go',
    multiplier: 1,
    discount: 0,
    suffix: 'mo (metered)',
    badge: 'Hourly Metered',
  },
  monthly: {
    id: 'monthly',
    shortId: 'monthly',
    label: '1 Month',
    multiplier: 1,
    discount: 0,
    suffix: 'mo',
  },
  semi_annual: {
    id: 'semi_annual',
    shortId: 'semi_annual',
    label: '6 Months',
    multiplier: 6,
    discount: SEMI_ANNUAL_DISCOUNT,
    suffix: '6 mo',
    badge: 'Save 5%',
  },
  annual: {
    id: 'annual',
    shortId: 'annual',
    label: '12 Months',
    multiplier: 12,
    discount: ANNUAL_DISCOUNT,
    suffix: 'yr',
    badge: '2 Mo Free',
  },
};

export function normalizeCycle(raw?: string | null): CanonicalBillingCycle {
  const v = (raw || '').trim().toLowerCase();
  if (v === 'payg' || v === 'pay_as_you_go' || v === 'hourly') return 'pay_as_you_go';
  if (v === 'semi_annual' || v === '6' || v === '6m' || v === '6mo') return 'semi_annual';
  if (v === 'annual' || v === 'yearly' || v === '12' || v === '12m' || v === '1y') return 'annual';
  return 'monthly';
}

export function toShortCycle(cycle: CanonicalBillingCycle): ShortBillingCycle {
  return cycle === 'pay_as_you_go' ? 'payg' : cycle;
}

export function calculateHourlyRate(monthlyPrice: number): number {
  if (!monthlyPrice || monthlyPrice <= 0) return 0;
  return Number((monthlyPrice / HOURS_PER_MONTH).toFixed(2));
}

/**
 * Custom compute pricing formula:
 * VaultHost: ₹1,488/vCPU, ₹211/GB RAM, ₹6.70/GB NVMe Gen4 + ₹0 egress
 */
export function calculateCustomComputeMonthly(vcpu: number, ramGb: number, storageGb: number): number {
  const safeCpu = Math.max(1, Number(vcpu) || 1);
  const safeRam = Math.max(1, Number(ramGb) || 1);
  const safeDisk = Math.max(10, Number(storageGb) || 10);
  return Math.round(safeCpu * 1488 + safeRam * 211 + safeDisk * 6.7);
}

/**
 * Normalizes the dual conventions of `price_annual` in DB/fallback objects:
 * - Some records store monthly equivalent rate when billed annually (e.g., 1228 vs monthly 1480)
 * - Some records store full 12-month total (e.g., 14794 vs monthly 1480)
 */
export function getAnnualPricing(priceMonthly: number, priceAnnual?: number | null): {
  annualMonthlyEquivalent: number;
  annualTotal: number;
  annualSavings: number;
} {
  const monthly = Math.max(0, Number(priceMonthly) || 0);
  const rawAnnual = Number(priceAnnual) || 0;

  if (monthly === 0 && rawAnnual === 0) {
    return { annualMonthlyEquivalent: 0, annualTotal: 0, annualSavings: 0 };
  }

  let annualMonthlyEquivalent: number;
  let annualTotal: number;

  if (rawAnnual > 0 && rawAnnual <= monthly) {
    // Stored as discounted monthly rate
    annualMonthlyEquivalent = Math.round(rawAnnual);
    annualTotal = Math.round(rawAnnual * 12);
  } else if (rawAnnual > monthly * 2) {
    // Stored as 12-month total
    annualTotal = Math.round(rawAnnual);
    annualMonthlyEquivalent = Math.round(rawAnnual / 12);
  } else {
    // Compute standard 16.7% annual discount (2 months free)
    annualMonthlyEquivalent = Math.round(monthly * (1 - ANNUAL_DISCOUNT));
    annualTotal = Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT));
  }

  const annualSavings = Math.max(0, Math.round(monthly * 12 - annualTotal));
  return { annualMonthlyEquivalent, annualTotal, annualSavings };
}

export function isFixedAnnualProductTier(tier?: string | null): boolean {
  const t = (tier || '').toLowerCase().trim();
  return t === 'domain' || t === 'ssl';
}

export interface CheckoutMathInput {
  baseMonthly: number;
  panelMonthly?: number;
  addonMonthlyTotal?: number;
  billingCycle: CanonicalBillingCycle;
  planTier?: string | null;
  coupon?: { discount_type: string; discount_value: number } | null;
  availableCreditInr?: number;
  applyWalletCredit?: boolean;
  includeGst?: boolean;
}

export interface CheckoutMathResult {
  isFixedAnnualProduct: boolean;
  multiplier: number;
  discountRate: number;
  baseTermAmount: number;
  panelTermAmount: number;
  addonTermAmount: number;
  grossBeforeDiscount: number;
  cycleSavings: number;
  subtotalBeforeCoupon: number;
  couponDiscount: number;
  taxAmount: number;
  creditApplied: number;
  payableTotal: number;
  hourlyRate: number;
}

export function calculateCheckoutTotals(input: CheckoutMathInput): CheckoutMathResult {
  const cycle = CYCLE_CONFIG[input.billingCycle] || CYCLE_CONFIG.monthly;
  const fixedAnnual = isFixedAnnualProductTier(input.planTier);

  const baseMonthly = Math.max(0, Number(input.baseMonthly) || 0);
  const panelMonthly = Math.max(0, Number(input.panelMonthly) || 0);
  const addonMonthlyTotal = Math.max(0, Number(input.addonMonthlyTotal) || 0);

  // Domain registrations & SSL certificates are billed per year (1 unit = 1 yr registration)
  const effectiveMultiplier = fixedAnnual ? 1 : cycle.multiplier;
  const effectiveDiscount = fixedAnnual ? 0 : cycle.discount;

  const grossBeforeDiscount = Math.round(
    (baseMonthly + panelMonthly + addonMonthlyTotal) * effectiveMultiplier
  );

  const baseTermAmount = Math.round(baseMonthly * effectiveMultiplier * (1 - effectiveDiscount));
  const panelTermAmount = Math.round(panelMonthly * effectiveMultiplier * (1 - effectiveDiscount));
  const addonTermAmount = Math.round(addonMonthlyTotal * effectiveMultiplier);

  const subtotalBeforeCoupon = Math.max(0, baseTermAmount + panelTermAmount + addonTermAmount);
  const cycleSavings = fixedAnnual
    ? 0
    : Math.max(0, Math.round((baseMonthly + panelMonthly) * effectiveMultiplier - (baseTermAmount + panelTermAmount)));

  let couponDiscount = 0;
  if (input.coupon && subtotalBeforeCoupon > 0) {
    if (input.coupon.discount_type === 'percentage') {
      couponDiscount = Math.round((subtotalBeforeCoupon * Number(input.coupon.discount_value || 0)) / 100);
    } else {
      couponDiscount = Math.min(Math.round(Number(input.coupon.discount_value || 0)), subtotalBeforeCoupon);
    }
  }

  const afterCoupon = Math.max(0, subtotalBeforeCoupon - couponDiscount);
  const taxAmount = input.includeGst ? Math.round(afterCoupon * 0.18) : 0;
  const totalWithTax = afterCoupon + taxAmount;

  let creditApplied = 0;
  if (input.applyWalletCredit && input.availableCreditInr && input.availableCreditInr > 0) {
    creditApplied = Math.min(Math.round(input.availableCreditInr), totalWithTax);
  }

  const payableTotal = Math.max(0, totalWithTax - creditApplied);
  const hourlyRate = fixedAnnual
    ? 0
    : calculateHourlyRate(baseMonthly + panelMonthly + addonMonthlyTotal);

  return {
    isFixedAnnualProduct: fixedAnnual,
    multiplier: effectiveMultiplier,
    discountRate: effectiveDiscount,
    baseTermAmount,
    panelTermAmount,
    addonTermAmount,
    grossBeforeDiscount,
    cycleSavings,
    subtotalBeforeCoupon,
    couponDiscount,
    taxAmount,
    creditApplied,
    payableTotal,
    hourlyRate,
  };
}
