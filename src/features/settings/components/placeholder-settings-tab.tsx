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
    <div className="max-w-xl rounded-xl border border-zinc-200/80 bg-white p-6 text-left shadow-xs md:p-8">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
      <Button
        variant="primary"
        className="mt-6 h-9 rounded-lg text-sm"
        onClick={() => toast.message("Coming in a later release")}
      >
        Notify me
      </Button>
    </div>
  )
}
