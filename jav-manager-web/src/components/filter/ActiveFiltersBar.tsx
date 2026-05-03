import { X } from "lucide-react"
import { useFilterStore } from "@/stores/filterStore"

interface ActiveFiltersBarProps {
  filterOpen: boolean
}

export function ActiveFiltersBar({ filterOpen }: ActiveFiltersBarProps) {
  const {
    actors,
    genres,
    tags,
    directors,
    studios,
    cups,
    setFilter,
  } = useFilterStore()

  if (filterOpen) return null

  const items: { key: string; label: string }[] = [
    ...actors.map((a) => ({ key: "actors", label: a })),
    ...genres.map((g) => ({ key: "genres", label: g })),
    ...tags.map((t) => ({ key: "tags", label: t })),
    ...directors.map((d) => ({ key: "directors", label: d })),
    ...studios.map((s) => ({ key: "studios", label: s })),
    ...cups.map((c) => ({ key: "cups", label: `${c} Cup` })),
  ]

  if (items.length === 0) return null

  const handleRemove = (key: string, label: string) => {
    const store = useFilterStore.getState()
    const current = store[key as keyof typeof store] as string[]
    setFilter(key, current.filter((v: string) => v !== label))
  }

  return (
    <div className="border-b px-4 py-2 flex flex-wrap items-center gap-1.5">
      {items.map((item) => (
        <span
          key={`${item.key}-${item.label}`}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
        >
          {item.label}
          <button
            onClick={() => handleRemove(item.key, item.label)}
            className="rounded-sm hover:bg-primary/20 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}
