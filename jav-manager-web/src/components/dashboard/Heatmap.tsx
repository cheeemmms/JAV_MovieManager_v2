import { useMemo } from "react"
import type { StatsResponse } from "@/types/stats"

interface HeatmapProps {
  stats: StatsResponse
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"]

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function getColor(count: number, max: number): string {
  if (count === 0) return "bg-muted"
  const pct = count / max
  if (pct < 0.25) return "bg-emerald-400/25"
  if (pct < 0.5) return "bg-emerald-400/50"
  if (pct < 0.75) return "bg-emerald-400/75"
  return "bg-emerald-400"
}

interface DayCell {
  date: string
  count: number
}

export function Heatmap({ stats }: HeatmapProps) {
  const { cells, maxCount, monthLabels } = useMemo(() => {
    if (!stats.dailyPlays || stats.dailyPlays.length === 0) {
      return { cells: [], maxCount: 0, monthLabels: [] as { index: number; label: string }[] }
    }

    const dataMap = new Map<string, number>()
    for (const item of stats.dailyPlays) {
      dataMap.set(item.date, item.count)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const startDate = new Date(oneYearAgo)
    const dayOfWeek = startDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(startDate.getDate() + mondayOffset)

    const result: DayCell[] = []
    const current = new Date(startDate)
    while (current <= today) {
      const dateStr = current.toISOString().slice(0, 10)
      result.push({
        date: dateStr,
        count: dataMap.get(dateStr) ?? 0,
      })
      current.setDate(current.getDate() + 1)
    }

    const months: { index: number; label: string }[] = []
    for (let i = 0; i < result.length; i++) {
      if (i % 7 === 0) {
        const d = new Date(result[i].date + "T00:00:00")
        const monthIdx = d.getMonth()
        const col = Math.floor(i / 7)
        if (months.length === 0 || months[months.length - 1].label !== MONTH_NAMES[monthIdx]) {
          months.push({ index: col, label: MONTH_NAMES[monthIdx] })
        }
      }
    }

    return {
      cells: result,
      maxCount: Math.max(1, ...result.map((c) => c.count)),
      monthLabels: months,
    }
  }, [stats.dailyPlays])

  if (cells.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
          No play data yet
        </div>
      </div>
    )
  }

  const totalWeeks = Math.ceil(cells.length / 7)

  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex">
        <div
          className="grid"
          style={{
            gridTemplateRows: `repeat(7, minmax(0, 1fr))`,
            gap: "4px",
            marginRight: "8px",
            paddingTop: "18px",
          }}
        >
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex h-[12px] items-center text-[10px] text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="relative" style={{ width: totalWeeks * 16 }}>
            <div className="flex mb-1">
              {monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="text-[10px] text-muted-foreground"
                  style={{
                    position: "absolute",
                    left: m.index * 16,
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div
              className="grid gap-[4px]"
              style={{
                gridTemplateColumns: `repeat(${totalWeeks}, 12px)`,
                gridTemplateRows: `repeat(7, 12px)`,
                gridAutoFlow: "column",
              }}
            >
              {cells.map((cell, i) => (
                <div
                  key={i}
                  title={`${cell.date}: ${cell.count} plays`}
                  className={`w-[12px] h-[12px] rounded-sm ${getColor(cell.count, maxCount)}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <div className="h-3 w-3 rounded-sm bg-emerald-400/25" />
        <div className="h-3 w-3 rounded-sm bg-emerald-400/50" />
        <div className="h-3 w-3 rounded-sm bg-emerald-400/75" />
        <div className="h-3 w-3 rounded-sm bg-emerald-400" />
        <span>More</span>
      </div>
    </div>
  )
}
