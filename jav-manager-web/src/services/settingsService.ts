import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchJson } from "./api"

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchJson<Record<string, string>>("/settings"),
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Record<string, string>) =>
      fetchJson<Record<string, string>>("/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}

export function useTriggerScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      directory: string
      dateRange: number
      scrapeActorInfo: boolean
      forceUpdate: boolean
    }) =>
      fetchJson<{ scanned: number; total: number }>("/movies/scan", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movies"] })
      qc.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}

export function useGetSetting(key: string) {
  return useQuery({
    queryKey: ["settings", key],
    queryFn: () => fetchJson<string>(`/settings/${key}`),
    enabled: !!key,
  })
}
