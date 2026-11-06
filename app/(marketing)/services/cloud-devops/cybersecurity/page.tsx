'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { ShieldAlert, FileCode2, CloudCog, ShieldCheck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CybersecurityPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Cybersecurity & Pen Testing"
        title={<>Secure by Design. <span className="text-signal">Tested to the Limit.</span></>}
        description="Comprehensive security services to protect your infrastructure, applications, and data. From vulnerability assessments to 24/7 SOC, we safeguard your digital assets against evolving threats."
      />

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Our Security Services</h2>
              <p className="text-text-secondary-v4 text-lg">Proactive and reactive security measures designed for modern cloud and application architectures.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'VAPT (Pen Testing)', desc: 'Rigorous manual and automated penetration testing for web, mobile, and APIs to find flaws before attackers do.', icon: ShieldAlert },
              { title: 'Secure Code Review', desc: 'Deep dive into your source code to identify vulnerabilities, logic flaws, and insecure dependencies.', icon: FileCode2 },
              { title: 'Cloud Security Posture', desc: 'Auditing AWS/GCP/Azure environments for misconfigurations, excessive permissions, and network exposure.', icon: CloudCog },
              { title: 'Compliance Audits', desc: 'Gap analysis and remediation for major regulatory frameworks.', icon: ShieldCheck },
              { title: 'SOC & Incident Response', desc: '24/7 monitoring, threat hunting, and rapid response to security breaches.', icon: Lock }
            ].map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full flex flex-col">
                  <service.icon className="w-10 h-10 text-signal mb-6" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Compliance Standards</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">We help you achieve and maintain compliance with critical industry standards, turning security into a business enabler.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'ISO 27001', desc: 'Information Security Management' },
                  { name: 'SOC 2 Type I/II', desc: 'Trust Services Criteria' },
                  { name: 'PCI-DSS', desc: 'Payment Card Industry' },
                  { name: 'GDPR / HIPAA', desc: 'Data Privacy & Healthcare' }
                ].map((standard, i) => (
                  <div key={i} className="v4-panel p-6 border border-hairline hover:border-signal/50 transition-colors">
                    <h4 className="font-bold text-text-primary-v4 text-lg mb-1">{standard.name}</h4>
                    <p className="text-xs text-text-secondary-v4 uppercase tracking-wider">{standard.desc}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 md:p-12 bg-ink-surface-2 border-l-4 border-l-signal">
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-6">The DevSecOps Advantage</h3>
                <p className="text-text-secondary-v4 mb-6">Security shouldn't be an afterthought. We integrate security tooling directly into your CI/CD pipelines.</p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary-v4 block">SAST (Static Analysis)</strong>
                      <span className="text-sm text-text-secondary-v4">Scanning code on every commit.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary-v4 block">DAST (Dynamic Analysis)</strong>
                      <span className="text-sm text-text-secondary-v4">Testing running applications in staging.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-primary-v4 block">SCA (Software Composition)</strong>
                      <span className="text-sm text-text-secondary-v4">Detecting vulnerabilities in open-source libraries.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Is your infrastructure secure?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="v4-btn-primary">
                Schedule a Security Audit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
