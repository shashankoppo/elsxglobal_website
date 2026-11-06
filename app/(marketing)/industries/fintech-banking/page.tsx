'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { ArrowRight, CreditCard, ShieldCheck, Banknote, Search, Network } from 'lucide-react';

export default function FintechBankingPage() {
  return (
    <main className="v4-page">
      <PageHeroV4
        eyebrow="Fintech & Banking"
        title={<span>Financial Technology Built for <span className="text-signal">Trust</span></span>}
        description="Next-generation financial software solutions. We build secure, compliant, and scalable platforms for modern banking, payments, and lending."
      />

      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-text-primary-v4 mb-4">Our Solutions</h2>
              <p className="text-text-secondary-v4 max-w-2xl">Powering the future of finance with robust engineering and intuitive user experiences.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Banknote, title: "Core Banking", desc: "Modernize legacy systems with cloud-native core banking infrastructure." },
                { icon: CreditCard, title: "Payment Gateways", desc: "Secure, high-volume payment processing and routing solutions." },
                { icon: Network, title: "Lending Platforms", desc: "End-to-end loan origination and management systems." },
                { icon: Search, title: "Fraud Detection", desc: "AI-powered anomaly detection and risk management." },
                { icon: ShieldCheck, title: "KYC/AML Automation", desc: "Streamlined customer onboarding and compliance monitoring." },
                { icon: Network, title: "Open Banking APIs", desc: "Developer-friendly API portals for financial data exchange." }
              ].map((item, i) => (
                <PanelCard key={i} className="p-6 flex flex-col items-start gap-4 border border-hairline">
                  <div className="p-3 rounded-full bg-ink-surface-2 text-signal">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-text-primary-v4">{item.title}</h3>
                  <p className="text-text-secondary-v4">{item.desc}</p>
                </PanelCard>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Uncompromising Compliance</h2>
            <p className="text-text-secondary-v4 mb-8">Security and compliance are non-negotiable in finance. We build systems that meet the most stringent global standards.</p>
            <div className="flex flex-wrap gap-4">
              {['PCI-DSS', 'RBI Guidelines', 'SOC 2', 'GDPR'].map(cert => (
                <span key={cert} className="px-4 py-2 rounded-full border border-hairline bg-ink text-text-primary-v4 font-medium text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="v4-panel p-8 border border-signal/20 bg-signal/5">
              <h3 className="text-5xl font-bold text-signal mb-4">₹2,400Cr+</h3>
              <p className="text-xl text-text-primary-v4 font-medium mb-2">Transactions Processed</p>
              <p className="text-text-secondary-v4">Handled securely through payment platforms built and scaled by our engineering teams.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section-sm text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Ready to Build Your Fintech Product?</h2>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center gap-2">
            Talk to an Expert <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
