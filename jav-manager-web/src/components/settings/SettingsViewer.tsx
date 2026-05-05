import { useEffect, useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ScanLine, Save, Loader2, AlertTriangle, RefreshCw, Copy, X, Shield, Wifi, Globe, Key, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useSettings, useSaveSettings, useTriggerScan } from "@/services/settingsService"
import {
  getAuthStatus,
  setPasswordViaSettings,
  getNetworkInfo,
  getSessions,
  revokeSession,
  revokeAllSessions,
} from "@/services/authService"

const settingsSchema = z.object({
  movieDirectory: z.string().min(1, "Movie directory is required"),
  actorPhotoDirectory: z.string().optional(),
  dateRange: z.number().min(-1),
  scrapeActorInfo: z.boolean(),
  forceUpdate: z.boolean(),
})

type SettingsForm = z.infer<typeof settingsSchema>

export function SettingsViewer() {
  const { data: settings, isLoading, isError, error, refetch } = useSettings()
  const saveMutation = useSaveSettings()
  const scanMutation = useTriggerScan()
  const [loadingTimedOut, setLoadingTimedOut] = useState(false)
  const loadingStartRef = useRef(0)
  const hasInitRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      movieDirectory: "",
      actorPhotoDirectory: "",
      dateRange: -1,
      scrapeActorInfo: false,
      forceUpdate: false,
    },
  })

  useEffect(() => {
    if (isLoading) {
      loadingStartRef.current = Date.now()
    }
  }, [isLoading])

  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setLoadingTimedOut(true), 8000)
    return () => clearTimeout(timer)
  }, [isLoading])

  useEffect(() => {
    if (settings && !hasInitRef.current) {
      hasInitRef.current = true
      reset({
        movieDirectory: settings.MovieDirectory || "",
        actorPhotoDirectory: settings.ActorPhotoDirectory || "",
        dateRange: Number(settings.ScanDateRange) || -1,
        scrapeActorInfo: settings.ScanScrapeActorInfo === "true",
        forceUpdate: settings.ScanForceUpdate === "true",
      })
    }
  }, [settings, reset])

  const onSubmit = async (data: SettingsForm) => {
    try {
      await saveMutation.mutateAsync({
        MovieDirectory: data.movieDirectory,
        ActorPhotoDirectory: data.actorPhotoDirectory || "",
        ScanDateRange: String(data.dateRange),
        ScanScrapeActorInfo: String(data.scrapeActorInfo),
        ScanForceUpdate: String(data.forceUpdate),
      })
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save settings")
    }
  }

  const handleScan = async () => {
    const data = getValues()
    try {
      const result = await scanMutation.mutateAsync({
        directory: data.movieDirectory,
        dateRange: data.dateRange,
        scrapeActorInfo: data.scrapeActorInfo,
        forceUpdate: data.forceUpdate,
      })
      toast.success(`Scan complete: ${result.scanned} movies found (${result.total} total)`)
    } catch {
      toast.error("Scan failed. Check the directory path and try again.")
    }
  }

  if (isLoading && !loadingTimedOut) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (isLoading && loadingTimedOut) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <p className="text-muted-foreground">Loading is taking longer than expected</p>
          <Button variant="outline" onClick={() => { setLoadingTimedOut(false); refetch(); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load settings"}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your movie library and scanning options
          </p>
        </div>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Movie Library</h2>

            <div className="space-y-2">
              <label htmlFor="movieDirectory" className="text-sm font-medium">
                Movie Directory
              </label>
              <div className="flex gap-2">
                <Input
                  id="movieDirectory"
                  placeholder="e.g. D:\Movies\JAV"
                  className="flex-1"
                  {...register("movieDirectory")}
                />
              </div>
              {errors.movieDirectory && (
                <p className="text-sm text-destructive">{errors.movieDirectory.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The root directory containing your movie folders with .nfo metadata files
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="actorPhotoDirectory" className="text-sm font-medium">
                Actor Photo Directory
              </label>
              <div className="flex gap-2">
                <Input
                  id="actorPhotoDirectory"
                  placeholder="e.g. D:\Photos\Actors"
                  className="flex-1"
                  {...register("actorPhotoDirectory")}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Directory containing actor photos named as ActorName.jpg
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Scan Options</h2>

            <div className="space-y-2">
              <label htmlFor="dateRange" className="text-sm font-medium">
                Date Range Filter
              </label>
              <Controller
                name="dateRange"
                control={control}
                render={({ field }) => (
                  <select
                    id="dateRange"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <option value={-1}>All time</option>
                    <option value={1}>Today</option>
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Only scan movie files modified within this time range
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="scrapeActorInfo"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="scrapeActorInfo"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label htmlFor="scrapeActorInfo" className="text-sm font-medium cursor-pointer">
                Scrape actor information
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="forceUpdate"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="forceUpdate"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label htmlFor="forceUpdate" className="text-sm font-medium cursor-pointer">
                Force update existing movies
              </label>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Actions</h2>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="default"
                onClick={handleScan}
                disabled={scanMutation.isPending}
              >
                {scanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ScanLine className="mr-2 h-4 w-4" />
                    Start Scan
                  </>
                )}
              </Button>

              <Button
                type="submit"
                variant="outline"
                disabled={saveMutation.isPending || !isDirty}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <Separator />

        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Remote Access</h2>
          <p className="text-sm text-muted-foreground">
            Access your library from your phone or tablet on the same home network.
            Enable this in <code className="rounded bg-muted px-1 text-xs">appsettings.json</code> (RemoteAccess.Enabled = true).
          </p>
          <RemoteAccessPanel />
        </div>
      </div>
    </div>
  )
}

function RemoteAccessPanel() {
  const qc = useQueryClient()
  const { data: authStatus, isLoading: authLoading } = useQuery({
    queryKey: ["auth", "status"],
    queryFn: getAuthStatus,
    refetchInterval: 30_000,
  })
  const { data: networkInfo, isLoading: networkLoading } = useQuery({
    queryKey: ["settings", "network-info"],
    queryFn: getNetworkInfo,
    refetchInterval: 60_000,
  })
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["settings", "sessions"],
    queryFn: getSessions,
    refetchInterval: 10_000,
  })

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [copiedIp, setCopiedIp] = useState("")

  const handleSetPassword = async () => {
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters")
      return
    }
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match")
      return
    }
    setPasswordSaving(true)
    try {
      await setPasswordViaSettings(password)
      toast.success("Password updated. All sessions revoked.")
      setPassword("")
      setPasswordConfirm("")
      qc.invalidateQueries({ queryKey: ["auth", "status"] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set password")
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleRevokeSession = async (id: number) => {
    try {
      await revokeSession(id)
      toast.success("Session revoked")
      qc.invalidateQueries({ queryKey: ["settings", "sessions"] })
      qc.invalidateQueries({ queryKey: ["auth", "status"] })
    } catch {
      toast.error("Failed to revoke session")
    }
  }

  const handleRevokeAll = async () => {
    try {
      await revokeAllSessions()
      toast.success("All sessions revoked")
      qc.invalidateQueries({ queryKey: ["settings", "sessions"] })
      qc.invalidateQueries({ queryKey: ["auth", "status"] })
    } catch {
      toast.error("Failed to revoke sessions")
    }
  }

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip)
    setCopiedIp(ip)
    toast.success("IP copied to clipboard")
    setTimeout(() => setCopiedIp(""), 2000)
  }

  if (authLoading || networkLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading remote access info...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Key className="h-4 w-4" />
          Access Password
        </h3>
        <p className="text-xs text-muted-foreground">
          {authStatus?.hasPassword
            ? "Password is set. Change it below (will revoke all sessions)."
            : "No password set. Set one to enable remote access."}
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          <Input
            type="password"
            placeholder="Password (min 4 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={passwordSaving}
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={passwordSaving}
          />
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={handleSetPassword}
          disabled={passwordSaving || !password || !passwordConfirm}
        >
          {passwordSaving ? (
            <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Saving...</>
          ) : (
            <>{authStatus?.hasPassword ? "Update Password" : "Set Password"}</>
          )}
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Network Information
        </h3>
        {networkInfo?.localIPs && networkInfo.localIPs.length > 0 ? (
          <div className="space-y-2">
            {networkInfo.localIPs.map((ip) => (
              <div key={ip} className="flex items-center gap-2 text-sm">
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  https://{ip}:{networkInfo.port}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopyIp(`https://${ip}:${networkInfo.port}`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {copiedIp === `https://${ip}:${networkInfo.port}` && (
                  <span className="text-xs text-green-600">Copied!</span>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Open these URLs on your phone browser. Accept the certificate warning on first visit.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No active network interfaces detected. Check your network connection.
          </p>
        )}
      </div>

      {networkInfo?.portForwardingDetected && (
        <>
          <Separator />
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
            <Globe className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Public Internet Exposure Detected
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Port {networkInfo.port} appears reachable from the public internet.
                This is a security risk. Check your router port forwarding settings.
              </p>
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Active Sessions
          {authStatus?.activeSessions != null && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {authStatus.activeSessions}
            </span>
          )}
        </h3>

        {sessionsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sessions...
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border px-4 py-2"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{s.deviceType}</p>
                  <p className="text-xs text-muted-foreground">
                    Last active: {new Date(s.lastActiveAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(s.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRevokeSession(s.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={handleRevokeAll}
            >
              <Trash2 className="mr-2 h-3 w-3" />
              Revoke All Sessions
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No active sessions</p>
        )}
      </div>

      <Separator />

      <div className="rounded-md border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Certificate Warning:</strong> The browser will show a security warning
          because the HTTPS certificate is self-signed. On your phone, tap
          "Advanced" then "Proceed" to continue. This is safe on your home network.
        </p>
      </div>
    </div>
  )
}
