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
  Task01Icon,
  Calendar03Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const columns = [
    {
      id: "todo",
      title: "TO DO",
      count: "3 tasks",
      tasks: [
        { id: "tsk-1", title: "Order Palm Sunday Branches", project: "Easter 2025", priority: "HIGH", assignee: "KM", due: "In 2 days" },
        { id: "tsk-2", title: "Renew Child Protection Insurance", project: "Compliance & Safety", priority: "URGENT", assignee: "MV", due: "Friday" },
        { id: "tsk-3", title: "Review New Small Group Curriculum", project: "Discipleship", priority: "NORMAL", assignee: "AF", due: "Next week" },
      ],
    },
    {
      id: "in_progress",
      title: "IN PROGRESS",
      count: "2 tasks",
      tasks: [
        { id: "tsk-4", title: "Install In-Ear Wireless Transmitters", project: "Sound Upgrade", priority: "HIGH", assignee: "SM", due: "Tomorrow" },
        { id: "tsk-5", title: "Publish Weekly Digital Bulletin", project: "Communications", priority: "NORMAL", assignee: "BR", due: "Saturday" },
      ],
    },
    {
      id: "review",
      title: "UNDER REVIEW",
      count: "1 task",
      tasks: [
        { id: "tsk-6", title: "Baptism Candidate Testimonies Review", project: "Spiritual Milestones", priority: "NORMAL", assignee: "DJ", due: "Today" },
      ],
    },
    {
      id: "done",
      title: "COMPLETED",
      count: "4 tasks",
      tasks: [
        { id: "tsk-7", title: "Submit Q3 Non-Profit Financials", project: "Accounting", priority: "HIGH", assignee: "EP", due: "Completed" },
        { id: "tsk-8", title: "Configure Sunday Check-in QR Cards", project: "Hospitality", priority: "NORMAL", assignee: "AF", due: "Completed" },
      ],
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
      <SidebarInset className="bg-[#fbfcfb] dark:bg-zinc-950 min-h-screen">
        
        {/* TOP HEADER */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={Task01Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Church Projects & Facility Tasks</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ministry action items, event logistics, conference setups, and building maintenance.
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
                <span>Export Tasks</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Open Ministry Tasks: <strong className="text-zinc-800 dark:text-zinc-200">6 pending</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Completed This Month: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">24 items</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search tasks..."
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

        {/* KANBAN BOARD */}
        <div className="flex flex-1 gap-6 p-8 overflow-x-auto items-start">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex w-72 shrink-0 flex-col rounded-2xl bg-[#f4f6f4]/60 dark:bg-zinc-900/40 p-3 border border-zinc-200/50"
            >
              <div className="flex items-center justify-between px-1 pb-3 pt-1">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {col.title}
                  </p>
                  <p className="text-xs font-semibold text-zinc-400 mt-0.5">{col.count}</p>
                </div>
                <button className="text-zinc-400 hover:text-zinc-600 p-1">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-400 cursor-pointer transition-all space-y-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {task.project}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                        {task.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.8} className="size-3 text-zinc-400" />
                        <span>{task.due}</span>
                      </div>
                      <div className="size-5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white">
                        {task.assignee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
