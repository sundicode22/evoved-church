"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { authClient } from "@/features/auth/auth-client"
import {
  clearOnboardingCompletedCookie,
  setOnboardingCompletedCookie,
} from "@/features/onboarding/cookie"

type ChurchOrg = {
  id: string
  name: string
  slug: string
}

function safeNext(value: string | null) {
  if (value && value.startsWith("/dashboard")) return value
  return "/dashboard"
}

export default function WorkspacesPage() {
  return (
    <React.Suspense
      fallback={
        <Shell>
          <p className="text-sm text-muted-foreground">Checking your churches…</p>
        </Shell>
      }
    >
      <WorkspaceChooser />
    </React.Suspense>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-50/70 to-transparent dark:from-emerald-950/30"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <BrandMark />
        {children}
        <p className="text-center text-xs text-muted-foreground">
          &copy; Evolve ChMS &middot; One platform for your whole church.
        </p>
      </div>
    </main>
  )
}

function WorkspaceChooser() {
  const router = useRouter()
  const search = useSearchParams()
  const choose = search.get("choose") === "1"
  const next = safeNext(search.get("redirect"))
  const [orgs, setOrgs] = React.useState<ChurchOrg[] | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const started = React.useRef(false)

  const enter = React.useCallback(
    async (org: ChurchOrg) => {
      setBusyId(org.id)
      const { error } = await authClient.organization.setActive({ organizationId: org.id })
      if (error) {
        setBusyId(null)
        toast.error(error.message || "Could not open that church.")
        return
      }
      setOnboardingCompletedCookie()
      router.replace(next)
      router.refresh()
    },
    [next, router]
  )

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      const result = await authClient.organization.list()
      if (cancelled) return
      if (result.error) {
        setFailed(true)
        setOrgs([])
        toast.error(result.error.message || "Could not load your churches.")
        return
      }
      const rows = (result.data ?? []) as ChurchOrg[]
      setFailed(false)
      setOrgs(rows)
      if (rows.length === 0) {
        clearOnboardingCompletedCookie()
        router.replace("/onboarding")
        return
      }
      if (rows.length === 1 && !choose) {
        if (started.current) return
        started.current = true
        await enter(rows[0]!)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [choose, enter, router])

  const showPicker =
    !failed && orgs !== null && (orgs.length > 1 || (choose && orgs.length > 0))

  return (
    <Shell>
      {showPicker ? (
        <AuthCard>
          <AuthCardHeader
            title="Continue with your church"
            description="One church opens on its own. Choose here when you belong to more than one."
          />
          <div className="space-y-2">
            {orgs.map((org) => (
              <button
                key={org.id}
                type="button"
                disabled={busyId !== null}
                onClick={() => void enter(org)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left transition-colors hover:bg-muted disabled:opacity-60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Building2 className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{org.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{org.slug}</span>
                </span>
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-4 h-10 w-full rounded-lg text-sm"
            nativeButton={false}
            render={<Link href="/onboarding?new=1" />}
          >
            <Plus className="size-4" />
            Set up a new church
          </Button>
        </AuthCard>
      ) : failed ? (
        <AuthCard>
          <AuthCardHeader
            title="Could not open your churches"
            description="Try again, or set up a church if this account is new."
          />
          <Button className="h-10 w-full rounded-lg text-sm" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Button
            variant="outline"
            className="mt-2 h-10 w-full rounded-lg text-sm"
            nativeButton={false}
            render={<Link href="/onboarding" />}
          >
            Set up a church
          </Button>
        </AuthCard>
      ) : (
        <p className="text-sm text-muted-foreground">Checking your churches…</p>
      )}
    </Shell>
  )
}
