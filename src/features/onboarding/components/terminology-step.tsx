"use client"

import { useFormContext } from "react-hook-form"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { NOMENCLATURE_PRESETS } from "@/features/onboarding/presets"
import type { OnboardingFormValues } from "@/features/onboarding/schemas"

export function TerminologyStep() {
  const { control } = useFormContext<OnboardingFormValues>()

  return (
    <FieldGroup>
      <FormField
        control={control}
        name="preset"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <p className="text-base text-muted-foreground">
              Pick the language your church uses. You can fine-tune every term later in Settings.
            </p>
            <FormControl>
              <div className="grid gap-3">
                {NOMENCLATURE_PRESETS.map((preset) => {
                  const selected = preset.key === field.value
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => field.onChange(preset.key)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border bg-card p-4 text-left shadow-xs transition-all",
                        selected
                          ? "border-brand bg-brand-soft ring-1 ring-[var(--brand)]/20"
                          : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                      )}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          {preset.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {preset.description}
                        </span>
                      </span>
                      {selected && <CheckCircle2 className="size-5 text-brand" />}
                    </button>
                  )
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FieldGroup>
  )
}
