"use client"

import * as React from "react"
import { cn } from "cn"

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

function minuteOptions(step: number) {
  const safe = step > 0 && 60 % step === 0 ? step : 1
  return Array.from({ length: 60 / safe }, (_, i) => String(i * safe).padStart(2, "0"))
}

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-input bg-background px-3.5 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"

interface TimePickerProps {
  /** 24-hour "HH:mm" string, e.g. "14:30". */
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  /** Minute increments. Default 1 (full hour). Use 15 for campaign schedules. */
  minuteStep?: 1 | 5 | 15
}

function TimePicker({
  value = "09:00",
  onChange,
  disabled,
  className,
  minuteStep = 1,
}: TimePickerProps) {
  const minutes = minuteOptions(minuteStep)
  const [hour = "09", minute = "00"] = value.split(":")
  const safeMinute = minutes.includes(minute)
    ? minute
    : minutes.reduce((best, m) =>
        Math.abs(Number(m) - Number(minute)) < Math.abs(Number(best) - Number(minute))
          ? m
          : best
      )

  return (
    <div data-slot="time-picker" className={cn("flex items-center gap-2", className)}>
      <select
        aria-label="Hour"
        value={hour.padStart(2, "0")}
        disabled={disabled}
        onChange={(e) => onChange?.(`${e.target.value}:${safeMinute}`)}
        className={selectClass}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-sm font-semibold text-zinc-400">:</span>
      <select
        aria-label="Minute"
        value={safeMinute}
        disabled={disabled}
        onChange={(e) => onChange?.(`${hour.padStart(2, "0")}:${e.target.value}`)}
        className={selectClass}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  )
}

export { TimePicker }
export type { TimePickerProps }
