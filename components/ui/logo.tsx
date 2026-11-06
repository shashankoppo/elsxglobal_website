import { cn } from '@/lib/utils';

/**
 * ELSxGlobal "ƎE" Logo — matches admin panel.
 * A mirrored capital E (Ǝ) facing a standard capital E,
 * forming an enterprise-grade monogram. Adapts to light/dark via currentColor.
 */
export function LogoMark({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      className={cn('text-primary h-7 w-auto shrink-0', active && 'text-signal', className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <rect x="1" y="2" width="16" height="4" rx="1.5" />
        <rect x="5" y="14" width="12" height="3.5" rx="1.5" />
        <rect x="1" y="26" width="16" height="4" rx="1.5" />
        <rect x="13" y="2" width="4" height="28" rx="1.5" />
      </g>
      <g fill="currentColor" opacity="0.85">
        <rect x="31" y="2" width="16" height="4" rx="1.5" />
        <rect x="31" y="14" width="12" height="3.5" rx="1.5" />
        <rect x="31" y="26" width="16" height="4" rx="1.5" />
        <rect x="31" y="2" width="4" height="28" rx="1.5" />
      </g>
      <circle cx="24" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, showCaption = true }: { className?: string; showCaption?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className="h-7 w-7" />
      <span className="flex flex-col">
        <span className="flex items-baseline text-current">
          <span className="font-display font-semibold text-sm">ELS</span>
          <span className="font-display font-semibold text-sm text-primary">x</span>
          <span className="font-display font-semibold text-sm">Global</span>
        </span>
        {showCaption && (
          <span className="font-mono text-[8px] uppercase tracking-wide mt-0.5 text-muted-foreground">
            by EvolucentSphere
          </span>
        )}
      </span>
    </span>
  );
}

export function VaultHostLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-foreground" aria-hidden="true">
        <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M9 14L12 17L19 10" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="1" fill="hsl(var(--primary))" />
      </svg>
      <span className="flex flex-col text-foreground">
        <span className="font-display font-semibold text-sm">VaultHost</span>
        <span className="font-mono text-[8px] uppercase tracking-wide text-muted-foreground">by ELSxGlobal</span>
      </span>
    </span>
  );
}
