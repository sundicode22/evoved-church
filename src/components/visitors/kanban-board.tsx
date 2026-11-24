"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useKanbanStore } from "@/store/use-kanban-store"
import { VisitorDrawer } from "@/components/visitors/visitor-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  useVisitorBoard,
  useUpdateLeadStage,
} from "@/features/visitors/hooks/use-visitor-leads"
import type { VisitorStage } from "@/features/visitors/schemas"
import { Calendar, Folder, ListTodo, MoreHorizontal, Plus, Search as Search, StickyNote } from "lucide-react"

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
  "bg-zinc-200 text-zinc-700",
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

type LeadCard = {
  id: string
  leadNumber?: string
  title: string
  location?: string
  contactName: string
  contactAvatar?: string
  amount?: string
  elapsed?: string
  stage?: string
  metrics?: { calendar?: number; checklist?: number; files?: number; notes?: number }
}

function SortableCard({
  lead,
  onOpen,
}: {
  lead: LeadCard
  onOpen: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: "lead", lead },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        onClick={() => onOpen(lead.id)}
        className="cursor-grab active:cursor-grabbing rounded-xl border-zinc-200/60 shadow-xs hover:border-zinc-300 transition-colors p-3.5 space-y-2.5 bg-white"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">{lead.title}</p>
            <p className="text-xs text-zinc-500 truncate">{lead.location || "Main Sanctuary"}</p>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0 bg-zinc-100 text-zinc-600">
            {lead.elapsed || "1m"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColor(lead.contactName)}`}
            >
              {lead.contactAvatar || lead.contactName.charAt(0)}
            </span>
            <span className="text-xs text-zinc-600 truncate max-w-[110px]">{lead.contactName}</span>
          </div>
          {lead.amount && (
            <span className="text-sm font-semibold text-emerald-700">{lead.amount}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-zinc-400 pt-1 border-t border-zinc-100">
          <span className="flex items-center gap-1 text-[11px]">
            <Calendar className="size-3.5" />
            {lead.metrics?.calendar ?? 0}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <ListTodo className="size-3.5" />
            {lead.metrics?.checklist ?? 0}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Folder className="size-3.5" />
            {lead.metrics?.files ?? 0}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <StickyNote className="size-3.5" />
            {lead.metrics?.notes ?? 0}
          </span>
        </div>
      </Card>
    </div>
  )
}

function Column({
  id,
  title,
  count,
  leads,
  onOpen,
}: {
  id: string
  title: string
  count: number
  leads: LeadCard[]
  onOpen: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "column", stage: id } })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[300px] shrink-0 rounded-lg border ${
        isOver ? "border-emerald-300 bg-emerald-50/40" : "border-zinc-200/70 bg-[#f8faf9]"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-zinc-700">{title}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-600 font-medium">
            {count}
          </span>
        </div>
        <Button variant="ghost" size="icon-sm" className="text-zinc-400">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5 px-2.5 pb-3 min-h-[120px]">
          {leads.map((lead) => (
            <SortableCard key={lead.id} lead={lead} onOpen={onOpen} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ embedded = false }: { embedded?: boolean }) {
  const { searchQuery, setSearchQuery, activeView, setActiveView, openLeadDrawer } = useKanbanStore()
  const { data, isLoading } = useVisitorBoard(searchQuery || undefined)
  const updateStage = useUpdateLeadStage()
  const [activeLead, setActiveLead] = React.useState<LeadCard | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const stages = data?.stages || []

  function findStageOf(leadId: string): string | null {
    for (const col of stages) {
      if (col.leads?.some((l: LeadCard) => l.id === leadId)) return col.id
    }
    return null
  }

  function onDragStart(event: DragStartEvent) {
    const lead = event.active.data.current?.lead as LeadCard | undefined
    if (lead) setActiveLead(lead)
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveLead(null)
    const { active, over } = event
    if (!over) return

    const leadId = String(active.id)
    const fromStage = findStageOf(leadId)
    let toStage: string | null = null

    if (over.data.current?.type === "column") {
      toStage = String(over.id)
    } else if (over.data.current?.type === "lead") {
      toStage = findStageOf(String(over.id))
    } else {
      toStage = String(over.id)
    }

    if (!fromStage || !toStage || fromStage === toStage) return

    updateStage.mutate({
      id: leadId,
      stage: toStage as VisitorStage,
      reason: `Moved via kanban from ${fromStage} to ${toStage}`,
    })
  }

  const board = (
    <>
      {isLoading ? (
        <div className="px-2 text-sm text-zinc-500">Loading visitor board…</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex min-w-max items-start gap-4">
            {stages.map((col: any) => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                count={col.leadCount || col.leads?.length || 0}
                leads={col.leads || []}
                onOpen={openLeadDrawer}
              />
            ))}
          </div>
          <DragOverlay>
            {activeLead ? (
              <Card className="w-[280px] rotate-1 rounded-xl border-zinc-200 bg-white p-3.5 shadow-xs">
                <p className="text-sm font-semibold">{activeLead.title}</p>
                <p className="text-xs text-zinc-500">{activeLead.contactName}</p>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      <VisitorDrawer />
    </>
  )

  if (embedded) {
    return <div className="overflow-x-auto">{board}</div>
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/70 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">Visitor Pipeline</h1>
          <p className="text-sm text-zinc-500">
            {data?.totalLeads ?? 0} guests across {stages.length} stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitors..."
              className="h-9 w-56 bg-white pl-8"
            />
          </div>
          <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
            <button
              type="button"
              onClick={() => setActiveView("board")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                activeView === "board" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setActiveView("list")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                activeView === "list" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              List
            </button>
          </div>
          <Button className="h-9 bg-[#16a34a] text-white hover:bg-[#15803d]">
            <Plus className="size-4" />
            Add visitor
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-5">{board}</div>
    </div>
  )
}
