import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
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

type DimTab = "genres" | "tags" | "directors" | "studios"

const DIM_TABS: { key: DimTab; label: string }[] = [
  { key: "genres", label: "Genres" },
  { key: "tags", label: "Tags" },
  { key: "directors", label: "Directors" },
  { key: "studios", label: "Studios" },
]

const MAX_VISIBLE_OPTIONS = 12

interface FilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SectionHeader({
  label,
  expanded,
  onToggle,
  badge,
}: {
  label: string
  expanded: boolean
  onToggle: () => void
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
    >
      <span className="flex items-center gap-2">
        {label}
        {badge && (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {badge}
          </span>
        )}
      </span>
      <ChevronDown
        className={cn(
          "h-4 w-4 transition-transform",
          expanded && "rotate-180"
        )}
      />
    </button>
  )
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

  const [sections, setSections] = useState({
    basic: true,
    actors: true,
    body: false,
    more: false,
    sort: false,
  })

  const [dimTab, setDimTab] = useState<DimTab>("genres")
  const [showAllDim, setShowAllDim] = useState(false)

  const { data: options } = useQuery({
    queryKey: ["filterOptions"],
    queryFn: fetchFilterOptions,
    staleTime: 300_000,
  })

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const dimOptions = {
    genres: options?.genres ?? [],
    tags: options?.tags ?? [],
    directors: options?.directors ?? [],
    studios: options?.studios ?? [],
  }

  const dimSelected = {
    genres,
    tags,
    directors,
    studios,
  }

  const activeOptions = dimOptions[dimTab]
  const activeSelected = dimSelected[dimTab]

  const visibleOptions = showAllDim
    ? activeOptions
    : activeOptions.slice(0, MAX_VISIBLE_OPTIONS)

  const handleDimSelect = (value: string) => {
    const current = [...activeSelected]
    if (current.includes(value)) {
      setFilter(dimTab, current.filter((v) => v !== value))
    } else {
      setFilter(dimTab, [...current, value])
    }
  }

  const handleApply = () => {
    onOpenChange(false)
  }

  const handleReset = () => {
    resetFilters()
    onOpenChange(false)
  }

  const totalSelected = actors.length + genres.length + tags.length + directors.length + studios.length

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="fixed right-0 top-0 h-full w-[480px] rounded-l-xl sm:max-w-[480px]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          <SectionHeader
            label="Basic"
            expanded={sections.basic}
            onToggle={() => toggleSection("basic")}
            badge={
              activeSelected.length > 0
                ? `${activeSelected.length}`
                : undefined
            }
          />

          {sections.basic && (
            <div className="space-y-2 pb-3">
              <div className="flex rounded-lg bg-muted p-1">
                {DIM_TABS.map((t) => {
                  const count = dimSelected[t.key].length
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setDimTab(t.key)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        dimTab === t.key
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t.label}
                      {count > 0 && (
                        <span className="ml-1 text-primary">({count})</span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {visibleOptions.map((opt) => {
                  const isSelected = activeSelected.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => handleDimSelect(opt)}
                    >
                      {opt}
                    </button>
                  )
                })}
                {activeOptions.length > MAX_VISIBLE_OPTIONS && !showAllDim && (
                  <button
                    type="button"
                    className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowAllDim(true)}
                  >
                    +{activeOptions.length - MAX_VISIBLE_OPTIONS} more
                  </button>
                )}
              </div>
            </div>
          )}

          <Separator />

          <SectionHeader
            label="Actors"
            expanded={sections.actors}
            onToggle={() => toggleSection("actors")}
            badge={actors.length > 0 ? `${actors.length}` : undefined}
          />

          {sections.actors && (
            <div className="pb-3">
              <ActorSearch
                selected={actors}
                onChange={(v) => setFilter("actors", v)}
              />
            </div>
          )}

          <Separator />

          <SectionHeader
            label="Actor Body"
            expanded={sections.body}
            onToggle={() => toggleSection("body")}
          />

          {sections.body && (
            <div className="space-y-4 pb-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Height: {heightFrom ?? 140}cm – {heightTo ?? 180}cm
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
                            setFilter(
                              "cups",
                              cups.filter((c) => c !== cup)
                            )
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
                  Age: {ageFrom ?? 18} – {ageTo ?? 60}
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
            </div>
          )}

          <Separator />

          <SectionHeader
            label="More Filters"
            expanded={sections.more}
            onToggle={() => toggleSection("more")}
          />

          {sections.more && (
            <div className="space-y-4 pb-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Year: {yearFrom ?? 1980} – {yearTo ?? 2026}
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
                  Play Count: {playedMin ?? 0} – {playedMax ?? 50}
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
                <label
                  htmlFor="favoriteOnly"
                  className="text-sm font-medium"
                >
                  Favorites Only
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="andOperator"
                  checked={isAndOperator}
                  onCheckedChange={(v) =>
                    setFilter("isAndOperator", !!v)
                  }
                />
                <label
                  htmlFor="andOperator"
                  className="text-sm font-medium"
                >
                  Match all filters (AND)
                </label>
              </div>
            </div>
          )}

          <Separator />

          <SectionHeader
            label="Sort"
            expanded={sections.sort}
            onToggle={() => toggleSection("sort")}
          />

          {sections.sort && (
            <div className="space-y-1.5 pb-3">
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
                        setFilter(
                          "sortOrder",
                          sortOrder === "asc" ? "desc" : "asc"
                        )
                      } else {
                        setFilter("sortBy", opt.value)
                        setFilter("sortOrder", "desc")
                      }
                    }}
                  >
                    {opt.label}
                    {sortBy === opt.value &&
                      (sortOrder === "asc" ? " ↑" : " ↓")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />
          <SavedFilters className="py-2" />
        </div>

        <div className="border-t px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {totalSelected > 0
              ? `${totalSelected} filter${totalSelected > 1 ? "s" : ""} applied`
              : "No filters"}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
