declare module "dplayer" {
  export interface DPlayerOptions {
    container: HTMLElement | null
    live?: boolean
    autoplay?: boolean
    theme?: string
    loop?: boolean
    lang?: string
    screenshot?: boolean
    hotkey?: boolean
    preload?: "auto" | "metadata" | "none"
    volume?: number
    mutex?: boolean
    video: {
      url: string
      pic?: string
      thumbnails?: string
      type?: "auto" | "hls" | "flv" | "dash" | "webtorrent" | "normal"
      customType?: Record<string, (video: HTMLVideoElement, player: DPlayer) => void>
    }
    subtitle?: {
      url?: string
      type?: "webvtt"
      fontSize?: string
      bottom?: string
      color?: string
    }
    danmaku?: boolean | object
    contextmenu?: Array<{ text: string; link?: string; click?: () => void }>
    highlight?: Array<{ time: number; text: string }>
  }

  type DPlayerEvent =
    | "abort"
    | "canplay"
    | "canplaythrough"
    | "durationchange"
    | "emptied"
    | "ended"
    | "error"
    | "loadeddata"
    | "loadedmetadata"
    | "loadstart"
    | "pause"
    | "play"
    | "playing"
    | "progress"
    | "ratechange"
    | "seeked"
    | "seeking"
    | "stalled"
    | "suspend"
    | "timeupdate"
    | "volumechange"
    | "waiting"
    | "screenshot"
    | "thumbnails_show"
    | "thumbnails_hide"
    | "danmaku_show"
    | "danmaku_hide"
    | "danmaku_clear"
    | "danmaku_loaded"
    | "danmaku_send"
    | "danmaku_opacity"
    | "contextmenu_show"
    | "contextmenu_hide"
    | "notice_show"
    | "notice_hide"
    | "quality_start"
    | "quality_end"
    | "destroy"
    | "resize"
    | "fullscreen"
    | "fullscreen_cancel"
    | "webfullscreen"
    | "webfullscreen_cancel"

  export default class DPlayer {
    constructor(options: DPlayerOptions)
    play(): void
    pause(): void
    seek(time: number): void
    toggle(): void
    on(event: DPlayerEvent, handler: (...args: unknown[]) => void): void
    off(event: DPlayerEvent, handler: (...args: unknown[]) => void): void
    notice(text: string, time?: number, opacity?: number): void
    switchVideo(video: DPlayerOptions["video"], danmaku?: DPlayerOptions["danmaku"]): void
    switchQuality(index: number): void
    destroy(): void
    speed(rate: number): void
    volume(percentage: number, nostorage?: boolean, nonotice?: boolean): void
    video: HTMLVideoElement
    danmaku?: { send: (opts: object, callback: () => void) => void }
    fullScreen: {
      request(type?: "web" | "browser"): void
      cancel(type?: "web" | "browser"): void
    }
    options: DPlayerOptions
  }
}
