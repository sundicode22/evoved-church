"use client"

import * as React from "react"
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ConfirmAction } from "@/components/confirm-action"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  useOccurrences,
  usePrograms,
  useCreateProgram,
  useCreateOccurrence,
  useDeleteOccurrence,
} from "@/features/calendar/hooks/use-calendar"
import { ASSIGNEE_ROLES, PROGRAM_TYPES } from "@/features/calendar/schemas"
import type { CalendarOccurrence } from "@/features/calendar/schemas"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

export default function ChurchCalendarPage() {
  const [month, setMonth] = React.useState<Date>(new Date())
  const [selectedDay, setSelectedDay] = React.useState<Date>(new Date())
  const from = startOfMonth(month).toISOString()
  const to = endOfMonth(month).toISOString()

  const { data: programs } = usePrograms()
  const { data: occurrences, isLoading } = useOccurrences(from, to)
  const createProgram = useCreateProgram()
  const createOcc = useCreateOccurrence()
  const removeOcc = useDeleteOccurrence()

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState<CalendarOccurrence | null>(null)

  const [mode, setMode] = React.useState<"existing" | "new">("existing")
  const [programId, setProgramId] = React.useState("")
  const [newTitle, setNewTitle] = React.useState("")
  const [newType, setNewType] = React.useState("ministry")
  const [locationLabel, setLocationLabel] = React.useState("")
  const [startsAt, setStartsAt] = React.useState("")
  const [endsAt, setEndsAt] = React.useState("")
  const [assigneeName, setAssigneeName] = React.useState("")
  const [assigneeRole, setAssigneeRole] = React.useState<"lead" | "volunteer" | "speaker">(
    "lead"
  )
  const [notes, setNotes] = React.useState("")

  const dayEvents =
    occurrences?.filter((o) => isSameDay(parseISO(o.startsAt), selectedDay)) ?? []

  const daysWithEvents = React.useMemo(() => {
    const set = new Set<string>()
    for (const o of occurrences || []) {
      set.add(format(parseISO(o.startsAt), "yyyy-MM-dd"))
    }
    return set
  }, [occurrences])

  function openCreate() {
    const base = new Date(selectedDay)
    base.setHours(10, 0, 0, 0)
    const end = new Date(base)
    end.setHours(12, 0, 0, 0)
    setStartsAt(format(base, "yyyy-MM-dd'T'HH:mm"))
    setEndsAt(format(end, "yyyy-MM-dd'T'HH:mm"))
    setProgramId(programs?.[0]?.id || "")
    setMode(programs?.length ? "existing" : "new")
    setSheetOpen(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    let pid = programId
    if (mode === "new") {
      const p = await createProgram.mutateAsync({
        title: newTitle,
        type: newType,
        locationLabel,
      })
      pid = p.id
    }
    await createOcc.mutateAsync({
      programId: pid,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      allDay: false,
      status: "scheduled",
      notes,
      assignees: assigneeName.trim()
        ? [{ displayName: assigneeName.trim(), roleLabel: assigneeRole }]
        : [],
    })
    setSheetOpen(false)
    setNewTitle("")
    setAssigneeName("")
    setNotes("")
  }

  const programItems =
    programs?.map((p) => ({ value: p.id, label: p.title })) ?? []

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-[#fbfcfb]">
        <RequireAbility permission="calendar.read">
          <div className="border-b border-zinc-200/80 bg-white px-8 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900">
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    strokeWidth={2}
                    className="size-6 text-emerald-600"
                  />
                  Church calendar
                </h1>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Programs, worship services, outreach dates, and who is responsible.
                </p>
              </div>
              <Can permission="calendar.write">
                <Button
                  className="h-9 gap-1.5 bg-[#22c55e] text-xs text-white hover:bg-[#16a34a]"
                  onClick={openCreate}
                >
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                  Add event
                </Button>
              </Can>
            </div>
          </div>

          <div className="grid gap-6 p-8 lg:grid-cols-[340px_1fr]">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDay}
                onSelect={(d) => d && setSelectedDay(d)}
                className="w-full"
                modifiers={{
                  hasEvent: (date) => daysWithEvents.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersClassNames={{
                  hasEvent: "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-emerald-500",
                }}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
              <div className="border-b border-zinc-100 px-5 py-4">
                <h2 className="text-sm font-bold text-zinc-900">
                  {format(selectedDay, "EEEE, MMM d, yyyy")}
                </h2>
                <p className="text-xs text-zinc-400">
                  {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
                </p>
              </div>
              <ScrollArea className="max-h-[70vh]">
                {isLoading && (
                  <p className="px-5 py-8 text-center text-xs text-zinc-400">Loading…</p>
                )}
                {!isLoading && dayEvents.length === 0 && (
                  <Empty className="py-12">
                    <EmptyHeader>
                      <EmptyTitle>No programs this day</EmptyTitle>
                      <EmptyDescription>
                        Schedule outreach, classes, or link a worship service.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
                <ul className="space-y-3 p-5">
                  {dayEvents.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-xl border border-zinc-200/80 bg-[#fbfcfb] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {o.programType}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                o.status === "scheduled"
                                  ? "border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                                  : "text-[10px]"
                              }
                            >
                              {o.status}
                            </Badge>
                          </div>
                          <h3 className="mt-1.5 text-sm font-bold text-zinc-900">
                            {o.programTitle}
                          </h3>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {o.allDay
                              ? "All day"
                              : `${format(parseISO(o.startsAt), "h:mm a")}${
                                  o.endsAt
                                    ? ` – ${format(parseISO(o.endsAt), "h:mm a")}`
                                    : ""
                                }`}
                            {o.locationLabel ? ` · ${o.locationLabel}` : ""}
                          </p>
                          {o.assignees.length > 0 && (
                            <p className="mt-2 text-xs text-zinc-600">
                              {o.assignees
                                .map((a) => `${a.displayName} (${a.roleLabel})`)
                                .join(" · ")}
                            </p>
                          )}
                          {o.notes && (
                            <p className="mt-1 text-xs text-zinc-400">{o.notes}</p>
                          )}
                        </div>
                        <Can permission="calendar.write">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-rose-600"
                            onClick={() => setConfirmDelete(o)}
                          >
                            Remove
                          </Button>
                        </Can>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Schedule program</SheetTitle>
                  <SheetDescription>
                    Pick an existing program or create one, set date/time, and assign caregivers.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Program source</FieldLabel>
                      <Select
                        value={mode}
                        items={[
                          { value: "existing", label: "Existing program" },
                          { value: "new", label: "Create new program" },
                        ]}
                        onValueChange={(v) => v && setMode(v as "existing" | "new")}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existing">Existing program</SelectItem>
                          <SelectItem value="new">Create new program</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {mode === "existing" ? (
                      <Field>
                        <FieldLabel>Program</FieldLabel>
                        <Select
                          value={programId}
                          items={programItems}
                          onValueChange={(v) => v && setProgramId(v)}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programItems.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    ) : (
                      <>
                        <Field>
                          <FieldLabel>Title</FieldLabel>
                          <Input
                            className="h-9"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Type</FieldLabel>
                          <Select
                            value={newType}
                            items={PROGRAM_TYPES.map((t) => ({
                              value: t.value,
                              label: t.label,
                            }))}
                            onValueChange={(v) => v && setNewType(v)}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROGRAM_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel>Location</FieldLabel>
                          <Input
                            className="h-9"
                            value={locationLabel}
                            onChange={(e) => setLocationLabel(e.target.value)}
                          />
                        </Field>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>Starts</FieldLabel>
                        <Input
                          type="datetime-local"
                          className="h-9"
                          value={startsAt}
                          onChange={(e) => setStartsAt(e.target.value)}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Ends</FieldLabel>
                        <Input
                          type="datetime-local"
                          className="h-9"
                          value={endsAt}
                          onChange={(e) => setEndsAt(e.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>Assignee</FieldLabel>
                        <Input
                          className="h-9"
                          value={assigneeName}
                          onChange={(e) => setAssigneeName(e.target.value)}
                          placeholder="Who takes care of this?"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Role</FieldLabel>
                        <Select
                          value={assigneeRole}
                          items={ASSIGNEE_ROLES.map((r) => ({
                            value: r.value,
                            label: r.label,
                          }))}
                          onValueChange={(v) =>
                            v && setAssigneeRole(v as "lead" | "volunteer" | "speaker")
                          }
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSIGNEE_ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>Notes</FieldLabel>
                      <Textarea
                        className="min-h-16"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createOcc.isPending || createProgram.isPending}
                    className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  >
                    Save event
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(confirmDelete)}
            onOpenChange={(o) => !o && setConfirmDelete(null)}
            title="Remove this event?"
            description={`${confirmDelete?.programTitle} on ${
              confirmDelete
                ? format(parseISO(confirmDelete.startsAt), "MMM d, yyyy")
                : ""
            } will be deleted.`}
            confirmLabel="Remove"
            variant="destructive"
            onConfirm={async () => {
              if (confirmDelete) await removeOcc.mutateAsync(confirmDelete.id)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
