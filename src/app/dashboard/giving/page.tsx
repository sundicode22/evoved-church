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
  Coins01Icon,
  CreditCardIcon,
  File01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

export default function GivingPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const contributions = [
    { id: "tx-1", donor: "Brian Robbin", fund: "General Operating Fund", method: "ACH Direct Bank", amount: 1250.0, date: "Nov 22, 2024", envelope: "#104", status: "cleared" },
    { id: "tx-2", donor: "Eleanor Pena", fund: "Sanctuary Capital Campaign", method: "Online Card (Stripe)", amount: 2500.0, date: "Nov 21, 2024", envelope: "#208", status: "cleared" },
    { id: "tx-3", donor: "Jane Cooper", fund: "General Operating Fund", method: "Sunday Envelope (Check)", amount: 500.0, date: "Nov 17, 2024", envelope: "#312", status: "cleared" },
    { id: "tx-4", donor: "Ahmad Fawaid", fund: "World Missions", method: "Online Card (Recurring)", amount: 350.0, date: "Nov 15, 2024", envelope: "#115", status: "cleared" },
    { id: "tx-5", donor: "Kathryn Murphy", fund: "Benevolence & Food Pantry", method: "Cash Envelope", amount: 200.0, date: "Nov 17, 2024", envelope: "#405", status: "cleared" },
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
      <SidebarInset className="bg-[#fbfcfb] dark:bg-zinc-950 min-h-screen">
        
        {/* TOP HEADER */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={Coins01Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Tithes, Offerings & Stewardship</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-channel giving records, Sunday collection batch entries, and 501(c)(3) compliant tax statements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>

              <Button variant="outline" className="h-9 px-3.5 rounded-lg border-zinc-200 text-xs font-normal gap-1.5 shadow-2xs">
                <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-3.5 text-zinc-600" />
                <span>Batch Tax Statements</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-normal gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Record Sunday Batch</span>
              </Button>
            </div>
          </div>

          {/* SUB-HEADER METRICS */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>Total Giving YTD: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">$295,400.00</strong></span>
              <span className="text-zinc-300">·</span>
              <span>Building Pledges: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">$145,000.00</strong></span>
              <span className="text-zinc-300">·</span>
              <span>Online vs Envelope: <strong className="text-zinc-700 dark:text-zinc-300">68% Digital</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search contributions..."
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

        {/* CONTRIBUTIONS TABLE */}
        <div className="p-8">
          <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 border-b border-zinc-200/70 text-zinc-400 font-semibold uppercase tracking-wider text-[11px] dark:bg-zinc-900/40">
                  <tr>
                    <th className="px-6 py-3.5">Donor Name</th>
                    <th className="px-6 py-3.5">Fund Designation</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Envelope #</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Tax Status</th>
                    <th className="px-6 py-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {contributions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {tx.donor}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {tx.fund}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                        {tx.method}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {tx.date}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono">
                        {tx.envelope}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200 text-[10px] font-semibold">
                          501(c)(3) Deductible
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 hover:text-emerald-700 font-normal gap-1">
                          <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-3" />
                          <span>Resend Email</span>
                        </Button>
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
