import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, X } from "lucide-react"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { fetchJson } from "@/services/api"
import { cn } from "@/lib/utils"

interface Actor {
  id: number
  name: string
}

async function searchActors(query: string): Promise<Actor[]> {
  if (!query || query.length < 1) return []
  try {
    return await fetchJson<Actor[]>(`/actors?search=${encodeURIComponent(query)}`)
  } catch {
    return []
  }
}

interface ActorSearchProps {
  selected: string[]
  onChange: (actors: string[]) => void
}

export function ActorSearch({ selected, onChange }: ActorSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const { data: actors = [] } = useQuery({
    queryKey: ["actors", "search", query],
    queryFn: () => searchActors(query),
    enabled: query.length > 0,
    staleTime: 30_000,
  })

  const toggle = useCallback(
    (name: string) => {
      if (selected.includes(name)) {
        onChange(selected.filter((s) => s !== name))
      } else {
        onChange([...selected, name])
      }
    },
    [selected, onChange]
  )

  const remove = useCallback(
    (name: string) => {
      onChange(selected.filter((s) => s !== name))
    },
    [selected, onChange]
  )

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Actors</label>
      <Command className="relative">
        <CommandInput
          placeholder="Search actors..."
          value={query}
          onValueChange={setQuery}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && query.length > 0 && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            <CommandList>
              <CommandEmpty>No actors found</CommandEmpty>
              <CommandGroup heading="Results">
                {actors.map((actor) => {
                  const isSelected = selected.includes(actor.name)
                  return (
                    <CommandItem
                      key={actor.id}
                      onSelect={() => toggle(actor.name)}
                      className="gap-2"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {actor.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs"
            >
              {name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => remove(name)}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
