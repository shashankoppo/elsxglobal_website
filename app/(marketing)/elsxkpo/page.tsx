'use client';

import { BarChart3, TrendingUp, Brain, DollarSign, MessageSquare, Globe, FileSearch, Database, ShieldCheck, Activity } from 'lucide-react';
import { DivisionPageV4 } from '@/components/shared/v4-page-templates';
import { BlueprintSection } from '@/components/ui/blueprint-section';
import { ComplianceSection } from '@/components/ui/compliance-section';
import { SLASection } from '@/components/ui/sla-section';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function ElsxKPOPage() {
  return (
    <DivisionPageV4 data={{
      eyebrow: 'ELSxKPO Division', eyebrowIcon: BarChart3,
      title: <>Data Is Only Valuable When It Drives Decisions</>,
      description: 'ELSxKPO transforms raw data into predictive intelligence that changes how you compete.',
      services: [
        { icon: FileSearch, title: 'Market Research', desc: 'Competitive intelligence and market landscape analysis.' },
        { icon: TrendingUp, title: 'Predictive Analytics', desc: 'Forecasting models with 92% accuracy.' },
        { icon: DollarSign, title: 'Financial Modeling', desc: 'Valuation, M&A support, and financial forecasting.' },
        { icon: MessageSquare, title: 'Consumer Sentiment Analysis', desc: 'Real-time brand and market sentiment tracking.' },
        { icon: Globe, title: 'Industry Benchmarking', desc: '40+ market verticals benchmarked continuously.' },
        { icon: Brain, title: 'Due Diligence Support', desc: 'Data-driven M&A and investment decision support.' },
      ],
      stats: [
        { value: 92, suffix: '%', label: 'Forecast Accuracy' },
        { value: 500, suffix: '+', label: 'Reports/Year' },
        { value: 40, suffix: '+', label: 'Market Verticals' },
        { value: 3, suffix: 'x', label: 'Faster Insights' },
      ],
      tags: ['AI Analytics', 'Real-Time', 'Multi-Market', 'Predictive'],
      children: (
        <>
          <section className="v4-section-sm bg-ink-surface border-b border-hairline">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">The Data Pipeline</h2>
              </ScrollReveal>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
                {[
                  { label: 'Data Sources', desc: 'Internal + external', icon: Globe },
                  { label: 'ELSxKPO Processing', desc: 'AI + human analysis', icon: Brain },
                  { label: 'Insights', desc: 'Actionable intelligence', icon: TrendingUp },
                  { label: 'Decisions', desc: 'Strategic action', icon: BarChart3 },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <ScrollReveal animation="fade-up" delay={i * 100}>
                      <div className="flex flex-col items-center gap-2 p-5 v4-panel min-w-[130px]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2">
                          <step.icon className="h-4 w-4 text-signal" />
                        </div>
                        <p className="text-xs font-medium text-text-primary-v4">{step.label}</p>
                        <p className="v4-readout text-[10px] text-text-muted-v4">{step.desc}</p>
                      </div>
                    </ScrollReveal>
                    {i < 3 && <div className="hidden lg:block h-px w-5 bg-hairline-2" />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <BlueprintSection 
            title="Knowledge Process Blueprint" 
            subtitle="How we transform disparate data into actionable intelligence."
            phases={[
              { title: 'Data Ingestion', desc: 'Securely pulling data from all enterprise silos.', icon: Database, details: ['API Integration', 'Data Lakes', 'Real-Time Sync'] },
              { title: 'Data Cleansing', desc: 'Standardizing raw data into a unified schema.', icon: ShieldCheck, details: ['Deduplication', 'Format Alignment', 'Anomaly Detection'] },
              { title: 'AI Modeling', desc: 'Running predictive models on clean data.', icon: Brain, details: ['Machine Learning', 'NLP', 'Sentiment Analysis'] },
              { title: 'Visualization', desc: 'Presenting insights in executive dashboards.', icon: Activity, details: ['Tableau / PowerBI', 'Custom Dashboards', 'Alert Systems'] },
            ]} 
          />
          <ComplianceSection />
          <SLASection />
        </>
      ),
    }} />
  );
}
