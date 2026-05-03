import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ScanLine, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useSettings, useSaveSettings, useTriggerScan } from "@/services/settingsService"

const settingsSchema = z.object({
  movieDirectory: z.string().min(1, "Movie directory is required"),
  dateRange: z.number().min(-1),
  scrapeActorInfo: z.boolean(),
  forceUpdate: z.boolean(),
})

type SettingsForm = z.infer<typeof settingsSchema>

export function SettingsViewer() {
  const { data: settings, isLoading } = useSettings()
  const saveMutation = useSaveSettings()
  const scanMutation = useTriggerScan()

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
      dateRange: -1,
      scrapeActorInfo: false,
      forceUpdate: false,
    },
  })

  useEffect(() => {
    if (settings) {
      reset({
        movieDirectory: settings.MovieDirectory || "",
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
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
      </div>
    </div>
  )
}
