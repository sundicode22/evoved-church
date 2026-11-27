import Link from "next/link"
import { EvolveLogo } from "@/components/evolve-logo"

/** Product mark on auth, onboarding, and the demo page. */
export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <EvolveLogo className="size-10" />
      <span className="font-display text-xl font-semibold tracking-normal text-foreground">Evolve</span>
    </Link>
  )
}
