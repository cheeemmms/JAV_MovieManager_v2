import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Play, Heart, Star } from "lucide-react"
import { BlurhashImage } from "./BlurhashImage"
import { API_BASE } from "@/lib/constants"
import type { MovieViewModel } from "@/types/movie"

interface MovieCardProps {
  movie: MovieViewModel
  index?: number
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const navigate = useNavigate()

  const posterUrl = movie.posterFileLocation
    ? `${API_BASE}/image/poster/${movie.imdbId}`
    : ""

  const handleClick = () => {
    navigate(`/movie/${movie.imdbId}`)
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/play/${movie.imdbId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <BlurhashImage
          src={posterUrl}
          alt={movie.title}
          className="h-full w-full"
          zoomable
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {movie.progress > 0 && movie.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${movie.progress}%` }}
            />
          </div>
        )}

        {movie.favorite && (
          <div className="absolute top-2 right-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500 drop-shadow" />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handlePlay}
        >
          <div className="rounded-full bg-white/90 p-3 shadow-lg">
            <Play className="h-6 w-6 fill-black text-black" />
          </div>
        </motion.button>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm font-medium text-white line-clamp-2">
            {movie.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
            <span>{movie.imdbId}</span>
            {movie.year > 0 && <span>· {movie.year}</span>}
            {movie.rating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {movie.rating.toFixed(1)}
              </span>
            )}
          </div>
          {movie.actors.length > 0 && (
            <p className="mt-1 text-xs text-white/50 line-clamp-1">
              {movie.actors.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
