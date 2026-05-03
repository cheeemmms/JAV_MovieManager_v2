import { useState } from "react"
import { Save, Trash2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useFilterStore } from "@/stores/filterStore"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "jav-manager-saved-filters"

interface SavedFilter {
  name: string
  filters: Record<string, unknown>
}

function loadSavedFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(filters: SavedFilter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
}

interface SavedFiltersProps {
  className?: string
}

export function SavedFilters({ className }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(loadSavedFilters)
  const [saveName, setSaveName] = useState("")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const buildApiRequest = useFilterStore((s) => s.buildApiRequest)
  const setFilter = useFilterStore((s) => s.setFilter)
  const resetFilters = useFilterStore((s) => s.resetFilters)

  const handleSave = () => {
    if (!saveName.trim()) return
    const currentFilters = buildApiRequest(1, 30)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, pageSize, ...filterData } = currentFilters
    const updated = [
      ...savedFilters.filter((f) => f.name !== saveName.trim()),
      { name: saveName.trim(), filters: filterData },
    ]
    setSavedFilters(updated)
    saveToStorage(updated)
    setSaveName("")
    setSaveDialogOpen(false)
  }

  const handleLoad = (saved: SavedFilter) => {
    resetFilters()
    for (const [key, value] of Object.entries(saved.filters)) {
      setFilter(key, value)
    }
  }

  const handleDelete = (name: string) => {
    const updated = savedFilters.filter((f) => f.name !== name)
    setSavedFilters(updated)
    saveToStorage(updated)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Saved Filters</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setSaveDialogOpen(true)}
        >
          <Save className="h-3 w-3" />
          Save Current
        </Button>
      </div>

      {savedFilters.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No saved filters yet. Configure your filters and save them for quick access.
        </p>
      ) : (
        <div className="space-y-1">
          {savedFilters.map((saved) => (
            <div
              key={saved.name}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
            >
              <Bookmark className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <button
                type="button"
                className="flex-1 text-left text-sm"
                onClick={() => handleLoad(saved)}
              >
                {saved.name}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => handleDelete(saved.name)}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Give your current filter configuration a name to quickly access it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Filter name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!saveName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
