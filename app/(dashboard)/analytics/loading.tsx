export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-md pt-safe pb-tab-bar">
        {/* DashboardHeader */}
        <div className="px-8 pb-2 pt-2">
          <div className="skeleton h-8 w-32 rounded-full" />
        </div>

        {/* TitularHero skeleton */}
        <div className="px-5 pt-4 pb-2">
          <div className="skeleton h-7 w-full rounded-lg mb-2" />
          <div className="skeleton h-7 w-2/3 rounded-lg" />
        </div>

        {/* InsightChips skeleton */}
        <div className="flex gap-2 px-5 py-3">
          <div className="skeleton h-7 w-32 rounded-full shrink-0" />
          <div className="skeleton h-7 w-24 rounded-full shrink-0" />
          <div className="skeleton h-7 w-28 rounded-full shrink-0" />
        </div>

        {/* Section label */}
        <div className="px-5 mt-2 mb-3">
          <div className="skeleton h-3 w-40 rounded-full" />
        </div>

        {/* CategoriaRow skeletons × 5 */}
        <div className="px-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-[72px] rounded-card mb-2" />
          ))}
        </div>
      </div>
    </div>
  )
}
