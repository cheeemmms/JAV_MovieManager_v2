import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchJson } from "./api"
import type { Movie, MovieViewModel } from "@/types/movie"
import type { FilterRequest, FilterResponse } from "@/types/filter"

export function useMovies(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["movies", page, pageSize],
    queryFn: () => fetchJson<MovieViewModel[]>(`/movies?page=${page}&pageSize=${pageSize}`),
  })
}

export function useFilterMovies(request: FilterRequest) {
  return useQuery({
    queryKey: ["movies", "filter", request],
    queryFn: () =>
      fetchJson<FilterResponse>("/movies/filter", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    enabled: false,
  })
}

export function useMovie(imdbId: string) {
  return useQuery({
    queryKey: ["movies", imdbId],
    queryFn: () => fetchJson<Movie>(`/movies/${imdbId}`),
    enabled: !!imdbId,
  })
}

export function useRecentMovies() {
  return useQuery({
    queryKey: ["movies", "recent"],
    queryFn: () => fetchJson<MovieViewModel[]>("/movies/recent"),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (imdbId: string) =>
      fetchJson<{ favorite: boolean }>(`/movies/favorite/${imdbId}`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movies"] })
    },
  })
}

export function useTriggerScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => fetchJson<{ message: string }>("/movies/scan", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movies"] })
    },
  })
}
