export interface TopItem {
  name: string
  count: number
}

export interface TrendItem {
  date: string
  count: number
}

export interface HeatmapItem {
  month: string
  year: number
  count: number
}

export interface StatsResponse {
  totalMovies: number
  totalActors: number
  totalGenres: number
  totalPlayTime: number
  totalPlays: number
  averageRating: number
  topMovies: TopItem[]
  topActors: TopItem[]
  topGenres: TopItem[]
  topStudios: TopItem[]
  trend: TrendItem[]
  heatmap: HeatmapItem[]
}
