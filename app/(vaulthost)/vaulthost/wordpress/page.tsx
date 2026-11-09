'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import {
  Zap,
  RefreshCw,
  Copy,
  Terminal,
  ShoppingBag,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  Server,
  Database,
  Gauge,
  X,
} from 'lucide-react';

export default function WordPressHostingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '₹199',
      unit: '/mo',
      popular: false,
      sites: '1 WordPress Site',
      storage: '25 GB NVMe Storage',
      traffic: '~25,000 Visits/mo',
      features: [
        '1 WordPress Installation',
        '25 GB NVMe High-Speed Storage',
        'LiteSpeed Web Server + LSCache',
        'Automated Daily Offsite Backups',
        'Free SSL & Cloudflare CDN',
        'WP-CLI & SSH Terminal Access',
        'Standard 24/7 Support',
      ],
      ctaText: 'Get Starter',
    },
    {
      name: 'Business',
      price: '₹499',
      unit: '/mo',
      popular: true,
      sites: '5 WordPress Sites',
      storage: '60 GB NVMe Storage',
      traffic: '~100,000 Visits/mo',
      features: [
        'Up to 5 WordPress Sites',
        '60 GB NVMe High-Speed Storage',
        '1-Click Staging & Sync Engine',
        'Free Custom Domain Name (1st Year)',
        'Smart Plugin Updates with Rollback',
        'Redis Object Cache Acceleration',
        'Unlimited Business Mailboxes',
        'Priority 24/7 WordPress Support',
      ],
      ctaText: 'Get Business',
    },
    {
      name: 'Pro',
      price: '₹999',
      unit: '/mo',
      popular: false,
      sites: '25 WordPress Sites',
      storage: '150 GB NVMe Storage',
      traffic: '~400,000 Visits/mo',
      features: [
        'Up to 25 WordPress Sites',
        '150 GB NVMe High-Speed Storage',
        'WooCommerce High-Load Optimizations',
        'Dedicated PHP Workers (512MB RAM)',
        'Automated Malware Scanner & Auto-Clean',
        'Git Integration & CI/CD Push Deploy',
        'White-Glove Priority Migration',
      ],
      ctaText: 'Get Pro',
    },
    {
      name: 'Agency',
      price: '₹2,499',
      unit: '/mo',
      popular: false,
      sites: '100 WordPress Sites',
      storage: '500 GB NVMe Storage',
      traffic: '~1,500,000 Visits/mo',
      features: [
        'Up to 100 WordPress Sites',
        '500 GB NVMe High-Speed Storage',
        'WordPress Multisite (WPMU) Support',
        'White-Label Client Account Portal',
        'Custom PHP.ini & Redis Tuning',
        '99.99% Financial Uptime SLA',
        'Dedicated Technical Account Manager',
      ],
      ctaText: 'Get Agency',
    },
  ];

  const features = [
    {
      title: 'LiteSpeed Enterprise Cache',
      description: 'Native server-level LiteSpeed cache pre-compiles static pages, serving HTML payloads in under 18ms with zero PHP overhead.',
      icon: <Zap className="h-5 w-5" />,
    },
    {
      title: 'Automated Smart Updates',
      description: 'Core, theme, and plugin updates are tested via AI visual comparison. If a plugin breaks your layout, changes rollback instantly.',
      icon: <RefreshCw className="h-5 w-5" />,
    },
    {
      title: '1-Click Staging Sandbox',
      description: 'Clone production environments into private test sandboxes in seconds. Experiment with designs or plugins, then push live smoothly.',
      icon: <Copy className="h-5 w-5" />,
    },
    {
      title: 'WP-CLI & SSH Access',
      description: 'Execute bulk WordPress commands, database migrations, plugin installations, and Git pushes directly from your secure terminal.',
      icon: <Terminal className="h-5 w-5" />,
    },
    {
      title: 'WooCommerce Accelerated',
      description: 'High-concurrency checkout scaling with server-side Redis object caching, custom cart fragments bypass, and 512MB PHP memory limits.',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      title: 'Automated Daily Backups',
      description: 'Nightly incremental snapshots stored in geographically redundant object storage with 30-day retention and one-click point-in-time restore.',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
  ];

  const comparisonRows = [
    {
      metric: 'Time to First Byte (TTFB)',
      vaulthost: '18 ms (LiteSpeed NVMe)',
      shared: '420 ms (Overloaded Apache)',
      aws: '180 ms (Uncached Nginx)',
    },
    {
      metric: 'Concurrent Throughput',
      vaulthost: '2,400 req/sec',
      shared: '120 req/sec',
      aws: '450 req/sec',
    },
    {
      metric: 'Uptime SLA',
      vaulthost: '99.99% Financial SLA',
      shared: '99.5% Best Effort',
      aws: '99.9% Standard',
    },
    {
      metric: 'Web Server & Caching',
      vaulthost: 'LiteSpeed Enterprise + LSCache',
      shared: 'Standard Apache + Plugin',
      aws: 'Nginx (Manual Config)',
    },
    {
      metric: '1-Click Staging Environment',
      vaulthost: 'Included Free',
      shared: 'Not Available',
      aws: 'Manual EBS Snapshot',
    },
    {
      metric: 'WordPress Smart Updates',
      vaulthost: 'AI Visual Rollback Guard',
      shared: 'Manual / Risky',
      aws: 'Self-Managed CLI',
    },
    {
      metric: '24/7 Human WordPress Support',
      vaulthost: 'Included (Core Experts)',
      shared: 'Generic Ticket Queue',
      aws: 'Paid Add-on ($29/mo+)',
    },
  ];

  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="Managed WordPress"
        title={<>WordPress Hosting <span className="text-signal">That Scales.</span></>}
        description="Fully managed WordPress with auto-updates, Litespeed cache, staging, WP CLI, and Cloudflare CDN. 10x faster. Plans from ₹199/mo."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">10x Faster</div>
              <div className="text-sm text-text-muted-v4">LiteSpeed Enterprise</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">Auto</div>
              <div className="text-sm text-text-muted-v4">Updates with Rollback</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">1-Click</div>
              <div className="text-sm text-text-muted-v4">Staging Sandbox</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">100% Free</div>
              <div className="text-sm text-text-muted-v4">White-Glove Migration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="v4-section bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                High-Performance WP Infrastructure
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl v4-display text-text-primary-v4">
                Managed WordPress Hosting Plans
              </h2>
              <p className="mt-3 text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Engineered for bloggers, agencies, and high-volume WooCommerce merchants demanding unyielding performance.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <ScrollReveal key={plan.name} delay={idx * 0.1}>
                <div
                  className={`v4-panel p-6 rounded-2xl flex flex-col h-full relative transition-all ${
                    plan.popular
                      ? 'border-signal ring-1 ring-signal/50 bg-ink-surface'
                      : 'border-hairline bg-ink-surface/60 hover:border-hairline-2'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-signal text-ink text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-medium text-text-primary-v4">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-text-primary-v4">{plan.price}</span>
                      <span className="text-xs text-text-muted-v4 font-mono">{plan.unit}</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs font-mono text-text-secondary-v4 border-t border-hairline pt-3">
                      <div className="text-signal font-semibold">{plan.sites}</div>
                      <div className="text-text-primary-v4">{plan.storage}</div>
                      <div className="text-text-muted-v4">{plan.traffic}</div>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1 border-t border-hairline pt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start text-xs text-text-secondary-v4">
                        <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/portal/signup"
                    className={`w-full justify-center rounded-btn py-2.5 text-sm font-semibold transition-all ${
                      plan.popular ? 'v4-btn-primary' : 'v4-btn-secondary'
                    }`}
                  >
                    {plan.ctaText}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 text-3xl sm:text-4xl mb-4">
                Engineered for Maximum Speed and Security
              </h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Stop wrestling with server configurations. We optimize the entire stack so your WordPress site runs at top speeds.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
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
        </div>
      </div>

      {/* Performance Comparison Table */}
      <div className="v4-section bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Benchmark Results
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl v4-display text-text-primary-v4">
                VaultHost vs. The Industry
              </h2>
              <p className="mt-3 text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Real-world benchmark telemetry comparing our LiteSpeed managed architecture against shared hosting and AWS Lightsail.
              </p>
            </div>
          </ScrollReveal>

          <div className="v4-panel rounded-2xl border border-hairline overflow-hidden bg-ink-surface/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline bg-ink-surface-2/80">
                    <th className="p-4 sm:p-5 text-sm font-semibold text-text-primary-v4">Performance &amp; Features</th>
                    <th className="p-4 sm:p-5 text-sm font-bold text-signal bg-signal/5 border-x border-signal/20">
                      VaultHost Managed WP
                    </th>
                    <th className="p-4 sm:p-5 text-sm font-medium text-text-secondary-v4">Traditional Shared Hosting</th>
                    <th className="p-4 sm:p-5 text-sm font-medium text-text-secondary-v4">AWS Lightsail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-sm">
                  {comparisonRows.map((row, idx) => (
                    <tr key={row.metric} className={idx % 2 === 0 ? 'bg-ink/30' : 'bg-ink-surface/30'}>
                      <td className="p-4 sm:p-5 font-medium text-text-primary-v4">{row.metric}</td>
                      <td className="p-4 sm:p-5 font-semibold text-signal bg-signal/5 border-x border-signal/20">
                        {row.vaulthost}
                      </td>
                      <td className="p-4 sm:p-5 text-text-secondary-v4">{row.shared}</td>
                      <td className="p-4 sm:p-5 text-text-secondary-v4">{row.aws}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Free Migration Callout */}
      <div className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="v4-panel p-8 sm:p-10 rounded-2xl border border-signal/40 bg-gradient-to-r from-ink-surface to-ink-surface-2 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-signal/10 border border-signal/30 text-signal text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Zero-Downtime Migration
              </div>
              <h2 className="v4-display text-2xl sm:text-3xl text-text-primary-v4 mb-3">
                Switching to VaultHost? We Migrate Your WordPress Sites for Free
              </h2>
              <p className="text-text-secondary-v4 text-sm sm:text-base leading-relaxed max-w-2xl">
                Our in-house WordPress engineers handle database migration, wp-content uploads, media libraries, and DNS cutover with zero downtime. Keep serving customers without missing a single order.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/vaulthost/migration"
                className="v4-btn-primary inline-flex items-center justify-center px-6 py-3 rounded-btn text-sm font-medium"
              >
                Claim Free Migration <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white text-3xl sm:text-4xl mb-6">
              Give Your WordPress Sites the Speed They Deserve
            </h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-base sm:text-lg">
              Launch in minutes with pre-configured LiteSpeed caching, staging environments, and automatic updates.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/portal/signup" className="v4-btn-primary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                Get Started with WordPress <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/vaulthost/compare" className="v4-btn-secondary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                Compare All Plans
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
