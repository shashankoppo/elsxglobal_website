'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import {
  MessageSquare,
  ShieldCheck,
  Users,
  Video,
  FileText,
  Share2,
  Lock,
  ArrowRight,
  Check,
  Server,
  Zap,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export default function VaultChatPage() {
  const integrations = [
    'Jira', 'GitHub', 'Bitbucket', 'PagerDuty', 'Jenkins', 'Zoom', 'Custom Webhooks'
  ];

  return (
    <div className="v4-page bg-ink min-h-screen text-text-primary-v4">
      <PageHeroV4
        eyebrow="VaultChat"
        title={
          <>
            Team Chat. <span className="text-signal">Your Data.</span>
          </>
        }
        description="Enterprise messaging built on Mattermost — Slack-compatible features with Indian data residency. End-to-end encrypted, self-hosted, fully managed."
      />

      {/* 1. Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-signal mb-1">90% Slack</div>
              <div className="text-sm text-text-muted-v4">Keyboard &amp; API Compatible</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">E2E Encrypted</div>
              <div className="text-sm text-text-muted-v4">Zero Third-Party Inspection</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">1,000+ Users</div>
              <div className="text-sm text-text-muted-v4">Per High-Performance Node</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">LDAP / SAML</div>
              <div className="text-sm text-text-muted-v4">Enterprise Single Sign-On</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Core Messaging Features Grid (6 Panels) */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Enterprise Collaboration Without Compromise</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">
                Channels, threads, calls, and files in a sovereign environment your security team will love.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <MessageSquare className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Channels &amp; Threads</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Public and private channels with structured threaded discussions, markdown formatting, syntax highlighting, and custom emoji reactions.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Users className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Direct Messages &amp; Groups</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  1-on-1 private messaging and multi-person direct message groups with custom notification controls, mentions, and presence status.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <FileText className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Unlimited File Sharing</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Upload PDFs, code snippets, logs, and spreadsheets directly to your private S3-compatible VaultStorage with zero file retention limits.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Share2 className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Screen Share</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Instantly share your entire screen, individual application windows, or browser tabs directly inside active channel calls.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Video className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">High-Def Video Calls</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Built-in WebRTC voice and video huddles with no third-party meeting links required. Talk with your team in 1 click.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Lock className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">End-to-End Encryption</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  TLS in transit and AES-256 at rest. Zero telemetry dispatched to foreign tech companies or ad brokers.
                </p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. Slack vs VaultChat Comparison Table */}
      <section className="v4-section bg-ink-surface/40 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">Slack vs. VaultChat Comparison</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                Slack costs ₹625+ per user each month and exports your sensitive conversations overseas. VaultChat cuts costs by 84%.
              </p>
            </div>
          </ScrollReveal>

          <div className="border border-hairline rounded-2xl overflow-hidden bg-ink shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-ink-surface-2 text-text-secondary-v4 border-b border-hairline">
                  <tr>
                    <th className="py-4 px-6 font-medium">Feature / Metric</th>
                    <th className="py-4 px-6 font-bold text-signal">VaultChat (Managed Mattermost)</th>
                    <th className="py-4 px-6 font-medium text-text-muted-v4">Slack Pro / Business+</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Monthly Price per User</td>
                    <td className="py-4 px-6 text-signal font-bold">₹99 /user/mo</td>
                    <td className="py-4 px-6 text-text-muted-v4">₹625 to ₹1,040 /user/mo ($7.25 - $12.50)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Data Location</td>
                    <td className="py-4 px-6 text-text-primary-v4 font-medium">100% Indian Data Centers (Mumbai/Pune)</td>
                    <td className="py-4 px-6 text-text-muted-v4">US Multi-Tenant AWS Cloud (Salesforce owned)</td>
                  </tr>
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Compliance Status</td>
                    <td className="py-4 px-6 text-signal font-medium">Indian DPDP Act, ISO 27001, RBI Certified</td>
                    <td className="py-4 px-6 text-text-muted-v4">US CLOUD Act jurisdiction (subpoena risk)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Message History Retention</td>
                    <td className="py-4 px-6 text-text-primary-v4 font-medium">Unlimited history forever on all plans</td>
                    <td className="py-4 px-6 text-text-muted-v4">90 days on free tier, strict paywalls</td>
                  </tr>
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Annual Cost for 50 Users</td>
                    <td className="py-4 px-6 text-signal font-bold">₹59,400 /year</td>
                    <td className="py-4 px-6 text-text-muted-v4">₹3,75,000+ /year (6.3x more expensive)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Integrations Grid */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">Integrate With Your DevOps Toolchain</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">
                Plug your alerts, CI/CD pipelines, and incident response directly into your team channels.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {integrations.map((tool, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-hairline bg-ink-surface text-center font-medium hover:border-signal/50 transition-colors shadow-sm"
              >
                <div className="text-sm text-text-primary-v4 font-semibold">{tool}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing (3 tiers) */}
      <section className="v4-section bg-ink-surface/30 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Honest Team Pricing</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                No foreign transaction charges. Pay in INR with GST tax invoices.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Team Tier */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">TEAM PLAN</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹99 <span className="text-sm font-normal text-text-muted-v4">/user/mo</span>
                </div>
                <div className="text-xs text-text-muted-v4 mb-6">Minimum 5 users (₹495/mo)</div>
                <p className="text-text-secondary-v4 text-sm mb-6">Ideal for engineering teams and small companies.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited channels &amp; message history
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> WebRTC audio &amp; video calls + screen share
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> iOS, Android, macOS &amp; Windows apps
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10GB cloud file storage per user
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Standard email ticket support
                  </li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=chat-team" className="v4-btn-secondary rounded-btn w-full text-center block py-3">
                Deploy Team Chat
              </Link>
            </div>

            {/* Business Tier (Highlighted) */}
            <div className="v4-panel rounded-2xl p-8 border-2 border-signal relative flex flex-col justify-between bg-ink-surface">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Enterprise Ready
              </div>
              <div>
                <div className="text-signal text-sm font-semibold mb-2">BUSINESS</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹149 <span className="text-sm font-normal text-text-muted-v4">/user/mo</span>
                </div>
                <div className="text-xs text-text-muted-v4 mb-6">Unlimited users</div>
                <p className="text-text-secondary-v4 text-sm mb-6">Full identity integration, auditing, and high availability.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> LDAP / Active Directory / SAML 2.0 SSO
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Advanced compliance exports &amp; audit logs
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom branding &amp; custom domain SSL
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 50GB storage per user + zero file limits
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 24/7 priority support &amp; 99.99% SLA
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=chat-business"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">ENTERPRISE DEDICATED</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  Custom
                </div>
                <div className="text-xs text-text-muted-v4 mb-6">Volume discounts for 200+ seats</div>
                <p className="text-text-secondary-v4 text-sm mb-6">Air-gapped VPC deployments and regulatory compliance escrow.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated bare-metal or private VPC cluster
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom cryptographic key management (BYOK)
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Disaster recovery failover across data centers
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated Technical Account Manager (TAM)
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.999% uptime SLA guarantee
                  </li>
                </ul>
              </div>
              <Link
                href="/portal"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Contact Enterprise
              </Link>
            </div>
          </div>

          {/* 6. CTA Card */}
          <div className="bg-ink-surface border border-hairline rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-2">
                Reclaim your team communications
              </h3>
              <p className="text-text-secondary-v4 max-w-xl">
                Migrate your channels and user history from Slack in under 20 minutes with our automated importer.
              </p>
            </div>
            <Link
              href="/portal"
              className="v4-btn-primary px-8 py-3.5 rounded-btn flex items-center gap-2 whitespace-nowrap"
            >
              Open VaultChat Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
