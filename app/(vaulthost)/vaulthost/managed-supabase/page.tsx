'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import {
  Database,
  KeyRound,
  Zap,
  HardDrive,
  Code2,
  ShieldCheck,
  Check,
  Server,
  ArrowRight,
  Layers,
  Cpu,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ManagedSupabasePage() {
  return (
    <div className="v4-page bg-ink min-h-screen text-text-primary-v4">
      <PageHeroV4
        eyebrow="VaultBase"
        title={
          <>
            Managed <span className="text-signal">Supabase</span> — Postgres + Auth + Realtime
          </>
        }
        description="Full Supabase stack — Postgres database, Auth, Realtime subscriptions, Storage, Edge Functions — fully managed by VaultHost on Indian data centers."
      />

      {/* 1. Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Postgres 16</div>
              <div className="text-sm text-text-muted-v4">Latest Engine + pgvector</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Realtime</div>
              <div className="text-sm text-text-muted-v4">WebSocket Subscriptions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">RLS Native</div>
              <div className="text-sm text-text-muted-v4">Row Level Security</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Edge Functions</div>
              <div className="text-sm text-text-muted-v4">Deno + Sub-10ms Cold Starts</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. What's Included Grid (6 PanelCards) */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Complete Supabase Stack, Zero DevOps</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">
                Every component is configured, secured, and scaled automatically on dedicated Indian infrastructure.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Database className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Postgres DB</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Full relational engine with connection pooling via PgBouncer. Automatic indexing, vacuuming, and replication.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <KeyRound className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Auth &amp; User Management</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  OAuth with Google, GitHub, Apple, and SMS OTP providers. Magic links, JWT authentication, and built-in RLS integration.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Zap className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Realtime Subscriptions</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Listen to PostgreSQL database changes over WebSockets. Broadcast presence and state changes to millions of clients.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <HardDrive className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Storage (S3-Compatible)</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Store and serve large media files with zero egress fees. Built-in image transformations and access control policies.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Code2 className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Edge Functions</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Serverless TypeScript code running close to users with Deno runtime. Integrate Stripe webhooks, AI pipelines, and cron triggers.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <ShieldCheck className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Database Backups</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Continuous WAL archiving with Point-in-Time Recovery (PITR). Restore your cluster to any exact second in the last 30 days.
                </p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. Why not Supabase.com? Comparison Table */}
      <section className="v4-section bg-ink-surface/40 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">Why Choose VaultBase over Supabase.com?</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                Built specifically for Indian businesses and enterprises demanding strict data residency and transparent pricing.
              </p>
            </div>
          </ScrollReveal>

          <div className="border border-hairline rounded-2xl overflow-hidden bg-ink shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-ink-surface-2 text-text-secondary-v4 border-b border-hairline">
                  <tr>
                    <th className="py-4 px-6 font-medium">Dimension</th>
                    <th className="py-4 px-6 font-bold text-signal">VaultBase (VaultHost)</th>
                    <th className="py-4 px-6 font-medium text-text-muted-v4">Supabase.com</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Data Center Location</td>
                    <td className="py-4 px-6 text-signal font-medium">Tier-IV Mumbai &amp; Pune, India</td>
                    <td className="py-4 px-6 text-text-muted-v4">Default US / EU (India region charges high premiums)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Compliance</td>
                    <td className="py-4 px-6 text-text-primary-v4 font-medium">100% DPDP Act 2023 &amp; RBI Compliant</td>
                    <td className="py-4 px-6 text-text-muted-v4">Subject to US CLOUD Act jurisdiction</td>
                  </tr>
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Billing Currency &amp; GST</td>
                    <td className="py-4 px-6 text-signal font-medium">INR (₹) with Indian GST Invoices &amp; Razorpay</td>
                    <td className="py-4 px-6 text-text-muted-v4">USD ($) with foreign exchange markup fees</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Data Egress Fees</td>
                    <td className="py-4 px-6 text-text-primary-v4 font-medium">₹0 Egress on VaultHost Network</td>
                    <td className="py-4 px-6 text-text-muted-v4">$0.09 per GB after quota</td>
                  </tr>
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Support SLA</td>
                    <td className="py-4 px-6 text-signal font-medium">Local 24/7 Phone + WhatsApp Engineers</td>
                    <td className="py-4 px-6 text-text-muted-v4">Email ticket queue based in US PST timezone</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pre-installed Stack */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">Hardened PostgreSQL Stack</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                Every VaultBase instance arrives with industry-standard extensions pre-compiled and configured for high concurrency.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface text-center">
              <div className="font-semibold text-text-primary-v4 mb-1">PostgREST</div>
              <div className="text-xs text-text-muted-v4">Instant REST API from schema</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface text-center">
              <div className="font-semibold text-text-primary-v4 mb-1">pgBouncer</div>
              <div className="text-xs text-text-muted-v4">Pooler for 10,000+ connections</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface text-center">
              <div className="font-semibold text-text-primary-v4 mb-1">pg_cron</div>
              <div className="text-xs text-text-muted-v4">Scheduled SQL execution</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface text-center">
              <div className="font-semibold text-text-primary-v4 mb-1">pg_vector</div>
              <div className="text-xs text-text-muted-v4">LLM embeddings &amp; RAG search</div>
            </div>
            <div className="p-4 rounded-xl border border-hairline bg-ink-surface text-center">
              <div className="font-semibold text-text-primary-v4 mb-1">pgsodium</div>
              <div className="text-xs text-text-muted-v4">Hardware-level encryption</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing (3 tiers) */}
      <section className="v4-section bg-ink-surface/30 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Predictable Indian Pricing</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                No foreign transaction fees, no surprise egress bills, no credit card lockouts.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Free */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">FREE DEVELOPER</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹0 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">Ideal for side projects, prototypes, and MVPs.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 500MB dedicated database
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 50,000 monthly active auth users
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1GB file storage with CDN
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 500K Edge Function invocations
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Community support
                  </li>
                </ul>
              </div>
              <Link href="/portal/cloud/database" className="v4-btn-secondary rounded-btn w-full text-center block py-3">
                Deploy Free Project
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="v4-panel rounded-2xl p-8 border-2 border-signal relative flex flex-col justify-between bg-ink-surface">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended
              </div>
              <div>
                <div className="text-signal text-sm font-semibold mb-2">PRO PRODUCTION</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">For production applications and growing startups.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 8GB high-speed NVMe storage
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100,000 monthly active auth users
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100GB S3-compatible storage
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 7-day Point-in-Time Recovery (PITR)
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 24/7 Priority support with 99.9% SLA
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=supabase-pro"
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
                  ₹3,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">High-throughput clusters with dedicated compute.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited disk with auto-scaling
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited MAU &amp; OAuth providers
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated Read Replicas &amp; VPC
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 30-day continuous PITR restore
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% SLA with designated engineer
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=supabase-business"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Upgrade to Business
              </Link>
            </div>
          </div>

          {/* 6. CTA Card */}
          <div className="bg-gradient-to-r from-ink-surface to-ink-surface-2 border border-signal/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-2">
                Ready to launch your sovereign Postgres cluster?
              </h3>
              <p className="text-text-secondary-v4 max-w-xl">
                Deploy in less than 30 seconds with automatic connection pooling and built-in studio interface.
              </p>
            </div>
            <Link
              href="/portal/cloud/database"
              className="v4-btn-primary px-8 py-3.5 rounded-btn flex items-center gap-2 whitespace-nowrap"
            >
              Create your first VaultBase project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
