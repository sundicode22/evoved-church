"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Download, Filter as Filter, MoreHorizontal, Search as Search } from "lucide-react"

export type TableToolbarAction = {
  label: string
  onClick: () => void
  shortcut?: string
  destructive?: boolean
  disabled?: boolean
}

type TableToolbarProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  count?: number
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onExport?: () => void
  onFilter?: () => void
  moreActions?: TableToolbarAction[]
  primaryAction?: React.ReactNode
  children?: React.ReactNode
}

/**
 * Top-of-table chrome: title, search, ButtonGroup (export / filter / more).
 */
export function TableToolbar({
  title,
  description,
  icon,
  count,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  onExport,
  onFilter,
  moreActions = [],
  primaryAction,
  children,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200/70 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        {icon}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
            {typeof count === "number" && (
              <Badge variant="outline" className="text-[10px] tabular-nums">
                {count}
              </Badge>
            )}
          </div>
          {description && <p className="mt-0.5 text-xs text-zinc-400">{description}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {onSearchChange && (
          <div className="relative w-full min-w-[12rem] max-w-sm sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="border-zinc-200 bg-white pl-9 shadow-xs"
            />
          </div>
        )}

        {children}

        <ButtonGroup>
          {onFilter && (
            <Button type="button" variant="outline" onClick={onFilter}>
              <Filter className="size-3.5" />
              Filter
            </Button>
          )}
          {onExport && (
            <Button type="button" variant="secondary" onClick={onExport}>
              <Download className="size-3.5" />
              Export
            </Button>
          )}
          {moreActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" className="px-3" />}
              >
                <MoreHorizontal className="size-3.5" />
                <ChevronDown className="size-3.5 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] tracking-wider text-zinc-400 uppercase">
                    Table options
                  </DropdownMenuLabel>
                  {moreActions.map((a) => (
                    <DropdownMenuItem
                      key={a.label}
                      disabled={a.disabled}
                      variant={a.destructive ? "destructive" : "default"}
                      onClick={a.onClick}
                    >
                      {a.label}
                      {a.shortcut && (
                        <DropdownMenuShortcut>{a.shortcut}</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </ButtonGroup>

        {primaryAction}
      </div>
    </div>
  )
}
