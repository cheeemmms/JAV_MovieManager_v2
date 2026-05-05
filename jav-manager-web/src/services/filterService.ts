import { fetchJson } from "./api"
import type { FilterRequest, FilterResponse } from "@/types/filter"
import type { MovieViewModel } from "@/types/movie"

export async function fetchFilterOptions(): Promise<{
  genres: string[]
  tags: string[]
  directors: string[]
  studios: string[]
  actors: string[]
}> {
  const [genres, tags, directors, studios, actors] = await Promise.all([
    fetchJson<string[]>("/genres"),
    fetchJson<string[]>("/tags"),
    fetchJson<string[]>("/directors"),
    fetchJson<string[]>("/studios"),
    fetchJson<string[]>("/actors/local"),
  ])
  return { genres, tags, directors, studios, actors }
}

export async function fetchFilteredMovies(
  request: FilterRequest
): Promise<FilterResponse> {
  return fetchJson<FilterResponse>("/movies/filter", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export async function fetchActors(search: string): Promise<{ id: number; name: string }[]> {
  return fetchJson(`/actors?search=${encodeURIComponent(search)}`)
}

export { type MovieViewModel }
