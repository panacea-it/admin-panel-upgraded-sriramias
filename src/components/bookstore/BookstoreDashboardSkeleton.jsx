export default function BookstoreDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-white shadow-sm" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-white shadow-sm" />
        <div className="h-64 rounded-xl bg-white shadow-sm" />
      </div>
      <div className="h-80 rounded-xl bg-white shadow-sm" />
    </div>
  )
}
