export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-xl p-5 border border-[var(--border)] space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export function ICardSkeleton() {
  return (
    <div className="p-5 space-y-6 flex flex-col items-center">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-64 w-full max-w-[320px] rounded-2xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
