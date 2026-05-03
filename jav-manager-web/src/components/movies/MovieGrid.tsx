import { useCallback, useMemo, useRef, useState } from "react"
import { VirtuosoGrid, type VirtuosoGridHandle } from "react-virtuoso"
import { useInfiniteQuery } from "@tanstack/react-query"
import { MovieCard } from "./MovieCard"
import { useFilterStore } from "@/stores/filterStore"
import { API_BASE } from "@/lib/constants"
import type { FilterResponse } from "@/types/filter"

const PAGE_SIZE = 30

async function fetchMovies(
  page: number,
  pageSize: number
): Promise<FilterResponse> {
  const filterStore = useFilterStore.getState()
  const body = filterStore.buildApiRequest(page, pageSize)
  const res = await fetch(`${API_BASE}/movies/filter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function MovieGrid() {
  const gridRef = useRef<VirtuosoGridHandle>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainerWidth(node.clientWidth)
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
        }
      })
      observer.observe(node)
    }
  }, [])

  const itemsPerRow = useMemo(() => {
    if (containerWidth < 500) return 2
    if (containerWidth < 700) return 3
    if (containerWidth < 960) return 4
    if (containerWidth < 1200) return 5
    return 6
  }, [containerWidth])

  const filterKey = useFilterStore((s) =>
    JSON.stringify({
      searchTerm: s.searchTerm,
      actors: s.actors,
      genres: s.genres,
      tags: s.tags,
      directors: s.directors,
      studios: s.studios,
      yearFrom: s.yearFrom,
      yearTo: s.yearTo,
      cups: s.cups,
      ratingFrom: s.ratingFrom,
      playedMin: s.playedMin,
      playedMax: s.playedMax,
      favoriteOnly: s.favoriteOnly,
      sortBy: s.sortBy,
      sortOrder: s.sortOrder,
    })
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["movies", "grid", filterKey],
    queryFn: ({ pageParam }) => fetchMovies(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page * lastPage.pageSize >= lastPage.totalCount) return undefined
      return lastPage.page + 1
    },
    staleTime: 30_000,
  })

  const movies = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  )

  const rows = useMemo(() => {
    const result: (typeof movies)[] = []
    for (let i = 0; i < movies.length; i += itemsPerRow) {
      result.push(movies.slice(i, i + itemsPerRow))
    }
    return result
  }, [movies, itemsPerRow])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-destructive">Failed to load movies</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Make sure the API server is running on port 5000
          </p>
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No movies found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Scan your movie directory or adjust your filters
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full max-w-[1920px] mx-auto px-4 py-4">
      <VirtuosoGrid
        ref={gridRef}
        style={{ height: "calc(100vh - 4rem)" }}
        totalCount={rows.length}
        data={rows}
        endReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        itemContent={(_, row) => (
          <div
            className="grid gap-4 pb-4"
            style={{
              gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`,
            }}
          >
            {row.map((movie, i) => (
              <MovieCard key={movie.imdbId} movie={movie} index={i} />
            ))}
          </div>
        )}
        components={{
          Footer: () =>
            isFetchingNextPage ? (
              <div className="flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : null,
        }}
      />
    </div>
  )
}
