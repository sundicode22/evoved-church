import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface WizardStepperProps {
  steps: string[]
  current: number
}

export function WizardStepper({ steps, current }: WizardStepperProps) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold shadow-xs transition-colors",
                done && "border-brand bg-brand text-white",
                active && "border-brand bg-brand-soft text-brand-ink",
                !done && !active && "border-border bg-white text-zinc-400"
              )}
            >
              {done ? <Check strokeWidth={3} className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:block",
                active ? "text-brand" : "text-zinc-400"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className={cn("h-px flex-1", done ? "bg-brand" : "bg-border")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
