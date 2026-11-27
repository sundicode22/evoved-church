"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, ChevronsUpDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChurchLogo } from "@/components/church-logo"
import { useBranchStore, type Campus } from "@/store/use-branch-store"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { useCampuses } from "@/features/campuses/hooks/use-campuses"

export function CampusSwitcher() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { activeCampus, availableCampuses, setActiveCampus } = useBranchStore()
  const campusTermSingular = useNomenclatureStore((s) => s.nomenclature.campusTermSingular)
  const campusTermPlural = useNomenclatureStore((s) => s.nomenclature.campusTermPlural)
  const churchName = useNomenclatureStore((s) => s.nomenclature.churchName)
  useCampuses()

  const orgLabel = churchName?.trim() || "Organization"
  const locationLabel = activeCampus.name?.trim() || `Select ${campusTermSingular.toLowerCase()}`

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <ChurchLogo size="md" markClassName="rounded-lg" />
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold tracking-tight text-foreground">
                {orgLabel}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Workspace · {locationLabel}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-64 rounded-lg p-1"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Organization
              </DropdownMenuLabel>
              <div className="px-2 pb-2 pt-0.5">
                <p className="truncate text-sm font-medium text-foreground">{orgLabel}</p>
                <p className="text-[11px] text-muted-foreground">
                  Switch {campusTermSingular.toLowerCase()} to change this workspace
                </p>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {campusTermPlural} · workspace
              </DropdownMenuLabel>
              {availableCampuses.map((campus: Campus) => (
                <DropdownMenuItem
                  key={campus.id}
                  onClick={() => setActiveCampus(campus)}
                  className={`gap-2 rounded-lg p-2 ${
                    campus.id === activeCampus.id ? "bg-brand-soft text-brand-ink" : ""
                  }`}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-border bg-card">
                    <Building2 className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">{campus.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground capitalize">
                      {campus.city ? `${campus.city} · ` : ""}
                      {campus.type.replaceAll("_", " ")}
                      {campus.id === activeCampus.id ? " · active" : ""}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-2 rounded-lg p-2"
                onClick={() => router.push("/workspaces?choose=1")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-border bg-card">
                  <Building2 className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium">Switch church</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 rounded-lg p-2 text-brand"
                onClick={() => router.push("/dashboard/settings?tab=locations")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-brand/40 bg-brand-soft">
                  <Plus className="size-3.5" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium">Add {campusTermSingular}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
