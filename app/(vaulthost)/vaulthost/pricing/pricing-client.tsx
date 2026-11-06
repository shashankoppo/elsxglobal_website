'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ComparisonMatrix } from '@/components/hosting/comparison-matrix';
import { Check, Sparkles, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { CloudCalculator } from '@/components/hosting/cloud-calculator';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  is_popular: boolean;
  short_description: string;
}

export function PricingPageClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTier, setActiveTier] = useState<string>('shared');

  useEffect(() => {
    const fetchPlans = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('hosting_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (data && data.length > 0) {
        setPlans(data);
      } else {
        // Fallback plans if the database is not seeded
        setPlans([
          { id: 'shared-starter', name: 'Starter', tier: 'shared', price_monthly: 99, price_annual: 999, features: ['1 Website', '10GB NVMe Storage', 'Free SSL', '24/7 Support'], is_popular: false, short_description: 'Perfect for small blogs and personal sites.' },
          { id: 'shared-pro', name: 'Professional', tier: 'shared', price_monthly: 199, price_annual: 1990, features: ['Unlimited Websites', '50GB NVMe Storage', 'Free SSL', 'Daily Backups', 'Free Migration'], is_popular: true, short_description: 'For growing businesses and portfolios.' },
          { id: 'shared-business', name: 'Business', tier: 'shared', price_monthly: 399, price_annual: 3990, features: ['Unlimited Websites', '100GB NVMe Storage', 'Premium SSL', 'Daily Backups', 'Priority Support'], is_popular: false, short_description: 'High performance for eCommerce.' },
          
          { id: 'vps-1', name: 'VPS Essential', tier: 'vps', price_monthly: 499, price_annual: 4990, features: ['2 vCPU Cores', '4GB RAM', '80GB NVMe Storage', 'Root Access'], is_popular: false, short_description: 'Scalable virtual servers for developers.' },
          { id: 'vps-2', name: 'VPS Advanced', tier: 'vps', price_monthly: 899, price_annual: 8990, features: ['4 vCPU Cores', '8GB RAM', '160GB NVMe Storage', 'Root Access', 'DDoS Protection'], is_popular: true, short_description: 'More power for demanding applications.' },
          
          { id: 'cloud-compute', name: 'Cloud Compute', tier: 'cloud', price_monthly: 899, price_annual: 8990, features: ['Auto-scaling', 'Load Balancing', 'High Availability', 'API Access', 'Automated Backups'], is_popular: true, short_description: 'Enterprise-grade cloud infrastructure.' },
          
          { id: 'dedicated-metal', name: 'Bare Metal', tier: 'dedicated', price_monthly: 5999, price_annual: 59990, features: ['16 Cores / 32 Threads', '64GB ECC RAM', '2x 1TB NVMe', '10Gbps Uplink', 'Unmetered Traffic'], is_popular: false, short_description: 'Uncompromised performance and control.' },
          
          { id: 'wp-managed', name: 'Managed WP', tier: 'wordpress', price_monthly: 299, price_annual: 2990, features: ['Litespeed Cache', 'Staging Environment', 'Plugin Updates', 'Malware Scan', '1-Click Restore'], is_popular: true, short_description: 'Optimized specifically for WordPress.' },
        ]);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const tiers = ['shared', 'vps', 'cloud', 'dedicated', 'wordpress'];

  const getTierName = (tier: string) => {
    const map: Record<string, string> = {
      shared: 'Shared',
      vps: 'VPS',
      cloud: 'Cloud',
      dedicated: 'Dedicated',
      wordpress: 'WordPress'
    };
    return map[tier] || tier;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-8">
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <TrendingDown className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Save up to 85% vs AWS/Azure</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Enterprise Hosting. <span className="text-primary">Human Pricing.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All plans include NVMe storage, daily backups, DDoS protection, and 24/7 human support. No hidden fees, ever.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 mt-8 v4-panel p-1 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Annual
              <span className={`text-xs px-2 py-0.5 rounded-full ${billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-good/20 text-good'}`}>2 months free</span>
            </button>
          </div>
        </div>

        {/* Tier Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tiers.map(tier => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTier === tier ? 'bg-white text-black' : 'v4-panel hover:border-v4-hairline-2 text-muted-foreground hover:text-foreground'}`}
            >
              {getTierName(tier)}
            </button>
          ))}
        </div>

        {/* Plan Grid */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.filter(p => p.tier === activeTier).map((plan) => {
              const price = billingCycle === 'annual' ? Number(plan.price_annual) : Number(plan.price_monthly);
              const monthlyEquivalent = billingCycle === 'annual' ? Math.round(Number(plan.price_annual) / 12) : null;
              const savings = billingCycle === 'annual' ? Number(plan.price_monthly) * 12 - Number(plan.price_annual) : 0;

              return (
                <div
                  key={plan.id}
                  className={`v4-panel p-8 relative transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 flex flex-col h-full ${plan.is_popular ? 'border-primary shadow-[0_0_30px_hsl(var(--primary)/0.1)]' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                    {plan.is_popular && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold whitespace-nowrap">
                        <Sparkles className="h-3.5 w-3.5" /> Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 h-10">{plan.short_description}</p>

                  <div className="mb-6 p-4 rounded-xl bg-background/50 border border-border/50">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">₹{price.toLocaleString('en-IN')}</span>
                      <span className="text-sm font-medium text-muted-foreground">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                    </div>
                    {monthlyEquivalent && (
                      <p className="text-xs font-medium text-muted-foreground mt-2">
                        Equivalent to ₹{monthlyEquivalent.toLocaleString('en-IN')}/mo
                      </p>
                    )}
                    {savings > 0 && (
                      <p className="text-xs font-medium text-good mt-1">
                        Save ₹{savings.toLocaleString('en-IN')} per year
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3.5 mb-8 flex-1">
                    {(plan.features as string[] || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/90 font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/vaulthost/checkout?plan=${plan.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${plan.is_popular ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40' : 'bg-muted/50 hover:bg-muted text-foreground'}`}
                  >
                    Select {plan.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Calculator - Only show in Cloud tier */}
        {activeTier === 'cloud' && (
          <div className="mb-24 animate-fade-up">
            <CloudCalculator />
          </div>
        )}

        {/* AWS/Azure Comparison */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">The Real Cost Difference</h2>
            <p className="text-muted-foreground">See exactly how much you save with VaultHost vs AWS and Azure</p>
          </div>
          <ComparisonMatrix />
        </div>
      </div>
    </div>
  );
}
