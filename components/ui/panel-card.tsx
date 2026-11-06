import { cn } from '@/lib/utils';

/**
 * V4 Panel Card — flat, no blur, no glow, no scale-on-hover.
 * Hover: border hairline → hairline-2 only.
 * Pure server component — no runtime JS.
 *
 * Supports two usage patterns:
 * 1. Children-based: <PanelCard className="p-6">...any content...</PanelCard>
 * 2. Prop-based:     <PanelCard title="Title" description="Desc" icon={<Icon />} />
 */
interface PanelCardProps {
  children?: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'article' | 'section';
  /** Optional — renders a structured card with icon, title, description */
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function PanelCard({ children, className, hover = true, as = 'div', title, description, icon }: PanelCardProps) {
  const Tag = as;

  // If title/description/icon props are provided, render structured layout
  const content = title ? (
    <div className="flex flex-col gap-3">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-ink-surface-2 text-signal shrink-0">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary-v4">{title}</h3>
      {description && <p className="text-sm text-text-secondary-v4 leading-relaxed">{description}</p>}
    </div>
  ) : null;

  return (
    <Tag className={cn('v4-panel', hover && 'v4-panel-hover', title && !className?.includes('p-') && 'p-6', className)}>
      {content}
      {children}
    </Tag>
  );
}

export function PanelCardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
