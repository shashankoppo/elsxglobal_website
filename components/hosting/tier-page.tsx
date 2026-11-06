'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRealtimePlans } from '@/hooks/use-realtime-plans';
import {
  Check, Loader2, ArrowRight, Sparkles, Shield, Zap, Headphones,
  Server, RefreshCw, Clock, X, Minus,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

interface Plan {
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  short_description: string;
  is_popular: boolean;
  cpu?: string;
  ram?: string;
  storage?: string;
  bandwidth?: string;
}

const TRUST_BADGES = [
  { icon: Shield, label: 'DDoS Protection', desc: 'Layer 3-7 mitigation' },
  { icon: RefreshCw, label: 'Free Migration', desc: 'Zero-downtime transfer' },
  { icon: Clock, label: '99.99% Uptime', desc: 'SLA backed' },
  { icon: Headphones, label: '24/7 Support', desc: 'Real humans, anytime' },
];

export function TierPageClient({ tier, tierName }: { tier: string; tierName: string }) {
  const { plans, loading } = useRealtimePlans(tier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="liquid-glass-card rounded-3xl p-6 h-[420px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="liquid-glass-card rounded-2xl p-12 text-center">
        <Server className="h-12 w-12 text-text-muted-v4/30 mx-auto mb-4" />
        <p className="text-sm text-text-muted-v4">
          No plans available for {tierName} at this time.{' '}
          <Link href="/contact" className="text-signal hover:underline">Contact sales</Link> for custom pricing.
        </p>
      </div>
    );
  }

  const allFeatures = Array.from(new Set(plans.flatMap((p) => (p.features as string[]) || [])));

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="inline-flex items-center gap-3 liquid-glass rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-signal text-primary-foreground' : 'text-text-muted-v4'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-signal text-primary-foreground' : 'text-text-muted-v4'}`}
          >
            Annual
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-good/20 text-good">2 months free</span>
          </button>
        </div>
        <p className="text-xs text-text-muted-v4">
          {plans.length} plans available · All prices in INR · GST extra
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const price = billingCycle === 'annual' ? Number(plan.price_annual) : Number(plan.price_monthly);
          const monthlyEq = billingCycle === 'annual' ? Math.round(Number(plan.price_annual) / 12) : null;
          const savings = billingCycle === 'annual' ? Number(plan.price_monthly) * 12 - Number(plan.price_annual) : 0;

          return (
            <ScrollReveal key={plan.id} animation="fade-up" delay={index * 100}>
              <div
                className={`liquid-glass-strong rounded-3xl p-8 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 h-full flex flex-col ${plan.is_popular ? 'border-primary ring-2 ring-signal/20' : 'border-white/10'}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-signal text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30 tracking-wide uppercase">
                      <Sparkles className="h-3.5 w-3.5" /> Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold tracking-tight mb-2 text-text-primary-v4">{plan.name}</h3>
                <p className="text-sm text-text-muted-v4 mb-6 min-h-[40px] leading-relaxed">{plan.short_description}</p>

                <div className="mb-6 pb-6 border-b border-hairline/50">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-extrabold tracking-tighter text-text-primary-v4">Rs {price.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-medium text-text-muted-v4">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                  </div>
                  {monthlyEq && (
                    <p className="text-sm text-text-secondary-v4 mt-2 font-medium">
                      Rs {monthlyEq.toLocaleString('en-IN')}/mo billed annually
                    </p>
                  )}
                  {savings > 0 && (
                    <p className="text-sm text-good mt-1 font-semibold flex items-center gap-1">
                      Save Rs {savings.toLocaleString('en-IN')}!
                    </p>
                  )}
                </div>

                {/* Specs grid */}
                {(plan.cpu || plan.ram || plan.storage || plan.bandwidth) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-ink-surface-2/50 border border-hairline shadow-inner">
                    {plan.cpu && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted-v4">CPU</p>
                        <p className="text-sm font-semibold text-text-primary-v4">{plan.cpu}</p>
                      </div>
                    )}
                    {plan.ram && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted-v4">RAM</p>
                        <p className="text-sm font-semibold text-text-primary-v4">{plan.ram}</p>
                      </div>
                    )}
                    {plan.storage && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted-v4">Storage</p>
                        <p className="text-sm font-semibold text-text-primary-v4">{plan.storage}</p>
                      </div>
                    )}
                    {plan.bandwidth && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted-v4">Bandwidth</p>
                        <p className="text-sm font-semibold text-text-primary-v4">{plan.bandwidth}</p>
                      </div>
                    )}
                  </div>
                )}

                <ul className="space-y-3 mb-8 flex-1">
                  {((plan.features as string[]) || []).slice(0, 7).map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm group">
                      <div className="h-5 w-5 rounded-full bg-good/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-good/20 transition-colors">
                        <Check className="h-3 w-3 text-good" />
                      </div>
                      <span className="text-text-secondary-v4 group-hover:text-text-primary-v4 transition-colors leading-relaxed">{f}</span>
                    </li>
                  ))}
                  {((plan.features as string[]) || []).length > 7 && (
                    <li className="text-xs font-medium text-signal mt-2">
                      +{((plan.features as string[]) || []).length - 7} more advanced features
                    </li>
                  )}
                </ul>

                <Link
                  href={`/vaulthost/checkout?plan=${plan.id}`}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 group ${plan.is_popular ? 'bg-signal text-primary-foreground hover:bg-primary-hover shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]' : 'liquid-glass hover:bg-ink-surface-2 hover:border-hairline-2'}`}
                >
                  Deploy Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Trust badges */}
      <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {TRUST_BADGES.map((badge) => (
          <div key={badge.label} className="flex items-center gap-3 p-4 rounded-xl liquid-glass border border-hairline/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal/10 border border-primary/20 shrink-0">
              <badge.icon className="h-5 w-5 text-signal" />
            </div>
            <div>
              <p className="text-sm font-medium">{badge.label}</p>
              <p className="text-xs text-text-muted-v4">{badge.desc}</p>
            </div>
          </div>
        ))}
      </ScrollReveal>

      {/* Feature comparison table */}
      {allFeatures.length > 0 && plans.length > 1 && (
        <ScrollReveal className="mt-12">
          <h3 className="text-xl font-semibold mb-1 text-center">Compare {tierName} Plans</h3>
          <p className="text-sm text-text-muted-v4 text-center mb-6">Every feature, side by side.</p>
          <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="p-4 text-left text-xs font-semibold text-text-muted-v4 uppercase tracking-wider">Features</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className={`p-4 text-center text-sm font-semibold min-w-[140px] ${plan.is_popular ? 'text-signal' : ''}`}>
                        {plan.name}
                        {plan.is_popular && <span className="block text-[10px] text-signal/70 font-normal mt-0.5">Popular</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, i) => (
                    <tr key={i} className="border-b border-hairline/30 last:border-0 hover:bg-ink-surface-2/10 transition-colors">
                      <td className="p-4 text-sm text-text-muted-v4">{feature}</td>
                      {plans.map((plan) => {
                        const has = ((plan.features as string[]) || []).includes(feature);
                        return (
                          <td key={plan.id} className="p-4 text-center">
                            {has ? (
                              <Check className="h-4 w-4 text-good mx-auto" />
                            ) : (
                              <Minus className="h-4 w-4 text-text-muted-v4/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-ink-surface-2/10">
                    <td className="p-4 text-sm font-medium">Price ({billingCycle === 'annual' ? 'yearly' : 'monthly'})</td>
                    {plans.map((plan) => {
                      const price = billingCycle === 'annual' ? Number(plan.price_annual) : Number(plan.price_monthly);
                      return (
                        <td key={plan.id} className="p-4 text-center">
                          <span className="text-sm font-bold">Rs {price.toLocaleString('en-IN')}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Bottom CTA strip */}
      <ScrollReveal className="mt-10 liquid-glass-strong rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-signal shrink-0" />
          <div>
            <p className="text-sm font-medium">Not sure which plan fits?</p>
            <p className="text-xs text-text-muted-v4">Talk to our team — we'll match you with the right {tierName} plan in minutes.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/contact" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass text-sm font-medium hover:bg-ink-surface-2/50 transition-colors">
            Talk to Sales
          </Link>
          <Link href="/vaulthost/pricing" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-signal text-primary-foreground text-sm font-medium hover:bg-signal/90 transition-colors">
            Compare All Plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}

// Backward-compatible export for static tier pages (vps, shared, cloud, etc.)
export function HostingTierPage({ tier }: { tier: string }) {
  const tierNameMap: Record<string, string> = {
    shared: 'Shared Hosting',
    wordpress: 'WordPress Hosting',
    vps: 'VPS Hosting',
    cloud: 'Cloud Hosting',
    dedicated: 'Dedicated Servers',
    email: 'Business Email',
    ssl: 'SSL Certificates',
    'website-builder': 'Website Builder',
  };
  return <TierPageClient tier={tier} tierName={tierNameMap[tier] || tier} />;
}
