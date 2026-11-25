"use client"

import * as React from "react"
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
import { useBranchStore, type Campus } from "@/store/use-branch-store"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { useCampuses } from "@/features/campuses/hooks/use-campuses"

export function CampusSwitcher() {
  const { isMobile } = useSidebar()
  const { activeCampus, availableCampuses, setActiveCampus } = useBranchStore()
  const campusTermSingular = useNomenclatureStore((s) => s.nomenclature.campusTermSingular)
  useCampuses()

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
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-[10px] font-semibold tracking-wide text-zinc-700">
              LOGO
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-zinc-900">LOGO</span>
              <span className="truncate text-xs text-zinc-500">
                {activeCampus.name || "No location"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-zinc-400" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1.5 shadow-xs"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                Locations
              </DropdownMenuLabel>
              {availableCampuses.map((campus: Campus) => (
                <DropdownMenuItem
                  key={campus.id}
                  onClick={() => setActiveCampus(campus)}
                  className={`gap-2 rounded-lg p-2 ${
                    campus.id === activeCampus.id
                      ? "bg-brand-soft text-brand-ink"
                      : ""
                  }`}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border border-zinc-200 bg-white">
                    <Building2 className="size-3.5 text-zinc-500" strokeWidth={1.75} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">{campus.name}</span>
                    <span className="text-[11px] text-zinc-400 capitalize">
                      {campus.city} · {campus.type}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 rounded-lg p-2 text-brand">
                <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-emerald-300 bg-emerald-50/60">
                  <Plus className="size-3.5" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium">Add New {campusTermSingular}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
