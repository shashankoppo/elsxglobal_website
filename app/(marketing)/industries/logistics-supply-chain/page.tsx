'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Truck, MapPin, Box, Users, Repeat, ArrowRight } from 'lucide-react';

export default function LogisticsSupplyChainPage() {
  return (
    <main className="v4-page">
      <PageHeroV4
        eyebrow="Logistics & Supply Chain"
        title={<span>From Warehouse to Last Mile — <span className="text-signal">Fully Digitized</span></span>}
        description="End-to-end supply chain visibility and optimization solutions. We build software that keeps the world moving."
      />

      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-text-primary-v4 mb-4">Smart Logistics Solutions</h2>
              <p className="text-text-secondary-v4 max-w-2xl">Modernizing logistics operations with data-driven software.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Box, title: "Warehouse Mgmt (WMS)", desc: "Automated inventory tracking, putaway, and picking optimization." },
                { icon: Truck, title: "Transport Mgmt (TMS)", desc: "Freight management, carrier selection, and load optimization." },
                { icon: MapPin, title: "Fleet Tracking", desc: "Real-time IoT-based vehicle telematics and monitoring." },
                { icon: Repeat, title: "Route Optimization", desc: "AI-powered algorithms to minimize fuel and maximize delivery speed." },
                { icon: Users, title: "Vendor Portals", desc: "Collaborative platforms for suppliers, carriers, and 3PL partners." }
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

      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Seamless Integrations</h2>
            <p className="text-text-secondary-v4 mb-8">Supply chains run on interconnected systems. We build robust connectors to ensure data flows freely across your enterprise.</p>
            <div className="flex flex-wrap gap-4">
              {['SAP Integrations', 'Oracle ERP', 'Custom ERP Connectors', 'EDI / API', 'IoT Hardware Sync'].map(cert => (
                <span key={cert} className="px-4 py-2 rounded-full border border-hairline bg-ink-surface text-text-primary-v4 font-medium text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="v4-panel p-8 border border-signal/20 bg-signal/5">
              <h3 className="text-5xl font-bold text-signal mb-4">28%</h3>
              <p className="text-xl text-text-primary-v4 font-medium mb-2">Reduction in Logistics Costs</p>
              <p className="text-text-secondary-v4">Achieved for a major FMCG distributor by implementing our custom route optimization and predictive load planning software.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section-sm text-center bg-ink-surface-2 border-t border-hairline">
        <ScrollReveal>
          <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Optimize Your Supply Chain</h2>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center gap-2">
            Let's Discuss <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
