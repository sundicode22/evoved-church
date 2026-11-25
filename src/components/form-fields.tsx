"use client"

import * as React from "react"
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
import { cn } from "@/lib/utils"

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
}: BaseProps<T> & {
  placeholder?: string
  options: { value: string; label: string }[]
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
            onValueChange={(v) => field.onChange(v ?? "")}
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
