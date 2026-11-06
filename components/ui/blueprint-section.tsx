import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PanelCard } from './panel-card';
import { type LucideIcon, ArrowRight } from 'lucide-react';

export interface BlueprintPhase {
  title: string;
  desc: string;
  icon: LucideIcon;
  details: string[];
}

export function BlueprintSection({ title, subtitle, phases }: { title: string; subtitle: string; phases: BlueprintPhase[] }) {
  return (
    <section className="v4-section-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-3xl v4-display text-text-primary-v4">{title}</h2>
          <p className="mt-2 text-text-secondary-v4">{subtitle}</p>
        </ScrollReveal>
        
        <div className="grid lg:grid-cols-4 gap-4">
          {phases.map((phase, i) => (
            <ScrollReveal key={phase.title} animation="fade-up" delay={i * 80} className="relative group h-full">
              {i !== phases.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-[1px] bg-gradient-to-r from-signal/50 to-transparent pointer-events-none z-0" />
              )}
              <PanelCard className="p-6 h-full border border-hairline hover:border-signal/30 transition-colors bg-ink-surface relative z-10 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2 group-hover:bg-signal/10 transition-colors shrink-0">
                    <phase.icon className="h-5 w-5 text-signal" />
                  </div>
                  <span className="v4-readout text-[10px] uppercase tracking-widest text-signal">Phase 0{i + 1}</span>
                </div>
                <h3 className="text-base font-semibold text-text-primary-v4 mb-2">{phase.title}</h3>
                <p className="text-sm text-text-secondary-v4 mb-4 leading-relaxed flex-1">{phase.desc}</p>
                <ul className="space-y-2 mt-auto">
                  {phase.details.map((detail) => (
                    <li key={detail} className="flex items-center text-xs text-text-muted-v4">
                      <ArrowRight className="h-3 w-3 mr-2 text-signal/70 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </PanelCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
