"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { useBranchStore, Campus } from "@/store/use-branch-store"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building01Icon, ArrowUpDownIcon, PlusSignIcon } from "@hugeicons/core-free-icons"

export function CampusSwitcher() {
  const { isMobile } = useSidebar()
  const { activeCampus, availableCampuses, setActiveCampus } = useBranchStore()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="hover:bg-zinc-100 dark:hover:bg-zinc-800 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <HugeiconsIcon icon={Building01Icon} strokeWidth={2} className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>evolve</span>
                <span className="text-xs px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-normal">
                  ChMS
                </span>
              </span>
              <span className="truncate text-xs text-zinc-500 font-medium">
                {activeCampus.name}
              </span>
            </div>
            <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="ml-auto size-4 text-zinc-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl p-2 shadow-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 py-1.5">
              Select Campus / Branch
            </DropdownMenuLabel>
            {availableCampuses.map((campus: Campus) => (
              <DropdownMenuItem
                key={campus.id}
                onClick={() => setActiveCampus(campus)}
                className={`gap-2 p-2 rounded-lg cursor-pointer ${
                  campus.id === activeCampus.id
                    ? "bg-emerald-50 text-emerald-900 font-medium dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <HugeiconsIcon icon={Building01Icon} strokeWidth={2} className="size-3.5 text-zinc-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm">{campus.name}</span>
                  <span className="text-[11px] text-zinc-400 capitalize">{campus.city} · {campus.type}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="gap-2 p-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 cursor-pointer">
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed border-emerald-300 bg-emerald-50/50">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5" />
              </div>
              <span>Add New Campus / Church Plant</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
