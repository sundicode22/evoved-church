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
  UserCircle02Icon,
  Location01Icon,
  Calendar03Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const smallGroups = [
    {
      id: "grp-1",
      name: "Downtown Young Professionals Life Group",
      category: "Young Adults",
      leader: "Kathryn Murphy",
      leaderAvatar: "KM",
      day: "Wednesday",
      time: "7:00 PM",
      location: "255 Columbus Cir, Apt 4B",
      membersCount: 14,
      capacity: 15,
      activeStudy: "The Book of Romans: Grace Unleashed",
    },
    {
      id: "grp-2",
      name: "North Campus Marriage & Family Fellowship",
      category: "Couples & Families",
      leader: "Marcus & Rachel Vance",
      leaderAvatar: "MV",
      day: "Thursday",
      time: "6:30 PM",
      location: "1740 Madison Ave",
      membersCount: 18,
      capacity: 20,
      activeStudy: "The Meaning of Marriage by Tim Keller",
    },
    {
      id: "grp-3",
      name: "Iron Sharpens Iron (Men's Bible Study)",
      category: "Men",
      leader: "Brian Robbin",
      leaderAvatar: "BR",
      day: "Saturday",
      time: "7:30 AM",
      location: "Sanctuary Cafe Lounge",
      membersCount: 22,
      capacity: 25,
      activeStudy: "Disciplines of a Godly Man",
    },
    {
      id: "grp-4",
      name: "Women of Grace & Intercessory Prayer",
      category: "Women",
      leader: "Sarah Miller",
      leaderAvatar: "SM",
      day: "Tuesday",
      time: "10:00 AM",
      location: "Main Sanctuary Prayer Chapel",
      membersCount: 16,
      capacity: 20,
      activeStudy: "Fervent Prayer Study Guide",
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
        
        {/* HEADER BAR */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Small Groups & Cell Ministry</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Weekly home fellowships, curriculum distribution, and cell leader attendance reports.
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
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-3.5 text-zinc-600" />
                <span>Export Groups</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-normal gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>New Small Group</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Active Groups: <strong className="text-zinc-800 dark:text-zinc-200">4 circles</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Total Disciples in Community: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">70 believers (88% capacity)</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search groups or leaders..."
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

        {/* GROUPS GRID */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {smallGroups.map((group) => {
            const fillPercent = Math.round((group.membersCount / group.capacity) * 100)

            return (
              <div
                key={group.id}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold uppercase">
                      {group.category}
                    </Badge>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-2">
                      {group.name}
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8">
                    <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-400" />
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.8} className="size-3.5 text-emerald-600" />
                    <span>Every {group.day} at <strong>{group.time}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className="size-3.5 text-zinc-400" />
                    <span>{group.location}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Current Study Guide</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{group.activeStudy}</p>
                </div>

                {/* Capacity & Leader */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[9px]">
                      {group.leaderAvatar}
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-300 font-medium">Leader: {group.leader}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{group.membersCount} / {group.capacity}</span>
                    <span className="text-[10px] text-zinc-400 ml-1">({fillPercent}%)</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
