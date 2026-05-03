import { create } from "zustand"
import { API_BASE } from "@/lib/constants"

const STORAGE_KEY = "jav-manager-shuffle"

interface ShuffleState {
  ids: string[]
  index: number
  loading: boolean
  init: () => Promise<void>
  next: () => string | null
  reset: () => void
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadFromStorage(): { ids: string[]; index: number } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed.ids) && typeof parsed.index === "number") {
      return parsed
    }
  } catch {
    // ignore
  }
  return null
}

function saveToStorage(ids: string[], index: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ids, index }))
  } catch {
    // ignore
  }
}

export const useShuffleStore = create<ShuffleState>((set, get) => ({
  ids: [],
  index: 0,
  loading: false,

  init: async () => {
    const cached = loadFromStorage()
    if (cached && cached.ids.length > 0 && cached.index < cached.ids.length) {
      set({ ids: cached.ids, index: cached.index, loading: false })
      return
    }

    set({ loading: true })
    try {
      const res = await fetch(`${API_BASE}/movies?sortBy=DateAdded&sortOrder=desc`)
      if (!res.ok) throw new Error("Failed to fetch movies")
      const movies: { imdbId: string }[] = await res.json()
      const movieIds = movies.map((m) => m.imdbId)
      const shuffled = fisherYatesShuffle(movieIds)
      saveToStorage(shuffled, 0)
      set({ ids: shuffled, index: 0, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  next: () => {
    const { ids, index } = get()
    if (ids.length === 0) return null
    if (index >= ids.length) {
      const reshuffled = fisherYatesShuffle(ids)
      saveToStorage(reshuffled, 1)
      set({ ids: reshuffled, index: 1 })
      return reshuffled[0]
    }
    const id = ids[index]
    saveToStorage(ids, index + 1)
    set({ index: index + 1 })
    return id
  },

  reset: () => {
    sessionStorage.removeItem(STORAGE_KEY)
    set({ ids: [], index: 0, loading: false })
  },
}))
