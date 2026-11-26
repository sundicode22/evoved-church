import Link from "next/link"

/** Temporary text mark until a real logo asset is uploaded. */
export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center">
      <span className="text-xl font-semibold tracking-tight text-black">LOGO</span>
    </Link>
  )
}
