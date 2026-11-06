'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Search, Shield, RefreshCw, Globe, Lock, Layers, ArrowRight, Zap, Check } from 'lucide-react';

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
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.in ₹299/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.io ₹3,499/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.co.in ₹199/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.org ₹999/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.net ₹999/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.dev ₹1,299/yr</span>
                <span className="bg-ink-surface-2 px-3 py-1 rounded-full border border-hairline">.ai ₹7,499/yr</span>
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

      {/* TLD Directory */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4">Find Your Niche</h2>
              <p className="text-text-secondary-v4 mt-4">Over 400 top-level domains available for registration.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="v4-panel p-6 border border-hairline rounded-2xl">
              <h4 className="text-text-primary-v4 font-bold mb-4 border-b border-hairline pb-2">Business</h4>
              <ul className="space-y-3 text-text-secondary-v4">
                <li className="flex justify-between"><span>.com</span> <span>₹899</span></li>
                <li className="flex justify-between"><span>.biz</span> <span>₹1,299</span></li>
                <li className="flex justify-between"><span>.co</span> <span>₹1,999</span></li>
                <li className="flex justify-between"><span>.store</span> <span>₹399</span></li>
                <li className="flex justify-between"><span>.shop</span> <span>₹299</span></li>
              </ul>
            </div>

            <div className="v4-panel p-6 border border-hairline rounded-2xl">
              <h4 className="text-text-primary-v4 font-bold mb-4 border-b border-hairline pb-2">India</h4>
              <ul className="space-y-3 text-text-secondary-v4">
                <li className="flex justify-between"><span>.in</span> <span>₹299</span></li>
                <li className="flex justify-between"><span>.co.in</span> <span>₹199</span></li>
                <li className="flex justify-between"><span>.net.in</span> <span>₹299</span></li>
                <li className="flex justify-between"><span>.org.in</span> <span>₹299</span></li>
                <li className="flex justify-between"><span>.ind.in</span> <span>₹299</span></li>
              </ul>
            </div>

            <div className="v4-panel p-6 border border-hairline rounded-2xl">
              <h4 className="text-text-primary-v4 font-bold mb-4 border-b border-hairline pb-2">Tech</h4>
              <ul className="space-y-3 text-text-secondary-v4">
                <li className="flex justify-between"><span>.io</span> <span>₹3,499</span></li>
                <li className="flex justify-between"><span>.dev</span> <span>₹1,299</span></li>
                <li className="flex justify-between"><span>.app</span> <span>₹1,299</span></li>
                <li className="flex justify-between"><span>.cloud</span> <span>₹1,499</span></li>
                <li className="flex justify-between"><span>.tech</span> <span>₹399</span></li>
              </ul>
            </div>

            <div className="v4-panel p-6 border border-hairline rounded-2xl">
              <h4 className="text-text-primary-v4 font-bold mb-4 border-b border-hairline pb-2">AI / ML</h4>
              <ul className="space-y-3 text-text-secondary-v4">
                <li className="flex justify-between"><span>.ai</span> <span>₹7,499</span></li>
                <li className="flex justify-between"><span>.ml</span> <span>₹2,999</span></li>
                <li className="flex justify-between"><span>.bot</span> <span>₹2,499</span></li>
                <li className="flex justify-between"><span>.net</span> <span>₹999</span></li>
                <li className="flex justify-between"><span>.network</span> <span>₹1,299</span></li>
              </ul>
            </div>

            <div className="v4-panel p-6 border border-hairline rounded-2xl">
              <h4 className="text-text-primary-v4 font-bold mb-4 border-b border-hairline pb-2">Startups</h4>
              <ul className="space-y-3 text-text-secondary-v4">
                <li className="flex justify-between"><span>.vc</span> <span>₹2,999</span></li>
                <li className="flex justify-between"><span>.startup</span> <span>₹1,499</span></li>
                <li className="flex justify-between"><span>.agency</span> <span>₹1,499</span></li>
                <li className="flex justify-between"><span>.studio</span> <span>₹1,999</span></li>
                <li className="flex justify-between"><span>.design</span> <span>₹2,499</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 mb-6">Ready to secure your identity?</h2>
            <p className="text-text-secondary-v4 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses that trust VaultHost to manage and protect their digital footprint.
            </p>
            <div className="flex justify-center">
              <Link href="/portal/signup" className="v4-btn-primary inline-flex items-center px-8 py-4 text-lg">
                Register your domain today <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
