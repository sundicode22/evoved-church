"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toast } from "sonner"
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
  ArrowUp01Icon,
  ArrowDown01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

interface ServiceSegment {
  id: string
  title: string
  leader: string
  durationMinutes: number
  details: string
}

const SERVICE_START_MINUTES = 9 * 60 + 50

function formatClock(totalMinutes: number) {
  const h24 = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  const suffix = h24 >= 12 ? "PM" : "AM"
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`
}

const INITIAL_SEGMENTS: ServiceSegment[] = [
  { id: "seg-1", durationMinutes: 10, title: "Pre-Service Countdown & Atmosphere", leader: "Production Team", details: "Countdown video on LED wall, ambient synth pad" },
  { id: "seg-2", durationMinutes: 20, title: "Praise & Worship Set", leader: "Sarah Miller (Worship Director)", details: "1. Lion and the Lamb (Key B) · 2. Goodness of God (Key G) · 3. Holy Forever (Key C#)" },
  { id: "seg-3", durationMinutes: 7, title: "Pastoral Welcome & First-Timer Greeting", leader: "Pastor Ahmad Fawaid", details: "Highlight Sunday Connection QR card on screen" },
  { id: "seg-4", durationMinutes: 8, title: "Tithes, Offerings & Announcements", leader: "Deaconess Kathryn Murphy", details: "Building Fund expansion update & online giving slides" },
  { id: "seg-5", durationMinutes: 35, title: "Sermon: 'Walking in Supernatural Authority'", leader: "Pastor David Johnson", details: "Scripture: Ephesians 6:10-18 · Slides via ProPresenter" },
  { id: "seg-6", durationMinutes: 15, title: "Altar Call & Ministry Prayer Response", leader: "Pastoral Care Team", details: "Altar ministers positioned at front, soft worship reprise" },
  { id: "seg-7", durationMinutes: 5, title: "Benediction & Fellowship Dismissal", leader: "Pastor David Johnson", details: "Post-service refreshments in courtyard" },
]

export default function ServicesPage() {
  const [segments, setSegments] = React.useState<ServiceSegment[]>(INITIAL_SEGMENTS)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [draft, setDraft] = React.useState({ title: "", leader: "", durationMinutes: "10", details: "" })

  const totalMinutes = segments.reduce((sum, seg) => sum + seg.durationMinutes, 0)
  const startTimes = segments.reduce<number[]>((acc, seg, i) => {
    acc.push(i === 0 ? SERVICE_START_MINUTES : acc[i - 1] + segments[i - 1].durationMinutes)
    return acc
  }, [])

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= segments.length) return
    setSegments((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function remove(id: string) {
    setSegments((prev) => prev.filter((seg) => seg.id !== id))
    toast.success("Segment removed")
  }

  function addSegment(e: React.FormEvent) {
    e.preventDefault()
    const minutes = Number(draft.durationMinutes)
    if (!draft.title.trim()) {
      toast.error("Give the segment a title.")
      return
    }
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) {
      toast.error("Duration must be between 1 and 240 minutes.")
      return
    }
    setSegments((prev) => [
      ...prev,
      {
        id: `seg-${Date.now()}`,
        title: draft.title.trim(),
        leader: draft.leader.trim() || "To be assigned",
        durationMinutes: Math.round(minutes),
        details: draft.details.trim(),
      },
    ])
    setDraft({ title: "", leader: "", durationMinutes: "10", details: "" })
    setDialogOpen(false)
    toast.success("Segment added to the order of service")
  }

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
                Next Service: <strong>Sunday, 10:00 AM Main Sanctuary</strong> · Planned length: {totalMinutes} minutes.
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

              <Button
                onClick={() => setDialogOpen(true)}
                className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Add Segment</span>
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
              <span className="text-xs text-zinc-400">Total run: {totalMinutes}m</span>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
              {segments.length === 0 && (
                <p className="py-6 text-center text-xs text-zinc-500">
                  No segments yet. Add the first part of the service.
                </p>
              )}
              {segments.map((cue, idx) => (
                <div key={cue.id} className="py-3.5 flex items-start gap-4 first:pt-0 last:pb-0 hover:bg-zinc-50/50 p-2 rounded-xl transition-colors">
                  <div className="w-20 shrink-0 text-center">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">{formatClock(startTimes[idx])}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                      {cue.durationMinutes}m
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cue.title}</h4>
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Leader: {cue.leader}
                    </p>
                    {cue.details && <p className="text-[11px] text-zinc-500 mt-1">{cue.details}</p>}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={() => move(idx, -1)}
                      className="text-zinc-400 hover:text-emerald-700"
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move down"
                      disabled={idx === segments.length - 1}
                      onClick={() => move(idx, 1)}
                      className="text-zinc-400 hover:text-emerald-700"
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove segment"
                      onClick={() => remove(cue.id)}
                      className="text-zinc-400 hover:text-rose-600"
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
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

        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetContent side="right" inset size="sm" className="p-0">
            <form onSubmit={addSegment} className="flex h-full flex-col">
              <SheetHeader className="pr-12">
                <SheetTitle>Add a segment</SheetTitle>
                <SheetDescription>
                  It will be added to the end. Use the arrows to reorder.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="grid gap-1.5">
                  <Label htmlFor="seg-title" className="text-xs font-semibold text-zinc-700">
                    Title
                  </Label>
                  <Input
                    id="seg-title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Communion"
                    className="h-9 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 grid gap-1.5">
                    <Label htmlFor="seg-leader" className="text-xs font-semibold text-zinc-700">
                      Leader
                    </Label>
                    <Input
                      id="seg-leader"
                      value={draft.leader}
                      onChange={(e) => setDraft({ ...draft, leader: e.target.value })}
                      placeholder="Deacon Team"
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="seg-duration" className="text-xs font-semibold text-zinc-700">
                      Minutes
                    </Label>
                    <Input
                      id="seg-duration"
                      type="number"
                      min={1}
                      max={240}
                      value={draft.durationMinutes}
                      onChange={(e) => setDraft({ ...draft, durationMinutes: e.target.value })}
                      className="h-9 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="seg-details" className="text-xs font-semibold text-zinc-700">
                    Notes
                  </Label>
                  <Textarea
                    id="seg-details"
                    value={draft.details}
                    onChange={(e) => setDraft({ ...draft, details: e.target.value })}
                    placeholder="Songs, scripture, or cues for the team"
                    className="min-h-20 rounded-lg"
                  />
                </div>
              </SheetBody>
              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg px-4"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 rounded-lg bg-[#22c55e] px-4 font-semibold text-white hover:bg-[#16a34a]"
                >
                  Add segment
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

      </SidebarInset>
    </SidebarProvider>
  )
}
