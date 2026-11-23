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
  MoreHorizontalIcon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons"
import { useMembers, useUserCategories } from "@/features/members/hooks/use-members"

export default function MembersPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const { data: membersResponse, isLoading } = useMembers({
    personType: activeTab === "all" ? undefined : activeTab,
    search: searchQuery,
  })
  const { data: categories } = useUserCategories()

  const members = membersResponse?.data || []
  const pagination = membersResponse?.pagination

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
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                People & Members Directory
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Explicit lifecycle distinction: from first-time visitors to ordained ministers and elders.
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
                <span>Export Directory</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Add Person</span>
              </Button>
            </div>
          </div>

          {/* SUB-HEADER: TABS & FILTER TOOLBAR */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-xs font-semibold">
                {[
                  { id: "all", label: "All People" },
                  { id: "covenant_member", label: "Covenant Members" },
                  { id: "staff_minister", label: "Pastors & Elders" },
                  { id: "leader", label: "Group Leaders" },
                  { id: "prospect", label: "New Guests" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative pb-2 transition-colors ${
                      activeTab === t.id
                        ? "text-[#16a34a] font-bold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#16a34a]"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-zinc-400 pl-2 border-l border-zinc-200">
                <span>Total Active Records: <strong className="text-zinc-700 dark:text-zinc-300">{members.length}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search people..."
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

        {/* DIRECTORY TABLE */}
        <div className="p-8">
          <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 border-b border-zinc-200/70 text-zinc-400 font-semibold uppercase tracking-wider text-[11px] dark:bg-zinc-900/40">
                  <tr>
                    <th className="px-6 py-3.5">Name & Ecclesiastical Title</th>
                    <th className="px-6 py-3.5">Category & Lifecycle</th>
                    <th className="px-6 py-3.5">Serving Ministries</th>
                    <th className="px-6 py-3.5">Ordination / Sacraments</th>
                    <th className="px-6 py-3.5">Child Safety Clearance</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {members.map((person: any) => (
                    <tr key={person.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                              {person.firstName} {person.lastName}
                            </p>
                            {person.recordedTitle ? (
                              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                {person.recordedTitle}
                              </p>
                            ) : (
                              <p className="text-[11px] text-zinc-400">Main Campus</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 uppercase">
                          {person.personType.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {person.ministryRoles && person.ministryRoles.length > 0 ? (
                            person.ministryRoles.map((role: string) => (
                              <span
                                key={role}
                                className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-zinc-400 italic">None assigned</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {person.ordinationDate ? (
                          <div className="text-[11px]">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Ordained: </span>
                            <span className="text-zinc-500">{person.ordinationDate}</span>
                          </div>
                        ) : person.baptismDate ? (
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3 text-emerald-600" />
                            <span>Water Baptized ({person.baptismDate})</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {person.backgroundCheckStatus === "cleared" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} className="size-3 text-emerald-600" />
                            <span>Cleared (Expires 2027)</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400">Not required</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="size-8">
                          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-400" />
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
