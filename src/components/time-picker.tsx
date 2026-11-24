"use client"

import * as React from "react"
import { cn } from "cn"

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = ["00", "15", "30", "45"]

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-input bg-white px-3.5 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"

interface TimePickerProps {
  /** 24-hour "HH:mm" string, e.g. "14:30". */
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

function TimePicker({ value = "09:00", onChange, disabled, className }: TimePickerProps) {
  const [hour = "09", minute = "00"] = value.split(":")
  // Snap odd minute values (e.g. "10") to the nearest listed option so the select stays controlled.
  const safeMinute = MINUTES.includes(minute) ? minute : "00"

  return (
    <div data-slot="time-picker" className={cn("flex items-center gap-2", className)}>
      <select
        aria-label="Hour"
        value={hour}
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
        onChange={(e) => onChange?.(`${hour}:${e.target.value}`)}
        className={selectClass}
      >
        {MINUTES.map((m) => (
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
