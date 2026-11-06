'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Cloud, Container, GitMerge, ShieldCheck, ArrowRight, Check } from 'lucide-react';

const services = [
  {
    icon: <Cloud className="w-6 h-6 text-signal" />,
    title: 'Cloud Migration',
    description: 'Seamless transition of legacy systems to modern cloud infrastructure with zero downtime strategies.',
  },
  {
    icon: <Container className="w-6 h-6 text-signal" />,
    title: 'Kubernetes & Containers',
    description: 'Design and management of highly resilient, auto-scaling containerized environments.',
  },
  {
    icon: <GitMerge className="w-6 h-6 text-signal" />,
    title: 'CI/CD Pipelines',
    description: 'Automated testing and deployment workflows to accelerate release cycles and reduce errors.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-signal" />,
    title: 'Security & Compliance',
    description: 'DevSecOps implementation ensuring robust infrastructure security and regulatory compliance.',
  }
];

const providers = ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Cloudflare'];

const reasons = [
  { title: '99.99% Uptime SLA', desc: 'Guaranteed reliability for mission-critical enterprise applications.' },
  { title: '24/7 NOC Monitoring', desc: 'Proactive incident response and continuous performance monitoring.' },
  { title: 'ISO 27001 Certified', desc: 'Adhering to the highest standards of information security management.' },
  { title: 'Multi-region Deployments', desc: 'Global distribution for low latency and robust disaster recovery.' },
  { title: 'Cost Optimization', desc: 'Avg 35% savings through resource right-sizing and architecture optimization.' }
];

export default function CloudDevOpsPage() {
  return (
    <main className="v4-page bg-ink text-text-primary-v4 min-h-screen">
      <PageHeroV4 
        eyebrow="Cloud & DevOps"
        title={
          <span className="v4-display">Infrastructure That <span className="text-signal">Never Sleeps</span></span>
        }
        description="Build, deploy, and scale with confidence. Our Cloud & DevOps engineering ensures your applications are resilient, secure, and highly performant globally."
      />

      <section className="v4-section pt-0">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <PanelCard className="h-full p-8 border border-hairline flex items-start gap-5">
                  <div className="bg-ink-surface-2 p-3 rounded-lg shrink-0 border border-hairline">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-text-secondary-v4">{service.description}</p>
                  </div>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface border-y border-hairline text-center">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-medium text-text-secondary-v4 mb-8">Supported Cloud Providers</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {providers.map((provider, i) => (
              <div key={i} className="px-8 py-4 rounded-xl bg-ink border border-hairline text-text-primary-v4 font-bold text-lg hover:border-signal/50 transition-colors">
                {provider}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Why ELSxGlobal for DevOps?</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">We manage the complexity of modern infrastructure so your team can focus on shipping features.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="bg-ink-surface p-6 rounded-2xl border border-hairline h-full flex flex-col">
                  <div className="w-10 h-10 rounded-full bg-signal/10 flex items-center justify-center text-signal mb-4">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
                  <p className="text-text-secondary-v4 text-sm mt-auto">{reason.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Is your infrastructure holding you back?</h2>
          <p className="text-text-secondary-v4 mb-8 text-lg">Get a comprehensive review of your current cloud architecture, security posture, and DevOps maturity.</p>
          <Link href="/contact" className="v4-btn-primary rounded-btn inline-flex items-center px-8 py-4 text-lg">
            Audit my infrastructure <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}

