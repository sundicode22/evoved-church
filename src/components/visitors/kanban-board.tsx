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
import {
  FollowUpAction,
  VisitorFollowUpDialogs,
} from "@/components/visitors/visitor-follow-up"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useVisitorBoard,
  useUpdateLeadStage,
} from "@/features/visitors/hooks/use-visitor-leads"
import type { VisitorStage } from "@/features/visitors/schemas"
import {
  Calendar,
  Folder,
  ListTodo,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Smartphone,
  StickyNote,
  UserCog,
} from "lucide-react"

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
  contactEmail?: string
  contactPhone?: string
  amount?: string
  elapsed?: string
  stage?: string
  assignee?: { name: string; role?: "admin" | "user"; avatar?: string } | null
  metrics?: { calendar?: number; checklist?: number; files?: number; notes?: number }
}

function SortableCard({
  lead,
  onOpen,
  onAction,
}: {
  lead: LeadCard
  onOpen: (id: string) => void
  onAction: (id: string, action: FollowUpAction, contactName: string) => void
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
      <div
        onClick={() => onOpen(lead.id)}
        className="cursor-grab space-y-2.5 rounded-xl bg-white p-3.5 shadow-sm ring-0 transition-shadow hover:shadow-md active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{lead.title}</p>
            <p className="truncate text-xs text-zinc-500">{lead.location || "Main Sanctuary"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Badge
              variant="secondary"
              className="bg-zinc-100/90 text-[10px] text-zinc-600 shadow-none"
            >
              {lead.elapsed || "1m"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-zinc-400 hover:text-zinc-700"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                }
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-44 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={() => onAction(lead.id, "assign", lead.contactName)}
                >
                  <UserCog className="size-3.5" />
                  Assign Admin / User
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction(lead.id, "comment", lead.contactName)}
                >
                  <MessageSquare className="size-3.5" />
                  Comment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onAction(lead.id, "email", lead.contactName)}
                >
                  <Mail className="size-3.5" />
                  Email follow-up
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction(lead.id, "sms", lead.contactName)}
                >
                  <Smartphone className="size-3.5" />
                  SMS follow-up
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm ${avatarColor(lead.contactName)}`}
            >
              {lead.contactAvatar || lead.contactName.charAt(0)}
            </span>
            <span className="max-w-[110px] truncate text-xs text-zinc-600">{lead.contactName}</span>
          </div>
          {lead.amount && (
            <span className="text-sm font-semibold text-emerald-700">{lead.amount}</span>
          )}
        </div>

        {lead.assignee && (
          <div className="flex items-center gap-2 rounded-lg bg-[#f6f8f6] px-2 py-1.5 shadow-xs">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] font-semibold shadow-sm ${avatarColor(lead.assignee.name)}`}
            >
              {lead.assignee.avatar || lead.assignee.name.charAt(0)}
            </span>
            <span className="truncate text-[11px] text-zinc-600">{lead.assignee.name}</span>
            <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium capitalize text-zinc-500 shadow-xs">
              {lead.assignee.role || "user"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 text-zinc-400">
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
      </div>
    </div>
  )
}

function Column({
  id,
  title,
  count,
  leads,
  onOpen,
  onAction,
}: {
  id: string
  title: string
  count: number
  leads: LeadCard[]
  onOpen: (id: string) => void
  onAction: (id: string, action: FollowUpAction, contactName: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "column", stage: id } })

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[300px] shrink-0 flex-col rounded-2xl bg-[#f4f6f5] p-1 shadow-sm transition-shadow ${
        isOver ? "bg-brand-soft shadow-md" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-zinc-700">{title}</span>
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shadow-xs">
            {count}
          </span>
        </div>
        <Button variant="ghost" size="icon-sm" className="text-zinc-400">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-col gap-2.5 px-2 pb-3">
          {leads.map((lead) => (
            <SortableCard key={lead.id} lead={lead} onOpen={onOpen} onAction={onAction} />
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
  const [followUp, setFollowUp] = React.useState<{
    id: string
    action: FollowUpAction
    contactName: string
  } | null>(null)

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

  function onAction(id: string, action: FollowUpAction, contactName: string) {
    setFollowUp({ id, action, contactName })
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
            {stages.map((col: { id: string; title: string; leadCount?: number; leads?: LeadCard[] }) => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                count={col.leadCount || col.leads?.length || 0}
                leads={col.leads || []}
                onOpen={openLeadDrawer}
                onAction={onAction}
              />
            ))}
          </div>
          <DragOverlay>
            {activeLead ? (
              <div className="w-[280px] rotate-1 space-y-1 rounded-xl bg-white p-3.5 shadow-lg">
                <p className="text-sm font-semibold">{activeLead.title}</p>
                <p className="text-xs text-zinc-500">{activeLead.contactName}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      <VisitorDrawer />
      <VisitorFollowUpDialogs
        leadId={followUp?.id ?? null}
        contactName={followUp?.contactName}
        action={followUp?.action ?? null}
        onClose={() => setFollowUp(null)}
      />
    </>
  )

  if (embedded) {
    return <div className="overflow-x-auto">{board}</div>
  }

  return (
    <div className="flex h-full flex-col bg-[#fbfcfb]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">Visitor Pipeline</h1>
          <p className="text-sm text-zinc-500">
            {data?.totalLeads ?? 0} guests across {stages.length} stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitors..."
              className="h-10 w-64 bg-white pl-10 shadow-xs"
            />
          </div>
          <div className="flex h-10 items-center rounded-lg bg-zinc-100/80 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveView("board")}
              className={`h-full rounded-md px-3.5 text-sm font-medium ${
                activeView === "board" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setActiveView("list")}
              className={`h-full rounded-md px-3.5 text-sm font-medium ${
                activeView === "list" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              List
            </button>
          </div>
          <Button>
            <Plus className="size-4" />
            Add visitor
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-5">{board}</div>
    </div>
  )
}
