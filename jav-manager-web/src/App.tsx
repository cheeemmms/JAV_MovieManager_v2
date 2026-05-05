import { useEffect, Component, useRef } from "react"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { AppLayout } from "@/components/layout/AppLayout"
import { MovieGrid } from "@/components/movies/MovieGrid"
import { MovieDetail } from "@/components/movies/MovieDetail"
import { VideoPlayer } from "@/components/player/VideoPlayer"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { SettingsViewer } from "@/components/settings/SettingsViewer"
import { ActorGrid } from "@/components/actors/ActorGrid"
import { LoginPage } from "@/components/auth/LoginPage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-xl font-bold text-destructive">Something went wrong</h1>
            <p className="text-sm text-muted-foreground break-all">
              {this.state.error?.message || "Unknown error"}
            </p>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function HomePage() {
  return <MovieGrid />
}

function Settings() {
  return <SettingsViewer />
}

function AuthRedirector() {
  const navigate = useNavigate()
  const navigating = useRef(false)

  useEffect(() => {
    const handler = () => {
      if (navigating.current) return
      navigating.current = true
      navigate("/login")
    }
    window.addEventListener("auth:required", handler)
    return () => window.removeEventListener("auth:required", handler)
  }, [navigate])

  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
        <AuthRedirector />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/actors" element={<ActorGrid />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/movie/:imdbId" element={<MovieDetail />} />
          <Route path="/play/:imdbId" element={<VideoPlayer />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        </ErrorBoundary>
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
