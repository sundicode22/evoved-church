"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
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

const selectClassName =
  "h-[39px] w-full rounded-lg border border-input bg-white px-3.5 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"

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
      <div className={cn("space-y-4 text-center", className)}>
        <p className="text-sm font-medium text-foreground">Thanks — your note is with the Evolve team.</p>
        <p className="text-sm text-muted-foreground">
          We email owners directly via Resend. Expect a reply at the address you shared.
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-lg text-sm"
          onClick={() => setSent(false)}
        >
          Send another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <Label htmlFor="demo-interest" className="text-foreground/80">
          What do you need?
        </Label>
        <select
          id="demo-interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value as Interest)}
          className={selectClassName}
        >
          {INTERESTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="demo-name" className="text-foreground/80">
          Your name
        </Label>
        <Input id="demo-name" name="name" required placeholder="Jordan Miles" autoComplete="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="demo-email" className="text-foreground/80">
          Work email
        </Label>
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
        <Label htmlFor="demo-church" className="text-foreground/80">
          Church name
        </Label>
        <Input id="demo-church" name="churchName" required placeholder="Grace North" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="demo-phone" className="text-foreground/80">
          Phone (optional)
        </Label>
        <Input id="demo-phone" name="phone" type="tel" placeholder="+1…" autoComplete="tel" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="demo-locations" className="text-foreground/80">
          Locations (optional)
        </Label>
        <Input id="demo-locations" name="locationsCount" placeholder="e.g. 3 campuses" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="demo-message" className="text-foreground/80">
          What should we know?
        </Label>
        <Textarea
          id="demo-message"
          name="message"
          rows={3}
          placeholder="Current tools, timeline, or what you want to see on the demo…"
        />
      </div>

      <Button type="submit" disabled={pending} className="h-10 w-full rounded-lg text-sm">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {interest === "demo" ? "Request demo" : "Send interest"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Messages go to Evolve owners over Resend. We never sell your contact details.
      </p>
    </form>
  )
}
