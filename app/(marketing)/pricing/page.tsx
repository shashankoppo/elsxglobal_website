'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, Server } from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { SectionLabelV4 } from '@/components/ui/section-label-v4';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/lib/animations';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';

const TIERS = [
  {
    name: 'Starter',
    monthly: 0,
    annual: 0,
    features: { vcpu: '1', ram: '512MB', bandwidth: '100GB', edges: '3', aiOps: false, waf: 'Basic', databases: '1', support: 'Community' },
  },
  {
    name: 'Professional',
    monthly: 3999,
    annual: 3199,
    popular: true,
    features: { vcpu: '4', ram: '8GB', bandwidth: '2TB', edges: '12', aiOps: true, waf: 'Advanced', databases: '5', support: 'Email' },
  },
  {
    name: 'Enterprise',
    monthly: 24999,
    annual: 19999,
    features: { vcpu: '16', ram: '64GB', bandwidth: '20TB', edges: '38', aiOps: true, waf: 'Zero-Trust', databases: '20', support: '24/7 Dedicated' },
  },
  {
    name: 'Infinite',
    monthly: null,
    annual: null,
    features: { vcpu: 'Unlimited', ram: 'Unlimited', bandwidth: 'Custom', edges: 'All', aiOps: true, waf: 'Custom', databases: 'Unlimited', support: 'White-Glove' },
  },
];

