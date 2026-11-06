import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import { Server, Globe, Search, Shield, Zap, Terminal, Activity, Check, Cpu, Database, BrainCircuit, FileText } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  server: Server,
  globe: Globe,
  search: Search,
  shield: Shield,
  zap: Zap,
  terminal: Terminal,
  activity: Activity,
  check: Check,
  cpu: Cpu,
  database: Database,
  brain: BrainCircuit,
  'file-text': FileText,
};

interface PageHeroV4Props {
  eyebrow: string;
  eyebrowIcon?: any;
  title: React.ReactNode;
  description: string;
  children?: React.ReactNode;
}

export function PageHeroV4({ eyebrow, eyebrowIcon, title, description, children }: PageHeroV4Props) {
  // Resolve icon to a component — supports both string keys and direct LucideIcon refs
  const ActualIcon = typeof eyebrowIcon === 'string' ? ICON_MAP[eyebrowIcon.toLowerCase()] : eyebrowIcon;

  // Pre-render the eyebrow label as JSX so only serializable React elements cross
  // the server→client boundary (ScrollReveal is a client component).
  const eyebrowLabel = (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2',
        'v4-readout text-[10px] uppercase tracking-widest text-text-secondary-v4'
      )}
    >
      {ActualIcon && <ActualIcon className="h-3 w-3 text-signal" />}
      {eyebrow}
    </span>
  );

  return (
    <section className="relative pt-12 pb-16 bg-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal animation="fade-up" delay={0}>
          {eyebrowLabel}
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl v4-display text-text-primary-v4 leading-[1.1]">
            {title}
          </h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={200}>
          <p className="mt-6 text-lg text-text-secondary-v4 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </ScrollReveal>
        {children && (
          <ScrollReveal animation="fade-up" delay={300} className="mt-8">
            {children}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
