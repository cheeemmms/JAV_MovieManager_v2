import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useActors } from "@/services/actorService"
import { useFilterStore } from "@/stores/filterStore"
import { API_BASE } from "@/lib/constants"

export function ActorGrid() {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const { data: actors, isLoading, isError } = useActors(search)

  const handleActorClick = (name: string) => {
    useFilterStore.getState().setFilter("actors", [name])
    navigate("/")
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Actors</h1>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search actors..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-destructive">Failed to load actors</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Make sure the API server is running
          </p>
        </div>
      )}

      {!isLoading && !isError && actors?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">No actors found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? "Try a different search term" : "Scan your movie directory to import actors"}
          </p>
        </div>
      )}

      {actors && actors.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {actors.map((actor) => (
            <div
              key={actor.name}
              className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleActorClick(actor.name)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={`${API_BASE}/images/actor/${encodeURIComponent(actor.name)}`}
                  alt={actor.name}
                  className="h-12 w-12 rounded-full object-cover bg-muted shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{actor.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                {actor.movieCount > 0 && (
                  <span className="rounded bg-muted px-1.5 py-0.5">
                    {actor.movieCount} movies
                  </span>
                )}
                {actor.cup && (
                  <span className="rounded bg-muted px-1.5 py-0.5">
                    {actor.cup}
                  </span>
                )}
                {actor.height && (
                  <span className="rounded bg-muted px-1.5 py-0.5">
                    {actor.height}
                  </span>
                )}
              </div>
              {actor.overall && (
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <span className="text-yellow-500 font-medium">
                    {actor.overall}
                  </span>
                </div>
              )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
