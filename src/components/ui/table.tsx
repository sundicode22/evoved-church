"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

type TableFeatures = {
  selectable: boolean
  reorderable: boolean
  selected: Set<string>
  keys: string[]
  order: string[]
  toggle: (key: string) => void
  setAll: (on: boolean) => void
  setKeys: (keys: string[]) => void
  setOrder: (keys: string[]) => void
  onReorder?: (keys: string[]) => void
}

const TableFeaturesContext = React.createContext<TableFeatures | null>(null)

export function useTableSelection() {
  const ctx = React.useContext(TableFeaturesContext)
  return {
    selected: ctx?.selected ?? new Set<string>(),
    selectedCount: ctx?.selected.size ?? 0,
    keys: ctx?.keys ?? [],
  }
}

export function TableFeaturesProvider({
  selectable = true,
  reorderable = true,
  onReorder,
  children,
}: {
  selectable?: boolean
  reorderable?: boolean
  onReorder?: (keys: string[]) => void
  children: React.ReactNode
}) {
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [keys, setKeysState] = React.useState<string[]>([])
  const [order, setOrderState] = React.useState<string[]>([])

  const setKeys = React.useCallback((next: string[]) => {
    setKeysState((prev) => (prev.join("\0") === next.join("\0") ? prev : next))
    setOrderState((prev) => {
      const keep = prev.filter((id) => next.includes(id))
      const added = next.filter((id) => !keep.includes(id))
      const merged = [...keep, ...added]
      return merged.join("\0") === prev.join("\0") ? prev : merged
    })
  }, [])

  const setOrder = React.useCallback((next: string[]) => {
    setOrderState(next)
  }, [])

  const toggle = React.useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const setAll = React.useCallback(
    (on: boolean) => {
      setSelected(on ? new Set(keys) : new Set())
    },
    [keys]
  )

  const value = React.useMemo<TableFeatures>(
    () => ({
      selectable,
      reorderable,
      selected,
      keys,
      order,
      toggle,
      setAll,
      setKeys,
      setOrder,
      onReorder,
    }),
    [
      selectable,
      reorderable,
      selected,
      keys,
      order,
      toggle,
      setAll,
      setKeys,
      setOrder,
      onReorder,
    ]
  )

  return (
    <TableFeaturesContext.Provider value={value}>
      {children}
    </TableFeaturesContext.Provider>
  )
}

