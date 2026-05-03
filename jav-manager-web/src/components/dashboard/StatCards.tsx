import { useEffect, useState } from "react"
import { Film, Users, Play, Star } from "lucide-react"
import type { StatsResponse } from "@/types/stats"

interface StatCardsProps {
  stats: StatsResponse
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) return
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(increment * step, value)
      setDisplay(Math.round(current))
      if (step >= steps) {
        setDisplay(value)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <span>{display.toLocaleString()}{suffix}</span>
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      label: "Total Movies",
      value: stats.totalMovies,
      icon: Film,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Plays",
      value: stats.totalPlays,
      icon: Play,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Actors",
      value: stats.totalActors,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Avg Rating",
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      render: () => (
        <span>{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}</span>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`rounded-md p-1.5 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            {card.label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">
            {card.render ? (
              card.render()
            ) : (
              <AnimatedNumber value={card.value as number} />
            )}
          </div>
          {card.label === "Total Plays" && stats.totalPlayTime > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDuration(stats.totalPlayTime)} total
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
