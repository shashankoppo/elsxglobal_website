'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { ServerOff, Scissors, Rocket, GitBranch, ArrowRight, Database, Terminal, ShieldAlert } from 'lucide-react';

export default function LegacyModernizationPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Legacy Modernization"
        title={<>Escape the Monolith. <span className="text-signal">Don't Lose the Business.</span></>}
        description="We systematically upgrade aging software infrastructure to modern cloud-native architectures without disrupting your ongoing business operations."
      />

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Modernization Approaches</h2>
              <p className="text-text-secondary-v4 text-lg">We balance speed, cost, and risk to determine the best path forward for your specific legacy systems.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Strangler Fig Pattern', desc: 'Incrementally replacing specific pieces of functionality with new microservices until the monolith can be safely retired.', icon: Scissors },
              { title: 'Incremental Refactor', desc: 'Gradually improving the existing codebase by updating frameworks, removing dead code, and writing tests.', icon: GitBranch },
              { title: 'Big Bang Migration', desc: 'Building a parallel modern system and cutting over. High risk, but sometimes necessary for fundamentally broken architectures.', icon: Rocket }
            ].map((approach, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="v4-panel p-8 h-full bg-ink border border-hairline hover:border-signal/50 transition-colors">
                  <div className="p-3 bg-signal/10 rounded-full w-fit mb-6">
                    <approach.icon className="w-8 h-8 text-signal" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">{approach.title}</h3>
                  <p className="text-text-secondary-v4">{approach.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">What We Modernize</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">We have deep expertise in extracting business logic from decades-old systems.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'COBOL & Mainframes', icon: Terminal },
                  { name: '.NET Framework (Legacy)', icon: ServerOff },
                  { name: 'PHP & Java Monoliths', icon: GitBranch },
                  { name: 'Oracle Forms & DB2', icon: Database }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 v4-panel bg-ink border border-hairline">
                    <item.icon className="w-5 h-5 text-signal" />
                    <span className="font-semibold text-text-primary-v4 text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 md:p-12 border-l-4 border-l-signal">
                <ShieldAlert className="w-10 h-10 text-signal mb-6" />
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">Risk Mitigation is Everything</h3>
                <p className="text-text-secondary-v4 mb-6">Modernization projects often fail because they disrupt the core business. We prevent this by:</p>
                <ul className="space-y-3 text-text-secondary-v4">
                  <li className="flex gap-3"><span className="text-signal font-bold">1.</span> Building robust automated test suites around legacy code before touching it.</li>
                  <li className="flex gap-3"><span className="text-signal font-bold">2.</span> Using feature flags to run new and old systems in parallel (Shadowing).</li>
                  <li className="flex gap-3"><span className="text-signal font-bold">3.</span> Ensuring bi-directional data synchronization during the transition phase.</li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface border-t border-hairline text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Stop paying the legacy tax</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Discuss Your Modernization Strategy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
