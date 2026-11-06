'use client';

import { Compass, Map, Rocket, ShieldCheck, Users, Target, Lightbulb, Search, Network } from 'lucide-react';
import { DivisionPageV4 } from '@/components/shared/v4-page-templates';
import { BlueprintSection } from '@/components/ui/blueprint-section';
import { ComplianceSection } from '@/components/ui/compliance-section';
import { SLASection } from '@/components/ui/sla-section';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function ElsxConsultancyPage() {
  const phases = [
    { n: '01', label: 'Discover', desc: 'Stakeholder interviews, process audit, tech assessment' },
    { n: '02', label: 'Architect', desc: 'Solution design, vendor selection, roadmap' },
    { n: '03', label: 'Deploy', desc: 'Phased rollout, change management, training' },
    { n: '04', label: 'Optimize', desc: 'Continuous improvement, KPI tracking, scaling' },
  ];
  return (
    <DivisionPageV4 data={{
      eyebrow: 'ELSxConsultancy Division', eyebrowIcon: Compass,
      title: <>Strategy First. Then Execution.</>,
      description: 'Senior consultants who have built and scaled systems at global enterprises — now on your team.',
      services: [
        { icon: Compass, title: 'Digital Transformation', desc: 'End-to-end strategy from legacy to cloud-native.' },
        { icon: Map, title: 'Technology Roadmapping', desc: '12-36 month phased modernization plans.' },
        { icon: Rocket, title: 'Vendor Selection & RFP', desc: 'Independent guidance to the right stack.' },
        { icon: ShieldCheck, title: 'Compliance & Risk', desc: 'GDPR, HIPAA, SOC2, ISO readiness.' },
        { icon: Users, title: 'Change Management', desc: 'Adoption is the hardest part. We solve it.' },
        { icon: Target, title: 'Performance Optimization', desc: 'Audit existing systems for cost and speed.' },
      ],
      stats: [
        { value: 100, suffix: '+', label: 'Clients Served' },
        { value: 4, suffix: '', label: 'Intl. Offices' },
        { value: 98, suffix: '%', label: 'Client Retention' },
        { value: 12, suffix: 'mo', label: 'Avg Engagement' },
      ],
      tags: ['Strategy', 'Roadmaps', 'Compliance', 'Change Mgmt'],
      children: (
        <>
          <section className="v4-section-sm bg-ink-surface border-b border-hairline">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Our Methodology</h2>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {phases.map((p, i) => (
                  <ScrollReveal key={p.n} animation="fade-up" delay={i * 100}>
                    <div className="v4-panel p-5 h-full">
                      <p className="v4-readout text-signal text-xs">{p.n}</p>
                      <h3 className="mt-2 text-sm font-semibold uppercase tracking-wider text-text-primary-v4">{p.label}</h3>
                      <p className="mt-2 text-xs text-text-secondary-v4 leading-relaxed">{p.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal className="mt-6 flex items-center justify-center gap-2">
                <Lightbulb className="h-4 w-4 text-signal" />
                <p className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4">6-week discovery sprint · fixed-fee · no lock-in</p>
              </ScrollReveal>
            </div>
          </section>

          <BlueprintSection 
            title="Strategic Transformation Blueprint" 
            subtitle="How we de-risk massive enterprise modernizations."
            phases={[
              { title: 'Current State Audit', desc: 'Uncover technical debt and hidden operational costs.', icon: Search, details: ['Codebase Audit', 'Process Mapping', 'Vendor Spend Analysis'] },
              { title: 'Future State Design', desc: 'Drafting the optimal cloud-native architecture.', icon: Map, details: ['To-Be Architecture', 'Security Framework', 'ROI Projections'] },
              { title: 'Execution Roadmap', desc: 'Phased, agile delivery plans to minimize disruption.', icon: Target, details: ['Sprint Planning', 'Resource Allocation', 'Risk Mitigation'] },
              { title: 'Governance & Change', desc: 'Ensuring adoption across the enterprise.', icon: Users, details: ['Training Programs', 'KPI Dashboards', 'CoE Setup'] },
            ]} 
          />
          <ComplianceSection />
          <SLASection />
        </>
      ),
    }} />
  );
}
