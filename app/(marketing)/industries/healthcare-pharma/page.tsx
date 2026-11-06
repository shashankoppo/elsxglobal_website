'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Activity, Shield, FileText, Database, Stethoscope, ArrowRight } from 'lucide-react';

export default function HealthcarePharmaPage() {
  return (
    <main className="v4-page">
      <PageHeroV4
        eyebrow="Healthcare & Pharma"
        title={<span>Digital Health That Meets <span className="text-signal">Compliance</span></span>}
        description="Secure, scalable, and compliant software solutions for healthcare providers, pharmaceutical companies, and digital health startups. We build systems that meet HIPAA, ABDM, and HL7 FHIR standards."
      />

      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-text-primary-v4 mb-4">Challenges in Healthcare IT</h2>
              <p className="text-text-secondary-v4 max-w-2xl">Modern healthcare requires robust data management, interoperability, and strict adherence to patient privacy regulations.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Data Security & Privacy", desc: "Protecting sensitive PHI/ePHI against breaches." },
                { icon: Database, title: "System Interoperability", desc: "Connecting legacy systems with modern cloud infrastructure." },
                { icon: Activity, title: "Patient Experience", desc: "Providing seamless digital touchpoints for care delivery." },
                { icon: FileText, title: "Regulatory Compliance", desc: "Navigating complex global and regional health tech laws." },
                { icon: Stethoscope, title: "Clinical Workflows", desc: "Optimizing provider efficiency with smart tools." }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-semibold text-text-primary-v4 mb-4">Our Solutions</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">Comprehensive software engineering for the health ecosystem.</p>
            </div>
            <div className="space-y-6">
              {[
                { title: "EHR/EMR Systems", desc: "Custom Electronic Health Record platforms tailored to your clinical workflows." },
                { title: "Telemedicine Platforms", desc: "Secure video consultations, scheduling, and remote patient monitoring." },
                { title: "Pharmacy Management", desc: "Inventory, e-prescriptions, and retail pharmacy software." },
                { title: "Clinical Analytics", desc: "AI-driven insights for population health and clinical decision support." },
                { title: "Patient Portals", desc: "Engaging apps for patients to access records, book appointments, and pay bills." }
              ].map((item, i) => (
                <div key={i} className="v4-panel p-6 border border-hairline flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-ink">
                  <div>
                    <h3 className="text-xl font-medium text-text-primary-v4 mb-2">{item.title}</h3>
                    <p className="text-text-secondary-v4">{item.desc}</p>
                  </div>
                  <div className="shrink-0 text-signal flex gap-2 items-center font-medium">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Built for Compliance</h2>
            <p className="text-text-secondary-v4 mb-8">We engineer systems with security and regulatory compliance baked in from day one. Our development processes adhere to global standards.</p>
            <div className="flex flex-wrap gap-4">
              {['HIPAA', 'ISO 27001', 'ABDM', 'NABH IT', 'HL7 FHIR'].map(cert => (
                <span key={cert} className="px-4 py-2 rounded-full border border-hairline bg-ink text-text-primary-v4 font-medium text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="v4-panel p-8 border border-signal/20 bg-signal/5">
              <h3 className="text-5xl font-bold text-signal mb-4">40%</h3>
              <p className="text-xl text-text-primary-v4 font-medium mb-2">Reduction in patient wait times</p>
              <p className="text-text-secondary-v4">Achieved by automating intake workflows and optimizing scheduling algorithms for a leading multi-specialty hospital chain.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section-sm text-center">
        <ScrollReveal>
          <h2 className="text-3xl font-semibold text-text-primary-v4 mb-6">Ready to Transform Healthcare?</h2>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center gap-2">
            Start Your Project <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
