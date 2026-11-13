'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Search, Shield, RefreshCw, Globe, Lock, Layers, ArrowRight, Zap, Check } from 'lucide-react';
import { DOMAIN_PRICING } from '@/lib/data/cloud-pricing';

export default function VaultDomainsPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="VaultDomains"
        title={
          <>
            Register, Manage, and Protect <span className="text-signal">Every Domain.</span>
          </>
        }
        description="Search and register .com, .in, .io, .co.in, .org, and 400+ TLDs. Every domain includes free WHOIS privacy, DNS management, SSL, and auto-renewal. Integrated seamlessly with VaultDNS."
      />

      {/* Domain Search UI */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-ink-surface border border-hairline rounded-3xl p-8 md:p-12 text-center">
              <h2 className="v4-display text-text-primary-v4 mb-8">Find Your Perfect Domain</h2>
              <div className="max-w-3xl mx-auto relative flex items-center mb-8">
                <Search className="absolute left-4 w-6 h-6 text-text-muted-v4" />
                <input 
                  type="text" 
                  placeholder="Search your domain name..." 
                  className="w-full bg-ink-surface-2 border border-hairline rounded-btn py-4 pl-14 pr-32 text-text-primary-v4 focus:outline-none focus:border-signal text-lg"
                />
                <button className="v4-btn-primary absolute right-2 py-2 px-6">
                  Search
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary-v4 text-sm font-medium">
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.com ₹899/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.in ₹699/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.io ₹3,499/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.org ₹999/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.net ₹1,099/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.dev ₹1,299/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.ai ₹5,999/yr</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4">Everything You Need Included</h2>
              <p className="text-text-secondary-v4 mt-4 max-w-2xl mx-auto text-lg">
                We believe security and performance should be standard. Every domain registered with VaultHost comes with premium features at no extra cost.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col">
                <Shield className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Free WHOIS Privacy</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Keep your personal information safe from spammers and scammers. WHOIS privacy is included on all supported TLDs by default.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col">
                <RefreshCw className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Auto-Renewal</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Never lose a domain again. Set up auto-renewal with a fallback payment method to ensure uninterrupted ownership of your brand.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col">
                <Globe className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">One-Click DNS</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Manage your domains with VaultDNS, our lightning-fast globally distributed anycast network. Changes propagate in milliseconds.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col">
                <Lock className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Free SSL</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Every domain automatically receives a free Let's Encrypt SSL certificate, auto-provisioned and auto-renewed so you're always secure.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col">
                <Zap className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Domain Lock</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Prevent unauthorized domain transfers or malicious hijacking with our robust registry-level domain locking mechanism.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <PanelCard className="v4-panel h-full p-8 flex flex-col">
                <Layers className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-xl font-bold text-text-primary-v4 mb-3">Bulk Management</h3>
                <p className="text-text-secondary-v4 flex-grow">
                  Managing thousands of domains? No problem. Our dashboard makes bulk renewals, DNS updates, and setting changes effortless.
                </p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Transfer Domain Section */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div 
              className="rounded-3xl border border-hairline p-10 md:p-16 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <h2 className="v4-display text-white mb-6">Transfer Your Domain to VaultHost</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg mb-10">
                Get 1 year free on transfer, instant DNS propagation, and free WHOIS privacy. Consolidate your digital assets under one powerful platform.
              </p>
              
              <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-8">
                <input 
                  type="text" 
                  placeholder="example.com" 
                  className="flex-grow bg-ink-surface border border-hairline rounded-btn py-3 px-4 text-text-primary-v4 focus:outline-none focus:border-signal"
                />
                <button className="v4-btn-primary whitespace-nowrap">
                  Start Transfer
                </button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-text-muted-v4">
                <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-signal" /> No downtime transfer</span>
                <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-signal" /> Keeps remaining time</span>
                <span className="flex items-center"><Check className="w-4 h-4 mr-2 text-signal" /> Transparent pricing</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TLD Directory & Full Pricing Table */}
      <section className="v4-section bg-ink-surface border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4">Domain Pricing Directory</h2>
              <p className="text-text-secondary-v4 mt-4">Transparent registration, renewal, and transfer rates. Zero renewal price gouging.</p>
            </div>
          </ScrollReveal>

          <div className="overflow-x-auto rounded-2xl border border-hairline mb-16 bg-ink">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-surface-2 border-b border-hairline">
                  <th className="py-3 px-4 text-left font-medium text-text-muted-v4">Extension</th>
                  <th className="py-3 px-4 text-right font-medium text-text-muted-v4">Registration</th>
                  <th className="py-3 px-4 text-right font-medium text-text-muted-v4">Renewal</th>
                  <th className="py-3 px-4 text-right font-medium text-text-muted-v4">Transfer</th>
                  <th className="py-3 px-4 text-center font-medium text-text-muted-v4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {DOMAIN_PRICING.map((item) => (
                  <tr key={item.tld} className={`hover:bg-ink-surface/50 transition-colors ${item.popular ? 'bg-signal/5' : ''}`}>
                    <td className="py-3.5 px-4 font-bold text-text-primary-v4 flex items-center gap-2">
                      {item.tld}
                      {item.popular && (
                        <span className="text-[10px] bg-signal text-ink font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-signal">₹{item.registration.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-text-secondary-v4">₹{item.renewal.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-text-secondary-v4">₹{item.transfer.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Link 
                        href={`/vaulthost/checkout?plan=domain-${item.tld.replace('.', '')}&tld=${item.tld}`}
                        className="v4-btn-primary text-xs px-3.5 py-1.5 rounded-btn inline-block font-medium hover:opacity-90"
                      >
                        Register →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Competitor comparison */}
          <div className="mb-16">
            <h3 className="text-xl font-medium text-text-primary-v4 text-center mb-6">How VaultHost Compares on Domains</h3>
            <div className="border border-hairline rounded-2xl overflow-hidden bg-ink">
              <table className="w-full text-sm">
                <thead className="bg-ink-surface-2 text-text-secondary-v4 border-b border-hairline">
                  <tr>
                    <th className="py-3.5 px-4 text-left font-medium">Registrar</th>
                    <th className="py-3.5 px-4 text-left font-medium">.COM Pricing</th>
                    <th className="py-3.5 px-4 text-left font-medium">WHOIS Privacy</th>
                    <th className="py-3.5 px-4 text-left font-medium">Renewal Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="bg-signal/5">
                    <td className="py-3.5 px-4 font-semibold text-signal">VaultHost Domains</td>
                    <td className="py-3.5 px-4 font-medium text-text-primary-v4">₹899 1st yr / ₹999 renewal</td>
                    <td className="py-3.5 px-4 text-signal font-medium">FREE forever included</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">Predictable wholesale renewal rate, zero surprise hikes</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 text-text-primary-v4">GoDaddy</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">₹899 1st yr / ₹2,199 renewal</td>
                    <td className="py-3.5 px-4 text-text-muted-v4">₹499/yr extra per domain</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">Aggressive 150%+ price hike on year 2, mandatory add-on fees</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 text-text-primary-v4">Namecheap</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">₹950 1st yr / ₹1,350 renewal</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">Free basic privacy</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">Slow standard DNS propagation, extra fees for premium Anycast DNS</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 text-text-primary-v4">Google Domains / Squarespace</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">₹1,650/yr flat</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">Included</td>
                    <td className="py-3.5 px-4 text-text-secondary-v4">High flat baseline pricing across all standard domains</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
