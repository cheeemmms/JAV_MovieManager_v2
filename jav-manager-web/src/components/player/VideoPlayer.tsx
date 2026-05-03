import { useState, useCallback, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Heart, AlertTriangle } from "lucide-react"
import { DPlayerWrapper } from "./DPlayerWrapper"
import { useMovie, useToggleFavorite } from "@/services/movieService"
import { usePlayerStore } from "@/stores/playerStore"
import { API_BASE } from "@/lib/constants"
import { usePlaybackRecording } from "@/hooks/usePlaybackRecording"
import type DPlayer from "dplayer"

export function VideoPlayer() {
  const { imdbId } = useParams<{ imdbId: string }>()
  const navigate = useNavigate()
  const { data: movie, isLoading, isError } = useMovie(imdbId ?? "")
  const toggleFavorite = useToggleFavorite()
  const { setCurrent, setPlaying, setProgress } = usePlayerStore()
  const [dp, setDp] = useState<DPlayer | null>(null)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [hevcWarning, setHevcWarning] = useState(false)
  const progressRef = useRef(0)
  const hasCheckedHevcRef = useRef(false)

  const streamUrl = `${API_BASE}/stream/${imdbId}`
  const posterUrl = movie?.posterFileLocation
    ? `${API_BASE}/image/poster/${imdbId}`
    : ""

  const { startRecording, endRecording } = usePlaybackRecording(imdbId ?? "")

  useEffect(() => {
    if (imdbId) setCurrent(imdbId)
    return () => {
      setCurrent(null)
      setPlaying(false)
      setProgress(0)
    }
  }, [imdbId, setCurrent, setPlaying, setProgress])

  useEffect(() => {
    if (movie && movie.progress > 0 && movie.progress < 95) {
      setShowResumePrompt(true)
    }
  }, [movie])

  const checkHEVCSupport = useCallback(() => {
    if (hasCheckedHevcRef.current) return
    hasCheckedHevcRef.current = true
    const video = document.createElement("video")
    const supported = video.canPlayType('video/mp4; codecs="hvc1.1.6.L153.b0"') !== ""
      || video.canPlayType('video/mp4; codecs="hev1.1.6.L153.b0"') !== ""
    if (!supported) setHevcWarning(true)
  }, [])

  const handleReady = useCallback((player: DPlayer) => {
    setDp(player)
    checkHEVCSupport()
    startRecording()
  }, [checkHEVCSupport, startRecording])

  const handleResume = useCallback(() => {
    if (dp && movie) {
      const seekTime = (movie.progress / 100) * dp.video.duration
      dp.seek(seekTime)
      dp.play()
    }
    setShowResumePrompt(false)
  }, [dp, movie])

  const handleStartFromBeginning = useCallback(() => {
    setShowResumePrompt(false)
  }, [])

  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    const pct = duration > 0 ? (currentTime / duration) * 100 : 0
    progressRef.current = pct
    setProgress(pct)
  }, [setProgress])

  const handlePlay = useCallback(() => setPlaying(true), [setPlaying])
  const handlePause = useCallback(() => setPlaying(false), [setPlaying])

  const handleEnded = useCallback(() => {
    setPlaying(false)
    setProgress(100)
    endRecording(100)
  }, [setPlaying, setProgress, endRecording])

  const handleBack = useCallback(() => {
    endRecording(progressRef.current)
    navigate(-1)
  }, [navigate, endRecording])

  const handleToggleFavorite = useCallback(() => {
    if (imdbId) toggleFavorite.mutate(imdbId)
  }, [imdbId, toggleFavorite])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dp) return
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      switch (e.key) {
        case " ":
          e.preventDefault()
          dp.toggle()
          break
        case "ArrowLeft":
          e.preventDefault()
          dp.seek(Math.max(0, dp.video.currentTime - 10))
          break
        case "ArrowRight":
          e.preventDefault()
          dp.seek(dp.video.currentTime + 10)
          break
        case "f":
        case "F":
          e.preventDefault()
          dp.fullScreen.request("browser")
          break
        case "Escape":
          handleBack()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dp, handleBack])

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  if (isError || !movie) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg font-medium">Movie not found</p>
        <p className="text-white/50 text-sm">The requested movie could not be loaded</p>
        <button
          onClick={handleBack}
          className="mt-2 rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-30 rounded-full bg-black/50 p-2 text-white/80 hover:bg-black/70 hover:text-white transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="flex-1">
        <DPlayerWrapper
          videoUrl={streamUrl}
          posterUrl={posterUrl}
          autoplay={!showResumePrompt}
          onReady={handleReady}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        />
      </div>

      <AnimatePresence>
        {showResumePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/80"
          >
            <div className="rounded-lg border bg-card p-6 max-w-sm text-card-foreground shadow-lg">
              <p className="text-lg font-semibold">
                Resume from {Math.round(movie.progress)}%?
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You have saved progress for this movie
              </p>
              <div className="mt-5 flex gap-3 justify-end">
                <button
                  onClick={handleStartFromBeginning}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleResume}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Resume
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hevcWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-200 backdrop-blur">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span>H.265/HEVC not supported by this browser. Video playback may fail.</span>
              <button
                onClick={() => setHevcWarning(false)}
                className="ml-2 text-yellow-300 hover:text-yellow-100"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="shrink-0 bg-gradient-to-t from-black/95 to-transparent px-6 pb-6 pt-12">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {movie.title}
            </h1>
            <p className="mt-1 text-sm text-white/60">
              {movie.imdbId}
              {movie.year > 0 && ` · ${movie.year}`}
              {movie.runtime > 0 && ` · ${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}
              {movie.director && ` · ${movie.director}`}
            </p>
            {movie.actors.length > 0 && (
              <p className="mt-1 text-xs text-white/40 truncate">
                {movie.actors.slice(0, 5).join(", ")}
              </p>
            )}
          </div>
          <button
            onClick={handleToggleFavorite}
            className="shrink-0 rounded-full p-2 hover:bg-white/10 transition-colors"
            aria-label={movie.favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                movie.favorite
                  ? "fill-red-500 text-red-500"
                  : "text-white/70 hover:text-red-400"
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
