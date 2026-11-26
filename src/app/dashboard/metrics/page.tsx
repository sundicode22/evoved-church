"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  CalendarClock,
  Church,
  Coins,
  HandCoins,
  ListChecks,
  ListTodo,
  Mail,
  Users,
  UsersRound,
} from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequireAbility } from "@/components/auth/can"
import { ChartCard } from "@/features/reports/components/chart-card"
import { StatTile } from "@/features/reports/components/stat-tile"
import {
  AuditLogPanel,
  ReportCatalogPanel,
} from "@/features/reports/components/report-catalog"
import { useReportsOverview } from "@/features/reports/hooks/use-reports"
import { useBranchStore } from "@/store/use-branch-store"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { formatCompact, formatMoney } from "@/lib/format"
import { AuthSearchParamsFallback } from "@/components/auth-search-params"

const givingConfig = {
  total: { label: "Giving", color: "var(--brand)" },
  online: { label: "Online", color: "var(--brand-hover)" },
  inPerson: { label: "In person", color: "#86efac" },
} satisfies ChartConfig

const attendanceConfig = {
  total: { label: "Total", color: "var(--brand)" },
  adults: { label: "Adults", color: "var(--brand-hover)" },
  children: { label: "Children", color: "#86efac" },
} satisfies ChartConfig

const fundConfig = {
  budget: { label: "Budget", color: "#d4d4d8" },
  expended: { label: "Expended", color: "var(--brand)" },
  available: { label: "Available", color: "#86efac" },
} satisfies ChartConfig

const funnelConfig = {
  count: { label: "Leads", color: "var(--brand)" },
} satisfies ChartConfig

const methodConfig = {
  value: { label: "Amount", color: "var(--brand)" },
} satisfies ChartConfig

const lifecycleConfig = {
  value: { label: "People", color: "var(--brand)" },
} satisfies ChartConfig

const projectConfig = {
  count: { label: "Tasks", color: "var(--brand)" },
} satisfies ChartConfig

type MainTab = "reports" | "metrics" | "audit"

