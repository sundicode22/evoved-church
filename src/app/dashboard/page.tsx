"use client"

import * as React from "react"
import Link from "next/link"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ChartCard } from "@/features/reports/components/chart-card"
import { useReportsOverview } from "@/features/reports/hooks/use-reports"
import { useFunds } from "@/features/accounting/hooks/use-funds"
import { useContributions } from "@/features/giving/hooks/use-giving"
import { useVisitorBoard } from "@/features/visitors/hooks/use-visitor-leads"
import { formatCompact, formatMoney } from "@/lib/format"

const givingConfig = {
  online: { label: "Online", color: "#6495ed" },
  inPerson: { label: "In person", color: "#86efac" },
} satisfies ChartConfig

const attendanceConfig = {
  adults: { label: "Adults", color: "#4f7fd4" },
  children: { label: "Children", color: "#4ade80" },
} satisfies ChartConfig

const funnelConfig = {
  count: { label: "People", color: "#6495ed" },
} satisfies ChartConfig

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" })
}

export default function DashboardHomePage() {
  const { data: funds = [] } = useFunds()
  const { data: giving } = useContributions()
  const { data: board } = useVisitorBoard()
  const { data: overview } = useReportsOverview()

  const netAvailable = (funds as { balance?: number; encumberedAmount?: number }[]).reduce(
    (s, f) => s + (Number(f.balance || 0) - Number(f.encumberedAmount || 0)),
    0
  )
  const givingTotal = Number(giving?.summary?.total ?? overview?.giving.total ?? 0)
  const visitorCount = Array.isArray(board)
    ? board.reduce((s: number, col: { cards?: unknown[] }) => s + (col.cards?.length || 0), 0)
    : overview?.visitors.totalLeads ?? 0

  const givingTrend = overview?.giving.byWeek || []
  const attendanceTrend = overview?.attendance.byWeek || []
  const funnelBars = (overview?.visitors.stages || []).map((s) => ({
    name: s.title.length > 16 ? `${s.title.slice(0, 14)}…` : s.title,
    count: s.count,
  }))

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <PageHeader title="Dashboard" />
        <div className="flex flex-1 flex-col gap-6 bg-white p-4 md:p-6">
          <section className="rounded-xl bg-white">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Dashboard</h1>
            <p className="mt-1 text-base text-zinc-700">
              Funds, giving, and the visitor pipeline for this location.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard label="Fund net available" value={money(netAvailable)} href="/dashboard/funds" />
              <StatCard label="Giving listed" value={money(givingTotal)} href="/dashboard/giving" />
              <StatCard label="Visitor pipeline" value={String(visitorCount)} href="/dashboard/visitors" />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Giving" description="Weekly totals, online and in person">
              <ChartContainer config={givingConfig} className="aspect-[16/9] w-full">
                <AreaChart data={givingTrend} margin={{ left: 8, right: 8, top: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v) => formatCompact(Number(v))}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => formatMoney(Number(value) || 0)} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="inPerson"
                    stackId="a"
                    stroke="var(--color-inPerson)"
                    fill="var(--color-inPerson)"
                    fillOpacity={0.45}
                  />
                  <Area
                    type="monotone"
                    dataKey="online"
                    stackId="a"
                    stroke="var(--color-online)"
                    fill="var(--color-online)"
                    fillOpacity={0.65}
                  />
                </AreaChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title="Attendance" description="Weekly headcount, adults and children">
              <ChartContainer config={attendanceConfig} className="aspect-[16/9] w-full">
                <LineChart data={attendanceTrend} margin={{ left: 8, right: 8, top: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="adults"
                    stroke="var(--color-adults)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="children"
                    stroke="var(--color-children)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </ChartCard>
          </div>

          <ChartCard title="Visitor pipeline" description="How many people are in each stage">
            <ChartContainer config={funnelConfig} className="aspect-[21/9] w-full min-h-[240px]">
              <BarChart data={funnelBars} margin={{ left: 8, right: 8, top: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <section className="rounded-xl bg-white">
            <h2 className="text-lg font-semibold text-zinc-950">Go to</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { href: "/dashboard/giving", label: "Add giving" },
                { href: "/dashboard/members", label: "People" },
                { href: "/dashboard/groups", label: "Groups" },
                { href: "/dashboard/calendar", label: "Calendar" },
                { href: "/dashboard/campaigns", label: "Campaigns" },
                { href: "/dashboard/metrics", label: "Reports" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg bg-zinc-100 px-3.5 py-2 text-base text-zinc-900 hover:bg-[var(--brand-soft)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl bg-zinc-50 px-5 py-5 transition-colors hover:bg-[var(--brand-soft)]"
    >
      <p className="text-base font-medium text-zinc-800">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
    </Link>
  )
}
