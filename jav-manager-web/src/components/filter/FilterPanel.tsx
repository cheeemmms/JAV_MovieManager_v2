import { useQuery } from "@tanstack/react-query"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { MultiSelect } from "./MultiSelect"
import { ActorSearch } from "./ActorSearch"
import { SavedFilters } from "./SavedFilters"
import { useFilterStore } from "@/stores/filterStore"
import { API_BASE } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface FilterOptions {
  genres: string[]
  tags: string[]
  directors: string[]
  studios: string[]
}

async function fetchFilterOptions(): Promise<FilterOptions> {
  const [genres, tags, directors, studios] = await Promise.all([
    fetch(`${API_BASE}/genres`).then((r) => r.json()),
    fetch(`${API_BASE}/tags`).then((r) => r.json()),
    fetch(`${API_BASE}/directors`).then((r) => r.json()),
    fetch(`${API_BASE}/studios`).then((r) => r.json()),
  ])
  return { genres, tags, directors, studios }
}

const CUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]

const SORT_OPTIONS = [
  { value: "dateAdded", label: "Date Added" },
  { value: "year", label: "Year" },
  { value: "title", label: "Title" },
  { value: "rating", label: "Rating" },
  { value: "playedCount", label: "Play Count" },
]

interface FilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterPanel({ open, onOpenChange }: FilterPanelProps) {
  const {
    actors,
    genres,
    tags,
    directors,
    studios,
    yearFrom,
    yearTo,
    heightFrom,
    heightTo,
    cups,
    ageFrom,
    ageTo,
    ratingFrom,
    playedMin,
    playedMax,
    favoriteOnly,
    isAndOperator,
    sortBy,
    sortOrder,
    setFilter,
    resetFilters,
  } = useFilterStore()

  const { data: options } = useQuery({
    queryKey: ["filterOptions"],
    queryFn: fetchFilterOptions,
    staleTime: 300_000,
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed right-0 top-0 h-full w-[400px] rounded-l-xl sm:max-w-[400px]">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow down your movie collection
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          <ActorSearch
            selected={actors}
            onChange={(v) => setFilter("actors", v)}
          />

          <MultiSelect
            label="Genres"
            options={options?.genres ?? []}
            selected={genres}
            onChange={(v) => setFilter("genres", v)}
          />

          <MultiSelect
            label="Tags"
            options={options?.tags ?? []}
            selected={tags}
            onChange={(v) => setFilter("tags", v)}
          />

          <MultiSelect
            label="Directors"
            options={options?.directors ?? []}
            selected={directors}
            onChange={(v) => setFilter("directors", v)}
          />

          <MultiSelect
            label="Studios"
            options={options?.studios ?? []}
            selected={studios}
            onChange={(v) => setFilter("studios", v)}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Year Range: {yearFrom ?? 1980} - {yearTo ?? 2026}
            </label>
            <Slider
              min={1980}
              max={2026}
              step={1}
              value={[yearFrom ?? 1980, yearTo ?? 2026]}
              onValueChange={([from, to]) => {
                setFilter("yearFrom", from)
                setFilter("yearTo", to)
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Height Range: {heightFrom ?? 140}cm - {heightTo ?? 180}cm
            </label>
            <Slider
              min={140}
              max={180}
              step={1}
              value={[heightFrom ?? 140, heightTo ?? 180]}
              onValueChange={([from, to]) => {
                setFilter("heightFrom", from)
                setFilter("heightTo", to)
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cup Size</label>
            <div className="flex flex-wrap gap-1.5">
              {CUPS.map((cup) => {
                const isSelected = cups.includes(cup)
                return (
                  <button
                    key={cup}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => {
                      if (isSelected) {
                        setFilter("cups", cups.filter((c) => c !== cup))
                      } else {
                        setFilter("cups", [...cups, cup])
                      }
                    }}
                  >
                    {cup}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Age Range: {ageFrom ?? 18} - {ageTo ?? 60}
            </label>
            <Slider
              min={18}
              max={60}
              step={1}
              value={[ageFrom ?? 18, ageTo ?? 60]}
              onValueChange={([from, to]) => {
                setFilter("ageFrom", from)
                setFilter("ageTo", to)
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Min Rating: {ratingFrom ?? 0}
            </label>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={[ratingFrom ?? 0]}
              onValueChange={([v]) => setFilter("ratingFrom", v)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Play Count: {playedMin ?? 0} - {playedMax ?? 50}
            </label>
            <Slider
              min={0}
              max={50}
              step={1}
              value={[playedMin ?? 0, playedMax ?? 50]}
              onValueChange={([from, to]) => {
                setFilter("playedMin", from)
                setFilter("playedMax", to)
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="favoriteOnly"
              checked={favoriteOnly}
              onCheckedChange={(v) => setFilter("favoriteOnly", !!v)}
            />
            <label htmlFor="favoriteOnly" className="text-sm font-medium">
              Favorites Only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="andOperator"
              checked={isAndOperator}
              onCheckedChange={(v) => setFilter("isAndOperator", !!v)}
            />
            <label htmlFor="andOperator" className="text-sm font-medium">
              Match all filters (AND)
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sort By</label>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
                    sortBy === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => {
                    if (sortBy === opt.value) {
                      setFilter("sortOrder", sortOrder === "asc" ? "desc" : "asc")
                    } else {
                      setFilter("sortBy", opt.value)
                      setFilter("sortOrder", "desc")
                    }
                  }}
                >
                  {opt.label}
                  {sortBy === opt.value && (sortOrder === "asc" ? " ↑" : " ↓")}
                </button>
              ))}
            </div>
          </div>

          <Separator />
          <SavedFilters />
        </div>

        <DrawerFooter className="border-t">
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
