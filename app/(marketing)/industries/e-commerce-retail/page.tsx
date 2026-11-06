'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { ShoppingCart, ShoppingBag, Package, TrendingUp, Cpu, ArrowRight } from 'lucide-react';

export default function EcommerceRetailPage() {
  return (
    <main className="v4-page">
      <PageHeroV4
        eyebrow="E-commerce & Retail"
        title={<span>Commerce Infrastructure for the <span className="text-signal">Next Decade</span></span>}
        description="Scalable storefronts, intelligent inventory systems, and omnichannel retail solutions designed for extreme growth and peak traffic."
      />

      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-text-primary-v4 mb-4">Platforms We Excel In</h2>
              <p className="text-text-secondary-v4 max-w-2xl">From enterprise custom builds to headless implementations of popular commerce engines.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: ShoppingBag, title: "Headless Shopify", desc: "Ultra-fast frontend experiences powered by Shopify's robust backend." },
                { icon: ShoppingCart, title: "WooCommerce", desc: "Customized, highly-optimized WordPress commerce deployments." },
                { icon: Cpu, title: "Custom Commerce", desc: "Bespoke microservices architectures for complex B2B and B2C needs." }
              ].map((item, i) => (
                <PanelCard key={i} className="p-6 flex flex-col items-center text-center gap-4 border border-hairline">
                  <div className="p-4 rounded-full bg-ink-surface-2 text-signal">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium text-text-primary-v4">{item.title}</h3>
                  <p className="text-text-secondary-v4">{item.desc}</p>
                </PanelCard>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Key Features</h2>
            <div className="space-y-6">
              {[
                { title: "Omnichannel Experiences", desc: "Unified commerce across web, mobile, social, and physical stores." },
                { title: "Inventory Management", desc: "Real-time sync across multiple warehouses and fulfillment centers." },
                { title: "Order Management Systems (OMS)", desc: "Automated routing, tracking, and returns processing." },
                { title: "AI Personalization", desc: "Dynamic product recommendations and personalized user journeys." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 shrink-0 text-signal">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-text-primary-v4 mb-1">{item.title}</h3>
                    <p className="text-text-secondary-v4">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="v4-panel p-8 border border-signal/20 bg-signal/5">
              <h3 className="text-5xl font-bold text-signal mb-4">340%</h3>
              <p className="text-xl text-text-primary-v4 font-medium mb-2">Avg. Conversion Improvement</p>
              <p className="text-text-secondary-v4">Achieved by redesigning checkout flows and optimizing page load speeds to under 1 second for enterprise clients.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section-sm text-center bg-ink-surface-2 border-t border-hairline">
        <ScrollReveal>
          <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Scale Your Retail Business</h2>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center gap-2">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
