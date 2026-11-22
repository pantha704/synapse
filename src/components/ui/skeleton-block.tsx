export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`}
    />
  );
}

export function SkeletonPage({ rows = 4 }: { rows?: number }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="h-4 w-80" />
      </div>
      <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 w-full" />
        ))}
      </div>
      <span className="sr-only">Loading content</span>
    </div>
  );
}