const FAQS = [
  { q: 'Is there a free tier?', a: 'Yes. The Starter plan is free forever with 1 vCPU, 512MB RAM, and 100GB bandwidth. No credit card required.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately and are prorated.' },
  { q: 'What does annual billing save?', a: 'Annual billing gives you 20% off compared to monthly. The discount is applied automatically.' },
  { q: 'Is AI-Ops included?', a: 'AI-Ops is included in Professional, Enterprise, and Infinite tiers. It is not available on Starter.' },
  { q: 'What is the difference between Advanced and Zero-Trust WAF?', a: 'Advanced WAF covers OWASP Top 10 and basic DDoS. Zero-Trust WAF adds AI threat detection, bot management, and custom rule engine.' },
  { q: 'Do you offer custom enterprise pricing?', a: 'Yes. The Infinite tier is fully customizable. Contact us for a tailored quote based on your infrastructure needs.' },
  { q: 'What support is included?', a: 'Starter gets community support. Professional gets email support. Enterprise includes 24/7 dedicated support. Infinite includes white-glove service with a dedicated account manager.' },
  { q: 'Can I use my own domain?', a: 'Yes. All tiers support custom domains with automatic SSL/TLS certificate provisioning.' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="VaultHost Pricing"
        eyebrowIcon={Server}
        title={<>Transparent Pricing. No Surprises.</>}
        description="Start free. Scale when you need. Cancel anytime. No hidden fees, no vendor lock-in."
      >
        <div className="flex gap-2 justify-center flex-wrap">
          <div className="inline-flex items-center gap-1 p-1 rounded-panel border border-hairline bg-ink-surface-2 max-w-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-chip text-sm font-medium transition-colors ${!annual ? 'bg-signal/15 text-signal' : 'text-text-muted-v4 hover:text-text-secondary-v4'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-chip text-sm font-medium transition-colors ${annual ? 'bg-signal/15 text-signal' : 'text-text-muted-v4 hover:text-text-secondary-v4'}`}
            >
              Annual <span className="text-[10px] text-good">-20%</span>
            </button>
          </div>
        </div>
      </PageHeroV4>

      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {TIERS.map((tier, i) => {
              const price = annual ? tier.annual : tier.monthly;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex"
                >
                  <PanelCard hover className={`p-6 flex flex-col justify-between h-full w-full relative transition-transform duration-300 ${tier.popular ? 'border-signal/50 shadow-[0_0_20px_rgba(var(--signal-rgb),0.15)] md:scale-105 md:-translate-y-1 z-10' : ''}`}>
                    <div>
                      {tier.popular && (
                        <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-signal text-ink text-[10px] font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <h3 className="text-base font-semibold text-text-primary-v4">{tier.name}</h3>
                      <div className="mt-3">
                        {price === null ? (
                          <p className="v4-readout-primary text-2xl">Custom</p>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="v4-readout-primary text-2xl">₹{price}</span>
                            <span className="v4-readout text-xs text-text-muted-v4">/mo</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 space-y-2.5">
                        {[
                          ['vCPU', tier.features.vcpu],
                          ['RAM', tier.features.ram],
                          ['Bandwidth', tier.features.bandwidth],
                          ['Edge PoPs', tier.features.edges],
                          ['Databases', tier.features.databases],
                          ['Support', tier.features.support],
                        ].map(([label, val]) => (
                          <div key={label} className="flex items-center justify-between text-sm">
                            <span className="text-text-muted-v4">{label}</span>
                            <span className="v4-readout text-xs text-text-primary-v4">{val}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-muted-v4">AI-Ops</span>
                          {tier.features.aiOps ? (
                            <Check className="h-4 w-4 text-good" />
                          ) : (
                            <X className="h-4 w-4 text-text-muted-v4" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-muted-v4">WAF</span>
                          <span className="v4-readout text-xs text-text-primary-v4">{tier.features.waf}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={price === null ? '/contact' : '/vaulthost'}
                      className={`mt-6 block text-center py-3 rounded-btn text-sm font-medium transition-colors ${
                        tier.popular ? 'v4-btn-primary' : 'v4-btn-secondary'
                      }`}
                    >
                      {price === 0 ? 'Start Free' : price === null ? 'Contact Sales' : 'Get Started'}
                    </a>
                  </PanelCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <SectionLabelV4 icon={Server}>Feature Matrix</SectionLabelV4>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold v4-display text-text-primary-v4">
              Compare Plan Capabilities
            </h2>
            <p className="mt-2 text-base text-text-secondary-v4 max-w-2xl mx-auto">
              Everything you need to evaluate which tier matches your enterprise workloads.
            </p>
          </div>

          <div className="overflow-x-auto rounded-panel border border-hairline bg-ink-surface-2 p-1">
            <div className="min-w-[600px]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="py-4 px-4 text-text-muted-v4 font-medium">Feature</th>
                    <th className="py-4 px-4 text-text-primary-v4 font-semibold">Starter</th>
                    <th className="py-4 px-4 text-signal font-semibold">Professional</th>
                    <th className="py-4 px-4 text-text-primary-v4 font-semibold">Enterprise</th>
                    <th className="py-4 px-4 text-text-primary-v4 font-semibold">Infinite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline text-text-secondary-v4">
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">vCPU</td>
                    <td className="py-3 px-4 font-mono text-xs">1 Core</td>
                    <td className="py-3 px-4 font-mono text-xs text-signal font-bold">4 Cores</td>
                    <td className="py-3 px-4 font-mono text-xs">16 Cores</td>
                    <td className="py-3 px-4 font-mono text-xs">Custom / Dedicated</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">RAM</td>
                    <td className="py-3 px-4 font-mono text-xs">512 MB</td>
                    <td className="py-3 px-4 font-mono text-xs text-signal font-bold">8 GB</td>
                    <td className="py-3 px-4 font-mono text-xs">64 GB</td>
                    <td className="py-3 px-4 font-mono text-xs">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">Monthly Bandwidth</td>
                    <td className="py-3 px-4 font-mono text-xs">100 GB</td>
                    <td className="py-3 px-4 font-mono text-xs text-signal font-bold">2 TB</td>
                    <td className="py-3 px-4 font-mono text-xs">20 TB</td>
                    <td className="py-3 px-4 font-mono text-xs">Unmetered</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">Global Edge PoPs</td>
                    <td className="py-3 px-4 font-mono text-xs">3 Locations</td>
                    <td className="py-3 px-4 font-mono text-xs text-signal font-bold">12 Locations</td>
                    <td className="py-3 px-4 font-mono text-xs">38 Locations</td>
                    <td className="py-3 px-4 font-mono text-xs">All (300+)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">AI-Ops Diagnostics</td>
                    <td className="py-3 px-4"><X className="h-4 w-4 text-text-muted-v4" /></td>
                    <td className="py-3 px-4"><Check className="h-4 w-4 text-good" /></td>
                    <td className="py-3 px-4"><Check className="h-4 w-4 text-good" /></td>
                    <td className="py-3 px-4"><Check className="h-4 w-4 text-good" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">Web Application Firewall</td>
                    <td className="py-3 px-4 font-mono text-xs">Basic OWASP</td>
                    <td className="py-3 px-4 font-mono text-xs text-signal font-bold">Advanced + DDoS</td>
                    <td className="py-3 px-4 font-mono text-xs">Zero-Trust AI</td>
                    <td className="py-3 px-4 font-mono text-xs">Custom Rule Engine</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">Databases</td>
                    <td className="py-3 px-4 font-mono text-xs">1 Instance</td>
                    <td className="py-3 px-4 font-mono text-xs text-signal font-bold">5 Instances</td>
                    <td className="py-3 px-4 font-mono text-xs">20 Instances</td>
                    <td className="py-3 px-4 font-mono text-xs">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-text-primary-v4">Support SLA</td>
                    <td className="py-3 px-4 font-mono text-xs">Community</td>
                    <td className="py-3 px-4 font-mono text-xs text-signal font-bold">Priority Email (4h)</td>
                    <td className="py-3 px-4 font-mono text-xs">24/7 Dedicated (15m)</td>
                    <td className="py-3 px-4 font-mono text-xs">White-Glove TAM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...useScrollReveal()} className="text-center mb-10">
            <SectionLabelV4 icon={Server}>FAQ</SectionLabelV4>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold v4-display text-text-primary-v4">Frequently Asked Questions</h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="v4-panel rounded-panel px-5 border-b-0">
                <AccordionTrigger className="text-left text-sm font-medium text-text-primary-v4 hover:text-signal transition-colors py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-text-secondary-v4 leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="v4-section-sm">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-16 text-center">
          <motion.div {...useScrollReveal()}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold v4-display text-text-primary-v4">Still Have Questions?</h2>
            <p className="mt-4 text-base sm:text-lg text-text-secondary-v4">Talk to our team about custom infrastructure needs.</p>
            <a href="/contact" className="mt-8 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-btn v4-btn-primary text-sm w-full sm:w-auto">
              Contact Sales <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
