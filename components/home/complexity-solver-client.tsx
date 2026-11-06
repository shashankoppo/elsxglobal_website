'use client';

import { useState, useEffect } from 'react';
import { Activity, Cpu, GitBranch, BarChart3, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';
import { SectionLabelV4 } from '@/components/ui/section-label-v4';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const TABS = [
  { key: 'tech', label: 'Technology Gaps', icon: Cpu, pain: 'Legacy systems creating $2.3M/year in inefficiency. Manual processes blocking AI adoption.', solution: 'ELSxTech modernizes your entire stack — cloud migration, custom AI, microservices architecture.', stats: ['87% Cost Reduction', '48hr Migration SLA', 'Zero Downtime'] },
  { key: 'ops', label: 'Operations Overload', icon: GitBranch, pain: 'Manual processes scaling headcount linearly. Error rates climbing as volume grows.', solution: 'ELSxBPO deploys RPA bots and AI-augmented agents that scale without adding headcount.', stats: ['68% Cost Reduction', '24/7 Operations', '99.2% Accuracy'] },
  { key: 'intel', label: 'Intelligence Deficit', icon: BarChart3, pain: 'Decisions based on gut feeling, not data. No predictive capability. Reactive, not proactive.', solution: 'ELSxKPO transforms raw data into predictive intelligence that changes how you compete.', stats: ['92% Forecast Accuracy', '500+ Reports/yr', '40+ Verticals'] },
  { key: 'scale', label: 'Scale Paralysis', icon: Briefcase, pain: 'Infrastructure buckling under growth. Scaling means hiring, not systems thinking.', solution: 'ELSxConsultancy + VaultHost build scalable systems that grow without linear cost increase.', stats: ['340+ Projects', '3.5x Avg ROI', 'Global Scale'] },
];

function cnToggle(active: boolean) {
  return active
    ? 'flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium bg-ink-surface-2 text-signal border border-hairline-2'
    : 'flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium text-text-muted-v4 hover:text-text-secondary-v4 border border-transparent hover:border-hairline transition-colors';
}

export function ComplexitySolverClient() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];

  return (
    <section className="v4-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <SectionLabelV4 icon={Activity}>The Challenge</SectionLabelV4>
          <h2 className="mt-4 text-3xl sm:text-4xl v4-display text-text-primary-v4">Every enterprise has a breaking point</h2>
          <p className="mt-4 text-lg text-text-secondary-v4">ELSxGlobal was built to solve the problems that traditional agencies can't touch.</p>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(i)}
              className={cnToggle(activeTab === i)}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div key={tab.key} className="animate-fade-in">
          <PanelCard className="p-8 lg:p-10 max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-[64px_1fr] gap-6 items-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2">
                <tab.icon className="h-7 w-7 text-signal" />
              </div>
              <div>
                <div className="space-y-5">
                  <div>
                    <p className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4 mb-2">The Problem</p>
                    <p className="text-base text-text-secondary-v4 leading-relaxed">{tab.pain}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-signal mt-0.5 shrink-0" />
                    <div>
                      <p className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4 mb-2">The ELSxGlobal Solution</p>
                      <p className="text-base text-text-primary-v4 leading-relaxed">{tab.solution}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {tab.stats.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip border border-hairline bg-ink-surface-2 v4-readout text-xs">
                      <CheckCircle2 className="h-3 w-3 text-good" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </section>
  );
}
