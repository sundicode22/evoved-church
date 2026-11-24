"use client"

import * as React from "react"
import {
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

type AuthFormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  hint?: React.ReactNode
  className?: string
}

export function AuthFormField<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  hint,
  className,
}: AuthFormFieldProps<T>) {
  const [show, setShow] = React.useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (show ? "text" : "password") : type

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <div className="flex items-center justify-between gap-2">
            <FormLabel className="text-slate-700">{label}</FormLabel>
            {hint}
          </div>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                id={field.name}
                type={inputType}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                className={cn("h-10 rounded-lg bg-white", isPassword && "pr-10")}
              />
              {isPassword ? (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <EyeOff className="size-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-4" strokeWidth={1.75} />
                  )}
                </button>
              ) : null}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
