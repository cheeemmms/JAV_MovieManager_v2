import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { API_BASE } from "@/lib/constants"

interface SearchResult {
  imdbId: string
  title: string
  director: string
  year: number
}

async function searchMovies(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return []
  const res = await fetch(`${API_BASE}/movies/search?term=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

interface SearchBarProps {
  externalOpen?: boolean
  onExternalOpenChange?: (open: boolean) => void
}

export function SearchBar({ externalOpen, onExternalOpenChange }: SearchBarProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onExternalOpenChange ?? setInternalOpen

  const { data: results = [] } = useQuery({
    queryKey: ["movies", "search", query],
    queryFn: () => searchMovies(query),
    enabled: query.length > 1,
    staleTime: 30_000,
  })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        )
          return
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  const handleSelect = useCallback(
    (imdbId: string) => {
      setOpen(false)
      setQuery("")
      navigate(`/movie/${imdbId}`)
    },
    [navigate, setOpen]
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search movies by title or code..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Movies">
            {results.map((movie) => (
              <CommandItem
                key={movie.imdbId}
                onSelect={() => handleSelect(movie.imdbId)}
                className="flex flex-col items-start"
              >
                <span className="font-medium">{movie.imdbId}</span>
                <span className="text-sm text-muted-foreground">{movie.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
