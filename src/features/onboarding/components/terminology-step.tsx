"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { NOMENCLATURE_PRESETS, type NomenclaturePresetKey } from "@/features/onboarding/presets"
import { ONBOARDING_STEP_FORM_ID } from "@/features/onboarding/components/church-step"
import { CheckCircle2 } from "lucide-react"

const PRESET_KEYS = NOMENCLATURE_PRESETS.map((p) => p.key) as [
  NomenclaturePresetKey,
  ...NomenclaturePresetKey[],
]

export const terminologyStepSchema = z.object({
  preset: z.enum(PRESET_KEYS),
})

export type TerminologyStepValues = z.infer<typeof terminologyStepSchema>

interface TerminologyStepProps {
  defaultValues: TerminologyStepValues
  onContinue: (values: TerminologyStepValues) => void
}

export function TerminologyStep({ defaultValues, onContinue }: TerminologyStepProps) {
  const form = useForm<TerminologyStepValues>({
    resolver: zodResolver(terminologyStepSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form
        id={ONBOARDING_STEP_FORM_ID}
        noValidate
        onSubmit={form.handleSubmit((values) => onContinue(values))}
      >
        <FieldGroup>
          <FormField
            control={form.control}
            name="preset"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <p className="text-base text-zinc-600">
                  Pick the language your church uses. You can fine-tune every term later in
                  Settings.
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
                            "flex items-center justify-between rounded-xl border bg-white p-4 text-left shadow-xs transition-all",
                            selected
                              ? "border-brand bg-brand-soft ring-1 ring-[var(--brand)]/20"
                              : "border-zinc-200/70 hover:border-zinc-300 hover:bg-zinc-50"
                          )}
                        >
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {preset.label}
                            </span>
                            <span className="mt-0.5 block text-sm text-zinc-500">
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
      </form>
    </Form>
  )
}
