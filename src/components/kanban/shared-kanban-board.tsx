"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MoreHorizontal } from "lucide-react"

export interface KanbanCardData {
  id: string
  title: string
  /** Small uppercase-ish tag shown top-left (e.g. project name). */
  label?: string
  subtitle?: string
  /** ISO timestamp used for the elapsed-time badge. */
  since?: string
  /** Badges rendered at the bottom (e.g. priority). */
  badges?: { text: string; className?: string }[]
  dueLabel?: string
  assignee?: string
}

export interface KanbanColumnData {
  id: string
  title: string
  cards: KanbanCardData[]
}

interface SharedKanbanBoardProps {
  columns: KanbanColumnData[]
  onMove: (cardId: string, toStage: string) => void
  onCardClick?: (cardId: string) => void
  isLoading?: boolean
  /** Opens column manager (add / rename / reorder / delete). */
  onManageColumns?: () => void
}

export function formatElapsed(since: string | undefined, now: number) {
  if (!since) return "now"
  const diff = Math.max(0, now - new Date(since).getTime())
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function CardView({
  card,
  now,
  overlay,
  onClick,
}: {
  card: KanbanCardData
  now: number | null
  overlay?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`space-y-2.5 rounded-xl bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md ${
        overlay ? "rotate-1 cursor-grabbing shadow-lg" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {card.label ? (
          <span className="truncate rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-xs">
            {card.label}
          </span>
        ) : (
          <span />
        )}
        <Badge variant="secondary" className="shrink-0 bg-zinc-100 text-[10px] text-zinc-600 shadow-none">
          {now === null ? "…" : formatElapsed(card.since, now)}
        </Badge>
      </div>

      <div>
        <h4 className="text-sm font-semibold leading-snug text-zinc-900">{card.title}</h4>
        {card.subtitle && <p className="mt-0.5 truncate text-xs text-zinc-500">{card.subtitle}</p>}
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          {card.badges?.map((b) => (
            <Badge
              key={b.text}
              variant="secondary"
              className={`text-[10px] font-semibold capitalize shadow-none ${b.className ?? ""}`}
            >
              {b.text}
            </Badge>
          ))}
          {card.dueLabel && (
            <span className="flex items-center gap-1">
              <Calendar strokeWidth={1.8} className="size-3" />
              {card.dueLabel}
            </span>
          )}
        </div>
        {card.assignee && (
          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-semibold text-white shadow-sm">
            {card.assignee}
          </span>
        )}
      </div>
    </div>
  )
}

function SortableCard({
  card,
  now,
  onClick,
}: {
  card: KanbanCardData
  now: number | null
  onClick?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card" },
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
    >
      <CardView card={card} now={now} onClick={onClick} />
    </div>
  )
}

function Column({
  column,
  now,
  onCardClick,
  onManageColumns,
}: {
  column: KanbanColumnData
  now: number | null
  onCardClick?: (id: string) => void
  onManageColumns?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } })
  return (
    <div
      ref={setNodeRef}
      className={`flex w-[300px] shrink-0 flex-col rounded-2xl bg-[#f4f6f5] p-1 shadow-sm transition-shadow ${
        isOver ? "bg-brand-soft shadow-md" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-zinc-700">{column.title}</span>
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shadow-xs">
            {column.cards.length}
          </span>
        </div>
        {onManageColumns ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-zinc-400"
            onClick={onManageColumns}
            aria-label="Manage columns"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        ) : null}
      </div>
      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-col gap-2.5 px-2.5 pb-3">
          {column.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              now={now}
              onClick={onCardClick ? () => onCardClick(card.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function SharedKanbanBoard({
  columns,
  onMove,
  onCardClick,
  isLoading,
  onManageColumns,
}: SharedKanbanBoardProps) {
  // Computed after mount so server and client markup agree.
  const [now, setNow] = React.useState<number | null>(null)
  const [activeCard, setActiveCard] = React.useState<KanbanCardData | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const columnOfCard = React.useCallback(
    (cardId: string) => columns.find((col) => col.cards.some((c) => c.id === cardId))?.id ?? null,
    [columns]
  )

  function onDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    setActiveCard(columns.flatMap((c) => c.cards).find((c) => c.id === id) ?? null)
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return
    const cardId = String(active.id)
    const from = columnOfCard(cardId)
    const overId = String(over.id)
    const to = columns.some((c) => c.id === overId) ? overId : columnOfCard(overId)
    if (!from || !to || from === to) return
    onMove(cardId, to)
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-64 w-[300px] shrink-0 animate-pulse rounded-lg bg-zinc-100" />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveCard(null)}
    >
      <div className="flex min-w-max items-start gap-4">
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            now={now}
            onCardClick={onCardClick}
            onManageColumns={onManageColumns}
          />
        ))}
        {onManageColumns ? (
          <button
            type="button"
            onClick={onManageColumns}
            className="flex h-28 w-[200px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/60 text-sm text-zinc-500 transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-ink"
          >
            + Add column
          </button>
        ) : null}
      </div>
      <DragOverlay>
        {activeCard ? <CardView card={activeCard} now={now} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
