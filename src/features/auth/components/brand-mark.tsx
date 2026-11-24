import Link from "next/link"

/** Temporary text mark until a real logo asset is uploaded. */
export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center">
      <span className="text-base font-semibold tracking-tight text-slate-900">LOGO</span>
    </Link>
  )
}
