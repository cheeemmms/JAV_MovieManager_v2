import { create } from "zustand"

interface PlayerState {
  currentImdbId: string | null
  isPlaying: boolean
  progress: number
  setCurrent: (imdbId: string | null) => void
  setPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentImdbId: null,
  isPlaying: false,
  progress: 0,
  setCurrent: (imdbId) => set({ currentImdbId: imdbId, isPlaying: false, progress: 0 }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress) => set({ progress }),
}))
