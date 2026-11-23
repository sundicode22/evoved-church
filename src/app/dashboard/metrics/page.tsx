"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  Download01Icon,
  ChartHistogramIcon,
  Coins01Icon,
  UserGroupIcon,
  ChurchIcon,
} from "@hugeicons/core-free-icons"

export default function MetricsPage() {
  const statCards = [
    { title: "Weekly Sunday Attendance", val: "1,420", sub: "+12.4% vs last month", icon: ChurchIcon, color: "text-emerald-700 bg-emerald-50" },
    { title: "Giving YTD (All Funds)", val: "$295,400.00", sub: "98.2% of target budget", icon: Coins01Icon, color: "text-blue-700 bg-blue-50" },
    { title: "New Visitor Retention (30-day)", val: "34.2%", sub: "Industry benchmark: 15%", icon: UserGroupIcon, color: "text-purple-700 bg-purple-50" },
    { title: "Connected in Small Groups", val: "70 believers", sub: "88% of group capacity", icon: ChartHistogramIcon, color: "text-amber-700 bg-amber-50" },
  ]

  const fundBreakdown = [
    { name: "General Operating Fund", budget: "$250,000", collected: "$145,890.50", percent: 58 },
    { name: "Sanctuary Expansion & Capital", budget: "$500,000", collected: "$320,400.00", percent: 64 },
    { name: "World Missions & Church Plants", budget: "$75,000", collected: "$48,900.00", percent: 65 },
    { name: "Benevolence & Food Relief", budget: "$30,000", collected: "$18,250.00", percent: 61 },
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
        
        {/* HEADER BAR */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Executive Church Analytics & Metrics</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Attendance growth curves, financial stewardship health, and discipleship retention metrics.
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
                <span>Export Board PDF</span>
              </Button>
            </div>
          </div>
        </div>

        {/* METRICS BODY */}
        <div className="p-8 space-y-8">
          
          {/* STATS TILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((sc, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-zinc-500">{sc.title}</span>
                  <div className={`flex size-8 items-center justify-center rounded-lg ${sc.color}`}>
                    <HugeiconsIcon icon={sc.icon} strokeWidth={2} className="size-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{sc.val}</h3>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">{sc.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FUND HEALTH PROGRESS METERS */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Stewardship & Restricted Fund Health
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Budget targets vs. actual realization per fund.</p>
            </div>

            <div className="space-y-4">
              {fundBreakdown.map((fb, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fb.name}</span>
                    <span className="text-zinc-500">
                      <strong>{fb.collected}</strong> / {fb.budget} ({fb.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fb.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
