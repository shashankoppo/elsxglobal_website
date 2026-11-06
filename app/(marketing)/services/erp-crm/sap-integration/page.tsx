'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Network, Database, Cable, ArrowRight, CheckCircle2, Box, ArrowRightLeft } from 'lucide-react';

export default function SAPIntegrationPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="SAP & ERP Integration"
        title={<>Connect SAP to Your <span className="text-signal">Entire Ecosystem</span></>}
        description="Unlock the full value of your SAP investment. We build robust, scalable integrations connecting SAP S/4HANA and legacy systems to modern SaaS applications, custom frontends, and data lakes."
      />

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Integration Types</h2>
              <p className="text-text-secondary-v4 text-lg">We handle complex data flows across the entire SAP landscape.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'SAP S/4HANA', desc: 'Real-time integrations utilizing OData and BAPI to modern applications.', icon: Database },
              { title: 'SAP BTP', desc: 'Extending SAP functionality using Business Technology Platform services.', icon: Network },
              { title: 'SAP EWM', desc: 'Connecting Extended Warehouse Management to third-party logistics and IoT.', icon: Box },
              { title: 'SAP IBP', desc: 'Integrated Business Planning synchronization with external demand forecasting tools.', icon: ArrowRightLeft }
            ].map((type, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <type.icon className="w-8 h-8 text-signal mb-4" />
                    <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{type.title}</h3>
                    <p className="text-text-secondary-v4">{type.desc}</p>
                  </div>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Middleware & Architecture</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">We avoid messy point-to-point connections, opting instead for scalable, API-led connectivity.</p>
              
              <div className="space-y-6">
                {[
                  { name: 'MuleSoft Anypoint', desc: 'API-led connectivity for enterprise-grade integration.' },
                  { name: 'Azure Integration Services', desc: 'Logic Apps and Event Grid for Microsoft-centric ecosystems.' },
                  { name: 'Custom API Gateways', desc: 'High-performance Node.js or Go microservices for specific, low-latency requirements.' }
                ].map((middleware, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <Cable className="w-6 h-6 text-signal" />
                    </div>
                    <div>
                      <h4 className="text-text-primary-v4 font-semibold text-lg">{middleware.name}</h4>
                      <p className="text-text-secondary-v4">{middleware.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 md:p-12 border-l-4 border-l-signal">
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-6">Typical Integration Timeline</h3>
                
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-signal/20">
                  {[
                    { title: 'Week 1-2: Architecture Design', desc: 'Mapping data models and defining API contracts.' },
                    { title: 'Week 3-6: Development', desc: 'Building connectors and data transformation logic.' },
                    { title: 'Week 7-8: UAT & Load Testing', desc: 'Validating data integrity and system performance.' },
                    { title: 'Week 9: Go-Live', desc: 'Phased rollout with fallback mechanisms.' }
                  ].map((phase, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-signal border-4 border-ink" />
                      <h4 className="font-bold text-text-primary-v4">{phase.title}</h4>
                      <p className="text-sm text-text-secondary-v4">{phase.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Unsilio your enterprise data</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Discuss Your Integration Needs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
