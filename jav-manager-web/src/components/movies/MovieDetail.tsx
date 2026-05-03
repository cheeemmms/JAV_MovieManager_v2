import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Play, Heart, Star, Clock, Calendar, Film, User, Building2, Tag, Hash } from "lucide-react"
import { toast } from "sonner"
import { BlurhashImage } from "./BlurhashImage"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMovie, useToggleFavorite } from "@/services/movieService"
import { useFilterStore } from "@/stores/filterStore"
import { API_BASE } from "@/lib/constants"

export function MovieDetail() {
  const { imdbId } = useParams<{ imdbId: string }>()
  const navigate = useNavigate()
  const { data: movie, isLoading, isError } = useMovie(imdbId || "")
  const toggleFavorite = useToggleFavorite()

  const posterUrl = movie?.posterFileLocation
    ? `${API_BASE}/image/poster/${movie.imdbId}`
    : ""

  const fanartUrl = movie?.fanArtLocation
    ? `${API_BASE}/image/fanart/${movie.imdbId}`
    : ""

  const handlePlay = () => {
    if (imdbId) navigate(`/play/${imdbId}`)
  }

  const handleBack = () => {
    navigate("/")
  }

  const handleToggleFavorite = () => {
    if (imdbId) {
      toggleFavorite.mutate(imdbId, {
        onSuccess: (data) => {
          toast.success(
            data.favorite ? "Added to favorites" : "Removed from favorites"
          )
        },
        onError: () => {
          toast.error("Failed to update favorites")
        },
      })
    }
  }

  const handleFilterClick = (key: string, value: string) => {
    useFilterStore.getState().setFilter(key, [value])
    navigate("/")
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isError || !movie) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Movie not found</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-background overflow-y-auto"
    >
      <div className="relative">
        {fanartUrl && (
          <div className="absolute inset-0 h-80 overflow-hidden">
            <img
              src={fanartUrl}
              alt=""
              className="w-full h-full object-cover opacity-30 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
          </div>
        )}

        <div className="relative">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </button>

            <div className="flex flex-col md:flex-row gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="shrink-0 w-48 mx-auto md:mx-0"
              >
                <BlurhashImage
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full aspect-[2/3] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                />
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 min-w-[140px]" size="lg" onClick={handlePlay}>
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Play
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={toggleFavorite.isPending}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        movie.favorite
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm text-muted-foreground font-mono tracking-wide">
                  {movie.imdbId}
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight">{movie.title}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {movie.year > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {movie.year}
                    </span>
                  )}
                  {movie.runtime > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </span>
                  )}
                  {movie.rating > 0 && (
                    <span className="inline-flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      {movie.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Film className="h-4 w-4" />
                    {movie.playedCount} plays
                  </span>
                </div>

                {movie.progress > 0 && movie.progress < 100 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round(movie.progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${movie.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {movie.plot && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Synopsis
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                      {movie.plot}
                    </p>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {movie.director && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Director</span>
                        <p
                          className="font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleFilterClick("directors", movie.director!)}
                        >
                          {movie.director}
                        </p>
                      </div>
                    </div>
                  )}
                  {movie.studio && (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Studio</span>
                        <p
                          className="font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleFilterClick("studios", movie.studio!)}
                        >
                          {movie.studio}
                        </p>
                      </div>
                    </div>
                  )}
                  {movie.dateAdded && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Date Added</span>
                        <p className="font-medium">{movie.dateAdded}</p>
                      </div>
                    </div>
                  )}
                  {movie.releaseDate && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Release Date</span>
                        <p className="font-medium">{movie.releaseDate}</p>
                      </div>
                    </div>
                  )}
                  {movie.lastPlayedAt && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Last Played</span>
                        <p className="font-medium">{new Date(movie.lastPlayedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                {(movie.actors.length > 0 || movie.genres.length > 0 || movie.tags.length > 0) && (
                  <>
                    <Separator className="my-6" />

                    {movie.actors.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Actors
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {movie.actors.map((actor) => (
                            <span
                              key={actor}
                              className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium cursor-pointer hover:ring-2 hover:ring-primary transition-shadow"
                              onClick={() => handleFilterClick("actors", actor)}
                            >
                              {actor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-6">
                      {movie.genres.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <Hash className="h-3.5 w-3.5" />
                            Genres
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {movie.genres.map((genre) => (
                              <span
                                key={genre}
                                className="inline-flex items-center rounded-md bg-accent/50 px-2.5 py-0.5 text-xs font-medium text-foreground/80 cursor-pointer hover:bg-accent hover:text-foreground hover:-translate-y-0.5 transition-all"
                                onClick={() => handleFilterClick("genres", genre)}
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {movie.tags.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            Tags
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {movie.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-md bg-accent/50 px-2.5 py-0.5 text-xs font-medium text-foreground/80 cursor-pointer hover:bg-accent hover:text-foreground hover:-translate-y-0.5 transition-all"
                                onClick={() => handleFilterClick("tags", tag)}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