function MetricsPageInner() {
  const router = useRouter()
  const search = useSearchParams()
  const rawTab = search.get("tab")
  const mainTab: MainTab =
    rawTab === "metrics" || rawTab === "audit" || rawTab === "reports" ? rawTab : "reports"

  const locationLabel = useNomenclatureStore((s) => s.nomenclature.campusTermSingular)
  const activeCampus = useBranchStore((s) => s.activeCampus)
  const { data: overview, isLoading } = useReportsOverview()

  function setMainTab(next: string | null) {
    const tab = (next as MainTab) || "reports"
    router.replace(`/dashboard/metrics?tab=${tab}`)
  }

  const attendanceHeadcount =
    (overview?.attendance.headcountAdults || 0) +
    (overview?.attendance.headcountChildren || 0)

  const givingTrend = overview?.giving.byWeek || []
  const attendanceTrend = overview?.attendance.byWeek || []
  const fundBars = (overview?.funds.rows || []).slice(0, 6).map((f) => ({
    name: f.name.length > 14 ? `${f.name.slice(0, 12)}…` : f.name,
    budget: f.budget,
    expended: f.expended,
    available: Math.max(0, f.available),
  }))
  const funnelBars = (overview?.visitors.stages || []).map((s) => ({
    name: s.title.length > 16 ? `${s.title.slice(0, 14)}…` : s.title,
    count: s.count,
  }))
  const methodBars = overview?.giving.byMethod || []
  const lifecycleBars = overview?.members.byLifecycle || []
  const projectBars = overview?.projects.byStage || []

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="reports.read">
          <PageHeader
            title="Reports & Metrics"
            description={`Operational reports and live health for ${activeCampus.name}.`}
          />

          <div className="space-y-6 bg-white p-6 md:p-8">
            <Tabs value={mainTab} onValueChange={setMainTab}>
              <TabsList>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="audit">Audit log</TabsTrigger>
              </TabsList>

              <TabsContent value="reports" className="mt-6">
                <ReportCatalogPanel />
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                <AuditLogPanel />
              </TabsContent>

              <TabsContent value="metrics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatTile
                title="Attendance"
                loading={isLoading}
                value={formatCompact(attendanceHeadcount)}
                deltaPct={overview?.attendance.compare.deltaPct}
                hint={`${overview?.attendance.sessionCount ?? 0} sessions · ${locationLabel}`}
                icon={<Church className="size-4" strokeWidth={1.75} />}
              />
              <StatTile
                title="Giving (90d)"
                loading={isLoading}
                value={formatMoney(overview?.giving.compare.total.current || 0)}
                deltaPct={overview?.giving.compare.total.deltaPct}
                hint={`vs prior 90 days`}
                icon={<HandCoins className="size-4" strokeWidth={1.75} />}
              />
              <StatTile
                title="Giving households"
                loading={isLoading}
                value={String(overview?.giving.donors90d ?? 0)}
                deltaPct={overview?.giving.compare.donors.deltaPct}
                hint={`${overview?.giving.recurringSharePct ?? 0}% recurring`}
                icon={<Users className="size-4" strokeWidth={1.75} />}
              />
              <StatTile
                title="Funds available"
                loading={isLoading}
                value={formatMoney(overview?.funds.netAvailable || 0)}
                hint={
                  overview?.funds.utilizationPct != null
                    ? `${overview.funds.utilizationPct}% of budget used`
                    : `${overview?.funds.count ?? 0} funds`
                }
                icon={<Coins className="size-4" strokeWidth={1.75} />}
              />
              <StatTile
                title="Members"
                loading={isLoading}
                value={formatCompact(overview?.members.total || 0)}
                hint={`${overview?.members.households ?? 0} households`}
                icon={<Users className="size-4" strokeWidth={1.75} />}
              />
              <StatTile
                title="Visitor pipeline"
                loading={isLoading}
                value={String(overview?.visitors.totalLeads ?? 0)}
                hint={`${overview?.visitors.stages.length ?? 0} stages`}
                icon={<UsersRound className="size-4" strokeWidth={1.75} />}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ChartCard
                title="Giving trend"
                description="Weekly totals · last 12 weeks · online vs in person"
              >
                <ChartContainer config={givingConfig} className="aspect-[16/9] w-full">
                  <AreaChart data={givingTrend} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v) => formatCompact(Number(v))}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatMoney(Number(value) || 0)}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="inPerson"
                      stackId="a"
                      stroke="var(--color-inPerson)"
                      fill="var(--color-inPerson)"
                      fillOpacity={0.35}
                    />
                    <Area
                      type="monotone"
                      dataKey="online"
                      stackId="a"
                      stroke="var(--color-online)"
                      fill="var(--color-online)"
                      fillOpacity={0.55}
                    />
                  </AreaChart>
                </ChartContainer>
              </ChartCard>

              <ChartCard
                title="Attendance trend"
                description="Weekly headcount · adults & children · prior-period comparison on tiles"
              >
                <ChartContainer config={attendanceConfig} className="aspect-[16/9] w-full">
                  <LineChart data={attendanceTrend} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis tickLine={false} axisLine={false} width={36} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="adults"
                      stroke="var(--color-adults)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="children"
                      stroke="var(--color-children)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </ChartCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ChartCard title="Visitor funnel" description="Leads by stage — where guests stall">
                <ChartContainer config={funnelConfig} className="aspect-[16/10] w-full">
                  <BarChart
                    data={funnelBars}
                    layout="vertical"
                    margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </ChartCard>
              <ChartCard
                title="Budget vs actual"
                description="Planned spend, expended, and what is still available"
              >
                <ChartContainer config={fundConfig} className="aspect-[16/10] w-full">
                  <BarChart data={fundBars} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tickFormatter={(v) => formatCompact(Number(v))}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatMoney(Number(value) || 0)}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="budget" fill="var(--color-budget)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expended" fill="var(--color-expended)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="available" fill="var(--color-available)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </ChartCard>
            </div>

            <Tabs defaultValue="ministry">
              <TabsList>
                <TabsTrigger value="ministry">Ministry</TabsTrigger>
                <TabsTrigger value="giving">Giving detail</TabsTrigger>
                <TabsTrigger value="funds">Budget vs actual</TabsTrigger>
                <TabsTrigger value="ops">Operations</TabsTrigger>
              </TabsList>

              <TabsContent value="ministry" className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <ChartCard
                    title="Visitor funnel"
                    description="Leads by stage — where guests stall"
                  >
                    <ChartContainer config={funnelConfig} className="aspect-[16/10] w-full">
                      <BarChart
                        data={funnelBars}
                        layout="vertical"
                        margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={110}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </ChartCard>

                  <ChartCard
                    title="People by lifecycle"
                    description="Member roster breakdown"
                  >
                    <ChartContainer config={lifecycleConfig} className="aspect-[16/10] w-full">
                      <BarChart data={lifecycleBars} margin={{ left: 8, right: 8, top: 8 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </ChartCard>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatTile
                    title="Groups"
                    loading={isLoading}
                    value={String(overview?.groups.total ?? 0)}
                    hint={`${overview?.groups.active ?? 0} active · ${overview?.groups.members ?? 0} members`}
                    icon={<UsersRound className="size-4" strokeWidth={1.75} />}
                  />
                  <StatTile
                    title="Follow-ups open"
                    loading={isLoading}
                    value={String(overview?.followUps.open ?? 0)}
                    hint={`${overview?.followUps.overdue ?? 0} overdue`}
                    icon={<ListChecks className="size-4" strokeWidth={1.75} />}
                  />
                  <StatTile
                    title="Appointments"
                    loading={isLoading}
                    value={String(overview?.appointments.upcomingBookings ?? 0)}
                    hint={`${overview?.appointments.completedThisWeek ?? 0} done this week`}
                    icon={<CalendarClock className="size-4" strokeWidth={1.75} />}
                  />
                  <StatTile
                    title="Projects"
                    loading={isLoading}
                    value={String(overview?.projects.total ?? 0)}
                    hint="Across kanban stages"
                    icon={<ListTodo className="size-4" strokeWidth={1.75} />}
                  />
                </div>
              </TabsContent>

              <TabsContent value="giving" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatTile
                    title="All-time total"
                    loading={isLoading}
                    value={formatMoney(overview?.giving.total || 0)}
                  />
                  <StatTile
                    title="In person"
                    loading={isLoading}
                    value={formatMoney(overview?.giving.inPerson || 0)}
                  />
                  <StatTile
                    title="Online"
                    loading={isLoading}
                    value={formatMoney(overview?.giving.online || 0)}
                  />
                  <StatTile
                    title="Posted / recorded"
                    loading={isLoading}
                    value={`${overview?.giving.postedCount ?? 0} / ${overview?.giving.recordedCount ?? 0}`}
                    hint="Ledger status"
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <ChartCard title="Giving by method" description="Channel mix across contributions">
                    <ChartContainer config={methodConfig} className="aspect-[16/10] w-full">
                      <BarChart data={methodBars} margin={{ left: 8, right: 8, top: 8 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={48}
                          tickFormatter={(v) => formatCompact(Number(v))}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              formatter={(value) => formatMoney(Number(value) || 0)}
                            />
                          }
                        />
                        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </ChartCard>
                  <ChartCard title="Giving by fund" description="Top funds by contribution amount">
                    <ChartContainer config={methodConfig} className="aspect-[16/10] w-full">
                      <BarChart
                        data={overview?.giving.byFund || []}
                        layout="vertical"
                        margin={{ left: 8, right: 16, top: 8 }}
                      >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => formatCompact(Number(v))}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              formatter={(value) => formatMoney(Number(value) || 0)}
                            />
                          }
                        />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </ChartCard>
                </div>
              </TabsContent>

              <TabsContent value="funds" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatTile
                    title="Budget"
                    loading={isLoading}
                    value={formatMoney(overview?.funds.totalBudget || 0)}
                  />
                  <StatTile
                    title="Expended"
                    loading={isLoading}
                    value={formatMoney(overview?.funds.totalExpended || 0)}
                  />
                  <StatTile
                    title="Available"
                    loading={isLoading}
                    value={formatMoney(overview?.funds.netAvailable || 0)}
                  />
                  <StatTile
                    title="Utilization"
                    loading={isLoading}
                    value={
                      overview?.funds.utilizationPct != null
                        ? `${overview.funds.utilizationPct}%`
                        : "—"
                    }
                  />
                </div>
                <ChartCard
                  title="Budget vs actual by fund"
                  description="Compare planned spend with expended and remaining available"
                >
                  <ChartContainer config={fundConfig} className="aspect-[21/9] w-full min-h-[260px]">
                    <BarChart data={fundBars} margin={{ left: 8, right: 8, top: 8 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={48}
                        tickFormatter={(v) => formatCompact(Number(v))}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => formatMoney(Number(value) || 0)}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="budget" fill="var(--color-budget)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expended" fill="var(--color-expended)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="available" fill="var(--color-available)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </ChartCard>
              </TabsContent>

              <TabsContent value="ops" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatTile
                    title="Campaigns"
                    loading={isLoading}
                    value={String(overview?.campaigns.total ?? 0)}
                    hint={`${overview?.campaigns.sent ?? 0} sent · ${overview?.campaigns.draft ?? 0} draft`}
                    icon={<Mail className="size-4" strokeWidth={1.75} />}
                  />
                  <StatTile
                    title="Schedules open"
                    loading={isLoading}
                    value={String(overview?.appointments.openSchedules ?? 0)}
                    hint={`${overview?.appointments.closedSchedules ?? 0} closed`}
                    icon={<CalendarClock className="size-4" strokeWidth={1.75} />}
                  />
                  <StatTile
                    title="Follow-ups done"
                    loading={isLoading}
                    value={String(overview?.followUps.done ?? 0)}
                    icon={<ListChecks className="size-4" strokeWidth={1.75} />}
                  />
                  <StatTile
                    title="Rolling attendance"
                    loading={isLoading}
                    value={formatCompact(overview?.attendance.rollingAvg || 0)}
                    hint="Avg recent weeks"
                    icon={<Church className="size-4" strokeWidth={1.75} />}
                  />
                </div>
                <ChartCard title="Project board" description="Tasks by kanban stage">
                  <ChartContainer config={projectConfig} className="aspect-[21/9] w-full min-h-[220px]">
                    <BarChart data={projectBars} margin={{ left: 8, right: 8, top: 8 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="title" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </ChartCard>
              </TabsContent>
            </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function MetricsPage() {
  return (
    <React.Suspense fallback={<AuthSearchParamsFallback />}>
      <MetricsPageInner />
    </React.Suspense>
  )
}
