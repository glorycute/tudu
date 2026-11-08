export function TaskListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-3 border-b border-border py-3">
          <span className="size-5 shrink-0 animate-pulse rounded-full bg-hover" />
          <span className="h-5 animate-pulse rounded-sm bg-hover" style={{ width: `${40 + ((i * 23) % 40)}%` }} />
        </div>
      ))}
    </div>
  );
}
