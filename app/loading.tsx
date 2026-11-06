export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background" style={{ zIndex: 100 }}>
      <div className="flex flex-col items-center gap-4">
        <svg width="48" height="48" viewBox="0 0 48 48" className="animate-spin-slow">
          <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
          <path d="M24 10L38 18V30L24 38L10 30V18L24 10Z" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--accent))" strokeWidth="1" />
        </svg>
        <div className="w-48 h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-primary rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground text-sm">Loading ELSxGlobal...</p>
      </div>
    </div>
  );
}
