'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Cloud, Users, BarChart, Code, Database, ArrowRight, Award } from 'lucide-react';

export default function SalesforcePage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Salesforce CRM"
        title={<>Salesforce That Actually <span className="text-signal">Fits Your Business</span></>}
        description="Stop fighting your CRM. We customize, integrate, and extend Salesforce to match your unique sales processes, improving adoption and driving revenue."
      />

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Salesforce Services</h2>
              <p className="text-text-secondary-v4 text-lg">From initial implementation to complex custom Apex development, we cover the entire Salesforce ecosystem.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Sales Cloud', desc: 'Optimize lead routing, opportunity management, and forecasting.', icon: Cloud },
              { title: 'Service Cloud', desc: 'Omnichannel support, knowledge bases, and field service management.', icon: Users },
              { title: 'Marketing Cloud', desc: 'Automated journeys, personalization, and cross-channel campaigns.', icon: BarChart },
              { title: 'Custom Development', desc: 'Apex triggers, Lightning Web Components (LWC), and Visualforce.', icon: Code },
              { title: 'Data Migration', desc: 'Secure, accurate data extraction, transformation, and loading (ETL).', icon: Database },
              { title: 'AppExchange Apps', desc: 'Building and publishing commercial applications for the AppExchange.', icon: Cloud }
            ].map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full">
                  <service.icon className="w-8 h-8 text-signal mb-4" />
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{service.title}</h3>
                  <p className="text-text-secondary-v4">{service.desc}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto v4-panel p-8 md:p-12 text-center border-t-4 border-t-signal">
            <ScrollReveal>
              <Award className="w-16 h-16 text-signal mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Certified Excellence</h2>
              <p className="text-text-secondary-v4 text-lg mb-10">Our team consists of certified Salesforce professionals who understand both the technical platform and underlying business operations.</p>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  'Platform Developer I & II',
                  'Sales Cloud Consultant',
                  'Service Cloud Consultant',
                  'Integration Architecture Designer',
                  'Administrator'
                ].map((cert) => (
                  <span key={cert} className="px-4 py-2 bg-ink rounded-full border border-hairline font-semibold text-text-primary-v4 shadow-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface border-t border-hairline text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Maximize your Salesforce ROI</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Book a Salesforce Audit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
