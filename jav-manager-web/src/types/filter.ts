import type { MovieViewModel } from "@/types/movie"

export interface FilterRequest {
  searchTerm: string
  actors: string[]
  genres: string[]
  tags: string[]
  directors: string[]
  studios: string[]
  yearFrom: number | null
  yearTo: number | null
  heightFrom: number | null
  heightTo: number | null
  cups: string[]
  ageFrom: number | null
  ageTo: number | null
  ratingFrom: number | null
  playedMin: number | null
  playedMax: number | null
  favoriteOnly: boolean
  isAndOperator: boolean
  sortBy: string
  sortOrder: string
  page: number
  pageSize: number
}

export interface FilterResponse {
  totalCount: number
  page: number
  pageSize: number
  items: MovieViewModel[]
}
