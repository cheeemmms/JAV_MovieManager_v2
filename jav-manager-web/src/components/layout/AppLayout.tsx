/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from "react"
import { Outlet } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { Navbar } from "./Navbar"
import { FilterPanel } from "@/components/filter/FilterPanel"
import { SearchBar } from "@/components/filter/SearchBar"

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

  const handleFilterChange = (open: boolean) => {
    setFilterOpen(open)
    if (!open) {
      queryClient.invalidateQueries({ queryKey: ["movies", "grid"] })
    }
  }

  return (
    <LayoutContext.Provider
      value={{
        openFilter: () => setFilterOpen(true),
        openSearch: () => setSearchOpen(true),
      }}
    >
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <FilterPanel open={filterOpen} onOpenChange={handleFilterChange} />
        <SearchBar externalOpen={searchOpen} onExternalOpenChange={setSearchOpen} />
      </div>
    </LayoutContext.Provider>
  )
}
