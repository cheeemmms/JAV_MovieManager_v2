import { useQuery } from "@tanstack/react-query"
import { fetchJson } from "./api"
import type { StatsResponse } from "@/types/stats"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => fetchJson<StatsResponse>("/stats/dashboard"),
    staleTime: 120_000,
  })
}
