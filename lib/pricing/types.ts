/**
 * Canonical Pricing Type Definitions
 *
 * All pricing values across VaultHost MUST be stored in integer paise (INR), ex-GST.
 */

export type BillingCycle =
  | 'monthly'
  | 'quarterly'
  | 'semi_annual'
  | 'annual'
  | 'pay_as_you_go';

export type Currency = 'INR';

export type ProductMaturity = 'ga' | 'beta' | 'alpha' | 'roadmap';

export interface PricingPlan {
  id: string;
  name: string;
  product: string;
  pricePaise: number; // Always integer paise, ex-GST
  billingCycle: BillingCycle;
  currency: Currency;
  maturity: ProductMaturity;
  features: string[];
  isPopular?: boolean;
  sortOrder: number;
}

export const GST_RATE = 0.18;
export const GST_RATE_PERCENT = 18;
