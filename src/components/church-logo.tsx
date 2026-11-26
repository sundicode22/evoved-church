"use client"

import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { cn } from "@/lib/utils"

type ChurchLogoProps = {
  /** Square mark size (px classes via size). */
  size?: "sm" | "md" | "lg"
  /** Show church name beside the mark. */
  showName?: boolean
  className?: string
  markClassName?: string
  nameClassName?: string
}

const SIZE = {
  sm: "size-7 text-[9px]",
  md: "size-8 text-[10px]",
  lg: "size-10 text-xs",
} as const

/**
 * Authentic church brand mark from Settings → logo upload.
 * Falls back to a LOGO chip when no image is set yet.
 */
export function ChurchLogo({
  size = "md",
  showName = false,
  className,
  markClassName,
  nameClassName,
}: ChurchLogoProps) {
  const logoUrl = useNomenclatureStore((s) => s.nomenclature.logoUrl)
  const churchName = useNomenclatureStore((s) => s.nomenclature.churchName)
  const label = churchName?.trim() || "LOGO"

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-black",
          SIZE[size],
          markClassName
        )}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-semibold tracking-tight">LOGO</span>
        )}
      </span>
      {showName ? (
        <span
          className={cn(
            "truncate font-semibold tracking-tight text-foreground",
            nameClassName
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  )
}
