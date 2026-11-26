"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Check, Copy, Download, ExternalLink, Printer, QrCode } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type GuestConnectionCardProps = {
  qrDataUrl: string
  targetUrl: string
  campusName?: string
  className?: string
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
}

async function buildPrintableCardPng(opts: {
  qrDataUrl: string
  targetUrl: string
  campusName: string
}): Promise<string> {
  const qr = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = opts.qrDataUrl
  })

  const width = 900
  const height = 520
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")

  // Card background
  ctx.fillStyle = "#0f1419"
  ctx.fillRect(0, 0, width, height)

  // Soft accent panel
  ctx.fillStyle = "#161c24"
  roundRect(ctx, 28, 28, width - 56, height - 56, 28)
  ctx.fill()

  // Brand chip
  ctx.fillStyle = "#6495ed"
  roundRect(ctx, 64, 64, 120, 36, 18)
  ctx.fill()
  ctx.fillStyle = "#ffffff"
  ctx.font = "600 16px Inter, system-ui, sans-serif"
  ctx.fillText("LOGO", 96, 88)

  // Titles
  ctx.fillStyle = "#ffffff"
  ctx.font = "600 36px Inter, system-ui, sans-serif"
  ctx.fillText("Guest connection card", 64, 160)
  ctx.fillStyle = "#a1a1aa"
  ctx.font = "400 20px Inter, system-ui, sans-serif"
  ctx.fillText("Scan to check in for the first time", 64, 196)
  ctx.fillText(opts.campusName, 64, 228)

  // QR on white plate
  const qrSize = 280
  const qrX = width - qrSize - 72
  const qrY = (height - qrSize) / 2
  ctx.fillStyle = "#ffffff"
  roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24)
  ctx.fill()
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

  // URL
  ctx.fillStyle = "#86efac"
  ctx.font = "500 16px ui-monospace, SFMono-Regular, Menlo, monospace"
  const url = opts.targetUrl.length > 48 ? `${opts.targetUrl.slice(0, 45)}…` : opts.targetUrl
  ctx.fillText(url, 64, height - 72)

  return canvas.toDataURL("image/png")
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function GuestConnectionCard({
  qrDataUrl,
  targetUrl,
  campusName = "Main campus",
  className,
}: GuestConnectionCardProps) {
  const [copied, setCopied] = React.useState(false)
  const [busy, setBusy] = React.useState<"png" | "card" | null>(null)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(targetUrl)
      setCopied(true)
      toast.success("Link copied")
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Could not copy link")
    }
  }

  function downloadQrPng() {
    setBusy("png")
    try {
      downloadDataUrl(qrDataUrl, `guest-qr-${campusName.toLowerCase().replace(/\s+/g, "-")}.png`)
      toast.success("QR code downloaded")
    } finally {
      setBusy(null)
    }
  }

  async function downloadCard() {
    setBusy("card")
    try {
      const card = await buildPrintableCardPng({
        qrDataUrl,
        targetUrl,
        campusName,
      })
      downloadDataUrl(
        card,
        `guest-connection-card-${campusName.toLowerCase().replace(/\s+/g, "-")}.png`
      )
      toast.success("Connection card downloaded")
    } catch {
      toast.error("Could not build downloadable card")
    } finally {
      setBusy(null)
    }
  }

  function printCard() {
    const win = window.open("", "_blank", "noopener,noreferrer,width=720,height=900")
    if (!win) {
      toast.error("Allow pop-ups to print the card")
      return
    }
    win.document.write(`<!doctype html>
<html>
<head>
  <title>Guest connection card</title>
  <style>
    @page { margin: 16mm; }
    body { font-family: Inter, system-ui, sans-serif; color: #18181b; margin: 0; }
    .card { max-width: 640px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 24px; padding: 32px; }
    .row { display: flex; gap: 28px; align-items: center; }
    img { width: 220px; height: 220px; background: #fff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 10px; }
    h1 { font-size: 28px; margin: 0 0 8px; font-weight: 600; }
    p { margin: 0; color: #71717a; font-size: 14px; line-height: 1.5; }
    .url { margin-top: 16px; color: #15803d; font-size: 12px; word-break: break-all; }
    .chip { display: inline-flex; margin-bottom: 16px; padding: 6px 12px; border-radius: 999px; background: #eef3fc; color: #2b4c8c; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="chip">LOGO · ${campusName.replace(/</g, "")}</div>
    <div class="row">
      <img src="${qrDataUrl}" alt="Guest check-in QR" />
      <div>
        <h1>Guest connection card</h1>
        <p>Print or display this QR for first-time guests. Scanning opens the welcome check-in page.</p>
        <p class="url">${targetUrl.replace(/</g, "")}</p>
      </div>
    </div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`)
    win.document.close()
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-xs",
        className
      )}
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="flex flex-col justify-between gap-6 p-5 sm:p-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-ink">
              <QrCode className="size-3.5" strokeWidth={1.75} />
              Guest check-in
            </div>
            <div>
              <h2 className="text-lg font-medium tracking-tight text-foreground">
                Guest connection card
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Print or display this QR for first-time guests at {campusName}. Scanning opens the
                welcome page.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
              <code className="min-w-0 flex-1 truncate text-xs text-emerald-700 dark:text-emerald-400">
                {targetUrl}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => void copyLink()}
                aria-label="Copy link"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={busy !== null}
              onClick={() => void downloadCard()}
            >
              <Download className="size-3.5" />
              {busy === "card" ? "Preparing…" : "Download card"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={downloadQrPng}
            >
              <Download className="size-3.5" />
              {busy === "png" ? "Saving…" : "Download QR"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={printCard}>
              <Printer className="size-3.5" />
              Print
            </Button>
            <Link
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              Open page
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-border bg-muted/30 p-6 md:border-t-0 md:border-l">
          <div className="rounded-2xl border border-border bg-white p-3 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="Guest check-in QR code"
              className="size-44 sm:size-48"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
