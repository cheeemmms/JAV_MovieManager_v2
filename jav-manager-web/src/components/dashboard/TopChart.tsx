import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { StatsResponse } from "@/types/stats"

interface TopChartProps {
  stats: StatsResponse
}

type Tab = "movies" | "actors" | "genres" | "studios"

export function TopChart({ stats }: TopChartProps) {
  const [tab, setTab] = useState<Tab>("actors")

  const dataMap: Record<Tab, { name: string; count: number }[]> = {
    movies: stats.topMovies,
    actors: stats.topActors,
    genres: stats.topGenres,
    studios: stats.topStudios,
  }

  const tabLabels: Record<Tab, string> = {
    movies: "Top Movies",
    actors: "Top Actors",
    genres: "Top Genres",
    studios: "Top Studios",
  }

  const barColor: Record<Tab, string> = {
    movies: "#f472b6",
    actors: "#60a5fa",
    genres: "#34d399",
    studios: "#a78bfa",
  }

  const data = dataMap[tab]

  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-3 flex items-center gap-1 rounded-lg bg-muted p-1">
        {(Object.keys(tabLabels) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>
      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={100}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" fill={barColor[tab]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
