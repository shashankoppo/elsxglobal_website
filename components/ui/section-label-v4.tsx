import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * V4 Section Label — eyebrow text, flat, no gradient.
 * Uses mono font, uppercase, hairline border.
 */
interface SectionLabelV4Props {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function SectionLabelV4({ icon: Icon, children, className }: SectionLabelV4Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-chip border border-hairline bg-ink-surface-2',
        'v4-readout text-[10px] uppercase tracking-widest text-text-secondary-v4',
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3 text-signal" />}
      {children}
    </span>
  );
}
