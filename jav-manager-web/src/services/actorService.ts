import { useQuery } from "@tanstack/react-query"
import { API_BASE } from "@/lib/constants"

export interface ActorViewModel {
  name: string
  dateofBirth: string
  height: string
  cup: string
  bust: string
  waist: string
  hips: string
  looks: string
  body: string
  sexAppeal: string
  overall: string
  lastUpdated: string
  favorite: boolean
  movieCount: number
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function useActors(search?: string) {
  return useQuery({
    queryKey: ["actors", search ?? ""],
    queryFn: () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : ""
      return fetchJson<ActorViewModel[]>(`/actors${params}`)
    },
    staleTime: 60_000,
  })
}
