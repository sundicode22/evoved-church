"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Disallow dates before today. */
  disablePast?: boolean
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  disablePast,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            variant="outline"
            data-empty={!value}
            className={cn(
              "h-10 w-full justify-start gap-2 rounded-lg border-input bg-white px-3.5 text-left text-sm font-normal shadow-xs data-[empty=true]:text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon strokeWidth={1.8} className="size-3.5 text-emerald-600" />
        {value ? format(value, "PPP") : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={
            disablePast
              ? { before: new Date(new Date().setHours(0, 0, 0, 0)) }
              : undefined
          }
          onSelect={(date) => {
            onChange?.(date)
            if (date) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
