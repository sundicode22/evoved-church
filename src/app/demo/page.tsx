import type { Metadata } from "next"
import Link from "next/link"
import { LandingDemoForm } from "@/components/marketing/landing-demo-form"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "Request a live Evolve walkthrough or share interest. We notify system owners over Resend.",
  robots: { index: true, follow: true },
}

export default function DemoPage() {
  return (
    <div className="light min-h-screen bg-[#fbfcfb] text-zinc-900">
      <header className="border-b border-zinc-200/70 bg-transparent">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#6495ed] text-sm font-semibold text-white">
              E
            </span>
            <span className="text-base font-semibold tracking-tight">Evolve</span>
          </Link>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
            Back to home
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Book a demo
        </h1>
        <p className="mt-3 max-w-xl text-base text-zinc-600">
          Tell us about your church. We email Evolve owners directly via Resend—no third-party form
          tool.
        </p>
        <div className="mt-8">
          <LandingDemoForm />
        </div>
      </main>
    </div>
  )
}
