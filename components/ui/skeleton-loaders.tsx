import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-muted/40', className)} />;
}

export function SkeletonCard({ className }: { className?: string } = {}) {
  return (
    <div className={cn('liquid-glass-card rounded-2xl p-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="liquid-glass-card rounded-2xl overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 flex-1" />)}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border/50 p-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((j) => <Skeleton key={j} className="h-4 flex-1" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRings() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="liquid-glass-card rounded-2xl p-5">
          <Skeleton className="h-9 w-9 rounded-xl mb-3" />
          <Skeleton className="h-[120px] w-[120px] rounded-full mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto mt-3" />
        </div>
      ))}
    </div>
  );
}
