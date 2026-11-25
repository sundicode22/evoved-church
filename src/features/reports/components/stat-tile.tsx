"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

type StatTileProps = {
  title: string
  value: React.ReactNode
  hint?: string
  loading?: boolean
  deltaPct?: number | null
  icon?: React.ReactNode
  className?: string
}

export function StatTile({
  title,
  value,
  hint,
  loading,
  deltaPct,
  icon,
  className,
}: StatTileProps) {
  const hasDelta = typeof deltaPct === "number"
  const up = hasDelta && deltaPct > 0
  const down = hasDelta && deltaPct < 0

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-800">{title}</p>
        {icon ? (
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-2 min-h-9 text-3xl font-semibold tracking-tight text-zinc-950">
        {loading ? <Skeleton className="h-7 w-24" /> : value}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              up && "bg-brand-soft text-brand-ink",
              down && "bg-rose-50 text-rose-700",
              !up && !down && "bg-zinc-100 text-zinc-600"
            )}
          >
            {up ? (
              <TrendingUp className="size-3" strokeWidth={2} />
            ) : down ? (
              <TrendingDown className="size-3" strokeWidth={2} />
            ) : (
              <Minus className="size-3" strokeWidth={2} />
            )}
            {deltaPct > 0 ? "+" : ""}
            {deltaPct}%
          </span>
        ) : null}
        {hint ? <span className="text-sm text-zinc-700">{hint}</span> : null}
      </div>
    </div>
  )
}
