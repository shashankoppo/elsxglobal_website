'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { HostingPlan, TIER_LABELS, HostingTier } from '@/lib/hosting-types';
import { Check, X, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';

export default function CompareClient() {
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await createClient()
        .from('hosting_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (data && data.length > 0) {
        setPlans(data as unknown as HostingPlan[]);
      } else {
        setPlans([
          {
            id: 'shared-starter',
            slug: 'shared-starter',
            tier: 'shared',
            name: 'Shared Starter',
            short_description: 'Personal sites & blogs',
            long_description: null,
            price_monthly: 99,
            price_annual: 999,
            cpu: '1 vCPU',
            ram: '1 GB',
            storage: '20 GB NVMe',
            bandwidth: '500 GB',
            features: ['1 Website', 'Free SSL', '5 Mailboxes', 'Daily Backups', '99.9% Uptime SLA'],
            specs: { cpu: 1, ram: 1 },
            is_popular: false,
            is_active: true,
            sort_order: 1,
          },
          {
            id: 'shared-pro',
            slug: 'shared-pro',
            tier: 'shared',
            name: 'Shared Pro',
            short_description: 'Growing businesses',
            long_description: null,
            price_monthly: 199,
            price_annual: 1999,
            cpu: '2 vCPU',
            ram: '2 GB',
            storage: '50 GB NVMe',
            bandwidth: '1.5 TB',
            features: ['Unlimited Websites', 'Free SSL', 'Free Domain (Annual)', 'LiteSpeed Web Server', 'Unlimited Mailboxes', 'Priority 24/7 Support'],
            specs: { cpu: 2, ram: 2 },
            is_popular: true,
            is_active: true,
            sort_order: 2,
          },
          {
            id: 'wp-managed',
            slug: 'wp-managed',
            tier: 'wordpress',
            name: 'Managed WP',
            short_description: 'WordPress performance',
            long_description: null,
            price_monthly: 299,
            price_annual: 2990,
            cpu: '2 vCPU',
            ram: '4 GB',
            storage: '40 GB NVMe',
            bandwidth: '1 TB',
            features: ['WP-CLI & SSH', 'LiteSpeed Cache', 'Staging Environment', 'Plugin Auto-Updates', 'Free Wildcard SSL', 'Malware Scanner'],
            specs: { cpu: 2, ram: 4 },
            is_popular: false,
            is_active: true,
            sort_order: 3,
          },
          {
            id: 'vps-essential',
            slug: 'vps-essential',
            tier: 'vps',
            name: 'VPS Essential',
            short_description: 'Devs & APIs',
            long_description: null,
            price_monthly: 499,
            price_annual: 4990,
            cpu: '2 vCPU Cores',
            ram: '4 GB',
            storage: '80 GB NVMe',
            bandwidth: '2 TB',
            features: ['Full Root Access', 'KVM Virtualization', 'Dedicated IPv4 + IPv6', '1-Click Snapshots', 'Mumbai Datacenter', 'DDoS Protection'],
            specs: { cpu: 2, ram: 4 },
            is_popular: false,
            is_active: true,
            sort_order: 4,
          },
          {
            id: 'vps-pro',
            slug: 'vps-pro',
            tier: 'vps',
            name: 'VPS Advanced',
            short_description: 'High traffic apps',
            long_description: null,
            price_monthly: 899,
            price_annual: 8990,
            cpu: '4 vCPU Cores',
            ram: '8 GB',
            storage: '160 GB NVMe',
            bandwidth: '4 TB',
            features: ['Full Root Access', 'EPYC High Frequency', '10 Gbps Uplink', 'BGP Anycast Routing', 'Live Kernel Patching', '24/7 Priority Support'],
            specs: { cpu: 4, ram: 8 },
            is_popular: true,
            is_active: true,
            sort_order: 5,
          },
          {
            id: 'cloud-compute',
            slug: 'cloud-compute',
            tier: 'cloud',
            name: 'Cloud Compute',
            short_description: 'Auto-scaling cluster',
            long_description: null,
            price_monthly: 1499,
            price_annual: 14990,
            cpu: '8 vCPU Cores',
            ram: '16 GB',
            storage: '320 GB NVMe',
            bandwidth: 'Unlimited',
            features: ['Auto-scaling 1-5 nodes', 'Managed Load Balancer', 'High Availability SLA', 'Automated Failover', 'Prometheus Metrics', 'Private Subnet VPC'],
            specs: { cpu: 8, ram: 16 },
            is_popular: false,
            is_active: true,
            sort_order: 6,
          },
        ]);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const getPrice = (plan: HostingPlan) =>
    billing === 'annual' ? plan.price_annual / 12 : plan.price_monthly;

  const allFeatures = Array.from(new Set(plans.flatMap((p) => p.features))).sort();
  const hasFeature = (plan: HostingPlan, feature: string) => plan.features.includes(feature);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading plans...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeroV4
        eyebrow="VaultHost"
        eyebrowIcon="server"
        title={<>Compare all hosting plans</>}
        description="Side-by-side comparison of every hosting plan we offer. Switch between monthly and annual billing to see your savings."
      />

      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-text-primary-v4' : 'text-text-muted-v4'}`}>Monthly</span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className="relative h-7 w-14 rounded-full bg-ink-surface-2 border border-hairline transition-colors"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-signal transition-transform ${billing === 'annual' ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm font-medium ${billing === 'annual' ? 'text-text-primary-v4' : 'text-text-muted-v4'}`}>
              Annual <span className="text-xs text-signal">(Save ~17%)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left p-4 text-sm font-semibold text-text-secondary-v4 sticky left-0 bg-ink z-10 min-w-[180px]">Plan</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="p-4 text-center min-w-[160px]">
                      <div className="flex flex-col items-center gap-1">
                        {plan.is_popular && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip bg-signal/10 border border-signal/20 text-xs font-medium text-signal mb-1">
                            <Star className="h-2.5 w-2.5 fill-signal" />Popular
                          </span>
                        )}
                        <span className="text-sm font-semibold text-text-primary-v4">{plan.name}</span>
                        <span className="text-xs text-text-muted-v4">{TIER_LABELS[plan.tier as HostingTier]}</span>
                        <span className="text-lg font-bold mt-1 tabular-nums text-text-primary-v4">&#8377;{getPrice(plan).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        <span className="text-xs text-text-muted-v4">/mo</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['cpu', 'ram', 'storage', 'bandwidth'].map((spec) => (
                  <tr key={spec} className="border-b border-hairline/50">
                    <td className="p-4 text-sm font-medium sticky left-0 bg-ink z-10 capitalize text-text-primary-v4">{spec}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="p-4 text-center text-sm text-text-secondary-v4 tabular-nums">
                        {(plan as unknown as Record<string, string | null>)[spec] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}

                {allFeatures.map((feature, i) => (
                  <tr key={i} className={`border-b border-hairline/30 ${i % 2 === 0 ? 'bg-ink-surface/50' : ''}`}>
                    <td className="p-3 text-sm text-text-secondary-v4 sticky left-0 bg-ink z-10">{feature}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="p-3 text-center">
                        {hasFeature(plan, feature) ? (
                          <Check className="h-4 w-4 text-signal mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-text-muted-v4/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr>
                  <td className="p-4 sticky left-0 bg-ink z-10"></td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="p-4 text-center">
                      <Link
                        href={`/vaulthost/checkout?plan=${plan.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn v4-btn-primary text-sm font-medium"
                      >
                        Order<ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
