import { create } from "zustand"
import type { FilterRequest } from "@/types/filter"

interface FilterState {
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
  setFilter: (key: string, value: unknown) => void
  resetFilters: () => void
  buildApiRequest: (page: number, pageSize: number) => FilterRequest
}

const defaultFilters = {
  searchTerm: "",
  actors: [],
  genres: [],
  tags: [],
  directors: [],
  studios: [],
  yearFrom: null,
  yearTo: null,
  heightFrom: null,
  heightTo: null,
  cups: [],
  ageFrom: null,
  ageTo: null,
  ratingFrom: null,
  playedMin: null,
  playedMax: null,
  favoriteOnly: false,
  isAndOperator: true,
  sortBy: "dateAdded",
  sortOrder: "desc",
}

export const useFilterStore = create<FilterState>((set, get) => ({
  ...defaultFilters,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(defaultFilters),
  buildApiRequest: (page, pageSize) => {
    const s = get()
    return {
      searchTerm: s.searchTerm,
      actors: s.actors,
      genres: s.genres,
      tags: s.tags,
      directors: s.directors,
      studios: s.studios,
      yearFrom: s.yearFrom,
      yearTo: s.yearTo,
      heightFrom: s.heightFrom,
      heightTo: s.heightTo,
      cups: s.cups,
      ageFrom: s.ageFrom,
      ageTo: s.ageTo,
      ratingFrom: s.ratingFrom,
      playedMin: s.playedMin,
      playedMax: s.playedMax,
      favoriteOnly: s.favoriteOnly,
      isAndOperator: s.isAndOperator,
      sortBy: s.sortBy,
      sortOrder: s.sortOrder,
      page,
      pageSize,
    }
  },
}))
