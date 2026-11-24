import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface WizardStepperProps {
  steps: string[]
  current: number
}

export function WizardStepper({ steps, current }: WizardStepperProps) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                done && "border-[#16a34a] bg-[#16a34a] text-white",
                active && "border-[#16a34a] bg-emerald-50 text-emerald-700",
                !done && !active && "border-zinc-200 bg-white text-zinc-400"
              )}
            >
              {done ? <HugeiconsIcon icon={Tick02Icon} strokeWidth={3} className="size-3" /> : i + 1}
            </span>
            <span className={cn("hidden text-xs font-medium sm:block", active ? "text-slate-900" : "text-zinc-400")}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className={cn("h-px flex-1", done ? "bg-[#16a34a]" : "bg-zinc-200")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
