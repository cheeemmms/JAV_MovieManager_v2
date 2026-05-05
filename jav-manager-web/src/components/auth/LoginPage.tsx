import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login, isAuthenticated } from "@/services/authService"

export function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [lockUntil, setLockUntil] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true })
    }
  }, [navigate])

  const [lockSec, setLockSec] = useState(0)

  useEffect(() => {
    if (lockUntil <= 0) return
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
      setLockSec(remaining)
      if (remaining <= 0) {
        setLockUntil(0)
        setError("")
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [lockUntil])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || loading) return

    setLoading(true)
    setError("")

    try {
      await login(password)
      navigate("/", { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed"
      if (msg.includes("Too many attempts")) {
        const match = msg.match(/retryAfter["']?\s*:\s*(\d+)/i)
        const seconds = match ? parseInt(match[1]) : 900
        setLockUntil(Date.now() + seconds * 1000)
        setError(`Too many attempts. Try again in ${Math.ceil(seconds / 60)} minutes.`)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">JAV Manager</CardTitle>
          <CardDescription>
            Enter your access password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={loading || lockSec > 0}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || lockSec > 0 || !password}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : lockSec > 0 ? (
                `Locked (${lockSec}s)`
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Home network access only
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
