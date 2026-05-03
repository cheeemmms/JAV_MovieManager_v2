import { useMemo } from "react"
import type { StatsResponse } from "@/types/stats"

interface HeatmapProps {
  stats: StatsResponse
}

const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getIntensityColor(count: number, max: number): string {
  if (count === 0) return "bg-muted"
  const pct = count / max
  if (pct < 0.25) return "bg-blue-500/20"
  if (pct < 0.5) return "bg-blue-500/40"
  if (pct < 0.75) return "bg-blue-500/60"
  return "bg-blue-500/80"
}

export function Heatmap({ stats }: HeatmapProps) {
  const years = useMemo(() => {
    const set = new Set(stats.heatmap.map((h) => h.year))
    return Array.from(set).sort().reverse()
  }, [stats.heatmap])

  const maxCount = useMemo(
    () => Math.max(1, ...stats.heatmap.map((h) => h.count)),
    [stats.heatmap]
  )

  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of stats.heatmap) {
      map.set(`${item.year}-${item.month}`, item.count)
    }
    return map
  }, [stats.heatmap])

  if (years.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Monthly Heatmap</h3>
        <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
          No play data yet
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Monthly Heatmap</h3>
      <div className="flex gap-1">
        <div className="grid grid-rows-12 gap-1 pr-1">
          {MONTH_LABELS.map((m) => (
            <div key={m} className="flex h-6 items-center text-[10px] text-muted-foreground">
              {m}
            </div>
          ))}
        </div>
        {years.map((year) => (
          <div key={year} className="flex-1">
            <div className="mb-1 text-center text-xs font-medium text-muted-foreground">
              {year}
            </div>
            <div className="grid grid-rows-12 gap-1">
              {MONTHS.map((month) => {
                const key = `${year}-${month}`
                const count = dataMap.get(key) ?? 0
                return (
                  <div
                    key={key}
                    title={`${year}-${month}: ${count} plays`}
                    className={`h-6 rounded-sm transition-colors ${getIntensityColor(count, maxCount)}`}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <div className="h-3 w-3 rounded-sm bg-blue-500/20" />
        <div className="h-3 w-3 rounded-sm bg-blue-500/40" />
        <div className="h-3 w-3 rounded-sm bg-blue-500/60" />
        <div className="h-3 w-3 rounded-sm bg-blue-500/80" />
        <span>More</span>
      </div>
    </div>
  )
}
