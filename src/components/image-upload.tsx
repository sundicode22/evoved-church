"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ImagePlus, Upload, X } from "lucide-react"

type ImageUploadProps = {
  value?: string
  onChange?: (url: string) => void
  disabled?: boolean
  className?: string
  label?: string
  hint?: string
  /** Max file size in bytes. Default ~2.5 MB. */
  maxBytes?: number
  /** Aspect preview box; default square-ish for group avatars. */
  previewClassName?: string
}

/**
 * Shadcn-styled single-image upload with preview.
 * Stores a data URL locally so it works without a separate storage round-trip.
 */
export function ImageUpload({
  value = "",
  onChange,
  disabled = false,
  className,
  label = "Image",
  hint = "PNG, JPG, or WebP up to ~2 MB",
  maxBytes = 2.5 * 1024 * 1024,
  previewClassName,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  function readFile(file: File) {
    if (!onChange) return
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPG, WebP, or GIF image")
      return
    }
    if (file.size > maxBytes) {
      const mb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10
      toast.error(`Image must be ${mb} MB or smaller`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : ""
      if (result) onChange(result)
    }
    reader.readAsDataURL(file)
  }

  function onFiles(list: FileList | null) {
    const file = list?.[0]
    if (file) readFile(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-[11px] text-zinc-400">{hint}</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled) onFiles(e.dataTransfer.files)
        }}
        className={cn(
          "relative overflow-hidden rounded-xl bg-muted shadow-xs transition-shadow",
          dragOver && "shadow-md ring-2 ring-[var(--brand)]/30",
          disabled && "opacity-60"
        )}
      >
        {value ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className={cn("aspect-[16/9] w-full object-cover", previewClassName)}
            />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 bg-white/95 shadow-sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="size-8 bg-white/95 text-zinc-500 shadow-sm hover:text-rose-600"
                disabled={disabled}
                onClick={() => onChange?.("")}
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center outline-none"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-brand shadow-sm">
              <ImagePlus className="size-5" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-medium text-foreground">Upload image</span>
            <span className="text-xs text-zinc-500">Drop a file here or click to browse</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>
  )
}
