"use client"

import * as React from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Interest = "demo" | "subscribe" | "pricing" | "migration"

const INTERESTS: { value: Interest; label: string }[] = [
  { value: "demo", label: "Book a demo" },
  { value: "subscribe", label: "Stay in the loop" },
  { value: "pricing", label: "Pricing question" },
  { value: "migration", label: "Migration help" },
]

export function LandingDemoForm({ className }: { className?: string }) {
  const [interest, setInterest] = React.useState<Interest>("demo")
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      churchName: String(fd.get("churchName") || ""),
      phone: String(fd.get("phone") || "") || undefined,
      locationsCount: String(fd.get("locationsCount") || "") || undefined,
      message: String(fd.get("message") || "") || undefined,
      interest,
    }

    setPending(true)
    try {
      const res = await fetch("/api/marketing/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json?.error?.message || json?.message || "Could not send. Try again.")
      }
      setSent(true)
      form.reset()
      toast.success("Request sent — we'll be in touch soon.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-6 text-sm text-emerald-950",
          className
        )}
      >
        <p className="font-medium">Thanks — your note is with the Evolve team.</p>
        <p className="mt-1 text-emerald-800/80">
          We email owners directly via Resend. Expect a reply at the address you shared.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 bg-white"
          onClick={() => setSent(false)}
        >
          Send another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setInterest(item.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              interest === item.value
                ? "border-[#6495ed] bg-[#eef3fc] text-[#2b4c8c]"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="demo-name">Your name</Label>
          <Input id="demo-name" name="name" required placeholder="Jordan Miles" autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="demo-email">Work email</Label>
          <Input
            id="demo-email"
            name="email"
            type="email"
            required
            placeholder="you@church.org"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="demo-church">Church name</Label>
          <Input id="demo-church" name="churchName" required placeholder="Grace North" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="demo-phone">Phone (optional)</Label>
          <Input id="demo-phone" name="phone" type="tel" placeholder="+1…" autoComplete="tel" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="demo-locations">Locations (optional)</Label>
          <Input id="demo-locations" name="locationsCount" placeholder="e.g. 3 campuses" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="demo-message">What should we know?</Label>
          <Textarea
            id="demo-message"
            name="message"
            rows={3}
            placeholder="Current tools, timeline, or what you want to see on the demo…"
          />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {interest === "demo" ? "Request demo" : "Send interest"}
      </Button>
      <p className="text-xs text-zinc-500">
        Messages go to Evolve owners over Resend. We never sell your contact details.
      </p>
    </form>
  )
}
