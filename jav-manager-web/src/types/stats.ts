export interface DashboardStats {
  totalMovies: number
  totalPlayCount: number
  totalWatchDuration: number
  totalActorsWatched: number
  favoriteCount: number
  topActors: TopItem[]
  topTags: TopItem[]
  recentTrend: TrendItem[]
}

export interface TopItem {
  name: string
  count: number
  duration: number
}

export interface TrendItem {
  date: string
  count: number
}

export interface HeatmapItem {
  date: string
  count: number
}

export interface MovieStats {
  imdbId: string
  totalPlays: number
  totalDuration: number
  averagePercentage: number
}
