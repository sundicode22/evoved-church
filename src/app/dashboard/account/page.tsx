"use client"

import * as React from "react"
import Link from "next/link"
import { KeyRound, Mail, UserCircle } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusPill } from "@/components/table-panel"
import { useSession } from "@/features/auth/auth-client"

export default function AccountPage() {
  const { data: session, isPending } = useSession()
  const user = session?.user
  const initials = (user?.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <PageHeader title="Account" />
        <div className="mx-auto w-full max-w-2xl space-y-6 p-6 md:p-8">
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-wrap items-start gap-4">
              {isPending ? (
                <Skeleton className="size-16 rounded-xl" />
              ) : (
                <Avatar className="size-16 rounded-xl">
                  <AvatarImage src={user?.image || undefined} alt={user?.name || "Account"} />
                  <AvatarFallback className="rounded-xl bg-brand-soft text-lg text-brand-ink">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-medium tracking-tight text-foreground">
                    {isPending ? "Loading…" : user?.name || "Your account"}
                  </h1>
                  {user?.emailVerified ? (
                    <StatusPill tone="success">Verified</StatusPill>
                  ) : user ? (
                    <StatusPill tone="warning">Email unverified</StatusPill>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Signed-in profile for this Evolve workspace.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-sm font-medium text-foreground">Profile</h2>
            {isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
                  <UserCircle className="mt-0.5 size-4 text-brand" strokeWidth={1.75} />
                  <div>
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="font-medium text-foreground">{user?.name || "—"}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
                  <Mail className="mt-0.5 size-4 text-brand" strokeWidth={1.75} />
                  <div>
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="font-medium text-foreground">{user?.email || "—"}</dd>
                  </div>
                </div>
              </dl>
            )}
          </section>

          <section className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-6 shadow-xs">
            <Button variant="outline" className="gap-2" nativeButton={false} render={<Link href="/forgot-password" />}>
              <KeyRound className="size-3.5" strokeWidth={1.75} />
              Reset password
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/settings?tab=billing" />}
            >
              Billing & plans
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/settings" />}>
              Church settings
            </Button>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