function useOptionalFeatures() {
  return React.useContext(TableFeaturesContext)
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

function leadingColSpan(ctx: TableFeatures | null) {
  if (!ctx) return 0
  return (ctx.reorderable ? 1 : 0) + (ctx.selectable ? 1 : 0)
}

function Table({
  className,
  selectable,
  reorderable,
  onReorder,
  ...props
}: React.ComponentProps<"table"> & {
  selectable?: boolean
  reorderable?: boolean
  onReorder?: (keys: string[]) => void
}) {
  const parent = useOptionalFeatures()
  const standalone =
    parent == null ? (
      <TableFeaturesProvider
        selectable={selectable ?? true}
        reorderable={reorderable ?? true}
        onReorder={onReorder}
      >
        <TableFrame className={className} {...props} />
      </TableFeaturesProvider>
    ) : (
      <TableFrame className={className} {...props} />
    )

  return standalone
}

function TableFrame({
  className,
  ...props
}: React.ComponentProps<"table">) {
  const ctx = useOptionalFeatures()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      if (!ctx?.reorderable) return
      const { active, over } = event
      if (!over || active.id === over.id) return
      const current = ctx.order.length ? ctx.order : ctx.keys
      const oldIndex = current.indexOf(String(active.id))
      const newIndex = current.indexOf(String(over.id))
      if (oldIndex < 0 || newIndex < 0) return
      const next = arrayMove(current, oldIndex, newIndex)
      ctx.setOrder(next)
      ctx.onReorder?.(next)
    },
    [ctx]
  )

  const table = (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-lg border border-border bg-background"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )

  if (!ctx?.reorderable) return table

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      {table}
    </DndContext>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const ctx = useOptionalFeatures()
  const children =
    ctx && (ctx.selectable || ctx.reorderable)
      ? React.Children.map(props.children, (child, index) => {
          if (!React.isValidElement<{ children?: React.ReactNode }>(child) || index > 0) {
            return child
          }
          const leading: React.ReactNode[] = []
          if (ctx.reorderable) {
            leading.push(<TableHead key="__drag" className="w-8 px-2" />)
          }
          if (ctx.selectable) {
            const allOn =
              ctx.keys.length > 0 && ctx.keys.every((key) => ctx.selected.has(key))
            const some = ctx.keys.some((key) => ctx.selected.has(key))
            leading.push(
              <TableHead key="__select" className="w-10 px-2">
                <div className="flex items-center justify-center">
                  <SelectBox
                    checked={allOn}
                    indeterminate={some && !allOn}
                    onCheckedChange={(on) => ctx.setAll(on)}
                    label="Select all rows"
                  />
                </div>
              </TableHead>
            )
          }
          return React.cloneElement(child, undefined, [
            ...leading,
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

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-3.5 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function SortableDataRow({
  id,
  selected,
  className,
  children,
  ...props
}: React.ComponentProps<"tr"> & { id: string; selected?: boolean }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({ id })
  return (
    <tr
      ref={setNodeRef}
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        isDragging && "relative z-20 bg-background opacity-90",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const ctx = useOptionalFeatures()
  const dataKeys: string[] = []
  const lead = leadingColSpan(ctx)

  const enhanced = React.Children.map(props.children, (child, index) => {
    if (!React.isValidElement<{ children?: React.ReactNode; className?: string }>(child)) {
      return child
    }
    if (isPlaceholderRow(child)) {
      if (!lead) return child
      const spanned = React.Children.map(child.props.children, (cell) => {
        if (!React.isValidElement<{ colSpan?: number }>(cell)) return cell
        const span = cell.props.colSpan
        if (typeof span === "number" && span > 1) {
          return React.cloneElement(cell, { colSpan: span + lead })
        }
        return cell
      })
      return React.cloneElement(child, undefined, spanned)
    }

    const key = String(child.key ?? `row-${index}`)
    dataKeys.push(key)

    if (!ctx || (!ctx.selectable && !ctx.reorderable)) return child

    const leading: React.ReactNode[] = []
    if (ctx.reorderable) {
      leading.push(
        <TableCell key="__drag" className="w-8 px-1">
          <DragHandle id={key} />
        </TableCell>
      )
    }
    if (ctx.selectable) {
      leading.push(
        <TableCell
          key="__select"
          className="w-10 px-2"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-center">
            <SelectBox
              checked={ctx.selected.has(key)}
              onCheckedChange={() => ctx.toggle(key)}
              label="Select row"
            />
          </div>
        </TableCell>
      )
    }

    const rowChildren = [
      ...leading,
      ...React.Children.toArray(child.props.children),
    ]

    if (ctx.reorderable) {
      return (
        <SortableDataRow
          key={key}
          id={key}
          selected={ctx.selected.has(key)}
          className={child.props.className}
        >
          {rowChildren}
        </SortableDataRow>
      )
    }

    return React.cloneElement(
      child as React.ReactElement<{ children?: React.ReactNode; "data-state"?: string }>,
      { "data-state": ctx.selected.has(key) ? "selected" : undefined },
      rowChildren
    )
  })

  const signature = dataKeys.join("\0")
  const setKeys = ctx?.setKeys
  React.useEffect(() => {
    if (!setKeys) return
    setKeys(signature ? signature.split("\0") : [])
  }, [setKeys, signature])

  let rows: React.ReactNode = enhanced
  if (ctx?.reorderable && enhanced) {
    const list = React.Children.toArray(enhanced)
    const byKey = new Map<string, React.ReactNode>()
    for (const node of list) {
      if (React.isValidElement(node) && node.key != null) {
        byKey.set(String(node.key), node)
      }
    }
    const sequence = (ctx.order.length ? ctx.order : dataKeys).filter((id) =>
      byKey.has(id)
    )
    const used = new Set(sequence)
    const rest = list.filter((node) => {
      if (!React.isValidElement(node) || node.key == null) return true
      return !used.has(String(node.key))
    })
    rows = [...sequence.map((id) => byKey.get(id)!), ...rest]
  }

  const ids = ctx?.order?.length ? ctx.order : dataKeys

  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {ctx?.reorderable ? (
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {rows}
        </SortableContext>
      ) : (
        rows
      )}
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
        "h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
        "px-3 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
