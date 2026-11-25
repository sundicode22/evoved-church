"use client"

import { cn } from "@/lib/utils"
import { NOMENCLATURE_PRESETS, type NomenclaturePresetKey } from "@/features/onboarding/presets"
import { CheckCircle2 } from "lucide-react"

interface TerminologyStepProps {
  value: NomenclaturePresetKey
  onChange: (key: NomenclaturePresetKey) => void
}

export function TerminologyStep({ value, onChange }: TerminologyStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-base text-zinc-600">
        Pick the language your church uses. You can fine-tune every term later in Settings.
      </p>
      <div className="grid gap-3">
        {NOMENCLATURE_PRESETS.map((preset) => {
          const selected = preset.key === value
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onChange(preset.key)}
              className={cn(
                "flex items-center justify-between rounded-xl border bg-white p-4 text-left shadow-xs transition-all",
                selected
                  ? "border-brand bg-brand-soft ring-1 ring-[var(--brand)]/20"
                  : "border-zinc-200/70 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <span>
                <span className="block text-sm font-semibold text-slate-900">{preset.label}</span>
                <span className="mt-0.5 block text-sm text-zinc-500">{preset.description}</span>
              </span>
              {selected && (
                <CheckCircle2 className="size-5 text-brand" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
