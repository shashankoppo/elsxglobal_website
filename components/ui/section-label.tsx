import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SectionLabelProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ icon: Icon, children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/5 px-3.5 py-1.5 text-xs font-medium text-blue-400 shadow-glow-blue',
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
