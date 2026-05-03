import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { StatsResponse } from "@/types/stats"

interface TrendChartProps {
  stats: StatsResponse
}

export function TrendChart({ stats }: TrendChartProps) {
  if (stats.trend.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Daily Plays (30d)</h3>
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          No play data yet
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Daily Plays (30d)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={stats.trend} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#60a5fa" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
