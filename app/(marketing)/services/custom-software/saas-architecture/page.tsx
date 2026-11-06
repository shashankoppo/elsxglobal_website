'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Database, Server, Workflow, Lock, CreditCard, BarChart, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function SaaSArchitecturePage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="SaaS Architecture"
        title={<>Multi-Tenant Platforms <span className="text-signal">Built to Scale</span></>}
        description="We architect and build scalable, secure SaaS platforms from the ground up. Our engineering teams specialize in complex multi-tenant environments, billing systems, and cloud-native infrastructure."
      />

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Architecture Patterns</h2>
              <p className="text-text-secondary-v4 text-lg">We employ modern architectural patterns designed for scale, high availability, and maintainability.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Multi-Tenant Isolation', desc: 'Secure data segregation at the database, schema, or row level based on your compliance needs.', icon: Lock },
              { title: 'Microservices', desc: 'Decoupled services that can be scaled and deployed independently for maximum agility.', icon: Workflow },
              { title: 'Event-Driven', desc: 'Asynchronous event streaming using Kafka or RabbitMQ for highly scalable, resilient systems.', icon: Server }
            ].map((pattern, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="v4-panel p-8 h-full border-t-2 border-t-signal/20 hover:border-t-signal transition-colors">
                  <pattern.icon className="w-10 h-10 text-signal mb-6" />
                  <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">{pattern.title}</h3>
                  <p className="text-text-secondary-v4">{pattern.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Core SaaS Features Included</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">Stop reinventing the wheel. We have proven implementations for the core features every B2B SaaS platform needs.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: 'RBAC & Auth', icon: Lock },
                  { title: 'Subscription Billing', icon: CreditCard },
                  { title: 'Usage Analytics', icon: BarChart },
                  { title: 'White-labeling', icon: LayoutDashboard }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 bg-ink p-4 rounded-xl border border-hairline">
                    <div className="p-2 bg-ink-surface-2 rounded-lg text-signal">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-text-primary-v4">{feature.title}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <PanelCard className="p-8">
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-6">Our Tech Stack</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary-v4 uppercase tracking-wider mb-3">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Next.js', 'React', 'Vue', 'Tailwind CSS'].map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-ink-surface rounded-full text-sm text-text-primary-v4 border border-hairline">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary-v4 uppercase tracking-wider mb-3">Backend</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Node.js', 'Go', 'Python', 'NestJS'].map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-ink-surface rounded-full text-sm text-text-primary-v4 border border-hairline">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary-v4 uppercase tracking-wider mb-3">Data & Infrastructure</h4>
                    <div className="flex flex-wrap gap-2">
                      {['PostgreSQL', 'Redis', 'AWS/GCP', 'Kubernetes'].map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-ink-surface rounded-full text-sm text-text-primary-v4 border border-hairline">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Start building your SaaS today</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="v4-btn-primary">
                Book a Tech Strategy Call
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
