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
  ChurchIcon,
  MusicNote01Icon,
  Time02Icon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

export default function ServicesPage() {
  const serviceCues = [
    { time: "9:50 AM", duration: "10m", title: "Pre-Service Countdown & Atmosphere", leader: "Production Team", details: "Countdown video on LED wall, ambient synth pad" },
    { time: "10:00 AM", duration: "20m", title: "Praise & Worship Set", leader: "Sarah Miller (Worship Director)", details: "1. Lion and the Lamb (Key B) · 2. Goodness of God (Key G) · 3. Holy Forever (Key C#)" },
    { time: "10:20 AM", duration: "7m", title: "Pastoral Welcome & First-Timer Greeting", leader: "Pastor Ahmad Fawaid", details: "Highlight Sunday Connection QR card on screen" },
    { time: "10:27 AM", duration: "8m", title: "Tithes, Offerings & Announcements", leader: "Deaconess Kathryn Murphy", details: "Building Fund expansion update & online giving slides" },
    { time: "10:35 AM", duration: "35m", title: "Sermon: 'Walking in Supernatural Authority'", leader: "Pastor David Johnson", details: "Scripture: Ephesians 6:10-18 · Slides via ProPresenter" },
    { time: "11:10 AM", duration: "15m", title: "Altar Call & Ministry Prayer Response", leader: "Pastoral Care Team", details: "Altar ministers positioned at front, soft worship reprise" },
    { time: "11:25 AM", duration: "5m", title: "Benediction & Fellowship Dismissal", leader: "Pastor David Johnson", details: "Post-service refreshments in courtyard" },
  ]

  const volunteerRoster = [
    { role: "Front of House Sound (Audio)", name: "Caleb Vance", status: "confirmed", avatar: "CV" },
    { role: "Broadcast Video & Stream", name: "Rachel Adams", status: "confirmed", avatar: "RA" },
    { role: "ProPresenter Lyrics & Slides", name: "Tyler Jenkins", status: "confirmed", avatar: "TJ" },
    { role: "Lead Acoustic Guitar / Vocals", name: "Sarah Miller", status: "confirmed", avatar: "SM" },
    { role: "Electric Guitar", name: "Brian Robbin", status: "confirmed", avatar: "BR" },
    { role: "Head Usher & Security", name: "Marcus Vance", status: "confirmed", avatar: "MV" },
    { role: "Kids Church Check-in Lead", name: "Kathryn Murphy", status: "confirmed", avatar: "KM" },
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
                <HugeiconsIcon icon={ChurchIcon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Sunday Service Order & Volunteer Roster</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Next Service: <strong>Sunday, 10:00 AM Main Sanctuary</strong> · Target Duration: 90 minutes.
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
                <span>Export Run Sheet</span>
              </Button>

              <Button className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Add Item</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Status: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Published & Roster Notified</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Volunteers Confirmed: <strong className="text-zinc-800 dark:text-zinc-200">7 of 7 Ready</strong></span>
            </div>
            <span className="text-[11px] text-zinc-400">All automated rehearsal reminders delivered via SMS/Email</span>
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN SPLIT */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* RUN OF SERVICE CUE SHEET (2 COLS) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={Time02Icon} strokeWidth={2} className="size-4 text-emerald-600" />
                <span>Minute-by-Minute Order of Service</span>
              </h3>
              <span className="text-xs text-zinc-400">Total Run: 90m</span>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
              {serviceCues.map((cue, idx) => (
                <div key={idx} className="py-3.5 flex items-start gap-4 first:pt-0 last:pb-0 hover:bg-zinc-50/50 p-2 rounded-xl transition-colors">
                  <div className="w-16 shrink-0 text-center">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">{cue.time}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200 inline-block mt-0.5">
                      {cue.duration}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cue.title}</h4>
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Leader: {cue.leader}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">{cue.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VOLUNTEER SERVING ROSTER (1 COL) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-4 text-emerald-600" />
                <span>Serving Roster</span>
              </h3>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                100% RSVP
              </Badge>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3.5">
              {volunteerRoster.map((vol, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {vol.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{vol.name}</p>
                      <p className="text-[10px] text-zinc-400">{vol.role}</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3" />
                    <span>Confirmed</span>
                  </span>
                </div>
              ))}

              <Button variant="outline" className="w-full text-xs font-semibold h-8 mt-2 border-dashed border-zinc-300">
                + Assign Substitute / Volunteer
              </Button>
            </div>
          </div>

        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
