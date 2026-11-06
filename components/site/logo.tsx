import { cn } from '@/lib/utils';

/**
 * ELSxGlobal "ƎE" Logo
 * A mirrored capital E (Ǝ) facing a standard capital E,
 * forming an enterprise-grade monogram. Adapts to light/dark via currentColor.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      className={cn('text-primary h-8 w-auto shrink-0', className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mirrored E (Ǝ) — left half */}
      <g fill="currentColor">
        {/* Top bar */}
        <rect x="1" y="2" width="16" height="4" rx="1.5" />
        {/* Middle bar */}
        <rect x="5" y="14" width="12" height="3.5" rx="1.5" />
        {/* Bottom bar */}
        <rect x="1" y="26" width="16" height="4" rx="1.5" />
        {/* Spine (right edge for mirrored E) */}
        <rect x="13" y="2" width="4" height="28" rx="1.5" />
      </g>

      {/* Standard E — right half (mirrored copy for symmetry) */}
      <g fill="currentColor" opacity="0.85">
        {/* Top bar */}
        <rect x="31" y="2" width="16" height="4" rx="1.5" />
        {/* Middle bar */}
        <rect x="31" y="14" width="12" height="3.5" rx="1.5" />
        {/* Bottom bar */}
        <rect x="31" y="26" width="16" height="4" rx="1.5" />
        {/* Spine (left edge for standard E) */}
        <rect x="31" y="2" width="4" height="28" rx="1.5" />
      </g>

      {/* Central accent dot — the "x" in ELSxGlobal */}
      <circle cx="24" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}
