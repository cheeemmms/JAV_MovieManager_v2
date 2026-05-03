import { Link, useNavigate } from "react-router-dom"
import { Search, SlidersHorizontal, Sun, Moon, Monitor, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useThemeStore, type Theme } from "@/stores/themeStore"
import { useFilterStore } from "@/stores/filterStore"
import { useShuffleStore } from "@/stores/shuffleStore"
import { useLayout } from "./AppLayout"

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
}

export function Navbar() {
  const { openFilter, openSearch } = useLayout()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const ThemeIcon = themeIcons[theme]

  const handleShuffle = async () => {
    const { init, next, loading } = useShuffleStore.getState()
    if (loading) return
    if (useShuffleStore.getState().ids.length === 0) {
      await init()
    }
    const id = next()
    if (id) {
      navigate(`/movie/${id}`)
    }
  }

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Link
          to="/"
          className="mr-6 font-bold text-lg"
          onClick={() => useFilterStore.getState().resetFilters()}
        >
          JAV Manager
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/">Movies</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/actors">Actors</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/settings">Settings</Link>
          </Button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-[200px] justify-start gap-2 text-muted-foreground"
            onClick={openSearch}
          >
            <Search className="h-4 w-4" />
            <span>Search movies...</span>
            <kbd className="ml-auto rounded border bg-muted px-1.5 text-xs">/</kbd>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Shuffle" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Filters" onClick={openFilter}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ThemeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(themeLabels) as Theme[]).map((t) => {
                const Icon = themeIcons[t]
                return (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => setTheme(t)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{themeLabels[t]}</span>
                    {theme === t && (
                      <span className="ml-auto text-xs text-muted-foreground">✓</span>
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
