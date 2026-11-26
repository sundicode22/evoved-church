"use client"

import type { ReactNode } from "react"
import { MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { ChurchLogo } from "@/components/church-logo"
import { useBranchStore } from "@/store/use-branch-store"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"

/**
 * Slim shell bar: trigger + church brand + active location workspace context.
 */
export function PageHeader({
  actions,
  children,
}: {
  /** @deprecated Unused — kept so existing call sites keep typechecking. */
  title?: ReactNode
  /** @deprecated Unused — page descriptions are not shown. */
  description?: ReactNode
  /** @deprecated Unused — icons are not shown in the shell bar. */
  icon?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  const activeCampus = useBranchStore((s) => s.activeCampus)
  const campusTermSingular = useNomenclatureStore((s) => s.nomenclature.campusTermSingular)
  const locationLabel = activeCampus.name?.trim() || `No ${campusTermSingular.toLowerCase()}`

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <ChurchLogo size="sm" showName nameClassName="text-sm" />
          <Separator orientation="vertical" className="mx-1 hidden h-4 sm:block" />
          <div
            className="hidden min-w-0 items-center gap-1.5 sm:flex"
            title={`${campusTermSingular} workspace`}
          >
            <MapPin className="size-3.5 shrink-0 text-brand" strokeWidth={1.75} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-foreground">{locationLabel}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {campusTermSingular} workspace
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 pr-3">
          {actions}
          <NotificationsDropdown />
          <ModeToggle />
        </div>
      </header>
      {children ? <div className="px-4 pt-4 lg:px-6">{children}</div> : null}
    </>
  )
}
