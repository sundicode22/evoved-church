"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  Download01Icon,
  PlusSignIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  Calendar03Icon,
  Location01Icon,
  UserCircle02Icon,
} from "@hugeicons/core-free-icons"

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const appointments = [
    {
      id: "app-1",
      day: "Monday",
      date: "January 19, 2024",
      time: "10:00 AM - 10:30 AM",
      title: "Pastoral Discovery Coffee with Brian Robbin",
      location: "4517 Washington Ave, Manchester, KY 39495",
      type: "First-Timer Follow-up",
      staff: "Pastor Ahmad Fawaid",
      status: "confirmed",
    },
    {
      id: "app-2",
      day: "Tuesday",
      date: "January 20, 2024",
      time: "2:00 PM - 3:00 PM",
      title: "Baptism Counseling & Foundations with Jane Cooper",
      location: "Main Sanctuary - Pastoral Office 102",
      type: "Spiritual Milestone",
      staff: "Pastor Marcus Vance",
      status: "confirmed",
    },
    {
      id: "app-3",
      day: "Thursday",
      date: "January 22, 2024",
      time: "11:30 AM - 12:30 PM",
      title: "Hospital Pastoral Care Visit with Eleanor Pena",
      location: "St. Jude Memorial Hospital - Room 412",
      type: "Hospital & Benevolence",
      staff: "Pastor David Johnson",
      status: "confirmed",
    },
    {
      id: "app-4",
      day: "Saturday",
      date: "January 24, 2024",
      time: "9:00 AM - 10:30 AM",
      title: "Life Group Leader Orientation with Kathryn Murphy",
      location: "Fellowship Hall - Room B",
      type: "Leadership Development",
      staff: "Pastor Ahmad Fawaid",
      status: "scheduled",
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
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Appointments & Pastoral Care Visits</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pastoral discovery sessions, baptism counseling, hospital visits, and newcomer coffees.
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
                <span>Sync Calendar</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Schedule Visit</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Scheduled This Week: <strong className="text-zinc-800 dark:text-zinc-200">4 visits</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Lead Shepherd: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Pastor Ahmad Fawaid</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search appointments..."
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

        {/* APPOINTMENTS LIST */}
        <div className="p-8 max-w-5xl space-y-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{app.day}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{app.date}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{app.time}</p>
                  <span className="inline-block mt-2 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                    {app.type}
                  </span>
                </div>

                <div className="flex-1 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {app.title}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className="size-3.5 text-zinc-400" />
                    <span>{app.location}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="size-5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white shadow-2xs">
                      AF
                    </div>
                    <span>Assigned Shepherd: <strong className="text-zinc-700 dark:text-zinc-300">{app.staff}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="size-8">
                    <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
