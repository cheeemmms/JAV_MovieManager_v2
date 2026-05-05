import { useQuery } from "@tanstack/react-query"
import { fetchJson } from "./api"

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
