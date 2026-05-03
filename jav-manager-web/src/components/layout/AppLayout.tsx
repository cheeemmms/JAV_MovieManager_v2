/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from "react"
import { Outlet } from "react-router-dom"
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
        <FilterPanel open={filterOpen} onOpenChange={setFilterOpen} />
        <SearchBar externalOpen={searchOpen} onExternalOpenChange={setSearchOpen} />
      </div>
    </LayoutContext.Provider>
  )
}
