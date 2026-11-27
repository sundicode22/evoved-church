import type { Metadata } from "next"
import { LandingDemoForm } from "@/components/marketing/landing-demo-form"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"
import { BrandMark } from "@/features/auth/components/brand-mark"

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "Request a live Evolve walkthrough or share interest. We notify system owners over Resend.",
  robots: { index: true, follow: true },
}

export default function DemoPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-50/70 to-transparent dark:from-emerald-950/30"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <BrandMark />
        <AuthCard>
          <AuthCardHeader
            title="Book a demo"
            description="Tell us about your church. We email Evolve owners directly via Resend."
          />
          <LandingDemoForm />
        </AuthCard>
        <p className="text-center text-xs text-muted-foreground">
          &copy; Evolve ChMS &middot; One platform for your whole church.
        </p>
      </div>
    </main>
  )
}
