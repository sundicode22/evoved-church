"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/table-panel"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { cn } from "cn"
import { Paperclip, Upload, X } from "lucide-react"

export type AttachmentFile = {
  id: string
  name: string
  size: number
  mimeType: string
  /** Local object URL or remote URL after upload */
  url: string
  file?: File
}

type FileAttachmentProps = {
  value?: AttachmentFile[]
  onChange?: (files: AttachmentFile[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
  className?: string
  label?: string
  hint?: string
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Shadcn-styled attachment control for receipts, policies, and vault uploads.
 */
export function FileAttachment({
  value = [],
  onChange,
  accept = "image/*,.pdf,.doc,.docx",
  multiple = true,
  maxFiles = 5,
  disabled = false,
  className,
  label = "Attachments",
  hint = "PDF, images, or Office docs",
}: FileAttachmentProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  function addFiles(list: FileList | null) {
    if (!list?.length || !onChange) return
    const next: AttachmentFile[] = [...value]
    for (const file of Array.from(list)) {
      if (next.length >= maxFiles) break
      next.push({
        id: `att-${crypto.randomUUID()}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        url: URL.createObjectURL(file),
        file,
      })
    }
    onChange(next)
    if (inputRef.current) inputRef.current.value = ""
  }

  function remove(id: string) {
    if (!onChange) return
    const target = value.find((f) => f.id === id)
    if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url)
    onChange(value.filter((f) => f.id !== id))
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="text-[11px] text-zinc-400">{hint}</p>
      </div>

      <InputGroup className="h-auto min-h-9 border-dashed bg-muted">
        <InputGroupAddon align="inline-start">
          <Paperclip className="size-3.5" />
        </InputGroupAddon>
        <button
          type="button"
          disabled={disabled || value.length >= maxFiles}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-9 flex-1 items-center px-2 py-2 text-left text-xs text-zinc-500 outline-none disabled:opacity-50"
        >
          {value.length >= maxFiles
            ? `Maximum ${maxFiles} files`
            : "Drop files or click to attach"}
        </button>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="sm"
            disabled={disabled || value.length >= maxFiles}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Browse
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => addFiles(e.target.files)}
      />

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{f.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <StatusPill>
                    {f.mimeType.split("/").pop()?.toUpperCase() || "FILE"}
                  </StatusPill>
                  <span className="text-[10px] text-zinc-400">{formatBytes(f.size)}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 text-zinc-400 hover:text-rose-600"
                disabled={disabled}
                onClick={() => remove(f.id)}
                aria-label={`Remove ${f.name}`}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
