'use client';

import { GitBranch, Cpu, Headphones, FileText, Workflow, ShieldCheck, Calculator, Search, CheckCircle } from 'lucide-react';
import { DivisionPageV4 } from '@/components/shared/v4-page-templates';
import { BlueprintSection } from '@/components/ui/blueprint-section';
import { ComplianceSection } from '@/components/ui/compliance-section';
import { SLASection } from '@/components/ui/sla-section';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function ElsxBPOPage() {
  return (
    <DivisionPageV4 data={{
      eyebrow: 'ELSxBPO Division', eyebrowIcon: GitBranch,
      title: <>Turn Operations Into a Competitive Advantage</>,
      description: 'RPA bots, AI-augmented agents, and process engineering that slashes cost and scales without headcount.',
      services: [
        { icon: Cpu, title: 'RPA Deployment', desc: 'UiPath, Automation Anywhere, Blue Prism.' },
        { icon: Headphones, title: 'AI-Augmented Contact Center', desc: '24/7/365 operations with AI-assisted human agents.' },
        { icon: FileText, title: 'Document Processing & OCR', desc: 'Automated data extraction from any document format.' },
        { icon: Workflow, title: 'Workflow Orchestration', desc: 'End-to-end process automation across systems.' },
        { icon: ShieldCheck, title: 'Quality Assurance & Compliance', desc: 'Automated QA with 99.2% accuracy rate.' },
        { icon: Calculator, title: 'Finance & Accounting BPO', desc: 'AP/AR, reconciliation, financial reporting.' },
      ],
      stats: [
        { value: 70, suffix: '%', label: 'Avg Cost Reduction' },
        { value: 99.2, suffix: '%', label: 'Accuracy Rate', decimals: 1 },
        { value: 24, suffix: '/7', label: 'Operations' },
        { value: 48, suffix: 'hr', label: 'RPA Deployment' },
      ],
      tags: ['RPA', '24/7 Ops', 'ISO-Certified', 'AI-Augmented'],
      children: (
        <>
          <section className="v4-section-sm bg-ink-surface border-b border-hairline">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Before & After ELSxBPO</h2>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="v4-panel p-6">
                  <h3 className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4 mb-4">Manual Process</h3>
                  <div className="space-y-2">
                    {['Human reviews document', 'Manual data entry', 'Approval workflow', 'Filing & archive'].map((step) => (
                      <div key={step} className="flex items-center gap-2 text-sm text-text-muted-v4">
                        <div className="h-1.5 w-1.5 rounded-full bg-text-muted-v4" /> {step}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 v4-readout text-xs text-text-muted-v4">~4 HRS/CYCLE · HIGH ERROR · SCALES WITH HEADCOUNT</p>
                </div>
                <div className="v4-panel p-6 border-signal/20">
                  <h3 className="v4-readout text-[10px] uppercase tracking-widest text-signal mb-4">RPA-Automated</h3>
                  <div className="space-y-2">
                    {['Bot extracts document data', 'Auto-validates & enters', 'AI routes for approval', 'Auto-archives'].map((step) => (
                      <div key={step} className="flex items-center gap-2 text-sm text-text-primary-v4">
                        <span className="v4-live-dot" /> {step}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 v4-readout text-xs text-good">~24 SEC/CYCLE · 99.2% ACCURACY · SCALES WITHOUT HEADCOUNT</p>
                </div>
              </div>
            </div>
          </section>
          
          <BlueprintSection 
            title="BPO Automation Blueprint" 
            subtitle="How we replace manual bottlenecks with intelligent automation."
            phases={[
              { title: 'Process Mining', desc: 'Identify bottlenecks using data, not guesswork.', icon: Search, details: ['Task Capture', 'ROI Modeling', 'Risk Analysis'] },
              { title: 'Bot Engineering', desc: 'Develop secure RPA bots for repetitive tasks.', icon: Cpu, details: ['UiPath / Blue Prism', 'Exception Handling', 'API Bridges'] },
              { title: 'Human-in-the-loop', desc: 'AI handles 80%, agents handle exceptions.', icon: Headphones, details: ['AI Agent Assist', 'Sentiment Analysis', 'Live Escalation'] },
              { title: 'Continuous QA', desc: 'Automated auditing of 100% of transactions.', icon: CheckCircle, details: ['Automated Grading', 'Compliance Checks', 'Real-time Dashboards'] },
            ]} 
          />
          <ComplianceSection />
          <SLASection />
        </>
      ),
    }} />
  );
}
