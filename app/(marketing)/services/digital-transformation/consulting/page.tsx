'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Lightbulb, Map, FileSearch, Presentation, ShieldCheck, ArrowRight, Clock, Target } from 'lucide-react';

export default function ConsultingPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Technology Consulting"
        title={<>Strategy <span className="text-signal">Before Code</span></>}
        description="We align your technology investments with your business goals. Our consulting services provide clarity, mitigate risk, and lay the foundation for successful digital transformation."
      />

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Consulting Services</h2>
              <p className="text-text-secondary-v4 text-lg">Objective, vendor-neutral advice from seasoned CTOs and Enterprise Architects.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Tech Stack Audit', desc: 'Comprehensive review of your existing software, highlighting technical debt, security flaws, and performance bottlenecks.', icon: FileSearch },
              { title: 'Digital Roadmap', desc: 'Strategic multi-year plan prioritizing initiatives based on ROI, dependencies, and business impact.', icon: Map },
              { title: 'Architecture Review', desc: 'Evaluating system design for scalability, high availability, and future-proofing.', icon: ShieldCheck },
              { title: 'Vendor Selection', desc: 'Unbiased RFP management and evaluation of third-party platforms (ERP, CRM, CMS).', icon: Target },
              { title: 'Board Presentations', desc: 'Translating complex technical strategies into clear business cases for executive stakeholders.', icon: Presentation }
            ].map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full border-t-2 border-t-signal/20 hover:border-t-signal transition-colors">
                  <service.icon className="w-10 h-10 text-signal mb-6" />
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{service.title}</h3>
                  <p className="text-text-secondary-v4">{service.desc}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-10 text-center">Engagement Models</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="v4-panel p-8 bg-ink border border-hairline text-center">
                  <Clock className="w-8 h-8 text-signal mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-2">Retainer</h3>
                  <p className="text-sm text-text-secondary-v4 mb-4">Ongoing fractional CTO or advisory support for continuous guidance.</p>
                  <div className="text-xs uppercase tracking-wider text-signal font-semibold">Best for long-term</div>
                </div>
                
                <div className="v4-panel p-8 bg-ink-surface-2 border border-signal relative text-center">
                  <div className="absolute top-0 inset-x-0 h-1 bg-signal" />
                  <Target className="w-8 h-8 text-signal mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-2">Project-Based</h3>
                  <p className="text-sm text-text-secondary-v4 mb-4">Fixed-scope assessments or roadmapping with defined deliverables.</p>
                  <div className="text-xs uppercase tracking-wider text-signal font-semibold">Most Popular</div>
                </div>
                
                <div className="v4-panel p-8 bg-ink border border-hairline text-center">
                  <Lightbulb className="w-8 h-8 text-signal mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-2">Advisory Workshop</h3>
                  <p className="text-sm text-text-secondary-v4 mb-4">Intensive 1-3 day sessions to tackle specific strategic challenges.</p>
                  <div className="text-xs uppercase tracking-wider text-signal font-semibold">Best for kickoff</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Need technical clarity?</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Schedule a Strategy Session
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
