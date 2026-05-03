import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "@/lib/constants"
import type { StatsResponse } from "@/types/stats"

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => fetchJson<StatsResponse>("/stats/dashboard"),
    staleTime: 120_000,
  })
}
