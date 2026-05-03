import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AppLayout } from "@/components/layout/AppLayout"
import { MovieGrid } from "@/components/movies/MovieGrid"
import { MovieDetail } from "@/components/movies/MovieDetail"
import { VideoPlayer } from "@/components/player/VideoPlayer"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { SettingsViewer } from "@/components/settings/SettingsViewer"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

function HomePage() {
  return <MovieGrid />
}

function ActorGrid() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Actors</h1>
    </div>
  )
}

function Settings() {
  return <SettingsViewer />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/actors" element={<ActorGrid />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/movie/:imdbId" element={<MovieDetail />} />
          <Route path="/play/:imdbId" element={<VideoPlayer />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          classNames: {
            toast: "group-[.toaster]:rounded-lg",
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
