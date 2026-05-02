import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AppLayout } from "@/components/layout/AppLayout"
import { MovieGrid } from "@/components/movies/MovieGrid"

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

function Dashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  )
}

function MovieDetail() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Movie Detail</h1>
    </div>
  )
}

function VideoPlayer() {
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <h1 className="text-white text-2xl">Video Player</h1>
    </div>
  )
}

function Settings() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">Settings</h1>
    </div>
  )
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
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
