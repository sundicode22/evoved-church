"use client"

import * as React from "react"
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CalendarOccurrence } from "@/features/calendar/schemas"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const TYPE_DOT: Record<string, string> = {
  worship: "bg-brand",
  ministry: "bg-accent-cta",
  outreach: "bg-amber-500",
  training: "bg-sky-500",
  fellowship: "bg-violet-500",
  other: "bg-muted-foreground",
}

export function MonthGrid({
  month,
  onMonthChange,
  selectedDay,
  onSelectDay,
  occurrences,
  onEventClick,
}: {
  month: Date
  onMonthChange: (d: Date) => void
  selectedDay: Date | null
  onSelectDay: (d: Date) => void
  occurrences: CalendarOccurrence[]
  onEventClick?: (o: CalendarOccurrence) => void
}) {
  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }, [month])

  const byDay = React.useMemo(() => {
    const map = new Map<string, CalendarOccurrence[]>()
    for (const o of occurrences) {
      const key = format(parseISO(o.startsAt), "yyyy-MM-dd")
      const list = map.get(key) ?? []
      list.push(o)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    }
    return map
  }, [occurrences])

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-base font-medium text-foreground">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8"
            aria-label="Previous month"
            onClick={() => onMonthChange(addDays(startOfMonth(month), -1))}
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={() => {
              const now = new Date()
              onMonthChange(now)
              onSelectDay(now)
            }}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8"
            aria-label="Next month"
            onClick={() => onMonthChange(addDays(endOfMonth(month), 1))}
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(6.5rem,1fr)]">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const events = byDay.get(key) ?? []
          const inMonth = isSameMonth(day, month)
          const selected = selectedDay ? isSameDay(day, selectedDay) : false
          const today = isToday(day)
          const visible = events.slice(0, 3)
          const more = events.length - visible.length

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex min-h-[6.5rem] flex-col gap-1 border-b border-r border-border p-1.5 text-left transition-colors hover:bg-muted/50",
                !inMonth && "bg-muted/20 text-muted-foreground",
                selected && "bg-brand-soft/60 ring-1 ring-inset ring-brand/40"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-xs font-medium",
                  today && "bg-brand text-white",
                  !today && selected && "text-brand-ink",
                  !today && !selected && inMonth && "text-foreground",
                  !inMonth && "text-muted-foreground"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                {visible.map((o) => (
                  <span
                    key={o.id}
                    role="presentation"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(o)
                      onSelectDay(day)
                    }}
                    className="flex items-center gap-1 truncate rounded-md bg-muted px-1 py-0.5 text-[10px] leading-tight text-foreground hover:bg-muted/80"
                    title={o.programTitle}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        TYPE_DOT[o.programType] || TYPE_DOT.other
                      )}
                    />
                    <span className="truncate">
                      {!o.allDay ? `${format(parseISO(o.startsAt), "h:mma")} ` : ""}
                      {o.programTitle}
                    </span>
                  </span>
                ))}
                {more > 0 ? (
                  <span className="px-1 text-[10px] font-medium text-muted-foreground">
                    +{more} more
                  </span>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
