import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChurchIcon } from "@hugeicons/core-free-icons"

export function BrandMark() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#16a34a] text-white shadow-sm shadow-emerald-600/20">
        <HugeiconsIcon icon={ChurchIcon} strokeWidth={2} className="size-5" />
      </span>
      <span className="text-base font-semibold tracking-tight text-slate-900">
        Evolve <span className="text-[#16a34a]">ChMS</span>
      </span>
    </Link>
  )
}
