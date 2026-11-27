"use client"

import * as React from "react"
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Slide = {
  id: string
  title: string
  caption: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

/** Replace these slots with your own section screenshots later. */
const SLIDES: Slide[] = [
  {
    id: "dashboard",
    title: "Workspace home",
    caption: "Placeholder — drop your dashboard screenshot here.",
    icon: LayoutDashboard,
  },
  {
    id: "people",
    title: "People & families",
    caption: "Placeholder — drop your people screenshot here.",
    icon: Users,
  },
  {
    id: "accounting",
    title: "Accounting",
    caption: "Placeholder — journal entries, COA, and fund ledger screenshot.",
    icon: BookOpen,
  },
  {
    id: "calendar",
    title: "Calendar",
    caption: "Placeholder — drop your calendar screenshot here.",
    icon: CalendarDays,
  },
]

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
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="secondary" className="rounded-md font-normal">
          Product tour
        </Badge>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
          See the real workspace
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Sliding section placeholders—swap in your own screenshots when ready.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                i === index
                  ? "border-brand bg-brand-soft text-brand-ink"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              <s.icon className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="font-medium">{s.title}</span>
            </button>
          ))}
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

      <figure
        key={slide.id}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs animate-in fade-in-0 duration-500"
      >
        <div className="relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-muted to-card">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <slide.icon className="size-6" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-medium text-foreground">{slide.title}</p>
          <p className="max-w-sm px-6 text-center text-xs text-muted-foreground">
            Screenshot placeholder · replace with your capture
          </p>
          <div className="absolute inset-x-8 bottom-8 top-1/2 rounded-xl border border-dashed border-border bg-background/60" />
        </div>
        <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-foreground sm:px-5">
          <span className="font-medium text-foreground">{slide.title}</span>
          <span className="mx-2 text-border">·</span>
          {slide.caption}
        </figcaption>
      </figure>
    </div>
  )
}
