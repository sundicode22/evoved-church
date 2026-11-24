"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
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
import { useFunds, useJournalEntries, useRequisitions } from "@/features/accounting/hooks/use-funds"
import { useVisitorBoard } from "@/features/visitors/hooks/use-visitor-leads"
import { useBranchStore } from "@/store/use-branch-store"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { PageHeader } from "@/components/page-header"
import { TablePanel } from "@/components/table-panel"
import { BarChart3, Church, Coins, Users } from "lucide-react"

export default function MetricsPage() {
  const locationLabel = useNomenclatureStore((s) => s.nomenclature.campusTermSingular)
  const activeCampus = useBranchStore((s) => s.activeCampus)
  const { data: funds } = useFunds()
  const { data: journal } = useJournalEntries()
  const { data: reqs } = useRequisitions()
  const { data: board } = useVisitorBoard()

  const fundList = (funds as any[]) || []
  const totalAvailable = fundList.reduce(
    (s, f) => s + (Number(f.balance) - Number(f.encumberedAmount || 0)),
    0
  )
  const totalBudget = fundList.reduce((s, f) => s + Number(f.budgetAmount || 0), 0)
  const totalLeads = board?.totalLeads ?? 0
  const stages = board?.stages || []
  const requisitions = reqs?.data || []
  const journals = (journal as any[]) || []

  const statCards = [
    {
      title: "Weekly attendance (demo)",
      val: "1,420",
      sub: `${locationLabel}: ${activeCampus.name}`,
      icon: Church,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Unencumbered funds",
      val: `$${totalAvailable.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      sub: `${fundList.length} active funds`,
      icon: Coins,
      color: "text-blue-700 bg-blue-50",
    },
    {
      title: "Visitor pipeline",
      val: String(totalLeads),
      sub: `${stages.length} stages`,
      icon: Users,
      color: "text-purple-700 bg-purple-50",
    },
    {
      title: "Budget utilization",
      val: totalBudget
        ? `${Math.round(
            (fundList.reduce((s, f) => s + Number(f.expendedAmount || 0), 0) / totalBudget) * 100
          )}%`
        : "—",
      sub: `of $${totalBudget.toLocaleString()} total budget`,
      icon: BarChart3,
      color: "text-amber-700 bg-amber-50",
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
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="reports.read">
          <PageHeader
            title="Reports"
            description={`Live metrics for the active ${locationLabel.toLowerCase()}.`}
            icon={<BarChart3 className="size-5 text-[#16a34a]" strokeWidth={1.75} />}
          />

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((c) => (
                <div
                  key={c.title}
                  className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className={`inline-flex size-9 items-center justify-center rounded-lg ${c.color}`}>
                    <c.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-medium">{c.title}</p>
                    <p className="text-xl font-medium text-zinc-900 mt-1">{c.val}</p>
                    <p className="text-[11px] text-zinc-400 mt-1">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Tabs defaultValue="funds">
              <TabsList>
                <TabsTrigger value="funds">Budget vs actual</TabsTrigger>
                <TabsTrigger value="funnel">Visitor funnel</TabsTrigger>
                <TabsTrigger value="expenses">Expense aging</TabsTrigger>
                <TabsTrigger value="ledger">Ledger activity</TabsTrigger>
              </TabsList>

              <TabsContent value="funds" className="mt-4">
                <TablePanel>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fund</TableHead>
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
                            <TableCell className="font-medium">{f.name}</TableCell>
                            <TableCell>${budget.toLocaleString()}</TableCell>
                            <TableCell>${expended.toLocaleString()}</TableCell>
                            <TableCell className="text-amber-700">${enc.toLocaleString()}</TableCell>
                            <TableCell className="font-medium text-emerald-700">
                              ${avail.toLocaleString()}
                            </TableCell>
                            <TableCell>{pct}%</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TablePanel>
              </TabsContent>

              <TabsContent value="funnel" className="mt-4">
                <TablePanel className="space-y-3 rounded-lg border bg-background p-5">
                  {stages.map((s: any) => {
                    const count = s.leadCount || s.leads?.length || 0
                    const width = totalLeads ? Math.max(8, Math.round((count / totalLeads) * 100)) : 8
                    return (
                      <div key={s.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-zinc-700">{s.title}</span>
                          <span className="text-zinc-500">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {!stages.length && (
                    <p className="text-sm text-zinc-500">No visitor board data yet.</p>
                  )}
                </TablePanel>
              </TabsContent>

              <TabsContent value="expenses" className="mt-4">
                <TablePanel>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requisition</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisitions.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium text-emerald-700">
                            {r.requisitionNumber}
                          </TableCell>
                          <TableCell>{r.vendorName}</TableCell>
                          <TableCell>${Number(r.amount).toFixed(2)}</TableCell>
                          <TableCell>Tier {r.currentTierLevel}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-[10px]">
                              {String(r.status).replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TablePanel>
              </TabsContent>

              <TabsContent value="ledger" className="mt-4">
                <TablePanel>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entry</TableHead>
                        <TableHead>Memo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created by</TableHead>
                        <TableHead>Posted by</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {journals.map((je: any) => (
                        <TableRow key={je.id}>
                          <TableCell className="font-medium text-emerald-700">
                            {je.entryNumber}
                          </TableCell>
                          <TableCell>{je.memo}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                je.status === "posted"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
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
