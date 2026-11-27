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
import { StatusPill } from "@/components/table-panel"
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
import { ManageColumnsSheet } from "@/components/kanban/manage-columns-sheet"
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
  "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "bg-muted text-muted-foreground",
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
        className="cursor-grab space-y-2.5 rounded-xl bg-card p-3.5 shadow-sm ring-0 transition-shadow hover:shadow-md active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{lead.title}</p>
            <p className="truncate text-xs text-muted-foreground">{lead.location || "Main Sanctuary"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StatusPill>{lead.elapsed || "1m"}</StatusPill>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-zinc-400 hover:text-muted-foreground"
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
            <span className="max-w-[110px] truncate text-xs text-muted-foreground">{lead.contactName}</span>
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
            <span className="truncate text-[11px] text-muted-foreground">{lead.assignee.name}</span>
            <span className="ml-auto rounded-md bg-card px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground shadow-xs">
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
  onManageColumns,
}: {
  id: string
  title: string
  count: number
  leads: LeadCard[]
  onOpen: (id: string) => void
  onAction: (id: string, action: FollowUpAction, contactName: string) => void
  onManageColumns?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "column", stage: id } })

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[300px] shrink-0 flex-col rounded-2xl bg-muted p-1 shadow-sm transition-shadow ${
        isOver ? "bg-brand-soft shadow-md" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground">{title}</span>
          <span className="rounded-full bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs">
            {count}
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
  const [manageColumnsOpen, setManageColumnsOpen] = React.useState(false)
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
        <div className="px-2 text-sm text-muted-foreground">Loading visitor board…</div>
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
                onManageColumns={() => setManageColumnsOpen(true)}
              />
            ))}
            <button
              type="button"
              onClick={() => setManageColumnsOpen(true)}
              className="flex h-28 w-[200px] shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 text-sm text-muted-foreground transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-ink"
            >
              + Add column
            </button>
          </div>
          <DragOverlay>
            {activeLead ? (
              <div className="w-[280px] rotate-1 space-y-1 rounded-xl bg-card p-3.5 shadow-lg">
                <p className="text-sm font-semibold">{activeLead.title}</p>
                <p className="text-xs text-muted-foreground">{activeLead.contactName}</p>
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
      <ManageColumnsSheet
        boardType="visitors"
        open={manageColumnsOpen}
        onOpenChange={setManageColumnsOpen}
        title="Visitor pipeline columns"
      />
    </>
  )

  if (embedded) {
    return <div className="overflow-x-auto">{board}</div>
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-background px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Visitor Pipeline</h1>
          <p className="text-sm text-muted-foreground">
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
              className="h-10 w-64 bg-background pl-10 shadow-xs"
            />
          </div>
          <div className="flex h-10 items-center rounded-lg bg-muted/80 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveView("board")}
              className={`h-full rounded-md px-3.5 text-sm font-medium ${
                activeView === "board" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setActiveView("list")}
              className={`h-full rounded-md px-3.5 text-sm font-medium ${
                activeView === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
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
