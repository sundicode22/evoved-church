"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Check, Copy, Download, ExternalLink, QrCode, Users } from "lucide-react"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { DatePicker } from "@/components/date-picker"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAttendanceQRCode, useCreateAttendanceSession } from "@/features/attendance/hooks/use-attendance"
import { useBranchStore } from "@/store/use-branch-store"
import { cn } from "@/lib/utils"

type ServiceDaySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional public form URL (e.g. /f/visitor-connect) — QR prefers this when set. */
  formUrl?: string | null
  formTitle?: string | null
}

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function ServiceDaySheet({
  open,
  onOpenChange,
  formUrl,
  formTitle,
}: ServiceDaySheetProps) {
  const router = useRouter()
  const activeCampus = useBranchStore((s) => s.activeCampus)
  const campusSlug = activeCampus.slug || "main-campus"
  const { data: campusQr, isLoading: qrLoading } = useAttendanceQRCode(campusSlug)
  const createSession = useCreateAttendanceSession()

  const [serviceDay, setServiceDay] = React.useState<Date>(() => new Date())
  const [sessionName, setSessionName] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const label = format(new Date(), "EEEE")
    setServiceDay(new Date())
    setSessionName(`${label} service · ${activeCampus.name || "Main campus"}`)
  }, [open, activeCampus.name])

  const targetUrl =
    formUrl?.trim() ||
    campusQr?.targetUrl ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/welcome/${campusSlug}`

  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open || !targetUrl) return
    let cancelled = false
    ;(async () => {
      if (formUrl?.trim()) {
        try {
          const QRCode = (await import("qrcode")).default
          const dataUrl = await QRCode.toDataURL(targetUrl, {
            width: 320,
            margin: 2,
            color: { dark: "#6495ed", light: "#ffffff" },
          })
          if (!cancelled) setQrDataUrl(dataUrl)
          return
        } catch {
          /* fall through to campus QR */
        }
      }
      if (!cancelled) setQrDataUrl(campusQr?.qrDataUrl ?? null)
    })()
    return () => {
      cancelled = true
    }
  }, [open, targetUrl, formUrl, campusQr?.qrDataUrl])

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

  function downloadQr() {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `guest-qr-${campusSlug}.png`
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  async function openServiceDayList() {
    if (!serviceDay) {
      toast.error("Pick a service day")
      return
    }
    const name =
      sessionName.trim() ||
      `${format(serviceDay, "EEEE")} service · ${activeCampus.name || "Campus"}`
    try {
      await createSession.mutateAsync({
        sessionName: name,
        sessionDate: serviceDay.toISOString(),
        sessionType: "service",
        campusId: activeCampus.id || undefined,
      })
      onOpenChange(false)
      router.push(`/dashboard/visitors?day=${dayKey(serviceDay)}`)
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset size="md" className="bg-background p-0">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <QrCode className="size-4 text-brand" strokeWidth={1.75} />
            Guest QR &amp; service day
          </SheetTitle>
          <SheetDescription>
            Display a scannable QR for first-time guests, then open a visitor list for one
            service day so the welcome team can track arrivals easily.
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="gap-6">
          <section className="space-y-3">
            <p className="text-sm font-medium text-foreground">Scan to connect</p>
            <div
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4",
                "sm:flex-row sm:items-start"
              )}
            >
              <div className="flex size-44 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-xs">
                {qrLoading && !qrDataUrl ? (
                  <Spinner className="size-6 text-brand" />
                ) : qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="Guest connection QR code"
                    className="size-full object-contain"
                  />
                ) : (
                  <QrCode className="size-10 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                <p className="text-sm font-medium text-foreground">
                  {formTitle?.trim() || "Guest welcome"}
                </p>
                <p className="break-all font-mono text-xs text-brand">{targetUrl}</p>
                <p className="text-xs text-muted-foreground">
                  Guests scan this on a phone — keep the code large and high-contrast.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
                  <Button type="button" size="sm" variant="outline" onClick={() => void copyLink()}>
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!qrDataUrl}
                    onClick={downloadQr}
                  >
                    <Download className="size-3.5" />
                    Download QR
                  </Button>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm shadow-xs hover:bg-muted"
                    )}
                  >
                    <ExternalLink className="size-3.5" />
                    Open
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-5">
            <p className="text-sm font-medium text-foreground">Visitor list for a service day</p>
            <p className="text-xs text-muted-foreground">
              Creates a session for that day and opens Visitors filtered to arrivals you can
              track together.
            </p>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel>Service day</FieldLabel>
                <DatePicker
                  value={serviceDay}
                  onChange={(d) => d && setServiceDay(d)}
                  placeholder="Pick service day"
                />
              </Field>
              <Field>
                <FieldLabel>List name</FieldLabel>
                <Input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Sunday AM · Main campus"
                  className="shadow-xs"
                />
              </Field>
            </FieldGroup>
          </section>
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={createSession.isPending || !serviceDay}
            onClick={() => void openServiceDayList()}
          >
            {createSession.isPending ? (
              <Spinner className="size-3.5" />
            ) : (
              <Users className="size-3.5" />
            )}
            Open visitor list
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
