"use client"

import * as React from "react"
import { BarChart3, Church, Coins, HandCoins, Users } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequireAbility } from "@/components/auth/can"
import { TableChrome, TablePanel } from "@/components/table-panel"
import { useFunds, useJournalEntries, useRequisitions } from "@/features/accounting/hooks/use-funds"
import { useReportsOverview } from "@/features/reports/hooks/use-reports"
import { useBranchStore } from "@/store/use-branch-store"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { formatCompact, formatMoney } from "@/lib/format"

export default function MetricsPage() {
  const locationLabel = useNomenclatureStore((s) => s.nomenclature.campusTermSingular)
  const activeCampus = useBranchStore((s) => s.activeCampus)
  const { data: overview, isLoading } = useReportsOverview()
  const { data: funds } = useFunds()
  const { data: journal } = useJournalEntries()
  const { data: reqs } = useRequisitions()

  const fundList = (funds as any[]) || []
  const requisitions = reqs?.data || []
  const journals = (journal as any[]) || []

  const attendanceHeadcount =
    (overview?.attendance.headcountAdults || 0) + (overview?.attendance.headcountChildren || 0)

  const statCards = [
    {
      title: "Attendance headcount",
      val: isLoading ? "…" : formatCompact(attendanceHeadcount || 0),
      sub: `${overview?.attendance.sessionCount ?? 0} sessions · ${locationLabel}: ${activeCampus.name}`,
      icon: Church,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Unencumbered funds",
      val: isLoading ? "…" : formatMoney(overview?.funds.netAvailable || 0),
      sub: `${overview?.funds.count ?? fundList.length} active funds`,
      icon: Coins,
      color: "text-blue-700 bg-blue-50",
    },
    {
      title: "Giving total",
      val: isLoading ? "…" : formatMoney(overview?.giving.total || 0),
      sub: `${overview?.giving.postedCount ?? 0} posted · ${overview?.giving.recordedCount ?? 0} recorded`,
      icon: HandCoins,
      color: "text-emerald-700 bg-[#eaf5ea]",
    },
    {
      title: "Visitor pipeline",
      val: isLoading ? "…" : String(overview?.visitors.totalLeads ?? 0),
      sub: `${overview?.visitors.stages.length ?? 0} stages`,
      icon: Users,
      color: "text-[#1b5e20] bg-[#eaf5ea]",
    },
  ]

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
      <SidebarInset className="min-h-screen bg-[#fbfcfb]">
        <RequireAbility permission="reports.read">
          <PageHeader
            title="Reports and Metrics"
            description={`Live stats for the active ${locationLabel.toLowerCase()}.`}
            icon={<BarChart3 className="size-5 text-[#16a34a]" strokeWidth={1.75} />}
          />

          <div className="space-y-6 p-6 md:p-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((c) => (
                <div
                  key={c.title}
                  className="space-y-3 rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs"
                >
                  <div
                    className={`inline-flex size-9 items-center justify-center rounded-lg ${c.color}`}
                  >
                    <c.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400">{c.title}</p>
                    <p className="mt-1 text-xl font-medium text-zinc-900">{c.val}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Tabs defaultValue="giving">
              <TabsList>
                <TabsTrigger value="giving">Giving</TabsTrigger>
                <TabsTrigger value="funds">Budget vs actual</TabsTrigger>
                <TabsTrigger value="funnel">Visitor funnel</TabsTrigger>
                <TabsTrigger value="expenses">Expense aging</TabsTrigger>
                <TabsTrigger value="ledger">Ledger activity</TabsTrigger>
              </TabsList>

              <TabsContent value="giving" className="mt-4">
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: "Total", value: overview?.giving.total },
                    { label: "In-person", value: overview?.giving.inPerson },
                    { label: "Online", value: overview?.giving.online },
                    { label: "Recurring", value: overview?.giving.recurring },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border bg-white p-4 shadow-xs">
                      <p className="text-xs text-zinc-500">{s.label}</p>
                      <p className="mt-1 text-lg font-semibold text-zinc-900">
                        {isLoading ? <Skeleton className="h-6 w-20" /> : formatMoney(s.value || 0)}
                      </p>
                    </div>
                  ))}
                </div>
                <TablePanel>
                  <TableChrome />
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Metric</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="pl-4">Posted to books</TableCell>
                        <TableCell>{overview?.giving.postedCount ?? 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-4">Recorded (not posted)</TableCell>
                        <TableCell>{overview?.giving.recordedCount ?? 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-4">Budget utilization</TableCell>
                        <TableCell>
                          {overview?.funds.utilizationPct != null
                            ? `${overview.funds.utilizationPct}%`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TablePanel>
              </TabsContent>

              <TabsContent value="funds" className="mt-4">
                <TablePanel>
                  <TableChrome />
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Fund</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Expended</TableHead>
                        <TableHead>Encumbered</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>% spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundList.map((f: any) => {
                        const budget = Number(f.budgetAmount || 0)
                        const expended = Number(f.expendedAmount || 0)
                        const enc = Number(f.encumberedAmount || 0)
                        const avail = Number(f.balance || 0) - enc
                        const pct = budget ? Math.round((expended / budget) * 100) : 0
                        return (
                          <TableRow key={f.id}>
                            <TableCell className="pl-4 font-medium">{f.name}</TableCell>
                            <TableCell>{formatMoney(budget)}</TableCell>
                            <TableCell>{formatMoney(expended)}</TableCell>
                            <TableCell className="text-amber-700">{formatMoney(enc)}</TableCell>
                            <TableCell className="font-medium text-emerald-700">
                              {formatMoney(avail)}
                            </TableCell>
                            <TableCell>{pct}%</TableCell>
                          </TableRow>
                        )
                      })}
                      {!fundList.length ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                            No funds yet.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TablePanel>
              </TabsContent>

              <TabsContent value="funnel" className="mt-4">
                <TablePanel className="space-y-3 rounded-xl border bg-white p-5 shadow-xs">
                  {(overview?.visitors.stages || []).map((s) => {
                    const total = overview?.visitors.totalLeads || 0
                    const width = total ? Math.max(8, Math.round((s.count / total) * 100)) : 8
                    return (
                      <div key={s.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-zinc-700">{s.title}</span>
                          <span className="text-zinc-500">{s.count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className="h-full rounded-full bg-[#16a34a]"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {!overview?.visitors.stages.length ? (
                    <p className="text-sm text-zinc-500">No visitor board data yet.</p>
                  ) : null}
                </TablePanel>
              </TabsContent>

              <TabsContent value="expenses" className="mt-4">
                <TablePanel>
                  <TableChrome />
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Requisition</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="pl-4 font-medium text-emerald-700">
                            {r.requisitionNumber}
                          </TableCell>
                          <TableCell>{r.vendorName}</TableCell>
                          <TableCell>{formatMoney(Number(r.amount))}</TableCell>
                          <TableCell>Tier {r.currentTierLevel}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {String(r.status).replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!requisitions.length ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                            No requisitions.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TablePanel>
              </TabsContent>

              <TabsContent value="ledger" className="mt-4">
                <TablePanel>
                  <TableChrome />
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Entry</TableHead>
                        <TableHead>Memo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created by</TableHead>
                        <TableHead>Posted by</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {journals.map((je: any) => (
                        <TableRow key={je.id}>
                          <TableCell className="pl-4 font-medium text-emerald-700">
                            {je.entryNumber}
                          </TableCell>
                          <TableCell>{je.memo}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                je.status === "posted"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : ""
                              }
                            >
                              {je.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {je.createdByName || je.createdByUserId || "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {je.postedByName || je.postedByUserId || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!journals.length ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                            No journal entries.
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TablePanel>
              </TabsContent>
            </Tabs>
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
