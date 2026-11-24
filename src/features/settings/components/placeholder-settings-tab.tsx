"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function PlaceholderSettingsTab({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border bg-white p-8 text-center shadow-xs">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
      <Button
        className="mt-6 h-9 rounded-lg bg-[#16a34a] text-sm text-white hover:bg-[#15803d]"
        onClick={() => toast.message("Coming in a later release")}
      >
        Notify me
      </Button>
    </div>
  )
}
