export default function DashboardLoading() {
  return (
    <div className="max-w-6xl space-y-8" aria-busy="true" aria-live="polite">
      <div className="h-16 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Loading dashboard…</p>
    </div>
  );
}
