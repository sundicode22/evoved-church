"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import {
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import { RichTextEditor } from "@/components/rich-text-editor"
import { cn } from "@/lib/utils"

function parseYmd(value: string): Date | undefined {
  if (!value?.trim()) return undefined
  const d = parse(value.slice(0, 10), "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

function toYmd(date: Date | undefined): string {
  return date ? format(date, "yyyy-MM-dd") : ""
}

function parseDateTimeLocal(value: string): { date?: Date; time: string } {
  if (!value?.trim()) return { time: "09:00" }
  const d = new Date(value)
  if (!isValid(d)) return { time: "09:00" }
  return { date: d, time: format(d, "HH:mm") }
}

function toDateTimeLocal(date: Date | undefined, time: string): string {
  if (!date) return ""
  const [h = "09", m = "00"] = time.split(":")
  const next = new Date(date)
  next.setHours(Number(h), Number(m), 0, 0)
  return format(next, "yyyy-MM-dd'T'HH:mm")
}

type BaseProps<T extends FieldValues> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>
  name: FieldPath<T>
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function TextFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  type = "text",
  placeholder,
  autoFocus,
  minLength,
  inputMode,
  inputClassName,
  transform,
  autoComplete,
}: BaseProps<T> & {
  autoComplete?: string
  inputClassName?: string
  /** Normalise the typed value before it is stored (e.g. lowercase keys). */
  transform?: (value: string) => string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoFocus?: boolean
  minLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(transform ? transform(e.target.value) : e.target.value)
              }
              className={inputClassName}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              minLength={minLength}
              inputMode={inputMode}
              autoComplete={autoComplete}
              aria-invalid={fieldState.invalid}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TextareaFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  placeholder,
  rows = 3,
  maxLength,
  autoFocus,
  textareaClassName,
}: BaseProps<T> & {
  placeholder?: string
  rows?: number
  maxLength?: number
  autoFocus?: boolean
  textareaClassName?: string
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              autoFocus={autoFocus}
              className={textareaClassName}
              aria-invalid={fieldState.invalid}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function SelectFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  placeholder = "Select…",
  options,
  onValueChange,
}: BaseProps<T> & {
  placeholder?: string
  options: { value: string; label: string }[]
  onValueChange?: (value: string) => void
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            value={field.value ?? ""}
            items={options}
            onValueChange={(v) => {
              const next = v ?? ""
              field.onChange(next)
              onValueChange?.(next)
            }}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={cn("h-[39px] w-full shadow-xs")}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function NumberFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  placeholder,
  min,
  max,
  step = "any",
}: BaseProps<T> & {
  placeholder?: string
  min?: number
  max?: number
  step?: number | string
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={min}
              max={max}
              step={step}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              value={field.value === undefined || field.value === null ? "" : String(field.value)}
              onChange={(e) => {
                const raw = e.target.value
                field.onChange(raw === "" ? undefined : Number(raw))
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/** Shadcn DatePicker — stores `yyyy-MM-dd` string (empty when cleared). */
export function DateFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  placeholder,
  disablePast,
}: BaseProps<T> & {
  placeholder?: string
  disablePast?: boolean
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DatePicker
              value={parseYmd(String(field.value ?? ""))}
              onChange={(date) => field.onChange(toYmd(date))}
              placeholder={placeholder}
              disabled={disabled}
              disablePast={disablePast}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/** Shadcn TimePicker — stores `HH:mm` 24h string. */
export function TimeFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  minuteStep = 1,
}: BaseProps<T> & {
  minuteStep?: 1 | 5 | 15
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <TimePicker
              value={String(field.value || "09:00")}
              onChange={(v) => field.onChange(v)}
              disabled={disabled}
              minuteStep={minuteStep}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/** TipTap rich text — stores HTML string. */
export function RichTextFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  placeholder,
  minHeight = "220px",
  enableImages = false,
}: BaseProps<T> & {
  placeholder?: string
  minHeight?: string
  enableImages?: boolean
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RichTextEditor
              value={String(field.value ?? "")}
              onChange={(html) => field.onChange(html)}
              placeholder={placeholder}
              disabled={disabled}
              minHeight={minHeight}
              enableImages={enableImages}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/**
 * Shadcn DatePicker + TimePicker — stores `yyyy-MM-dd'T'HH:mm`
 * (compatible with previous datetime-local fields).
 */
export function DateTimeFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  disablePast,
  minuteStep = 1,
}: BaseProps<T> & {
  disablePast?: boolean
  minuteStep?: 1 | 5 | 15
}) {
  return (
    <FormField<T, FieldPath<T>>
      control={control}
      name={name}
      render={({ field }) => {
        const parsed = parseDateTimeLocal(String(field.value ?? ""))
        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="grid gap-2 sm:grid-cols-2">
                <DatePicker
                  value={parsed.date}
                  onChange={(date) =>
                    field.onChange(toDateTimeLocal(date, parsed.time || "09:00"))
                  }
                  disabled={disabled}
                  disablePast={disablePast}
                />
                <TimePicker
                  value={parsed.time || "09:00"}
                  onChange={(time) =>
                    field.onChange(toDateTimeLocal(parsed.date ?? new Date(), time))
                  }
                  disabled={disabled || !parsed.date}
                  minuteStep={minuteStep}
                />
              </div>
            </FormControl>
            {description ? <FormDescription>{description}</FormDescription> : null}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
