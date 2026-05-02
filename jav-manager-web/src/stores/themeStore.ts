import { create } from "zustand"

export type Theme = "dark" | "light" | "system"

interface ThemeState {
  theme: Theme
  resolved: "dark" | "light"
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

const THEME_KEY = "jav-manager-theme"

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): "dark" | "light" {
  return theme === "system" ? getSystemTheme() : theme
}

function applyTheme(resolved: "dark" | "light") {
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

const savedTheme = (localStorage.getItem(THEME_KEY) as Theme) || "system"
const initialResolved = resolveTheme(savedTheme)
applyTheme(initialResolved)

const themeCycle: Theme[] = ["light", "dark", "system"]

export const useThemeStore = create<ThemeState>((set) => ({
  theme: savedTheme,
  resolved: initialResolved,
  setTheme: (theme) => {
    const resolved = resolveTheme(theme)
    applyTheme(resolved)
    localStorage.setItem(THEME_KEY, theme)
    set({ theme, resolved })
  },
  cycleTheme: () => {
    set((state) => {
      const idx = themeCycle.indexOf(state.theme)
      const next = themeCycle[(idx + 1) % themeCycle.length]
      const resolved = resolveTheme(next)
      applyTheme(resolved)
      localStorage.setItem(THEME_KEY, next)
      return { theme: next, resolved }
    })
  },
}))

if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const state = useThemeStore.getState()
    if (state.theme === "system") {
      const resolved = getSystemTheme()
      applyTheme(resolved)
      useThemeStore.setState({ resolved })
    }
  })
}
