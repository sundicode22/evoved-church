"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Same frame as the dashboard data table: toolbar, bordered table, footer. */
export function TablePanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        "**:data-[slot=table-container]:overflow-hidden **:data-[slot=table-container]:rounded-lg **:data-[slot=table-container]:border **:data-[slot=table-container]:bg-background",
        className
      )}
    >
      {children}
    </div>
  )
}

export type ColumnOption = {
  id: string
  label: string
  defaultVisible?: boolean
}

export function useColumnVisibility(columns: ColumnOption[]) {
  const [visible, setVisible] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.id, c.defaultVisible !== false]))
  )

  const isVisible = React.useCallback((id: string) => visible[id] !== false, [visible])

  const toggle = React.useCallback((id: string, next?: boolean) => {
    setVisible((prev) => ({
      ...prev,
      [id]: typeof next === "boolean" ? next : !prev[id],
    }))
  }, [])

  return { visible, isVisible, toggle, setVisible }
}

export function ColumnCustomize({
  columns,
  visible,
  onToggle,
}: {
  columns: ColumnOption[]
  visible: Record<string, boolean>
  onToggle: (id: string, next: boolean) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-zinc-200 text-xs font-normal shadow-xs"
          />
        }
      >
        <Columns3 className="size-3.5 text-zinc-500" strokeWidth={1.75} />
        Columns
        <ChevronDown className="size-3.5 opacity-50" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xs">
        <DropdownMenuLabel className="text-[11px] font-medium text-zinc-500">
          Toggle columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={visible[col.id] !== false}
            onCheckedChange={(v) => onToggle(col.id, Boolean(v))}
            className="text-xs font-normal"
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ViewToggle({
  value,
  onChange,
}: {
  value: "table" | "board"
  onChange: (v: "table" | "board") => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5">
      {(
        [
          { id: "table", label: "List" },
          { id: "board", label: "Board" },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.id
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Pill tabs like the reference (Outline / Past Performance…). */
export function TableTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="inline-flex w-fit max-w-full flex-wrap items-center rounded-lg bg-muted p-1">
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted-foreground/30 px-1 text-[10px] font-medium text-foreground tabular-nums">
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** Toolbar row above the table body (Columns + primary). */
export function TableChrome({
  tabs,
  trailing,
  className,
}: {
  tabs?: React.ReactNode
  trailing?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 px-1",
        className
      )}
    >
      <div className="min-w-0">{tabs}</div>
      <div className="flex flex-wrap items-center gap-2">{trailing}</div>
    </div>
  )
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "success" | "warning" | "danger" | "info"
}) {
  const tones = {
    neutral: "border-zinc-200 bg-white text-zinc-600",
    success: "border-zinc-200 bg-white text-zinc-700",
    warning: "border-zinc-200 bg-white text-zinc-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-zinc-200 bg-white text-zinc-700",
  }
  const dot =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "warning"
        ? "bg-amber-500"
        : tone === "danger"
          ? "bg-rose-500"
          : tone === "info"
            ? "bg-sky-500"
            : "bg-zinc-400"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-normal",
        tones[tone]
      )}
    >
      <span className={cn("size-2 rounded-full", dot)} />
      {children}
    </span>
  )
}

/** Reference-style footer: selection + rows/page + first/prev/next/last. */
export function TablePagination({
  page,
  pageSize,
  total,
  selected = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: {
  page: number
  pageSize: number
  total: number
  selected?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground tabular-nums">
        {selected} of {total} row(s) selected.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => v && onPageSizeChange(Number(v))}
              items={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs shadow-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <p className="text-sm font-medium tabular-nums">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-lg shadow-xs"
            disabled={!canPrev}
            onClick={() => onPageChange(1)}
            aria-label="First page"
          >
            <ChevronsLeft className="size-3.5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-lg shadow-xs"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-lg shadow-xs"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-lg shadow-xs"
            disabled={!canNext}
            onClick={() => onPageChange(totalPages)}
            aria-label="Last page"
          >
            <ChevronsRight className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Outline add button matching reference. */
export function TableAddButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-8 gap-1.5 rounded-lg border-zinc-200 text-xs font-normal shadow-xs"
    >
      {children}
    </Button>
  )
}
