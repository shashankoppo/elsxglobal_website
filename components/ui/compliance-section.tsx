import { ShieldCheck, Shield, Lock, FileCheck } from 'lucide-react';
import { PanelCard } from './panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const COMPLIANCE_DATA = [
  { icon: ShieldCheck, name: 'SOC 2 Type II', desc: 'Audited security, availability, and confidentiality.' },
  { icon: FileCheck, name: 'ISO 27001', desc: 'Information security management systems.' },
  { icon: Lock, name: 'HIPAA', desc: 'Strict PHI and healthcare data protection.' },
  { icon: Shield, name: 'GDPR / CCPA', desc: 'Global data privacy and compliance.' },
];

export function ComplianceSection() {
  return (
    <section className="v4-section-sm bg-ink-surface border-y border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-2xl v4-display text-text-primary-v4">Enterprise Compliance & Security</h2>
          <p className="mt-2 text-text-secondary-v4 text-sm">We maintain the highest global standards for data integrity and privacy.</p>
        </ScrollReveal>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPLIANCE_DATA.map((item, i) => (
            <ScrollReveal key={item.name} animation="fade-up" delay={i * 80} className="h-full">
              <PanelCard className="p-5 flex items-start gap-4 h-full">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2 text-text-primary-v4">
                  <item.icon className="h-5 w-5 text-signal" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-text-primary-v4">{item.name}</h4>
                  <p className="text-xs text-text-muted-v4 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </PanelCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
