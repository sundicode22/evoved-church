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
  Mail01Icon,
  DropletIcon,
  Time02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

export default function SequencesPage() {
  const steps = [
    {
      step: 1,
      trigger: "+2 Hours after QR Check-in",
      subject: "Welcome to Grace City Church, [Visitor Name]!",
      channel: "Email via Resend",
      description: "Warm welcome letter from Senior Pastor David Johnson with a short 60-second video message.",
      openRate: "84.2%",
      active: true,
    },
    {
      step: 2,
      trigger: "+24 Hours after Sunday Service",
      subject: "Pastoral Connection & Coffee Invitation",
      channel: "SMS / WhatsApp",
      description: "Assigned Shepherd sends a personal text offering to buy coffee and answer questions about the church.",
      openRate: "96.0%",
      active: true,
    },
    {
      step: 3,
      trigger: "+4 Days (Thursday Evening)",
      subject: "This Sunday at Grace City + Kids Ministry Preview",
      channel: "Email via Resend",
      description: "Sneak peek of the upcoming worship sermon, parking guide, and children's check-in tips.",
      openRate: "68.5%",
      active: true,
    },
    {
      step: 4,
      trigger: "+10 Days after First Visit",
      subject: "Invitation to Foundations: Growth Track Class",
      channel: "Email & App Notification",
      description: "Invites the visitor to Step 1 of membership: Discovering Grace City's vision and core theology.",
      openRate: "52.1%",
      active: true,
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
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={DropletIcon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Automated Visitor Drip Sequences</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automated multi-touch nurture sequence transforming first-time guests into connected members.
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
                <span>Sequence Analytics</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-normal gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Add Drip Step</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Active Sequence: <strong className="text-zinc-800 dark:text-zinc-200">New Guest Follow-Up (4 Steps)</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Overall Conversion to Member: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">34.2%</strong></span>
            </div>
            <span className="text-[11px] text-zinc-400">Triggered automatically when guest checks in on Sunday</span>
          </div>
        </div>

        {/* SEQUENCE TIMELINE */}
        <div className="p-8 max-w-4xl space-y-6">
          {steps.map((st) => (
            <div
              key={st.step}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3 hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-xs">
                    #{st.step}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      {st.trigger}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                      {st.subject}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400">Open / Engagement</span>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{st.openRate}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-500 pl-11">{st.description}</p>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 pl-11 flex items-center justify-between text-xs text-zinc-400">
                <span>Channel: <strong className="text-zinc-700 dark:text-zinc-300">{st.channel}</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
                  <span>Active & Firing</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
