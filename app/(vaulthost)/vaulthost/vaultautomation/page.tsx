'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import {
  Workflow,
  Zap,
  Code2,
  Cpu,
  Check,
  ArrowRight,
  Send,
  MessageSquare,
  FileSpreadsheet,
  Database,
  Mail,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function VaultAutomationPage() {
  const integrations = [
    'Gmail', 'Slack', 'WhatsApp Business', 'Razorpay', 'Supabase', 'MySQL',
    'PostgreSQL', 'HTTP Requests', 'Telegram', 'Google Sheets', 'Notion',
    'Jira', 'GitHub', 'Stripe', 'Salesforce'
  ];

  return (
    <div className="v4-page bg-ink min-h-screen text-text-primary-v4">
      <PageHeroV4
        eyebrow="VaultAutomation"
        title={
          <>
            Automate Everything. <span className="text-signal">No Code Required.</span>
          </>
        }
        description="Managed n8n — connect 400+ apps, build workflows visually, and automate your business processes. Zapier-like power, self-hosted for compliance."
      />

      {/* 1. Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-signal mb-1">400+</div>
              <div className="text-sm text-text-muted-v4">Native Integrations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Visual Canvas</div>
              <div className="text-sm text-text-muted-v4">Drag-and-Drop Builder</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Webhooks</div>
              <div className="text-sm text-text-muted-v4">Sub-5ms Execution Triggers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Python &amp; JS</div>
              <div className="text-sm text-text-muted-v4">Custom Inline Code Nodes</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. App Integrations Grid */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">Connect the Tools You Already Use</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">
                Orchestrate seamless data pipelines across modern SaaS, databases, APIs, and Indian payment gateways.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {integrations.map((app, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-hairline bg-ink-surface flex items-center justify-center text-center font-medium hover:border-signal/50 transition-colors shadow-sm"
              >
                <span className="text-sm text-text-primary-v4">{app}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Use Cases (6 Cards) */}
      <section className="v4-section bg-ink-surface/40 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">High-Impact Business Workflows</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">
                Pre-built templates to automate sales, operations, support, and engineering workflows in minutes.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Workflow className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Lead Capture → CRM Sync</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Capture inbound leads from website forms or Meta ads, validate emails, and sync contacts instantly into your CRM.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <MessageSquare className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Invoice → WhatsApp Notify</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Trigger WhatsApp Business API alerts with PDF invoice download links the instant a Razorpay payment succeeds.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Mail className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Form → Database + Email</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Save customer responses directly into PostgreSQL/Supabase and dispatch rich branded confirmation emails.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <CreditCard className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">E-comm Order → Fulfillment</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Route Shopify/WooCommerce orders to local logistics APIs, generate shipping labels, and alert warehouse teams.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Send className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Social Media Scheduler</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Auto-publish weekly marketing updates from Google Sheets or Notion across LinkedIn, Twitter/X, and Telegram.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <ShieldCheck className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Support Ticket Routing</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Classify incoming customer tickets using AI models, assign priority levels, and notify on-call agents in Slack.
                </p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. Why not Zapier / Make? Price Comparison */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">Why Pay 4x More for Zapier or Make?</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                No task quotas that cut off your business in the middle of a sale. Full sovereignty with self-hosted n8n.
              </p>
            </div>
          </ScrollReveal>

          <div className="border border-hairline rounded-2xl overflow-hidden bg-ink shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-ink-surface-2 text-text-secondary-v4 border-b border-hairline">
                  <tr>
                    <th className="py-4 px-6 font-medium">Platform</th>
                    <th className="py-4 px-6 font-medium">Monthly Price</th>
                    <th className="py-4 px-6 font-medium">Execution Allowance</th>
                    <th className="py-4 px-6 font-medium">Data Residency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-bold text-signal">VaultAutomation (Managed n8n)</td>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">₹999 /mo</td>
                    <td className="py-4 px-6 text-signal font-medium">100,000 Executions / mo</td>
                    <td className="py-4 px-6 text-text-primary-v4">100% India (DPDP Compliant)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Zapier Professional</td>
                    <td className="py-4 px-6 text-text-muted-v4">$49 /mo (~₹4,000 /mo)</td>
                    <td className="py-4 px-6 text-text-muted-v4">Only 750 tasks / mo</td>
                    <td className="py-4 px-6 text-text-muted-v4">US Multi-tenant Cloud</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Make (Integromat) Pro</td>
                    <td className="py-4 px-6 text-text-muted-v4">$16 /mo (~₹1,320 /mo)</td>
                    <td className="py-4 px-6 text-text-muted-v4">Only 10,000 ops / mo</td>
                    <td className="py-4 px-6 text-text-muted-v4">EU / US Servers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing (3 tiers) */}
      <section className="v4-section bg-ink-surface/30 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Transparent Automation Pricing</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                Scale your automations without being penalized for running high-frequency webhook listeners.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Free */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">FREE STARTER</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹0 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">Test triggers and build simple webhook orchestrations.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Up to 5 active workflows
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1,000 workflow executions / mo
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 400+ native n8n community nodes
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Webhook triggers &amp; test debugger
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Community support
                  </li>
                </ul>
              </div>
              <Link href="/portal" className="v4-btn-secondary rounded-btn w-full text-center block py-3">
                Start Free Automation
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="v4-panel rounded-2xl p-8 border-2 border-signal relative flex flex-col justify-between bg-ink-surface">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Unbeatable Value
              </div>
              <div>
                <div className="text-signal text-sm font-semibold mb-2">PRO BUSINESS</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">For scaling companies with real-time operational workflows.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited active workflows
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100,000 executions / month
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom Python &amp; JavaScript nodes
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Sub-5ms webhook responsiveness
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 24/7 priority support &amp; 99.9% SLA
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=automation-pro"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Get Started
              </Link>
            </div>

            {/* Business Tier */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">BUSINESS / DEDICATED</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹3,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">Dedicated worker queue and multi-instance concurrency.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited workflows &amp; executions
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated Redis execution queue
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Role-based access control (RBAC)
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated IP &amp; custom domain SSL
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% SLA with engineer consultation
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=automation-business"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* 6. CTA Card */}
          <div className="bg-ink-surface border border-hairline rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-2">
                Launch your automation canvas now
              </h3>
              <p className="text-text-secondary-v4 max-w-xl">
                Ready to replace fragile Zapier zaps with bulletproof, compliance-ready self-hosted workflows?
              </p>
            </div>
            <Link
              href="/portal"
              className="v4-btn-primary px-8 py-3.5 rounded-btn flex items-center gap-2 whitespace-nowrap"
            >
              Open Automation Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
