import { Activity, Clock, RefreshCw } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const SLA_METRICS = [
  { icon: Activity, title: '99.99%', label: 'Uptime Guarantee', desc: 'Financially backed SLA for mission-critical infrastructure.' },
  { icon: Clock, title: '< 15 min', label: 'Response Time', desc: 'Priority routing for Severity 1 enterprise incidents.' },
  { icon: RefreshCw, title: 'High HA', label: 'RTO / RPO', desc: 'Near-zero Recovery Time and Point Objectives.' },
];

export function SLASection() {
  return (
    <section className="v4-section-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ink-surface-2 border border-hairline rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-signal/5 to-transparent pointer-events-none" />
          
          <ScrollReveal className="text-center mb-10 relative z-10">
            <h2 className="text-3xl v4-display text-text-primary-v4">Service Level Agreements</h2>
            <p className="mt-2 text-text-secondary-v4">We guarantee performance so you can focus on growth.</p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {SLA_METRICS.map((metric, i) => (
              <ScrollReveal key={metric.title} animation="fade-up" delay={i * 80} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink border border-hairline mb-4">
                  <metric.icon className="h-5 w-5 text-signal" />
                </div>
                <div className="text-3xl font-light text-text-primary-v4 tracking-tight mb-2">{metric.title}</div>
                <div className="text-sm font-semibold text-text-secondary-v4 mb-2">{metric.label}</div>
                <p className="text-xs text-text-muted-v4 max-w-[200px] mx-auto">{metric.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
