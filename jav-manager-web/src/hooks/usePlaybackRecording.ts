import { useRef, useCallback, useEffect } from "react"
import { fetchJson } from "@/services/api"

const SAVE_INTERVAL = 30000

export function usePlaybackRecording(movieId: string) {
  const historyIdRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const movieIdRef = useRef(movieId)

  useEffect(() => {
    movieIdRef.current = movieId
  }, [movieId])

  const saveProgress = useCallback(async (percentage: number) => {
    if (!historyIdRef.current) return
    const now = Date.now()
    const duration = Math.floor((now - startTimeRef.current) / 1000)
    try {
      await fetchJson(`/history/${historyIdRef.current}`, {
        method: "PATCH",
        body: JSON.stringify({ duration, percentage }),
      })
    } catch {
      // Recording is non-critical
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!movieIdRef.current) return
    startTimeRef.current = Date.now()
    try {
      const data = await fetchJson<{ id: number }>("/history", {
        method: "POST",
        body: JSON.stringify({ movieId: movieIdRef.current, duration: 0, percentage: 0 }),
      })
      historyIdRef.current = data.id

      intervalRef.current = setInterval(() => {
        saveProgress(0)
      }, SAVE_INTERVAL)
    } catch {
      // Recording is non-critical
    }
  }, [saveProgress])

  const endRecording = useCallback(async (percentage: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    await saveProgress(percentage)
    historyIdRef.current = null
  }, [saveProgress])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { startRecording, endRecording }
}
