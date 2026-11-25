"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { CheckCircle2 } from "lucide-react"

function titleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function WelcomePage() {
  const params = useParams<{ campusSlug: string }>()
  const campusSlug = params.campusSlug
  const campusLabel = titleCase(decodeURIComponent(campusSlug ?? ""))

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-campus-slug": campusSlug },
        body: JSON.stringify({
          title: `First Visit — ${name.trim()}`,
          contactName: name.trim(),
          contactEmail: email.trim() || undefined,
          contactPhone: phone.trim() || undefined,
          location: campusLabel || undefined,
          source: "QR Connection Card",
        }),
      })
      const json = (await res.json().catch(() => null)) as { success?: boolean; error?: { message?: string } } | null
      if (!res.ok || json?.success === false) {
        setError(json?.error?.message ?? "We couldn't save your details. Please try again.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-50/70 to-transparent"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <BrandMark />
        <Card className="w-full rounded-2xl border border-zinc-200/60 bg-white shadow-sm">
          {submitted ? (
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="size-8 text-[var(--brand)]" />
              </span>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Thank you, {name.trim().split(" ")[0]}!
              </h1>
              <p className="text-sm text-zinc-500">
                We&apos;re so glad you joined us{campusLabel ? ` at ${campusLabel}` : ""}. Someone from our team will
                reach out soon.
              </p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                  Welcome{campusLabel ? ` to ${campusLabel}` : ""}
                </CardTitle>
                <CardDescription className="text-sm text-zinc-500">
                  We&apos;d love to get to know you. Share a few details and we&apos;ll stay in touch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-slate-700">Full name</Label>
                    <Input
                      id="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 555 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 rounded-lg bg-white"
                    />
                  </div>
                  {error && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-10 w-full rounded-lg bg-[var(--accent-cta)] text-sm text-white shadow-sm hover:bg-[var(--accent-cta-hover)]"
                  >
                    {pending ? "Submitting…" : "Say hello"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
