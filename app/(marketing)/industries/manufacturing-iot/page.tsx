'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Cpu, Wifi, Settings, Search, Layers, ArrowRight } from 'lucide-react';

export default function ManufacturingIoTPage() {
  return (
    <main className="v4-page">
      <PageHeroV4
        eyebrow="Manufacturing & IoT"
        title={<span>Industry 4.0 <span className="text-signal">Starts Here</span></span>}
        description="Transforming factory floors into smart, connected ecosystems. We bridge the gap between operational technology and IT."
      />

      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-text-primary-v4 mb-4">Smart Manufacturing Solutions</h2>
              <p className="text-text-secondary-v4 max-w-2xl">Leveraging data and connectivity to drive efficiency and reduce downtime.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Wifi, title: "IoT Sensor Integration", desc: "Connecting legacy machinery to cloud networks for real-time telemetry." },
                { icon: Settings, title: "Predictive Maintenance", desc: "AI models that forecast equipment failures before they happen." },
                { icon: Cpu, title: "MES Systems", desc: "Manufacturing Execution Systems to track and document production." },
                { icon: Search, title: "Quality Inspection AI", desc: "Computer vision systems for automated defect detection." },
                { icon: Layers, title: "Digital Twin", desc: "Virtual replicas of physical assets for simulation and optimization." }
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
            <div className="v4-panel p-8 border border-signal/20 bg-signal/5">
              <h3 className="text-5xl font-bold text-signal mb-4">35%</h3>
              <p className="text-xl text-text-primary-v4 font-medium mb-2">OEE Improvement</p>
              <p className="text-text-secondary-v4">Overall Equipment Effectiveness increased for an automotive parts manufacturer by implementing our IoT-based predictive maintenance solution.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Drive Efficiency with Data</h2>
            <p className="text-text-secondary-v4 mb-6">We help manufacturers transition from reactive to proactive operations. By capturing and analyzing edge data, we unlock insights that reduce waste, improve quality, and boost bottom-line performance.</p>
            <ul className="space-y-3 text-text-secondary-v4">
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-signal" /> Real-time production dashboards</li>
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-signal" /> Edge computing for low-latency control</li>
              <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-signal" /> Legacy PLC & SCADA integrations</li>
            </ul>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section-sm text-center bg-ink-surface-2 border-t border-hairline">
        <ScrollReveal>
          <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Modernize Your Factory</h2>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center gap-2">
            Talk to an Expert <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
