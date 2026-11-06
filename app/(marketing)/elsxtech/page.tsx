'use client';

import { Cpu, Cloud, Shield, Smartphone, Code2, Network, Layers, Database, Rocket, BrainCircuit } from 'lucide-react';
import { DivisionPageV4 } from '@/components/shared/v4-page-templates';
import { BlueprintSection } from '@/components/ui/blueprint-section';
import { ComplianceSection } from '@/components/ui/compliance-section';
import { SLASection } from '@/components/ui/sla-section';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function ElsxTechPage() {
  return (
    <DivisionPageV4 data={{
      eyebrow: 'ELSxTech Division', eyebrowIcon: Cpu,
      title: <>Intelligence-First Engineering for the Enterprise</>,
      description: 'Custom software, AI integration, cloud architecture, and cybersecurity — built to outperform, not just function.',
      services: [
        { icon: Code2, title: 'Custom Software Development', desc: 'Full-stack enterprise applications built for scale.' },
        { icon: BrainCircuit, title: 'AI/ML Integration', desc: 'Production-grade AI pipelines and model deployment.' },
        { icon: Cloud, title: 'Cloud Architecture', desc: 'Multi-cloud, hybrid, and edge infrastructure design.' },
        { icon: Shield, title: 'Cybersecurity', desc: 'Zero-trust architecture, SOC monitoring, pen testing.' },
        { icon: Smartphone, title: 'Mobile Applications', desc: 'Native and cross-platform mobile engineering.' },
        { icon: Network, title: 'API Platform Design', desc: 'RESTful and GraphQL API ecosystems at scale.' },
      ],
      stats: [
        { value: 200, suffix: '+', label: 'Deployments' },
        { value: 99.99, suffix: '%', label: 'Uptime SLA', decimals: 2 },
        { value: 87, suffix: '%', label: 'Cost Reduction' },
        { value: 48, suffix: 'hr', label: 'Migration SLA' },
      ],
      tags: ['AI-Native', 'Cloud-First', 'Zero-Trust', 'Enterprise-Grade'],
      children: (
        <>
          <section className="v4-section-sm bg-ink-surface border-b border-hairline">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Our Tech Stack Philosophy</h2>
              </ScrollReveal>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'AI-Native', desc: 'Every solution starts with intelligence built in — not bolted on.', icon: BrainCircuit },
                  { label: 'Cloud-First', desc: 'Designed for auto-scaling, multi-region, and infinite elasticity.', icon: Cloud },
                  { label: 'Zero-Trust', desc: 'Security is architecture, not an afterthought.', icon: Shield },
                ].map((item, i) => (
                  <ScrollReveal key={item.label} animation="fade-up" delay={i * 100}>
                    <div className="v4-panel p-6 text-center h-full">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2 mb-3">
                        <item.icon className="h-5 w-5 text-signal" />
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary-v4">{item.label}</h3>
                      <p className="mt-2 text-xs text-text-secondary-v4 leading-relaxed">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          <BlueprintSection 
            title="Engineering Blueprint" 
            subtitle="How we take enterprise software from concept to production-grade deployment."
            phases={[
              { title: 'Discovery & Audit', desc: 'Deep-dive into your current architecture and goals.', icon: Layers, details: ['Codebase Audit', 'Infrastructure Review', 'ROI Modeling'] },
              { title: 'Architecture Design', desc: 'Cloud-native, event-driven architecture blueprints.', icon: Database, details: ['System Design', 'API Contracts', 'Data Models'] },
              { title: 'Agile Build', desc: 'Two-week sprints with CI/CD from day one.', icon: Code2, details: ['Test-Driven Dev', 'Code Reviews', 'Automated QA'] },
              { title: 'Launch & Scale', desc: 'Zero-downtime deployment with observability baked in.', icon: Rocket, details: ['Blue-Green Deploy', 'APM Monitoring', 'Auto-Scaling'] },
            ]} 
          />
          <ComplianceSection />
          <SLASection />
        </>
      ),
    }} />
  );
}
