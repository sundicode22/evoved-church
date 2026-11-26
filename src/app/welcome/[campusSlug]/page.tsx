"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { VISITOR_INTAKE_SLUG } from "@/features/forms/schemas"

/**
 * Legacy QR welcome URL — redirects to the published visitor intake form
 * built in Forms (purpose = visitor_intake).
 */
function WelcomeRedirect() {
  const params = useParams<{ campusSlug: string }>()
  const router = useRouter()
  const campusSlug = params.campusSlug

  React.useEffect(() => {
    const q = campusSlug ? `?campus=${encodeURIComponent(campusSlug)}` : ""
    router.replace(`/f/${VISITOR_INTAKE_SLUG}${q}`)
  }, [campusSlug, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#fbfcfb] text-sm text-zinc-500">
      <Spinner className="size-5" />
      Taking you to our visitor form…
    </main>
  )
}

export default function WelcomeRoute() {
  return (
    <React.Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          Loading…
        </main>
      }
    >
      <WelcomeRedirect />
    </React.Suspense>
  )
}
