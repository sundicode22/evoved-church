"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  Download01Icon,
  PlusSignIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  Invoice01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Coins01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { useFunds, useRequisitions, useApproveRequisition } from "@/features/accounting/hooks/use-funds"

export default function AccountingPage() {
  const { data: fundsData, isLoading: fundsLoading } = useFunds()
  const { data: reqsData, isLoading: reqsLoading } = useRequisitions()
  const approveMutation = useApproveRequisition()
  const [searchQuery, setSearchQuery] = React.useState("")

  const funds = fundsData || []
  const requisitions = reqsData?.data || []

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
      <SidebarInset className="bg-[#fbfcfb] dark:bg-zinc-950 min-h-screen">
        
        {/* HEADER BAR */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Fund Accounting & Requisitions
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Restricted vs Unrestricted fund ledgers, encumbrance tracking, and multi-tier pastoral approvals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>

              <Button variant="outline" className="h-9 px-3.5 rounded-lg border-zinc-200 text-xs font-semibold gap-1.5 shadow-2xs">
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-3.5 text-zinc-600" />
                <span>Export Ledger</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>New Requisition</span>
              </Button>
            </div>
          </div>

          {/* SUB-BAR METRICS */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>Active Funds: <strong className="text-zinc-800 dark:text-zinc-200">{funds.length}</strong></span>
              <span className="text-zinc-300">·</span>
              <span>Total Available: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">$462,740.50</strong></span>
              <span className="text-zinc-300">·</span>
              <span>Encumbered (Committed): <strong className="text-amber-700 dark:text-amber-400 font-bold">$70,700.00</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-zinc-50 border-zinc-200 rounded-lg focus-visible:ring-emerald-500"
                />
              </div>

              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
                <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-3 text-zinc-500" />
                <span>Filter</span>
              </Button>

              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
                <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-3 text-zinc-500" />
                <span>Sort</span>
              </Button>
            </div>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="p-8 space-y-8">
          
          {/* FUND CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {funds.map((fund: any) => {
              const net = fund.balance - (fund.encumberedAmount || 0)
              const percentUsed = Math.min(100, Math.round(((fund.expendedAmount || 0) / (fund.budgetAmount || 1)) * 100))

              return (
                <div
                  key={fund.id}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold tracking-wider uppercase ${
                          fund.type === "unrestricted"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {fund.type.replace("_", " ")}
                      </Badge>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2 leading-tight">
                        {fund.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{fund.code}</p>
                    </div>

                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <HugeiconsIcon icon={Coins01Icon} strokeWidth={2} className="size-4" />
                    </div>
                  </div>

                  {/* Financial figures */}
                  <div className="space-y-1">
                    <p className="text-[11px] text-zinc-400 font-medium">Unencumbered Balance</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      ${net.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Encumbrance meter */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                    <div className="flex items-center justify-between text-zinc-500">
                      <span>Encumbered</span>
                      <span className="font-semibold text-amber-700">${Number(fund.encumberedAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentUsed}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                      <span>Budget: ${Number(fund.budgetAmount || 0).toLocaleString()}</span>
                      <span>{percentUsed}% spent</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* REQUISITIONS & EXPENSE APPROVAL PIPELINE */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Expense Requisitions & Multi-Tier Approvals
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Pastoral sign-off queue with automated budget encumbrance validation.
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                Tier 2 Active Queue
              </Badge>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 border-b border-zinc-200/70 text-zinc-400 font-semibold uppercase tracking-wider text-[11px] dark:bg-zinc-900/40">
                  <tr>
                    <th className="px-6 py-3.5">Requisition #</th>
                    <th className="px-6 py-3.5">Vendor</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Purpose</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Approval Tier</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {requisitions.map((req: any) => (
                    <tr key={req.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-emerald-700 dark:text-emerald-400">
                        {req.requisitionNumber}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {req.vendorName}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                        {req.department}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 max-w-xs truncate">
                        {req.description}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        ${Number(req.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                          <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="size-3.5 text-emerald-600" />
                          <span>Tier {req.currentTierLevel}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 uppercase">
                          {req.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              approveMutation.mutate({
                                id: req.id,
                                input: { decision: "approved", comments: "Approved by Campus Pastor" },
                              })
                            }
                            className="h-7 px-2.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-[11px] font-semibold gap-1 shadow-2xs"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2.5} className="size-3" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              approveMutation.mutate({
                                id: req.id,
                                input: { decision: "rejected", comments: "Budget limits exceeded" },
                              })
                            }
                            className="h-7 px-2.5 rounded-lg border-zinc-200 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
