"use client"

import * as React from "react"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Spinner } from "@/components/ui/spinner"
import {
  FollowUpAction,
  VisitorFollowUpDialogs,
} from "@/components/visitors/visitor-follow-up"
import { useVisitorDetail } from "@/features/visitors/hooks/use-visitor-leads"
import { VISITOR_STAGE_LABELS } from "@/features/visitors/schemas"
import { useKanbanStore } from "@/store/use-kanban-store"
import {
  Calendar,
  ListTodo,
  Mail,
  MessageSquare,
  Smartphone,
  StickyNote,
  User,
  UserCog,
} from "lucide-react"

export function VisitorDrawer() {
  const { isDrawerOpen, selectedLeadId, closeLeadDrawer } = useKanbanStore()
  const { data: lead, isLoading } = useVisitorDetail(selectedLeadId)
  const [followUp, setFollowUp] = React.useState<FollowUpAction | null>(null)

  const stages = (lead?.stages || []) as {
    id: string
    label: string
    active?: boolean
    completed?: boolean
  }[]
  const completedCount = stages.filter((s) => s.completed || s.active).length
  const progressPct =
    stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeLeadDrawer()}>
      <SheetContent side="right" inset size="xl" className="p-0 sm:max-w-4xl">
        {isLoading || !lead ? (
          <div className="flex h-full min-h-80 items-center justify-center gap-2 text-sm text-zinc-500">
            <Spinner className="size-4" />
            Loading visitor…
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="pr-12 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <SheetTitle className="text-lg text-zinc-900">{lead.title}</SheetTitle>
                  <SheetDescription>
                    {lead.leadNumber} · {lead.location || "Main Sanctuary"}
                    {lead.createdAt ? (
                      <span>
                        {" "}
                        · First visit{" "}
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </SheetDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-0 bg-emerald-50 text-emerald-700 shadow-xs">
                    {VISITOR_STAGE_LABELS[lead.stage as keyof typeof VISITOR_STAGE_LABELS] ||
                      lead.stage}
                  </Badge>
                  <Button
                    size="sm"
                    className="h-8 gap-1 bg-accent-cta text-white shadow-sm hover:bg-accent-cta-hover"
                  >
                    Create appointment
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 gap-1.5 shadow-xs"
                  onClick={() => setFollowUp("assign")}
                >
                  <UserCog className="size-3.5" />
                  Assign
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 gap-1.5 shadow-xs"
                  onClick={() => setFollowUp("comment")}
                >
                  <MessageSquare className="size-3.5" />
                  Comment
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 gap-1.5 shadow-xs"
                  onClick={() => setFollowUp("email")}
                >
                  <Mail className="size-3.5" />
                  Email
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 gap-1.5 shadow-xs"
                  onClick={() => setFollowUp("sms")}
                >
                  <Smartphone className="size-3.5" />
                  SMS
                </Button>
              </div>

              {stages.length > 0 && (
                <div className="space-y-3 pt-2">
                  <Progress value={progressPct} className="w-full gap-2">
                    <ProgressLabel>Journey</ProgressLabel>
                    <ProgressValue />
                  </Progress>
                  <div className="flex flex-wrap gap-1.5">
                    {stages.map((s) => (
                      <span
                        key={s.id}
                        className={`rounded-full px-2.5 py-1 text-[11px] shadow-xs ${
                          s.active
                            ? "bg-brand-soft font-semibold text-brand-ink"
                            : s.completed
                              ? "bg-zinc-100 text-zinc-500"
                              : "bg-white text-zinc-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lead.activeSequence && (
                <div className="mt-2 rounded-xl bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800 shadow-xs">
                  Active drip:{" "}
                  <strong>
                    {lead.activeSequence.title || lead.activeSequence}
                  </strong>
                  {lead.activeSequence.nextDrip && (
                    <span className="text-emerald-700">
                      {" "}
                      · Next: {lead.activeSequence.nextDrip}
                    </span>
                  )}
                </div>
              )}

              {lead.assignee && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#f6f8f6] px-3 py-2 text-xs text-zinc-600 shadow-xs">
                  <User className="size-3.5 text-zinc-400" />
                  Assigned to <strong>{lead.assignee.name}</strong>
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium capitalize shadow-xs">
                    {lead.assignee.role || "user"}
                  </span>
                </div>
              )}
            </SheetHeader>

            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px]">
              <SheetBody className="px-0">
                <Tabs defaultValue="activity" className="flex h-full min-h-0 flex-col px-6">
                  <TabsList className="mb-3 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="giving">Giving</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="min-h-0 flex-1 pr-2">
                    <TabsContent value="activity" className="mt-0 space-y-0 pb-6">
                      {(lead.latestActivity || []).length === 0 ? (
                        <Empty className="bg-[#f8faf9] py-10 shadow-xs">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <Mail />
                            </EmptyMedia>
                            <EmptyTitle>No activity yet</EmptyTitle>
                            <EmptyDescription>
                              Follow-ups, drips, and stage changes will show here.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      ) : (
                        <ol className="relative space-y-0 pl-5">
                          {(lead.latestActivity || []).map((act: {
                            id: string
                            title: string
                            description?: string
                            performedByUserId?: string
                            time?: string
                            createdAt?: string | Date
                          }) => (
                            <li key={act.id} className="relative pb-5 last:pb-0">
                              <span className="absolute -left-[0.85rem] top-1.5 size-2.5 rounded-full bg-emerald-500 shadow-sm ring-2 ring-white" />
                              <div className="rounded-xl bg-white p-3 shadow-sm">
                                <p className="text-sm font-medium text-zinc-900">{act.title}</p>
                                {act.description && (
                                  <p className="mt-0.5 text-xs text-zinc-500">{act.description}</p>
                                )}
                                <p className="mt-2 text-[11px] text-zinc-400">
                                  {act.performedByUserId
                                    ? `By ${act.performedByUserId}`
                                    : "System"}{" "}
                                  · {act.time || String(act.createdAt || "")}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </TabsContent>

                    <TabsContent value="appointments" className="mt-0 pb-6">
                      <Empty className="bg-[#f8faf9] py-10 shadow-xs">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Calendar />
                          </EmptyMedia>
                          <EmptyTitle>No appointments</EmptyTitle>
                          <EmptyDescription>
                            Schedule a pastoral coffee or home visit from the header.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TabsContent>

                    <TabsContent value="giving" className="mt-0 pb-6">
                      <Empty className="bg-[#f8faf9] py-10 shadow-xs">
                        <EmptyHeader>
                          <EmptyTitle>No giving linked</EmptyTitle>
                          <EmptyDescription>
                            Contributions tied to this guest will appear here.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0 pb-6">
                      <Empty className="bg-[#f8faf9] py-10 shadow-xs">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <StickyNote />
                          </EmptyMedia>
                          <EmptyTitle>No pastoral notes</EmptyTitle>
                          <EmptyDescription>Private care notes stay with this record.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TabsContent>

                    <TabsContent value="tasks" className="mt-0 pb-6">
                      <Empty className="bg-[#f8faf9] py-10 shadow-xs">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <ListTodo />
                          </EmptyMedia>
                          <EmptyTitle>No follow-up tasks</EmptyTitle>
                          <EmptyDescription>Assign a next step for the welcome team.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </SheetBody>

              <aside className="flex flex-col gap-5 bg-[#f8faf9] px-5 py-5 shadow-sm md:shadow-none">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                    Contact
                  </p>
                  <HoverCard>
                    <HoverCardTrigger
                      render={
                        <button
                          type="button"
                          className="flex w-full items-center gap-2.5 rounded-xl text-left outline-none hover:bg-white/70"
                        />
                      }
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800">
                          {lead.contact?.initials || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {lead.contact?.name || lead.contactName}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {lead.contact?.source || lead.source || "Walk-in"}
                        </p>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 space-y-1.5 p-3">
                      <p className="text-sm font-medium text-zinc-900">
                        {lead.contact?.name || lead.contactName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Source: {lead.contact?.source || lead.source || "—"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {lead.contact?.email || lead.contactEmail || "No email"}
                      </p>
                    </HoverCardContent>
                  </HoverCard>

                  <Separator />

                  <ul className="space-y-2.5 text-xs text-zinc-600">
                    <li className="flex items-center gap-2">
                      <Mail className="size-3.5 text-zinc-400" />
                      <span className="truncate">
                        {lead.contact?.email || lead.contactEmail || "—"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Smartphone className="size-3.5 text-zinc-400" />
                      <span>{lead.contact?.phone || lead.contactPhone || "—"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <User className="size-3.5 text-zinc-400" />
                      <span>{lead.contact?.source || lead.source || "Walk-in"}</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        )}
      </SheetContent>
      <VisitorFollowUpDialogs
        leadId={selectedLeadId}
        contactName={lead?.contact?.name || lead?.contactName}
        action={followUp}
        onClose={() => setFollowUp(null)}
      />
    </Sheet>
  )
}
