"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { TextFormField } from "@/components/form-fields"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { CheckCircle2 } from "lucide-react"

const connectionCardSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address")]),
  phone: z.string().trim(),
})

type ConnectionCardValues = z.infer<typeof connectionCardSchema>

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

  const form = useForm<ConnectionCardValues>({
    resolver: zodResolver(connectionCardSchema),
    defaultValues: { name: "", email: "", phone: "" },
  })
  const [submittedName, setSubmittedName] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(values: ConnectionCardValues) {
    const { name, email, phone } = values
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
      setSubmittedName(name.trim())
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
                <CheckCircle2 className="size-8 text-brand" />
              </span>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                Thank you, {submittedName.split(" ")[0]}!
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
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <TextFormField
                    control={form.control}
                    name="name"
                    label="Full name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    inputClassName="h-10 rounded-lg bg-white"
                  />
                  <TextFormField
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@example.com"
                    inputClassName="h-10 rounded-lg bg-white"
                  />
                  <TextFormField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 555 123 4567"
                    inputClassName="h-10 rounded-lg bg-white"
                  />
                  {error && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-10 w-full rounded-lg bg-accent-cta text-sm text-white shadow-sm hover:bg-accent-cta-hover"
                  >
                    {pending ? "Submitting…" : "Say hello"}
                  </Button>
                </form>
                </Form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
