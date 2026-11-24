"use client"

import * as React from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useFunds } from "@/features/accounting/hooks/use-funds"
import { useContributions } from "@/features/giving/hooks/use-giving"
import { useVisitorBoard } from "@/features/visitors/hooks/use-visitor-leads"

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" })
}

export default function DashboardHomePage() {
  const { data: funds = [] } = useFunds()
  const { data: giving } = useContributions()
  const { data: board } = useVisitorBoard()

  const netAvailable = (funds as { balance?: number; encumberedAmount?: number }[]).reduce(
    (s, f) => s + (Number(f.balance || 0) - Number(f.encumberedAmount || 0)),
    0
  )
  const givingTotal = Number(giving?.summary?.total ?? 0)
  const visitorCount = Array.isArray(board)
    ? board.reduce((s: number, col: { cards?: unknown[] }) => s + (col.cards?.length || 0), 0)
    : 0

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-[#fbfcfb]">
        <PageHeader title="Home" />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Fund net available"
              value={money(netAvailable)}
              href="/dashboard/funds"
            />
            <StatCard
              label="Giving (listed)"
              value={money(Number(givingTotal))}
              href="/dashboard/giving"
            />
            <StatCard
              label="Visitor pipeline"
              value={String(visitorCount)}
              href="/dashboard/visitors"
            />
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-xs">
            <h2 className="text-sm font-medium text-zinc-900">Quick links</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/dashboard/giving", label: "Add giving" },
                { href: "/dashboard/members", label: "People" },
                { href: "/dashboard/groups", label: "Groups" },
                { href: "/dashboard/calendar", label: "Calendar" },
                { href: "/dashboard/campaigns", label: "Campaigns" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg border bg-[#fbfcfb] px-3 py-2 text-sm text-[#1b5e20] hover:bg-[#eaf5ea]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-5 shadow-xs transition-colors hover:bg-[#eaf5ea]/40"
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </Link>
  )
}
