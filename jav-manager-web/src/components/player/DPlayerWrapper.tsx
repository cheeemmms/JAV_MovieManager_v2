import { useEffect, useRef } from "react"
import DPlayer from "dplayer"

interface DPlayerWrapperProps {
  videoUrl: string
  posterUrl?: string
  autoplay?: boolean
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onReady?: (dp: DPlayer) => void
}

export function DPlayerWrapper({
  videoUrl,
  posterUrl,
  autoplay = true,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onReady,
}: DPlayerWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dpRef = useRef<DPlayer | null>(null)
  const callbacksRef = useRef({ onTimeUpdate, onPlay, onPause, onEnded, onReady })

  useEffect(() => {
    callbacksRef.current = { onTimeUpdate, onPlay, onPause, onEnded, onReady }
  })

  useEffect(() => {
    if (!containerRef.current) return

    const dp = new DPlayer({
      container: containerRef.current,
      autoplay,
      video: {
        url: videoUrl,
        pic: posterUrl,
      },
      danmaku: false,
      contextmenu: [],
      hotkey: true,
    })

    dpRef.current = dp
    callbacksRef.current.onReady?.(dp)

    const handleTimeUpdate = () => {
      callbacksRef.current.onTimeUpdate?.(dp.video.currentTime, dp.video.duration)
    }
    const handlePlay = () => callbacksRef.current.onPlay?.()
    const handlePause = () => callbacksRef.current.onPause?.()
    const handleEnded = () => callbacksRef.current.onEnded?.()

    dp.on("timeupdate", handleTimeUpdate)
    dp.on("play", handlePlay)
    dp.on("pause", handlePause)
    dp.on("ended", handleEnded)

    return () => {
      dp.off("timeupdate", handleTimeUpdate)
      dp.off("play", handlePlay)
      dp.off("pause", handlePause)
      dp.off("ended", handleEnded)
      dp.destroy()
      dpRef.current = null
    }
  }, [videoUrl, posterUrl, autoplay])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  )
}
