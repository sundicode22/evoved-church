"use client"

import * as React from "react"
import { useKanbanStore } from "@/store/use-kanban-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Mail01Icon,
  Call02Icon,
  Calendar03Icon,
  File01Icon,
  MoreHorizontalIcon,
  InformationCircleIcon,
  DropletIcon,
  Tick02Icon,
  PlusSignIcon,
  UserCircle02Icon,
  Building01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons"

export function DealDrawer() {
  const { isDrawerOpen, closeDealDrawer, selectedDealId } = useKanbanStore()
  const [activeTab, setActiveTab] = React.useState<"activity" | "appointments" | "proposals" | "notes" | "tasks">("activity")

  if (!isDrawerOpen) return null

  const stages = [
    { id: "new_leads", label: "New Leads", done: true },
    { id: "request_rec", label: "Request Rec...", done: true },
    { id: "in_draft", label: "In Draft", done: true },
    { id: "proposal_sent", label: "Proposal Sent", current: true },
    { id: "approved", label: "Approved", done: false },
    { id: "rejected", label: "Rejected", done: false },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300">
        
        {/* TOP STATUS HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-3.5 bg-zinc-50/60 dark:bg-zinc-900/40">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">2 of 7 in Proposal Sent Stage</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Pipeline: <strong className="text-zinc-800 dark:text-zinc-200">Deals Pipeline</strong></span>
              <span>|</span>
              <span className="flex items-center gap-1">
                Stage: <strong className="text-zinc-800 dark:text-zinc-200">Proposal Sent</strong>
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-3.5 text-zinc-400" />
              </span>
            </div>
            <span>•</span>
            <span>Been this stage for <strong className="text-zinc-700 dark:text-zinc-300">48 minutes</strong></span>
          </div>

          <button
            onClick={closeDealDrawer}
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <span>Close</span>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
          </button>
        </div>

        {/* STAGE STEPPER BAR & DRIP SEQUENCE CARD */}
        <div className="border-b border-zinc-200/80 px-6 py-4 bg-white dark:bg-zinc-950">
          {/* Stage pills stepper */}
          <div className="grid grid-cols-6 gap-2">
            {stages.map((st) => (
              <div
                key={st.id}
                className={`flex items-center justify-center py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  st.current
                    ? "bg-[#67d5c5]/25 text-[#00695c] border border-[#67d5c5] shadow-xs"
                    : st.done
                    ? "bg-[#b2ebf2]/30 text-[#00838f]"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                }`}
              >
                <span className="truncate">{st.label}</span>
              </div>
            ))}
          </div>

          {/* Drip sequence banner */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-900 border border-zinc-200/60">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <HugeiconsIcon icon={DropletIcon} strokeWidth={2} className="size-4" />
              </div>
              <div className="text-xs">
                <span className="text-zinc-500">Active sequence: </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Proposals Sequence</span>
                <button className="ml-2 text-xs font-medium text-emerald-600 hover:underline">Change</button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Next drip:</span>
              <span className="text-zinc-800 dark:text-zinc-200">Follow up proposal</span>
              <span className="text-zinc-400">· Scheduled for Tomorrow 12:39 PM</span>
            </div>
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN SPLIT */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT COLUMN: DEAL DETAILS */}
          <div className="w-[340px] shrink-0 border-r border-zinc-200/80 p-6 overflow-y-auto space-y-6 bg-zinc-50/40 dark:bg-zinc-900/20">
            
            {/* Tags & ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] font-bold tracking-wider">
                  HOT LEADS
                </Badge>
                <Badge variant="outline" className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] font-bold tracking-wider">
                  REPEAT
                </Badge>
              </div>
              <p className="text-xs font-medium text-zinc-400">Deal #192748</p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Paint & Drywall Repairs
              </h2>
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className="size-3.5" />
                <span>2972 Washington Ave</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium text-xs h-9 rounded-xl shadow-xs gap-1.5">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>New Proposal</span>
              </Button>
              <Button size="icon" variant="outline" className="size-9 rounded-xl border-zinc-200">
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4 text-zinc-600" />
              </Button>
              <Button size="icon" variant="outline" className="size-9 rounded-xl border-zinc-200">
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-600" />
              </Button>
            </div>

            {/* Amount card */}
            <div className="flex items-center justify-between rounded-xl bg-white p-3.5 shadow-xs border border-zinc-200/60 dark:bg-zinc-900">
              <div>
                <span className="text-[11px] font-medium text-zinc-400">Proposal Sent</span>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">$2,480.00</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold p-0 h-auto">
                View
              </Button>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contact Details</h4>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-pink-100 text-pink-700 font-bold text-xs">
                  BR
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Brian Robbin</p>
                  <p className="text-xs text-zinc-400">Primary Contact</p>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400">
                  <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-3.5 text-zinc-400" />
                  <span>brianrobbin@gmail.com</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400">
                  <HugeiconsIcon icon={Call02Icon} strokeWidth={2} className="size-3.5 text-zinc-400" />
                  <span>(831) 522-5847</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400">
                  <HugeiconsIcon icon={Building01Icon} strokeWidth={2} className="size-3.5 text-zinc-400" />
                  <span>Source: <strong>LinkedIn</strong></span>
                </div>
              </div>
            </div>

            {/* Salesperson / Assigned Shepherd */}
            <div className="space-y-3 pt-2 border-t border-zinc-200/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Salesperson / Shepherd</h4>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold text-xs">
                  AF
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Ahmad Fawaid</p>
                  <p className="text-[11px] text-zinc-400">Lead Minister</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 pt-2">Deal created Jan 16, 2024 9:34 AM</p>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVITY & TABS */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* Tab navigation */}
            <div className="flex items-center gap-6 border-b border-zinc-200/80 text-xs font-medium pb-2 text-zinc-500">
              <button
                onClick={() => setActiveTab("activity")}
                className={`relative pb-2 transition-colors ${
                  activeTab === "activity"
                    ? "font-semibold text-emerald-700 dark:text-emerald-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-emerald-600"
                    : "hover:text-zinc-800"
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`relative pb-2 transition-colors ${
                  activeTab === "appointments"
                    ? "font-semibold text-emerald-700 dark:text-emerald-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-emerald-600"
                    : "hover:text-zinc-800"
                }`}
              >
                Appointments <span className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-600">1</span>
              </button>
              <button
                onClick={() => setActiveTab("proposals")}
                className={`relative pb-2 transition-colors ${
                  activeTab === "proposals"
                    ? "font-semibold text-emerald-700 dark:text-emerald-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-emerald-600"
                    : "hover:text-zinc-800"
                }`}
              >
                Proposals <span className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-600">1</span>
              </button>
              <button className="hover:text-zinc-800 pb-2">Invoices</button>
              <button className="hover:text-zinc-800 pb-2">Notifications</button>
              <button className="hover:text-zinc-800 pb-2">Notes</button>
              <button className="hover:text-zinc-800 pb-2">Tasks</button>
            </div>

            {/* TAB CONTENT: ACTIVITY */}
            <div className="space-y-6">
              
              {/* Latest Activity section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Latest Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl bg-zinc-50/80 p-3.5 border border-zinc-200/50 dark:bg-zinc-900/50">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Email Delivered: Proposal Sent</span>
                        <span className="text-zinc-400 text-[11px]">Today 9:49 AM</span>
                      </div>
                      <p className="text-zinc-500 mt-1">Proposal has been sent the message to the customer&apos;s email.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-zinc-50/80 p-3.5 border border-zinc-200/50 dark:bg-zinc-900/50">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700 shrink-0">
                      <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Stage: Request Received → Proposal Sent</span>
                        <span className="text-zinc-400 text-[11px]">Today 9:48 AM</span>
                      </div>
                      <p className="text-zinc-500 mt-1">Deal #192748 has been moved to the Proposal Sent stage.</p>
                      <button className="text-[11px] font-medium text-emerald-600 hover:underline mt-1.5">Show more</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointments section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Appointments</h3>
                  <button className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
                    <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5" />
                    <span>Create appointment</span>
                  </button>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:bg-zinc-900 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Monday</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">January 19, 2024</p>
                      <p className="text-xs text-zinc-400">10 AM - 10:30 AM</p>
                    </div>
                    <div className="flex-1 pl-8">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          On-Site Estimate with Brian Robbin
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">4517 Washington Ave, Manchester, KY 39495</p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                        <div className="size-4 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-bold">AF</div>
                        <span>Ahmad Fawaid</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7">
                      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-400" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Proposals section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Proposals</h3>
                  <button className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
                    <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-3.5" />
                    <span>Create proposal</span>
                  </button>
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-4" />
                      </div>
                      <div>
                        <span className="text-xs text-emerald-700 font-semibold mr-2">#192783</span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Paint & Drywall Repairs</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-[10px] text-zinc-400">Amount</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">$2,480.00</p>
                        <span className="inline-block mt-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200">
                          PENDING
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="size-7">
                        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
