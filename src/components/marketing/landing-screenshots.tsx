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
    id: "giving",
    title: "Giving & funds",
    caption: "Placeholder — drop your giving screenshot here.",
    icon: Coins,
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
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl sm:leading-[1.08]">
          See the real workspace
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
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
                  ? "border-[#6495ed] bg-[#eef3fc] text-[#2b4c8c] dark:bg-[#6495ed]/15 dark:text-[#a8c4f5]"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
        className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_40px_80px_-40px_rgba(15,23,42,0.25)] animate-in fade-in-0 duration-500 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3fc] text-[#4f7fd4] dark:bg-[#6495ed]/20">
            <slide.icon className="size-6" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{slide.title}</p>
          <p className="max-w-sm px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Screenshot placeholder · replace with your capture
          </p>
          <div className="absolute inset-x-8 bottom-8 top-1/2 rounded-xl border border-dashed border-zinc-200/90 bg-white/60 dark:border-zinc-700 dark:bg-zinc-950/40" />
        </div>
        <figcaption className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:px-5">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{slide.title}</span>
          <span className="mx-2 text-zinc-300">·</span>
          {slide.caption}
        </figcaption>
      </figure>
    </div>
  )
}
