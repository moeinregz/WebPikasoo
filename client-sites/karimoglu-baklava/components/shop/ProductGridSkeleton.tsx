export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4"
      role="status"
      aria-label="در حال بارگذاری محصولات"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 overflow-hidden rounded-lg bg-surface shadow-sm">
          <div className="img-placeholder aspect-square animate-pulse" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-bg-secondary" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-bg-secondary" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-bg-secondary" />
            <div className="h-9 w-full animate-pulse rounded bg-bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}
