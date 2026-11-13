'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import {
  BarChart3,
  LineChart,
  Eye,
  Database,
  ShieldCheck,
  Check,
  ArrowRight,
  Zap,
  Lock,
  PieChart,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function VaultAnalyticsPage() {
  return (
    <div className="v4-page bg-ink min-h-screen text-text-primary-v4">
      <PageHeroV4
        eyebrow="VaultAnalytics"
        title={
          <>
            Data That Makes <span className="text-signal">Decisions.</span>
          </>
        }
        description="Two analytics tools in one: Plausible for website analytics (privacy-first, no cookies), Metabase for SQL-powered business intelligence dashboards."
      />

      {/* 1. Two Product Cards: Website Analytics + BI Dashboards */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="v4-panel rounded-3xl p-8 border border-hairline bg-ink-surface flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-signal/10 text-signal">
                      <Eye className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-text-primary-v4">Plausible Web Analytics</h3>
                      <p className="text-xs text-signal font-semibold uppercase tracking-wider">Privacy-First &amp; Cookieless</p>
                    </div>
                  </div>
                  <p className="text-text-secondary-v4 text-sm leading-relaxed mb-6">
                    Track traffic, bounce rates, UTM campaigns, and conversions in real-time without annoying GDPR/cookie consent banners or spying on user personal data.
                  </p>
                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Lightweight tracking script (&lt;1KB footprint)
                    </li>
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100% cookie-free — no privacy consent modals needed
                    </li>
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Real-time active visitor stream &amp; geo breakdown
                    </li>
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom goals, events, and revenue attribution
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline font-mono text-xs text-text-muted-v4 truncate">
                  &lt;script defer data-domain=&quot;yourdomain.com&quot; src=&quot;https://analytics.vaulthost.cloud/js/script.js&quot;&gt;&lt;/script&gt;
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="v4-panel rounded-3xl p-8 border border-hairline bg-ink-surface flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-signal/10 text-signal">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-text-primary-v4">Metabase BI Dashboards</h3>
                      <p className="text-xs text-signal font-semibold uppercase tracking-wider">SQL &amp; Visual Analytics</p>
                    </div>
                  </div>
                  <p className="text-text-secondary-v4 text-sm leading-relaxed mb-6">
                    Connect directly to PostgreSQL, MySQL, ClickHouse, and BigQuery. Empower non-technical teams to ask questions with a visual query builder or write raw SQL.
                  </p>
                  <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Visual query builder + raw SQL editor with syntax highlight
                    </li>
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 20+ interactive chart types (funnels, maps, pivots, time-series)
                    </li>
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Automated daily/weekly email &amp; Slack dashboard summaries
                    </li>
                    <li className="flex items-center text-text-secondary-v4">
                      <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Connects to 50+ relational and analytical data stores
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-ink-surface-2 border border-hairline flex items-center justify-between text-xs text-text-muted-v4">
                  <span>Connectors: PostgreSQL · MySQL · SQLite · ClickHouse</span>
                  <Database className="w-4 h-4 text-signal" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2 & 3. Deep Feature Highlights */}
      <section className="v4-section bg-ink-surface/40 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Enterprise Data Stack, Delivered Managed</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">
                Designed to eliminate high Google Analytics latency and bypass expensive Tableau or Looker licensing fees.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PanelCard className="v4-panel p-6">
              <Zap className="w-8 h-8 text-signal mb-4" />
              <h4 className="text-lg font-bold text-text-primary-v4 mb-2">Zero Speed Penalty</h4>
              <p className="text-text-secondary-v4 text-sm leading-relaxed">
                Plausible script weighs under 1KB — 45x smaller than Google Analytics 4. Never hurt your Google Core Web Vitals score again.
              </p>
            </PanelCard>

            <PanelCard className="v4-panel p-6">
              <LineChart className="w-8 h-8 text-signal mb-4" />
              <h4 className="text-lg font-bold text-text-primary-v4 mb-2">Self-Service BI for Teams</h4>
              <p className="text-text-secondary-v4 text-sm leading-relaxed">
                Filter, aggregate, and slice data without filing engineering Jira tickets. Create interactive drill-downs in seconds.
              </p>
            </PanelCard>

            <PanelCard className="v4-panel p-6">
              <PieChart className="w-8 h-8 text-signal mb-4" />
              <h4 className="text-lg font-bold text-text-primary-v4 mb-2">Automated Data Sync</h4>
              <p className="text-text-secondary-v4 text-sm leading-relaxed">
                VaultHost keeps read replicas and Metabase instances synchronized automatically with low impact on production writes.
              </p>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* 4. GDPR / DPDP Compliance Callout */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12 rounded-3xl border border-signal/40 bg-gradient-to-r from-signal/10 via-ink-surface to-ink-surface-2 flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 rounded-2xl bg-signal/20 text-signal flex-shrink-0">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-signal mb-2">
                DPDP ACT &amp; GDPR COMPLIANCE VERIFIED
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-3">
                Zero third-party trackers. Zero compliance headaches.
              </h3>
              <p className="text-text-secondary-v4 text-base leading-relaxed max-w-3xl">
                Google Analytics transmits EU and Indian customer IP addresses to US servers, creating legal jeopardy under GDPR and the Indian Digital Personal Data Protection (DPDP) Act. With VaultAnalytics, your audience analytics remain 100% private and sovereign.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing (3 tiers) */}
      <section className="v4-section bg-ink-surface/30 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Simple, Unified Analytics Pricing</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                Select standalone web analytics or a full business intelligence suite with managed Metabase.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Starter */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">STARTER</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹299 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">Plausible Web Analytics only for fast websites and blogs.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100,000 monthly pageviews
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Up to 3 custom website domains
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Cookieless &amp; lightweight tracking
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Real-time dashboard &amp; UTM tags
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Weekly email traffic digest
                  </li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=analytics-starter" className="v4-btn-secondary rounded-btn w-full text-center block py-3">
                Start Web Analytics
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="v4-panel rounded-2xl p-8 border-2 border-signal relative flex flex-col justify-between bg-ink-surface">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Full Stack Analytics
              </div>
              <div>
                <div className="text-signal text-sm font-semibold mb-2">PRO</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">Plausible Web Analytics + Managed Metabase BI instance.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Plausible (500K pageviews, 10 sites)
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated Metabase BI instance
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Connect up to 5 databases
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited dashboard cards &amp; queries
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Automated Slack alerts &amp; reports
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=analytics-pro"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Get Started
              </Link>
            </div>

            {/* Business Tier */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">BUSINESS / ENTERPRISE</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹2,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">High-volume event pipelines and enterprise Metabase clusters.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 5,000,000+ monthly pageviews
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> High-memory Metabase instance
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited connected databases
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> SSO / SAML integration &amp; auditing
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% SLA with dedicated DBA
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=analytics-business"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Upgrade to Business
              </Link>
            </div>
          </div>

          {/* 6. CTA Card */}
          <div className="bg-ink-surface border border-hairline rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-2">
                Gain clarity on your business metrics today
              </h3>
              <p className="text-text-secondary-v4 max-w-xl">
                Set up cookie-free tracking or deploy your first BI dashboard in minutes through the unified VaultHost portal.
              </p>
            </div>
            <Link
              href="/portal"
              className="v4-btn-primary px-8 py-3.5 rounded-btn flex items-center gap-2 whitespace-nowrap"
            >
              Open Analytics Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
