/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from "react"
import { Outlet } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Navbar } from "./Navbar"
import { FilterPanel } from "@/components/filter/FilterPanel"
import { ActiveFiltersBar } from "@/components/filter/ActiveFiltersBar"
import { SearchBar } from "@/components/filter/SearchBar"
import { cn } from "@/lib/utils"

interface LayoutContextType {
  openFilter: () => void
  openSearch: () => void
}

const LayoutContext = createContext<LayoutContextType>({
  openFilter: () => {},
  openSearch: () => {},
})

export function useLayout() {
  return useContext(LayoutContext)
}

export function AppLayout() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleFilterClose = () => {
    setFilterOpen(false)
    queryClient.invalidateQueries({ queryKey: ["movies", "grid"] })
  }

  return (
    <LayoutContext.Provider
      value={{
        openFilter: () => setFilterOpen(true),
        openSearch: () => setSearchOpen(true),
      }}
    >
      <div className="flex min-h-screen bg-background text-foreground">
        <div className="flex-1 min-w-0 flex flex-col">
          <Navbar />
          <ActiveFiltersBar filterOpen={filterOpen} />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <div
          className={cn(
            "transition-all duration-300 ease-in-out border-l",
            filterOpen ? "w-full md:w-[480px]" : "w-0 overflow-hidden border-l-0"
          )}
        >
          <FilterPanel onClose={handleFilterClose} />
        </div>
      </div>
      <SearchBar externalOpen={searchOpen} onExternalOpenChange={setSearchOpen} />
    </LayoutContext.Provider>
  )
}
