'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import {
  Check,
  X,
  Trophy,
  ArrowRight,
  Shield,
  Zap,
  DollarSign,
  Headphones,
  Server,
  Sparkles,
} from 'lucide-react';

interface ComparisonRow {
  criterion: string;
  vaulthost: { text: string; boolean?: boolean };
  aws: { text: string; boolean?: boolean };
  azure: { text: string; boolean?: boolean };
  gcp: { text: string; boolean?: boolean };
  digitalocean: { text: string; boolean?: boolean };
  hostinger: { text: string; boolean?: boolean };
  godaddy: { text: string; boolean?: boolean };
}

export default function ComparePage() {
  const comparisonData: ComparisonRow[] = [
    {
      criterion: 'Entry VPS Price',
      vaulthost: { text: '₹399 /mo' },
      aws: { text: '₹2,800 /mo' },
      azure: { text: '₹2,500 /mo' },
      gcp: { text: '₹2,200 /mo' },
      digitalocean: { text: '₹1,100 /mo' },
      hostinger: { text: '₹500 /mo' },
      godaddy: { text: '₹650 /mo' },
    },
    {
      criterion: 'DDoS Protection Included',
      vaulthost: { text: 'Included (Unmetered Terabit)', boolean: true },
      aws: { text: 'Basic Only ($3,000/mo for Shield Adv)', boolean: false },
      azure: { text: 'Basic Only ($2,944/mo for Network Prot)', boolean: false },
      gcp: { text: 'Paid Add-on (Cloud Armor)', boolean: false },
      digitalocean: { text: 'Basic Layer 4 Only', boolean: false },
      hostinger: { text: 'Included', boolean: true },
      godaddy: { text: 'Paid Add-on', boolean: false },
    },
    {
      criterion: 'Free SSL Certificates',
      vaulthost: { text: 'Included (Wildcard Automated)', boolean: true },
      aws: { text: 'Requires ALB/CloudFront', boolean: false },
      azure: { text: 'App Service only (Not VMs)', boolean: false },
      gcp: { text: 'Requires Load Balancer', boolean: false },
      digitalocean: { text: 'Manual Setup Required', boolean: false },
      hostinger: { text: 'Included', boolean: true },
      godaddy: { text: 'Paid Add-on (₹2,999/yr+)', boolean: false },
    },
    {
      criterion: 'India Datacenter Locations',
      vaulthost: { text: 'Mumbai, Bengaluru, Delhi NCR', boolean: true },
      aws: { text: 'Mumbai & Hyderabad', boolean: true },
      azure: { text: 'Pune, Chennai, Mumbai', boolean: true },
      gcp: { text: 'Mumbai & Delhi', boolean: true },
      digitalocean: { text: 'Bengaluru (BLR1)', boolean: true },
      hostinger: { text: 'Mumbai', boolean: true },
      godaddy: { text: 'Singapore / US Only (Entry)', boolean: false },
    },
    {
      criterion: '24/7 Human Technical Support',
      vaulthost: { text: 'Included (Phone, Chat, Ticket)', boolean: true },
      aws: { text: 'Paid Support ($29-$100/mo min)', boolean: false },
      azure: { text: 'Paid Support ($29-$100/mo min)', boolean: false },
      gcp: { text: 'Paid Support ($29/mo min)', boolean: false },
      digitalocean: { text: 'Ticket only (Paid for Slack/SLA)', boolean: false },
      hostinger: { text: 'Slow Queue (Hours wait)', boolean: false },
      godaddy: { text: 'Phone Support (Aggressive Upsells)', boolean: true },
    },
    {
      criterion: 'Free White-Glove Migration',
      vaulthost: { text: 'Included (Zero-Downtime)', boolean: true },
      aws: { text: 'Self-Managed Only', boolean: false },
      azure: { text: 'Self-Managed Only', boolean: false },
      gcp: { text: 'Self-Managed Only', boolean: false },
      digitalocean: { text: 'Self-Managed Only', boolean: false },
      hostinger: { text: 'Automated Tool Only', boolean: true },
      godaddy: { text: 'Paid Add-on (₹7,000+)', boolean: false },
    },
    {
      criterion: 'Transparent Pricing Model',
      vaulthost: { text: 'Predictable Flat INR (No Egress Fees)' },
      aws: { text: 'Variable + Expensive Egress' },
      azure: { text: 'Variable + Inter-region Egress' },
      gcp: { text: 'Variable + Premium Egress' },
      digitalocean: { text: 'USD Billing + Egress Caps' },
      hostinger: { text: 'Teaser Price (3x Renewal Spike)' },
      godaddy: { text: 'Lock-in (Heavy Renewal Spike)' },
    },
    {
      criterion: 'Money-Back Guarantee',
      vaulthost: { text: '30-Day Full Refund', boolean: true },
      aws: { text: 'No Refunds', boolean: false },
      azure: { text: 'No Refunds', boolean: false },
      gcp: { text: 'No Refunds', boolean: false },
      digitalocean: { text: 'No Refunds', boolean: false },
      hostinger: { text: '30-Day Policy', boolean: true },
      godaddy: { text: 'Conditional / Non-refundable', boolean: false },
    },
  ];

  const winnerFeatures = [
    {
      title: 'Up to 85% Cost Reduction',
      description: 'Zero egress bandwidth penalties, zero sudden hyper-scaler surprise billing, and predictable INR pricing inclusive of GST credits.',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'Ultra-Low Latency in India',
      description: 'Servers deployed directly inside Tier-4 datacenters in Mumbai and Bengaluru, providing sub-10ms ping for Indian users.',
      icon: <Zap className="h-5 w-5" />,
    },
    {
      title: 'Real Human Support 24/7/365',
      description: 'Never get stuck talking to an unhelpful bot or pay thousands of dollars for basic support tickets. Talk directly to experienced systems engineers.',
      icon: <Headphones className="h-5 w-5" />,
    },
    {
      title: 'Free Zero-Downtime Migration',
      description: 'Our certified migration team moves your existing cPanel, WordPress, databases, and DNS from AWS, Hostinger, or GoDaddy for free.',
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const renderCell = (cell: { text: string; boolean?: boolean }, isVaultHost = false) => {
    if (cell.boolean === true) {
      return (
        <div className="flex items-center gap-1.5">
          <Check className="h-4 w-4 text-good shrink-0 font-bold" />
          <span className={isVaultHost ? 'font-semibold text-text-primary-v4' : 'text-text-secondary-v4'}>
            {cell.text}
          </span>
        </div>
      );
    }
    if (cell.boolean === false) {
      return (
        <div className="flex items-center gap-1.5">
          <X className="h-4 w-4 text-red-400 shrink-0 font-bold" />
          <span className="text-text-muted-v4 text-xs">{cell.text}</span>
        </div>
      );
    }
    return (
      <span className={isVaultHost ? 'font-bold text-signal' : 'text-text-secondary-v4 font-mono'}>
        {cell.text}
      </span>
    );
  };

  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="Compare Plans"
        title={<>VaultHost vs <span className="text-signal">The Competition</span></>}
        description="Transparent pricing vs AWS, Azure, GCP, DigitalOcean, Hostinger, and GoDaddy."
      />

      {/* Main Comparison Section */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Head-to-Head Provider Breakdown
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl v4-display text-text-primary-v4">
                Honest Cloud &amp; Hosting Comparison
              </h2>
              <p className="mt-3 text-text-secondary-v4 max-w-2xl mx-auto text-base">
                See exactly how VaultHost outperforms traditional hyperscalers and budget hosts in pricing, performance, and customer support.
              </p>
            </div>
          </ScrollReveal>

          {/* Mobile Swipe Hint */}
          <div className="sm:hidden flex items-center justify-between text-xs text-text-muted-v4 px-3 py-2 mb-3 bg-ink-surface rounded-lg border border-hairline">
            <span>← Swipe table horizontally to compare all 7 providers →</span>
          </div>

          {/* Comparison Table */}
          <div className="v4-panel rounded-2xl border border-hairline overflow-hidden bg-ink-surface/50 shadow-2xl">
            <div className="overflow-x-auto terminal-scrollbar">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-hairline bg-ink-surface-2">
                    <th className="p-4 sm:p-5 font-semibold text-text-primary-v4 min-w-[170px] sticky left-0 bg-ink-surface-2 z-10 border-r border-hairline">Feature / Metric</th>
                    <th className="p-4 sm:p-5 font-bold text-signal bg-signal/10 border-x border-signal/30 min-w-[190px]">
                      <div className="flex items-center gap-1.5 text-signal text-sm">
                        <Trophy className="h-4 w-4" /> VaultHost
                      </div>
                      <span className="text-[10px] text-text-secondary-v4 font-mono font-normal block mt-0.5">
                        Recommended
                      </span>
                    </th>
                    <th className="p-4 sm:p-5 font-medium text-text-secondary-v4 min-w-[150px]">AWS</th>
                    <th className="p-4 sm:p-5 font-medium text-text-secondary-v4 min-w-[150px]">Azure</th>
                    <th className="p-4 sm:p-5 font-medium text-text-secondary-v4 min-w-[150px]">GCP</th>
                    <th className="p-4 sm:p-5 font-medium text-text-secondary-v4 min-w-[150px]">DigitalOcean</th>
                    <th className="p-4 sm:p-5 font-medium text-text-secondary-v4 min-w-[150px]">Hostinger</th>
                    <th className="p-4 sm:p-5 font-medium text-text-secondary-v4 min-w-[150px]">GoDaddy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {comparisonData.map((row, idx) => (
                    <tr
                      key={row.criterion}
                      className={idx % 2 === 0 ? 'bg-ink/40 hover:bg-ink-surface/30' : 'bg-ink-surface/20 hover:bg-ink-surface/40'}
                    >
                      <td className="p-4 sm:p-5 font-medium text-text-primary-v4 whitespace-nowrap sticky left-0 bg-ink-surface z-10 border-r border-hairline">
                        {row.criterion}
                      </td>
                      <td className="p-4 sm:p-5 bg-signal/5 border-x border-signal/20">
                        {renderCell(row.vaulthost, true)}
                      </td>
                      <td className="p-4 sm:p-5">{renderCell(row.aws)}</td>
                      <td className="p-4 sm:p-5">{renderCell(row.azure)}</td>
                      <td className="p-4 sm:p-5">{renderCell(row.gcp)}</td>
                      <td className="p-4 sm:p-5">{renderCell(row.digitalocean)}</td>
                      <td className="p-4 sm:p-5">{renderCell(row.hostinger)}</td>
                      <td className="p-4 sm:p-5">{renderCell(row.godaddy)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Callout Section */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/30 text-signal text-xs font-semibold uppercase tracking-wider mb-3">
                <Trophy className="h-4 w-4" /> The Clear Winner
              </div>
              <h2 className="text-3xl sm:text-4xl v4-display text-text-primary-v4">
                Why Engineering Teams Pick VaultHost
              </h2>
              <p className="mt-3 text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Hyperscale power without the hyperscale price tag, bloated dashboards, or opaque foreign billing.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {winnerFeatures.map((feat, i) => (
              <ScrollReveal key={feat.title} delay={i * 0.1}>
                <PanelCard
                  title={feat.title}
                  description={feat.description}
                  icon={feat.icon}
                  className="h-full"
                />
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/portal/signup"
              className="v4-btn-primary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold"
            >
              Switch to VaultHost Today <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Migration Banner */}
      <div className="v4-section-sm bg-ink-surface border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="v4-panel p-8 sm:p-10 rounded-2xl border border-signal/40 bg-gradient-to-r from-ink-surface to-ink-surface-2 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="v4-display text-2xl text-text-primary-v4 mb-2">
                Trapped on AWS, Hostinger, or GoDaddy?
              </h3>
              <p className="text-text-secondary-v4 text-sm max-w-xl">
                We will migrate all your databases, websites, and DNS records over to VaultHost completely free with zero downtime.
              </p>
            </div>
            <Link
              href="/vaulthost/migration"
              className="v4-btn-secondary inline-flex items-center justify-center px-6 py-3 rounded-btn text-sm font-semibold shrink-0"
            >
              Request Free Migration <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white text-3xl sm:text-4xl mb-6">
              Experience the VaultHost Advantage
            </h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-base sm:text-lg">
              Get started with our high-speed cloud infrastructure in Mumbai starting at just ₹399/mo. 30-day money-back guarantee.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/portal/signup" className="v4-btn-primary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/pricing" className="v4-btn-secondary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                View All Pricing
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
