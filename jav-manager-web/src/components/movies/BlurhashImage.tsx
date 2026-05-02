import { useState, useRef, useCallback } from "react"
import { Blurhash } from "react-blurhash"
import mediumZoom, { type Zoom } from "medium-zoom"
import { cn } from "@/lib/utils"

interface BlurhashImageProps {
  src: string
  blurhash?: string
  alt: string
  className?: string
  width?: number
  height?: number
  zoomable?: boolean
}

export function BlurhashImage({
  src,
  blurhash,
  alt,
  className,
  width,
  height,
  zoomable = false,
}: BlurhashImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const zoomRef = useRef<Zoom | null>(null)

  const imgCallback = useCallback(
    (node: HTMLImageElement | null) => {
      if (node && zoomable && !zoomRef.current) {
        zoomRef.current = mediumZoom(node, {
          background: "rgba(0, 0, 0, 0.85)",
          margin: 24,
        })
      }
      imgRef.current = node
    },
    [zoomable]
  )

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{ width, height }}
    >
      {blurhash && !loaded && !error && (
        <div className="absolute inset-0">
          <Blurhash
            hash={blurhash}
            width="100%"
            height="100%"
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        </div>
      )}
      {!error && (
        <img
          ref={imgCallback}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            zoomable && "cursor-zoom-in"
          )}
        />
      )}
    </div>
  )
}
