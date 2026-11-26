"use client"

import Link from "next/link"
import { ChurchLogo } from "@/components/church-logo"
import { useNomenclatureQuery } from "@/features/settings/hooks/use-nomenclature-api"

/** Church logo from settings; LOGO fallback until uploaded. */
export function BrandMark({ href = "/" }: { href?: string }) {
  useNomenclatureQuery()

  return (
    <Link href={href} className="inline-flex items-center">
      <ChurchLogo size="lg" showName nameClassName="text-xl" />
    </Link>
  )
}
