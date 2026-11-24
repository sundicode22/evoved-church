"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CheckCircle2, Download, Droplet, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { TableAddButton } from "@/components/table-panel"

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
      <SidebarInset className="min-h-screen bg-white dark:bg-zinc-950">
        
        <PageHeader
          title="Communications"
          description="Automated follow-up sequences for first-time guests."
          icon={<Droplet className="size-5 text-[#16a34a]" strokeWidth={1.75} />}
          actions={
            <>
              <TableAddButton>
                <Download className="size-3.5 text-zinc-500" strokeWidth={1.75} />
                Sequence Analytics
              </TableAddButton>
              <TableAddButton>
                <Plus className="size-3.5" strokeWidth={1.75} />
                Add Drip Step
              </TableAddButton>
            </>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <span>
              Active: <span className="text-zinc-800">New Guest Follow-Up (4 steps)</span>
              <span className="mx-2 text-zinc-300">·</span>
              Conversion to member: <span className="font-medium text-emerald-700">34.2%</span>
            </span>
            <span className="text-[11px] text-zinc-400">
              Triggered automatically when a guest checks in on Sunday
            </span>
          </div>
        </PageHeader>

        {/* SEQUENCE TIMELINE */}
        <div className="p-8 max-w-4xl space-y-6">
          {steps.map((st) => (
            <div
              key={st.step}
              className="rounded-lg border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3 hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-medium text-xs">
                    #{st.step}
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      {st.trigger}
                    </span>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                      {st.subject}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400">Open / Engagement</span>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{st.openRate}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-500 pl-11">{st.description}</p>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 pl-11 flex items-center justify-between text-xs text-zinc-400">
                <span>Channel: <strong className="text-zinc-700 dark:text-zinc-300">{st.channel}</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                  <CheckCircle2 className="size-3.5" />
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
