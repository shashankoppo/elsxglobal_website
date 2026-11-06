'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { ArrowRight, Check, Code2, Headphones, Brain, Briefcase } from 'lucide-react';

export default function ComparePage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Compare Services"
        title={<>Find the Right <span className="text-signal">ELSxGlobal Solution</span></>}
        description="Whether you need a custom software platform, a dedicated support team, or strategic consulting, we have a specialized division to meet your exact needs."
      />

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <ScrollReveal>
            <div className="overflow-x-auto rounded-xl border border-hairline bg-ink-surface-2 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-6 border-b border-hairline bg-ink w-1/4"></th>
                    <th className="p-6 border-b border-hairline border-l bg-ink-surface">
                      <div className="flex items-center gap-2 mb-2 text-signal">
                        <Code2 className="w-5 h-5" />
                        <span className="font-bold text-lg text-text-primary-v4">ELSxTech</span>
                      </div>
                    </th>
                    <th className="p-6 border-b border-hairline border-l bg-ink-surface">
                      <div className="flex items-center gap-2 mb-2 text-signal">
                        <Headphones className="w-5 h-5" />
                        <span className="font-bold text-lg text-text-primary-v4">ELSxBPO</span>
                      </div>
                    </th>
                    <th className="p-6 border-b border-hairline border-l bg-ink-surface">
                      <div className="flex items-center gap-2 mb-2 text-signal">
                        <Brain className="w-5 h-5" />
                        <span className="font-bold text-lg text-text-primary-v4">ELSxKPO</span>
                      </div>
                    </th>
                    <th className="p-6 border-b border-hairline border-l bg-ink-surface">
                      <div className="flex items-center gap-2 mb-2 text-signal">
                        <Briefcase className="w-5 h-5" />
                        <span className="font-bold text-lg text-text-primary-v4">ELSxConsultancy</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {[
                    { label: 'Focus', tech: 'Custom Software & AI Dev', bpo: 'Customer Support & Ops', kpo: 'Data & Market Research', consult: 'Digital Strategy & Audit' },
                    { label: 'Team Size', tech: 'Scrum Teams (3-10+)', bpo: 'Scaled Teams (10-100+)', kpo: 'Specialized Analysts (2-15)', consult: 'Advisors (1-3)' },
                    { label: 'Engagement Model', tech: 'Project / Retainer', bpo: 'Dedicated FTEs', kpo: 'Dedicated FTEs / Project', consult: 'Fixed Scope / Advisory' },
                    { label: 'Typical Timeline', tech: '3-12 Months', bpo: 'Ongoing (12m+)', kpo: 'Ongoing / 1-3 Months', consult: '2-6 Weeks' },
                    { label: 'Best For', tech: 'Building new digital products', bpo: 'Scaling operations cost-effectively', kpo: 'Outsourcing complex knowledge tasks', consult: 'Planning technology investments' },
                    { label: 'Starting Price Range', tech: '$$$', bpo: '$', kpo: '$$', consult: '$$$' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-ink transition-colors">
                      <td className="p-4 font-semibold text-text-primary-v4 bg-ink">{row.label}</td>
                      <td className="p-4 border-l border-hairline text-text-secondary-v4">{row.tech}</td>
                      <td className="p-4 border-l border-hairline text-text-secondary-v4">{row.bpo}</td>
                      <td className="p-4 border-l border-hairline text-text-secondary-v4">{row.kpo}</td>
                      <td className="p-4 border-l border-hairline text-text-secondary-v4">{row.consult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="v4-section bg-ink-surface border-y border-hairline">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-text-primary-v4 mb-4">Not sure where to start?</h2>
              <p className="text-text-secondary-v4">Select the scenario that best describes your current challenge.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1}>
              <PanelCard className="p-8 h-full flex flex-col justify-between hover:border-signal/50 transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">"We need to build a custom app or SaaS platform."</h3>
                  <p className="text-text-secondary-v4 mb-6">You need engineering muscle to bring a product vision to life or modernize an existing application.</p>
                </div>
                <Link href="/services/custom-software" className="inline-flex items-center text-signal font-semibold hover:underline">
                  Explore ELSxTech <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </PanelCard>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <PanelCard className="p-8 h-full flex flex-col justify-between hover:border-signal/50 transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">"Our support/sales team is overwhelmed."</h3>
                  <p className="text-text-secondary-v4 mb-6">You need dedicated, scalable offshore talent to handle customer service, back-office ops, or data entry.</p>
                </div>
                <Link href="/services/bpo" className="inline-flex items-center text-signal font-semibold hover:underline">
                  Explore ELSxBPO <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="p-8 h-full flex flex-col justify-between hover:border-signal/50 transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">"Our IT infrastructure is a mess and we lack direction."</h3>
                  <p className="text-text-secondary-v4 mb-6">You need senior technological leadership to audit your systems, propose a roadmap, and select vendors.</p>
                </div>
                <Link href="/services/digital-transformation/consulting" className="inline-flex items-center text-signal font-semibold hover:underline">
                  Explore Consultancy <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </main>
  );
}
