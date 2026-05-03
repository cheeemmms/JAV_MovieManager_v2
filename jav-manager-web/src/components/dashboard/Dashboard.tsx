import { useDashboardStats } from "@/services/statsService"
import { StatCards } from "./StatCards"
import { TopChart } from "./TopChart"
import { TrendChart } from "./TrendChart"
import { Heatmap } from "./Heatmap"

export function Dashboard() {
  const { data: stats, isLoading, isError } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-[360px] animate-pulse rounded-xl bg-muted" />
            <div className="h-[320px] animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-[240px] animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-destructive">Failed to load statistics</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Make sure the API server is running
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="space-y-6">
        <StatCards stats={stats} />
        <div className="grid gap-6 lg:grid-cols-2">
          <TopChart stats={stats} />
          <div className="space-y-6">
            <TrendChart stats={stats} />
            <Heatmap stats={stats} />
          </div>
        </div>
      </div>
    </div>
  )
}
