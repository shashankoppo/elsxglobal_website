'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { CloudOff, Cloud, RefreshCcw, ServerCog, Rocket, ArrowRight, CheckSquare } from 'lucide-react';

export default function CloudMigrationPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Cloud Migration"
        title={<>Legacy to Cloud — <span className="text-signal">Zero Downtime Guaranteed</span></>}
        description="Seamlessly migrate your infrastructure, applications, and data to the cloud. We minimize risk, ensure data integrity, and modernize your architecture for maximum ROI."
      />

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Migration Strategies (The 4 R's)</h2>
              <p className="text-text-secondary-v4 text-lg">We don't believe in a one-size-fits-all approach. We select the right strategy for each application in your portfolio.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Rehost (Lift & Shift)', desc: 'Fastest migration path. Move applications to cloud VMs without code changes. Ideal for rapid data center exits.', icon: Cloud },
              { title: 'Refactor', desc: 'Tweak applications to leverage cloud PaaS capabilities (like managed databases) for better performance and lower management overhead.', icon: RefreshCcw },
              { title: 'Rearchitect', desc: 'Materially alter the application architecture to be cloud-native (e.g., monolith to microservices, serverless). Highest ROI.', icon: ServerCog },
              { title: 'Replace', desc: 'Decommission legacy applications entirely and migrate data to modern SaaS equivalents (e.g., moving to Salesforce).', icon: Rocket }
            ].map((strategy, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full border-t-2 border-t-signal/20 hover:border-t-signal transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <strategy.icon className="w-8 h-8 text-signal" />
                    <h3 className="text-2xl font-bold text-text-primary-v4">{strategy.title}</h3>
                  </div>
                  <p className="text-text-secondary-v4">{strategy.desc}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Our Assessment Process</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">Before moving a single byte, we conduct a rigorous audit to eliminate surprises and guarantee a smooth transition.</p>
              
              <div className="space-y-6">
                {[
                  { step: 'Phase 1: Discovery', desc: 'Automated scanning of your infrastructure to map dependencies and assets.' },
                  { step: 'Phase 2: TCO Analysis', desc: 'Calculating current costs vs projected cloud costs to prove ROI.' },
                  { step: 'Phase 3: Migration Plan', desc: 'Detailed roadmap with wave planning, rollback strategies, and cutover schedules.' },
                  { step: 'Phase 4: Pilot Migration', desc: 'Moving non-critical workloads first to validate the pipeline and security posture.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1"><CheckSquare className="w-6 h-6 text-signal" /></div>
                    <div>
                      <h4 className="text-text-primary-v4 font-semibold text-lg mb-1">{item.step}</h4>
                      <p className="text-text-secondary-v4">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 border-l-4 border-l-signal">
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-6">Timeline & Pricing Tiers</h3>
                
                <div className="space-y-6">
                  <div className="bg-ink p-4 rounded-xl border border-hairline">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-text-primary-v4">Small Scale (Lift & Shift)</h4>
                      <span className="text-signal text-sm font-mono">2-4 Weeks</span>
                    </div>
                    <p className="text-sm text-text-secondary-v4">Basic web apps, 1-5 servers, straightforward database migration.</p>
                  </div>
                  
                  <div className="bg-ink p-4 rounded-xl border border-hairline">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-text-primary-v4">Mid-Market (Refactor)</h4>
                      <span className="text-signal text-sm font-mono">1-3 Months</span>
                    </div>
                    <p className="text-sm text-text-secondary-v4">Multiple environments, transitioning to managed DBs and load balancers.</p>
                  </div>

                  <div className="bg-ink p-4 rounded-xl border border-hairline">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-text-primary-v4">Enterprise (Rearchitect)</h4>
                      <span className="text-signal text-sm font-mono">3-6+ Months</span>
                    </div>
                    <p className="text-sm text-text-secondary-v4">Monolith decomposition, containerization, complex compliance requirements.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Ready to exit the data center?</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Request a Free Cloud Readiness Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
