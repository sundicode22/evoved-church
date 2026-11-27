"use client"

import * as React from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coins,
  LayoutDashboard,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type Slide = {
  id: string
  title: string
  caption: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const SLIDES: Slide[] = [
  {
    id: "dashboard",
    title: "Workspace home",
    caption: "Funds, giving pulse, and visitor care in one calm glance.",
    icon: LayoutDashboard,
  },
  {
    id: "people",
    title: "People & families",
    caption: "Households with roles—father, mother, guardian, and more.",
    icon: Users,
  },
  {
    id: "giving",
    title: "Giving & funds",
    caption: "Batches and fund books with a clear who-posted trail.",
    icon: Coins,
  },
  {
    id: "calendar",
    title: "Calendar",
    caption: "Month grid plus agenda for worship, midweek, and youth.",
    icon: CalendarDays,
  },
]

function Chrome({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_40px_80px_-40px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/90 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-zinc-300" />
        <span className="size-2.5 rounded-full bg-zinc-300" />
        <span className="size-2.5 rounded-full bg-zinc-300" />
        <Badge variant="secondary" className="ml-2 rounded-md font-normal">
          {label}
        </Badge>
      </div>
      <div className="bg-[#f7f8f7] p-3 sm:p-4">{children}</div>
    </div>
  )
}

function SlideDashboard() {
  return (
    <Chrome label="Dashboard · Main Location">
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <aside className="hidden space-y-1 rounded-xl border border-zinc-200/80 bg-white p-3 sm:block">
          {["Home", "People", "Visitors", "Giving", "Calendar"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs",
                i === 0 ? "bg-[#eef3fc] font-medium text-[#2b4c8c]" : "text-zinc-600"
              )}
            >
              {item}
            </div>
          ))}
        </aside>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Fund net", value: "$12.4k", p: 72 },
              { label: "Giving", value: "$2.1k", p: 54 },
              { label: "Visitors", value: "18", p: 40 },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-zinc-200/80 bg-white p-3">
                <p className="text-[11px] text-zinc-500">{s.label}</p>
                <p className="mt-0.5 text-lg font-medium tracking-tight">{s.value}</p>
                <Progress value={s.p} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-white p-3">
            <p className="mb-2 text-xs font-medium text-zinc-700">Weekly attendance</p>
            <div className="flex h-28 items-end gap-1.5">
              {[42, 58, 50, 72, 64, 90, 78].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-[#6495ed]/85"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Chrome>
  )
}

function SlidePeople() {
  return (
    <Chrome label="People · Families">
      <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5">
          <p className="text-sm font-medium">Members</p>
          <Badge className="rounded-md bg-[#eef3fc] text-[#2b4c8c] hover:bg-[#eef3fc]">
            248 people
          </Badge>
        </div>
        <div className="divide-y divide-zinc-100">
          {[
            { name: "Amara Okoye", role: "Head · Okoye household", tag: "Member" },
            { name: "Jordan Miles", role: "Father · Miles household", tag: "Volunteer" },
            { name: "Elena Ruiz", role: "Guardian · Ruiz household", tag: "Leader" },
            { name: "Noah Chen", role: "Son · Chen household", tag: "Youth" },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#eef3fc] text-xs font-medium text-[#2b4c8c]">
                  {row.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{row.name}</p>
                  <p className="text-xs text-zinc-500">{row.role}</p>
                </div>
              </div>
              <Badge variant="outline" className="font-normal">
                {row.tag}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  )
}

function SlideGiving() {
  return (
    <Chrome label="Giving · Fund ledger">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-zinc-200/80 bg-white p-3">
          <p className="text-xs font-medium text-zinc-500">This month</p>
          <p className="text-2xl font-medium tracking-tight">$48,920</p>
          <Progress value={68} className="h-1.5" />
          <p className="text-xs text-zinc-500">68% of pledge goal</p>
        </div>
        <div className="space-y-2 rounded-xl border border-zinc-200/80 bg-white p-3">
          <p className="text-xs font-medium text-zinc-500">Funds</p>
          {[
            { name: "General", amt: "$31.2k" },
            { name: "Building", amt: "$12.4k" },
            { name: "Missions", amt: "$5.3k" },
          ].map((f) => (
            <div key={f.name} className="flex justify-between text-sm">
              <span className="text-zinc-600">{f.name}</span>
              <span className="font-medium tabular-nums">{f.amt}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white p-3 sm:col-span-2">
          <p className="mb-2 text-xs font-medium text-zinc-700">Recent batches</p>
          <div className="space-y-2">
            {[
              { id: "Batch #184", by: "Posted by Jordan", status: "Posted" },
              { id: "Batch #183", by: "Created by Elena", status: "Draft" },
            ].map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{b.id}</p>
                  <p className="text-xs text-zinc-500">{b.by}</p>
                </div>
                <Badge
                  variant={b.status === "Posted" ? "default" : "secondary"}
                  className="rounded-md font-normal"
                >
                  {b.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Chrome>
  )
}

function SlideCalendar() {
  return (
    <Chrome label="Calendar · Month + Agenda">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">November 2026</p>
            <Badge variant="secondary" className="rounded-md font-normal">
              Month
            </Badge>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-zinc-400">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 5
              const active = day === 16 || day === 19 || day === 23
              return (
                <div
                  key={i}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-md text-xs",
                    day < 1 || day > 30
                      ? "text-zinc-300"
                      : active
                        ? "bg-[#6495ed] font-medium text-white"
                        : "bg-zinc-50 text-zinc-700"
                  )}
                >
                  {day > 0 && day <= 30 ? day : ""}
                </div>
              )
            })}
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-zinc-200/80 bg-white p-3">
          <p className="text-xs font-medium text-zinc-500">Agenda</p>
          {[
            { t: "10:00", title: "Sunday Worship", tag: "Worship" },
            { t: "14:00", title: "Youth group", tag: "Ministry" },
            { t: "18:30", title: "Prayer night", tag: "Prayer" },
          ].map((e) => (
            <div
              key={e.title}
              className="rounded-lg border border-zinc-100 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{e.title}</p>
                <Badge variant="secondary" className="font-normal">
                  {e.tag}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500">{e.t}</p>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  )
}

const RENDER: Record<string, () => React.ReactNode> = {
  dashboard: () => <SlideDashboard />,
  people: () => <SlidePeople />,
  giving: () => <SlideGiving />,
  calendar: () => <SlideCalendar />,
}

export function LandingScreenshots() {
  const [index, setIndex] = React.useState(0)
  const slide = SLIDES[index]!

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 5500)
    return () => window.clearInterval(id)
  }, [])

  function prev() {
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)
  }
  function next() {
    setIndex((i) => (i + 1) % SLIDES.length)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <Badge variant="secondary" className="rounded-md font-normal">
            Product tour
          </Badge>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-zinc-950">
            See the workspace, not a brochure
          </h2>
          <p className="mt-2 text-base text-zinc-600">
            Sliding views of the dashboard, people, giving, and calendar—how teams actually run
            Sunday.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={prev} aria-label="Previous">
            <ChevronLeft className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={next} aria-label="Next">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              i === index
                ? "border-[#6495ed] bg-[#eef3fc] text-[#2b4c8c]"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}
          >
            <s.icon className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="font-medium">{s.title}</span>
          </button>
        ))}
      </div>

      <div
        key={slide.id}
        className="animate-in fade-in-0 slide-in-from-right-2 duration-500"
        aria-live="polite"
      >
        {RENDER[slide.id]?.()}
        <p className="mt-3 text-sm text-zinc-500">{slide.caption}</p>
      </div>
    </div>
  )
}
