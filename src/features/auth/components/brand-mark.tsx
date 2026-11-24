import Link from "next/link"

/** Logo placeholder — swap for a real mark when ready. */
export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <span
        className="flex size-9 items-center justify-center rounded-xl bg-[#16a34a] text-sm font-semibold text-white shadow-xs"
        aria-hidden
      >
        E
      </span>
      <span className="text-base font-semibold tracking-tight text-slate-900">
        Evolve <span className="text-[#16a34a]">ChMS</span>
      </span>
    </Link>
  )
}
