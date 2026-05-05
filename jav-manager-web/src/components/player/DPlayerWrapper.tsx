import { useEffect, useRef } from "react"
import DPlayer from "dplayer"
import type { DPlayerOptions } from "dplayer"

interface DPlayerWrapperProps {
  videoUrl: string
  posterUrl?: string
  subtitleUrl?: string
  autoplay?: boolean
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onReady?: (dp: DPlayer) => void
  onError?: (error: string) => void
}

export function DPlayerWrapper({
  videoUrl,
  posterUrl,
  subtitleUrl,
  autoplay = false,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onReady,
  onError,
}: DPlayerWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dpRef = useRef<DPlayer | null>(null)
  const callbacksRef = useRef({ onTimeUpdate, onPlay, onPause, onEnded, onReady, onError })

  useEffect(() => {
    callbacksRef.current = { onTimeUpdate, onPlay, onPause, onEnded, onReady, onError }
  })

  useEffect(() => {
    if (!containerRef.current) return

    const options: DPlayerOptions = {
      container: containerRef.current,
      autoplay,
      video: {
        url: videoUrl,
        pic: posterUrl,
      },
      danmaku: false,
      contextmenu: [],
      hotkey: true,
    }

    if (subtitleUrl) {
      options.subtitle = {
        url: subtitleUrl,
        type: "webvtt",
      }
    }

    const dp = new DPlayer(options)

    dpRef.current = dp
    callbacksRef.current.onReady?.(dp)

    const handleTimeUpdate = () => {
      callbacksRef.current.onTimeUpdate?.(dp.video.currentTime, dp.video.duration)
    }
    const handlePlay = () => callbacksRef.current.onPlay?.()
    const handlePause = () => callbacksRef.current.onPause?.()
    const handleEnded = () => callbacksRef.current.onEnded?.()
    const handleError = () => {
      const video = dp.video as HTMLVideoElement
      const msg = video.error
        ? `Video error: ${video.error.message || "unknown"} (code ${video.error.code})`
        : "Video failed to load"
      callbacksRef.current.onError?.(msg)
    }

    dp.on("timeupdate", handleTimeUpdate)
    dp.on("play", handlePlay)
    dp.on("pause", handlePause)
    dp.on("ended", handleEnded)

    const videoEl = dp.video as HTMLVideoElement
    videoEl.setAttribute("playsinline", "")
    videoEl.setAttribute("webkit-playsinline", "")
    videoEl.addEventListener("error", handleError)

    return () => {
      videoEl.removeEventListener("error", handleError)
      try {
        dp.destroy()
      } catch {
        // ignore
      }
      dpRef.current = null
    }
  }, [videoUrl, posterUrl, subtitleUrl, autoplay])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  )
}
