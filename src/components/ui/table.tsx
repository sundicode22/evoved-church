"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

type RowSelectContextValue = {
  enabled: boolean
  selected: Set<string>
  keys: string[]
  toggle: (key: string) => void
  setAll: (on: boolean) => void
  setKeys: (keys: string[]) => void
}

const RowSelectContext = React.createContext<RowSelectContextValue | null>(null)

function Table({
  className,
  selectable = true,
  ...props
}: React.ComponentProps<"table"> & { selectable?: boolean }) {
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [keys, setKeysState] = React.useState<string[]>([])

  const setKeys = React.useCallback((next: string[]) => {
    setKeysState((prev) => (prev.join("\0") === next.join("\0") ? prev : next))
  }, [])

  const toggle = React.useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const setAll = React.useCallback((on: boolean) => {
    setSelected(on ? new Set(keys) : new Set())
  }, [keys])

  const value = React.useMemo<RowSelectContextValue>(
    () => ({ enabled: selectable, selected, keys, toggle, setAll, setKeys }),
    [selectable, selected, keys, toggle, setAll, setKeys]
  )

  return (
    <RowSelectContext.Provider value={value}>
      <div data-slot="table-container" className="relative w-full overflow-x-auto">
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </RowSelectContext.Provider>
  )
}

function SelectBox({
  checked,
  indeterminate,
  onCheckedChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onCheckedChange: (on: boolean) => void
  label: string
}) {
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
    />
  )
}

function isPlaceholderRow(row: React.ReactElement<{ children?: React.ReactNode }>) {
  const cells = React.Children.toArray(row.props.children).filter(React.isValidElement)
  if (cells.length !== 1) return false
  const span = (cells[0] as React.ReactElement<{ colSpan?: number }>).props.colSpan
  return typeof span === "number" && span > 1
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const ctx = React.useContext(RowSelectContext)
  const children = ctx?.enabled
    ? React.Children.map(props.children, (child, index) => {
        if (!React.isValidElement<{ children?: React.ReactNode }>(child) || index > 0) {
          return child
        }
        const allOn = ctx.keys.length > 0 && ctx.keys.every((key) => ctx.selected.has(key))
        const some = ctx.keys.some((key) => ctx.selected.has(key))
        return React.cloneElement(child, undefined, [
          <TableHead key="__select" className="w-10 pl-3">
            <SelectBox
              checked={allOn}
              indeterminate={some && !allOn}
              onCheckedChange={(on) => ctx.setAll(on)}
              label="Select all rows"
            />
          </TableHead>,
          ...React.Children.toArray(child.props.children),
        ])
      })
    : props.children

  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 z-10 bg-muted [&_tr]:border-b", className)}
      {...props}
    >
      {children}
    </thead>
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const ctx = React.useContext(RowSelectContext)
  const dataKeys: string[] = []
  const children = ctx?.enabled
    ? React.Children.map(props.children, (child, index) => {
        if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return child
        if (isPlaceholderRow(child)) {
          const spanned = React.Children.map(child.props.children, (cell) => {
            if (!React.isValidElement<{ colSpan?: number }>(cell)) return cell
            const span = cell.props.colSpan
            if (typeof span === "number" && span > 1) {
              return React.cloneElement(cell, { colSpan: span + 1 })
            }
            return cell
          })
          return React.cloneElement(child, undefined, spanned)
        }
        const key = String(child.key ?? `row-${index}`)
        dataKeys.push(key)
        return React.cloneElement(
          child,
          { "data-state": ctx.selected.has(key) ? "selected" : undefined },
          [
          <TableCell
            key="__select"
            className="w-10 pl-3"
            onClick={(event) => event.stopPropagation()}
          >
            <SelectBox
              checked={ctx.selected.has(key)}
              onCheckedChange={() => ctx.toggle(key)}
              label="Select row"
            />
          </TableCell>,
          ...React.Children.toArray(child.props.children),
        ])
      })
    : props.children

  const signature = dataKeys.join("\0")
  const setKeys = ctx?.setKeys
  const enabled = ctx?.enabled
  React.useEffect(() => {
    if (!enabled || !setKeys) return
    setKeys(signature ? signature.split("\0") : [])
  }, [enabled, setKeys, signature])

  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-normal whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
