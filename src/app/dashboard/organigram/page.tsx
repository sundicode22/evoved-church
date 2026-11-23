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
  PlusSignIcon,
  HierarchySquare02Icon,
  UserCircle02Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { useBranchStore } from "@/store/use-branch-store"

export default function OrganigramPage() {
  const { activeCampus } = useBranchStore()

  const orgTree = {
    root: {
      id: "node-1",
      title: "Senior Pastor / Bishop",
      name: "Pastor David Johnson",
      department: "Executive Spiritual Council",
      spanOfCare: 1420,
      avatar: "DJ",
      color: "border-emerald-500 bg-emerald-50/40 text-emerald-950",
    },
    executives: [
      {
        id: "node-2",
        title: "Executive Pastor (Operations)",
        name: "Rev. Marcus Vance",
        department: "Operations & Admin",
        spanOfCare: 680,
        avatar: "MV",
        color: "border-blue-400 bg-blue-50/40 text-blue-950",
      },
      {
        id: "node-3",
        title: "Campus Pastor (Main Campus)",
        name: "Ahmad Fawaid",
        department: "Pastoral Care & Worship",
        spanOfCare: 450,
        avatar: "AF",
        color: "border-emerald-400 bg-emerald-50/40 text-emerald-950",
      },
      {
        id: "node-4",
        title: "Executive Director of Finance",
        name: "Eleanor Pena",
        department: "Treasury & Stewardship",
        spanOfCare: 290,
        avatar: "EP",
        color: "border-amber-400 bg-amber-50/40 text-amber-950",
      },
    ],
    directors: [
      {
        id: "node-5",
        title: "Worship & Creative Arts Director",
        name: "Sarah Miller",
        department: "Creative Arts",
        spanOfCare: 45,
        avatar: "SM",
      },
      {
        id: "node-6",
        title: "Life Group Network Coordinator",
        name: "Kathryn Murphy",
        department: "Discipleship & Cells",
        spanOfCare: 180,
        avatar: "KM",
      },
      {
        id: "node-7",
        title: "Children & Youth Ministry Director",
        name: "Brian Robbin",
        department: "NextGen Ministries",
        spanOfCare: 120,
        avatar: "BR",
      },
    ],
  }

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
                <HugeiconsIcon icon={HierarchySquare02Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Church Organigram & Reporting Tree</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-branch visual hierarchy, pastoral reporting lines, and real-time span-of-care capacity metrics.
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
                <span>Export Org Chart</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Add Position</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Viewing Scope: <strong className="text-zinc-800 dark:text-zinc-200">{activeCampus.name}</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Total Shepherding Span: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">1,420 disciples</strong></span>
            </div>
            <span className="text-[11px] text-zinc-400">Drag & drop nodes to reorganize reporting relationships</span>
          </div>
        </div>

        {/* INTERACTIVE ORGANIGRAM CANVAS */}
        <div className="p-8 flex flex-col items-center">
          
          {/* ROOT LEVEL: SENIOR PASTOR */}
          <div className="flex flex-col items-center">
            <div className={`w-80 rounded-2xl border-2 p-5 shadow-sm bg-white dark:bg-zinc-900 border-emerald-500 hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    {orgTree.root.department}
                  </Badge>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                    {orgTree.root.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {orgTree.root.name}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                  {orgTree.root.avatar}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>Span of Care:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{orgTree.root.spanOfCare} members</span>
              </div>
            </div>

            {/* Tree Branch Line */}
            <div className="w-0.5 h-8 bg-zinc-300 dark:bg-zinc-700" />
            <div className="w-[640px] h-0.5 bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* LEVEL 2: EXECUTIVE PASTORS */}
          <div className="grid grid-cols-3 gap-8 mt-8 w-full max-w-4xl">
            {orgTree.executives.map((node) => (
              <div
                key={node.id}
                className="relative rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      {node.department}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {node.title}
                    </h4>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {node.name}
                    </p>
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
                    {node.avatar}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>Direct Oversight:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{node.spanOfCare}</span>
                </div>
              </div>
            ))}
          </div>

          {/* LEVEL 3: DIRECTORS & COORDINATORS */}
          <div className="w-0.5 h-8 bg-zinc-300 dark:bg-zinc-700 mt-4" />
          <div className="w-[720px] h-0.5 bg-zinc-300 dark:bg-zinc-700" />

          <div className="grid grid-cols-3 gap-8 mt-8 w-full max-w-4xl">
            {orgTree.directors.map((node) => (
              <div
                key={node.id}
                className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      {node.department}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {node.title}
                    </h4>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {node.name}
                    </p>
                  </div>
                  <div className="flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                    {node.avatar}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Assigned Leaders:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{node.spanOfCare}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
