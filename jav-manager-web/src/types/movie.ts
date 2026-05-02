export interface Movie {
  imdbId: string
  title: string
  plot: string
  year: number
  runtime: number
  director: string
  studio: string
  posterFileLocation: string
  fanArtLocation: string
  movieLocation: string
  dateAdded: string
  releaseDate: string
  playedCount: number
  lastPlayedAt: string | null
  progress: number
  rating: number
  favorite: boolean
  actors: string[]
  genres: string[]
  tags: string[]
}

export interface MovieViewModel {
  imdbId: string
  title: string
  director: string
  studio: string
  posterFileLocation: string
  fanArtLocation: string
  movieLocation: string
  dateAdded: string
  year: number
  runtime: number
  playedCount: number
  progress: number
  rating: number
  favorite: boolean
  actors: string[]
  genres: string[]
  tags: string[]
}
