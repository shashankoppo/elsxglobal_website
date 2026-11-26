'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ComparisonMatrix } from '@/components/hosting/comparison-matrix';
import { Check, Sparkles, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { CloudCalculator } from '@/components/hosting/cloud-calculator';
import Link from 'next/link';
import { calculateHourlyRate, getAnnualPricing } from '@/lib/billing/pricingMath';

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

type BillingCycle = 'payg' | 'monthly' | 'semi_annual' | 'annual';

export function PricingPageClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
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
        // Authoritative enterprise plans with transparent INR pricing
        setPlans([
          { id: 'shared-starter', name: 'Shared Starter', tier: 'shared', price_monthly: 790, price_annual: 7900, features: ['1 Website', '10GB NVMe Storage', 'Free Wildcard SSL', '24/7 Support'], is_popular: false, short_description: 'Fast NVMe hosting for blogs and small sites.' },
          { id: 'shared-pro', name: 'Shared Professional', tier: 'shared', price_monthly: 1490, price_annual: 14900, features: ['Unlimited Websites', '50GB NVMe Storage', 'Free Wildcard SSL', 'Daily Backups', 'Free Migration'], is_popular: true, short_description: 'For growing businesses and portfolios.' },
          { id: 'shared-business', name: 'Shared Business', tier: 'shared', price_monthly: 2790, price_annual: 27900, features: ['Unlimited Websites', '100GB NVMe Storage', 'Premium EV SSL', 'Daily Backups', 'Priority Support'], is_popular: false, short_description: 'High performance for eCommerce and agencies.' },
          
          { id: 'vps-1', name: 'VPS Essential (2 vCPU / 4GB)', tier: 'vps', price_monthly: 2960, price_annual: 29472, features: ['2 vCPU Cores (AMD EPYC)', '4GB DDR5 RAM', '80GB NVMe Storage', 'Full Root SSH', 'DDoS Protection'], is_popular: false, short_description: 'Balanced cloud compute for production web applications and APIs.' },
          { id: 'vps-2', name: 'VPS Advanced (4 vCPU / 8GB)', tier: 'vps', price_monthly: 5850, price_annual: 58260, features: ['4 vCPU Cores (AMD EPYC)', '8GB DDR5 RAM', '160GB NVMe Storage', 'Full Root SSH', 'Automated Snapshots'], is_popular: true, short_description: 'High-frequency compute instance for APIs, databases, and microservices.' },
          
          { id: 'cloud-compute', name: 'Cloud Compute High Availability', tier: 'cloud', price_monthly: 4890, price_annual: 48900, features: ['Auto-scaling Cluster', 'Integrated Load Balancing', 'N+1 Multi-Zone Redundancy', 'Full REST API Automation', 'Automated Backups'], is_popular: true, short_description: 'Enterprise-grade cloud infrastructure for mission-critical apps.' },
          
          { id: 'dedicated-metal', name: 'Bare Metal Dedicated Server', tier: 'dedicated', price_monthly: 59990, price_annual: 599900, features: ['16 Cores / 32 Threads Intel Xeon', '64GB ECC RAM', '2x 1TB NVMe RAID-1', '10Gbps Uplink', 'Unmetered Bandwidth', 'IPMI/KVM Root Console'], is_popular: false, short_description: 'Uncompromised dedicated physical hardware with zero virtualization overhead.' },
          
          { id: 'wp-managed', name: 'Managed WordPress Pro', tier: 'wordpress', price_monthly: 2490, price_annual: 24900, features: ['LiteSpeed Cache (3x Faster)', '1-Click Staging', 'Automated Updates', 'Malware Scan', '1-Click Restore'], is_popular: true, short_description: 'Fully managed WordPress with LiteSpeed caching and zero maintenance.' },
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
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/20 mb-4">
            <TrendingDown className="h-3.5 w-3.5 text-signal" />
            <span className="text-xs font-semibold text-signal uppercase tracking-wider">
              India-First Enterprise Cloud · Transparent INR Billing &amp; Zero Egress Fees
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Enterprise Cloud Compute. <span className="text-primary">Predictable Economics.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            High-frequency AMD EPYC processors, enterprise PCIe 4.0 NVMe, and 10Gbps unmetered bandwidth. Choose Pay As You Go or commit 1, 6, or 12 months for additional savings.
          </p>

          {/* 4-Way Billing Toggle */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1 mt-8 v4-panel p-1.5 rounded-full max-w-full">
            <button
              onClick={() => setBillingCycle('payg')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                billingCycle === 'payg' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pay As You Go
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                billingCycle === 'monthly' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              1 Month
            </button>
            <button
              onClick={() => setBillingCycle('semi_annual')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                billingCycle === 'semi_annual' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              6 Months
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${billingCycle === 'semi_annual' ? 'bg-white/20 text-white' : 'bg-good/20 text-good'}`}>Save 5%</span>
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              12 Months
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-good/20 text-good'}`}>2 Mo Free</span>
            </button>
          </div>
        </div>

        {/* Tier Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tiers.map(tier => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${activeTier === tier ? 'bg-white text-black font-semibold' : 'v4-panel hover:border-v4-hairline-2 text-muted-foreground hover:text-foreground'}`}
            >
              {getTierName(tier)}
            </button>
          ))}
        </div>

        {/* Plan Grid */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.filter(p => p.tier === activeTier).map((plan) => {
              const baseMonthly = Number(plan.price_monthly);
              let displayPrice = baseMonthly;
              let suffix = '/mo';
              let subtitle = 'Standard 1-Month Rate';

              if (billingCycle === 'payg') {
                displayPrice = calculateHourlyRate(baseMonthly) as any;
                suffix = '/hr';
                subtitle = `Pay As You Go metered · 730 hrs (₹${baseMonthly.toLocaleString('en-IN')}/mo cap)`;
              } else if (billingCycle === 'semi_annual') {
                displayPrice = Math.round(baseMonthly * 0.95);
                suffix = '/mo';
                subtitle = `Billed ₹${Math.round(baseMonthly * 6 * 0.95).toLocaleString('en-IN')} every 6 months`;
              } else if (billingCycle === 'annual') {
                const { annualMonthlyEquivalent, annualTotal } = getAnnualPricing(baseMonthly, plan.price_annual);
                displayPrice = annualMonthlyEquivalent;
                suffix = '/mo';
                subtitle = `Billed ₹${annualTotal.toLocaleString('en-IN')} annually (2 mo free)`;
              }

              const checkoutBilling = billingCycle === 'payg' ? 'pay_as_you_go' : billingCycle;

              return (
                <div
                  key={plan.id}
                  className={`v4-panel p-6 sm:p-8 relative transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 flex flex-col h-full w-full ${plan.is_popular ? 'border-primary ring-1 ring-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.1)]' : ''}`}
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
                      <span className="text-4xl font-bold tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</span>
                      <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-2">
                      {subtitle}
                    </p>
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
                    href={`/vaulthost/checkout?plan=${plan.id}&billing=${checkoutBilling}`}
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">The Real Cost Difference</h2>
            <p className="text-muted-foreground">See exactly how much you save with VaultHost vs AWS and Azure</p>
          </div>
          <ComparisonMatrix />
        </div>
      </div>
    </div>
  );
}
