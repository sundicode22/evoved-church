"use client"

import { cn } from "@/lib/utils"

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-zinc-700">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
