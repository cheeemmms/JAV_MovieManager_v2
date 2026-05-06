import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { VirtuosoGrid, type VirtuosoGridHandle } from "react-virtuoso"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useNavigationType } from "react-router-dom"
import { MovieCard } from "./MovieCard"
import { useFilterStore } from "@/stores/filterStore"
import { fetchJson } from "@/services/api"
import type { FilterResponse } from "@/types/filter"

const PAGE_SIZE = 30
const SCROLL_STORAGE_KEY = "jav-manager-grid-scroll"

async function fetchMovies(
  page: number,
  pageSize: number
): Promise<FilterResponse> {
  const filterStore = useFilterStore.getState()
  const body = filterStore.buildApiRequest(page, pageSize)
  return fetchJson("/movies/filter", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

function saveScrollPosition(index: number) {
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, String(index))
  } catch {
    // ignore
  }
}

function loadScrollPosition(): number | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY)
    if (raw === null) return null
    const index = Number(raw)
    return Number.isFinite(index) && index >= 0 ? index : null
  } catch {
    return null
  }
}

function clearScrollPosition() {
  try {
    sessionStorage.removeItem(SCROLL_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function MovieGrid() {
  const gridRef = useRef<VirtuosoGridHandle>(null)
  const scrollMovieIndexRef = useRef(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const navigationType = useNavigationType()

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

  const initialTopMostItemIndex = useMemo(() => {
    if (navigationType === "POP" && itemsPerRow > 0) {
      const saved = loadScrollPosition()
      if (saved && saved > 0) {
        return Math.floor(saved / itemsPerRow)
      }
    }
    return 0
  }, [navigationType, itemsPerRow])

  useEffect(() => {
    if (navigationType === "PUSH") {
      clearScrollPosition()
    }
  }, [navigationType])

  useEffect(() => {
    return () => {
      if (scrollMovieIndexRef.current > 0) {
        saveScrollPosition(scrollMovieIndexRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full max-w-[1920px] mx-auto px-4 py-4">
      {isLoading || containerWidth === 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-destructive">Failed to load movies</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Make sure the API server is running on port 5000
          </p>
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">No movies found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Scan your movie directory or adjust your filters
          </p>
        </div>
      ) : (
      <VirtuosoGrid
        ref={gridRef}
        style={{ height: "calc(100vh - 4rem)" }}
        totalCount={rows.length}
        data={rows}
        initialTopMostItemIndex={initialTopMostItemIndex}
        endReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        itemContent={(_, row) => {
          const firstMovie = row[0]
          const movieIndex = movies.indexOf(firstMovie)
          if (movieIndex >= 0) {
            scrollMovieIndexRef.current = movieIndex
          }

          return (
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
          )
        }}
        components={{
          Footer: () =>
            isFetchingNextPage ? (
              <div className="flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : null,
        }}
      />
      )}
    </div>
  )
}
