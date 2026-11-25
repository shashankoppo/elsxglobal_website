'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import { CLOUD_PRICING } from '@/lib/data/cloud-pricing';
import {
  CanonicalBillingCycle,
  CYCLE_CONFIG,
  calculateHourlyRate,
  getAnnualPricing,
} from '@/lib/billing/pricingMath';

const CYCLE_ORDER: CanonicalBillingCycle[] = ['pay_as_you_go', 'monthly', 'semi_annual', 'annual'];

interface ProductPricingSectionProps {
  productId: string;
  title?: string;
  subtitle?: string;
  hideComparison?: boolean;
}

export function ProductPricingSection({
  productId,
  title = 'Simple, Transparent Pricing',
  subtitle = '3–5% lower than AWS, Google Cloud & Azure · Pay As You Go or 1 / 6 / 12-Month Cycles',
  hideComparison = false,
}: ProductPricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<CanonicalBillingCycle>('monthly');
  const product = CLOUD_PRICING[productId];

  if (!product) {
    return null;
  }

  return (
    <section className="v4-section border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/20 mb-3">
            <TrendingDown className="h-3.5 w-3.5 text-signal" />
            <span className="text-xs font-semibold text-signal">{product.productName} Pricing</span>
          </div>
          <h2 className="v4-display text-text-primary-v4 mb-3">{title}</h2>
          <p className="text-text-muted-v4 text-sm max-w-2xl mx-auto mb-6">{subtitle}</p>

          {/* 4-Cycle Selector */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 bg-ink-surface-2/80 border border-hairline rounded-2xl p-1.5">
            {CYCLE_ORDER.map((cycleId) => {
              const cfg = CYCLE_CONFIG[cycleId];
              const active = billingCycle === cycleId;
              return (
                <button
                  key={cycleId}
                  type="button"
                  onClick={() => setBillingCycle(cycleId)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-signal text-white shadow-sm'
                      : 'text-text-muted-v4 hover:text-text-primary-v4'
                  }`}
                >
                  <span>{cfg.label}</span>
                  {cfg.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-black/20 text-white' : 'bg-good/15 text-good'
                      }`}
                    >
                      {cfg.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {product.tiers.map((tier) => {
            const baseMonthly = Number(tier.monthlyPrice) || 0;
            const planSlug = tier.ctaPlanId || tier.id;
            const isFree = baseMonthly === 0;

            let displayPrice = baseMonthly;
            let suffix = '/mo';
            let cycleNote = product.billingNote;

            if (!isFree) {
              if (billingCycle === 'pay_as_you_go') {
                displayPrice = calculateHourlyRate(baseMonthly);
                suffix = '/hr';
                cycleNote = `Hourly metered · ₹${baseMonthly.toLocaleString('en-IN')}/mo cap (730 hrs)`;
              } else if (billingCycle === 'semi_annual') {
                displayPrice = Math.round(baseMonthly * (1 - CYCLE_CONFIG.semi_annual.discount));
                suffix = '/mo';
                const total6 = Math.round(baseMonthly * 6 * (1 - CYCLE_CONFIG.semi_annual.discount));
                cycleNote = `₹${total6.toLocaleString('en-IN')} billed every 6 months (Save 5%)`;
              } else if (billingCycle === 'annual') {
                const { annualMonthlyEquivalent, annualTotal } = getAnnualPricing(
                  baseMonthly,
                  tier.annualPrice
                );
                displayPrice = annualMonthlyEquivalent;
                suffix = '/mo';
                cycleNote = `₹${annualTotal.toLocaleString('en-IN')} billed annually (2 months free)`;
              } else {
                cycleNote = 'Standard 1-month rate · GST extra';
              }
            }

            return (
              <div
                key={tier.id}
                className={`v4-panel rounded-2xl p-7 relative flex flex-col ${
                  tier.highlighted ? 'border-2 border-signal shadow-lg shadow-signal/10' : 'border border-hairline'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-signal text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> MOST POPULAR
                  </div>
                )}

                <div
                  className={`text-xs font-semibold tracking-widest uppercase mb-2 ${
                    tier.highlighted ? 'text-signal' : 'text-text-muted-v4'
                  }`}
                >
                  {tier.name}
                </div>

                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹{displayPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-sm font-normal text-text-muted-v4">{suffix}</span>
                </div>
                <p className="text-xs text-signal/90 font-medium mb-3 min-h-[18px]">
                  {isFree ? 'Free tier — zero commitment' : cycleNote}
                </p>
                <p className="text-text-secondary-v4 text-sm mb-5">{tier.description}</p>

                <ul className="space-y-2 text-sm text-text-secondary-v4 mb-6 flex-1">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-good shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={
                    isFree && !tier.ctaPlanId
                      ? '/portal/signup'
                      : `/vaulthost/checkout?plan=${planSlug}&billing=${billingCycle}`
                  }
                  className={`${
                    tier.highlighted || !isFree ? 'v4-btn-primary' : 'v4-btn-secondary'
                  } rounded-btn text-center py-2.5 text-sm inline-flex items-center justify-center gap-1.5`}
                >
                  <span>{tier.cta || 'Get Started'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Competitor Comparison */}
        {!hideComparison && product.vsCompetitors.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-hairline">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-surface-2 border-b border-hairline">
                  <th className="py-3 px-5 text-left text-text-muted-v4 font-medium">Provider</th>
                  <th className="py-3 px-5 text-left text-text-muted-v4 font-medium">Benchmark Rate</th>
                  <th className="py-3 px-5 text-left text-text-muted-v4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {product.tiers[1] && (
                  <tr className="bg-signal/5">
                    <td className="py-3 px-5 text-signal font-semibold">VaultHost ({product.tiers[1].name})</td>
                    <td className="py-3 px-5 text-text-primary-v4 font-semibold">
                      ₹{product.tiers[1].monthlyPrice.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3 px-5 text-text-secondary-v4">
                      Zero egress fees · 3–5% below hyperscalers · Indian PoPs
                    </td>
                  </tr>
                )}
                {product.vsCompetitors.map((comp) => (
                  <tr key={comp.name}>
                    <td className="py-3 px-5 text-text-secondary-v4">{comp.name}</td>
                    <td className="py-3 px-5 text-text-secondary-v4">{comp.price}</td>
                    <td className="py-3 px-5 text-text-muted-v4">{comp.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
