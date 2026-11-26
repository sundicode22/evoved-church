"use client"

import * as React from "react"
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DateTimeFormField,
  SelectFormField,
  TextareaFormField,
  TextFormField,
} from "@/components/form-fields"
import { StatusPill } from "@/components/table-panel"
import { Calendar } from "@/components/ui/calendar"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FieldGroup } from "@/components/ui/field"
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
import { PageHeader } from "@/components/page-header"
import { Calendar as CalendarIcon, Plus } from "lucide-react"

const eventFormSchema = z
  .object({
    mode: z.enum(["existing", "new"]),
    programId: z.string(),
    newTitle: z.string(),
    newType: z.string(),
    locationLabel: z.string(),
    startsAt: z.string().min(1, "Start date and time is required"),
    endsAt: z.string(),
    assigneeName: z.string(),
    assigneeRole: z.enum(["lead", "volunteer", "speaker"]),
    notes: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "existing" && !v.programId) {
      ctx.addIssue({ code: "custom", path: ["programId"], message: "Select a program" })
    }
    if (v.mode === "new" && v.newTitle.trim().length < 2) {
      ctx.addIssue({ code: "custom", path: ["newTitle"], message: "Title is required" })
    }
  })

type EventFormValues = z.infer<typeof eventFormSchema>

const EVENT_FORM_DEFAULTS: EventFormValues = {
  mode: "existing",
  programId: "",
  newTitle: "",
  newType: "ministry",
  locationLabel: "",
  startsAt: "",
  endsAt: "",
  assigneeName: "",
  assigneeRole: "lead",
  notes: "",
}

const PROGRAM_SOURCE_OPTIONS = [
  { value: "existing", label: "Existing program" },
  { value: "new", label: "Create new program" },
]
const PROGRAM_TYPE_OPTIONS = PROGRAM_TYPES.map((t) => ({ value: t.value, label: t.label }))
const ASSIGNEE_ROLE_OPTIONS = ASSIGNEE_ROLES.map((r) => ({ value: r.value, label: r.label }))

export default function ChurchCalendarPage() {
  const [month, setMonth] = React.useState<Date | null>(null)
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null)

  React.useEffect(() => {
    const now = new Date()
    setMonth(now)
    setSelectedDay(now)
  }, [])

  const from = month ? startOfMonth(month).toISOString() : undefined
  const to = month ? endOfMonth(month).toISOString() : undefined

  const { data: programs } = usePrograms()
  const { data: occurrences, isLoading } = useOccurrences(from, to)
  const createProgram = useCreateProgram()
  const createOcc = useCreateOccurrence()
  const removeOcc = useDeleteOccurrence()

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState<CalendarOccurrence | null>(null)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: EVENT_FORM_DEFAULTS,
  })
  const mode = useWatch({ control: form.control, name: "mode" })

  const dayEvents =
    selectedDay
      ? (occurrences?.filter((o) => isSameDay(parseISO(o.startsAt), selectedDay)) ?? [])
      : []

  const daysWithEvents = React.useMemo(() => {
    const set = new Set<string>()
    for (const o of occurrences || []) {
      set.add(format(parseISO(o.startsAt), "yyyy-MM-dd"))
    }
    return set
  }, [occurrences])

  function openCreate() {
    const base = new Date(selectedDay ?? Date.now())
    base.setHours(10, 0, 0, 0)
    const end = new Date(base)
    end.setHours(12, 0, 0, 0)
    form.reset({
      ...EVENT_FORM_DEFAULTS,
      startsAt: format(base, "yyyy-MM-dd'T'HH:mm"),
      endsAt: format(end, "yyyy-MM-dd'T'HH:mm"),
      programId: programs?.[0]?.id || "",
      mode: programs?.length ? "existing" : "new",
    })
    setSheetOpen(true)
  }

  async function onSubmit(values: EventFormValues) {
    let pid = values.programId
    if (values.mode === "new") {
      const p = await createProgram.mutateAsync({
        title: values.newTitle.trim(),
        type: values.newType,
        locationLabel: values.locationLabel,
      })
      pid = p.id
    }
    await createOcc.mutateAsync({
      programId: pid,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : undefined,
      allDay: false,
      status: "scheduled",
      notes: values.notes,
      assignees: values.assigneeName.trim()
        ? [{ displayName: values.assigneeName.trim(), roleLabel: values.assigneeRole }]
        : [],
    })
    setSheetOpen(false)
    form.reset(EVENT_FORM_DEFAULTS)
  }

  const programItems =
    programs?.map((p) => ({ value: p.id, label: p.title })) ?? []

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="calendar.read">
          <PageHeader
            title="Calendar"
            description="Programs, services, and who is responsible."
            icon={<CalendarIcon className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="calendar.write">
                <Button
                  onClick={openCreate}
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  Add event
                </Button>
              </Can>
            }
          />

          <div className="grid gap-6 p-8 lg:grid-cols-[340px_1fr]">
            <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-xs">
              {month ? (
                <Calendar
                  mode="single"
                  month={month}
                  onMonthChange={setMonth}
                  selected={selectedDay ?? undefined}
                  onSelect={(d) => d && setSelectedDay(d)}
                  className="w-full"
                  modifiers={{
                    hasEvent: (date) => daysWithEvents.has(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersClassNames={{
                    hasEvent:
                      "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-emerald-500",
                  }}
                />
              ) : (
                <div className="h-72 animate-pulse rounded-lg bg-zinc-100" />
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-xs">
              <div className="border-b border-zinc-100 px-5 py-4">
                <h2 className="text-sm font-medium text-zinc-900">
                  {selectedDay ? format(selectedDay, "EEEE, MMM d, yyyy") : "Loading…"}
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
                      className="rounded-lg border border-zinc-200/80 bg-[#f4f6f5] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <StatusPill className="capitalize">{o.programType}</StatusPill>
                            <StatusPill
                              tone={o.status === "scheduled" ? "success" : "neutral"}
                              className="capitalize"
                            >
                              {o.status}
                            </StatusPill>
                          </div>
                          <h3 className="mt-1.5 text-sm font-medium text-zinc-900">
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle>Schedule program</SheetTitle>
                    <SheetDescription>
                      Pick an existing program or create one, set date/time, and assign caregivers.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <SelectFormField
                        control={form.control}
                        name="mode"
                        label="Program source"
                        options={PROGRAM_SOURCE_OPTIONS}
                      />

                      {mode === "existing" ? (
                        <SelectFormField
                          control={form.control}
                          name="programId"
                          label="Program"
                          placeholder="Select program"
                          options={programItems}
                        />
                      ) : (
                        <>
                          <TextFormField control={form.control} name="newTitle" label="Title" />
                          <SelectFormField
                            control={form.control}
                            name="newType"
                            label="Type"
                            options={PROGRAM_TYPE_OPTIONS}
                          />
                          <TextFormField
                            control={form.control}
                            name="locationLabel"
                            label="Location"
                          />
                        </>
                      )}

                      <DateTimeFormField
                        control={form.control}
                        name="startsAt"
                        label="Starts"
                      />
                      <DateTimeFormField
                        control={form.control}
                        name="endsAt"
                        label="Ends"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <TextFormField
                          control={form.control}
                          name="assigneeName"
                          label="Assignee"
                          placeholder="Who takes care of this?"
                        />
                        <SelectFormField
                          control={form.control}
                          name="assigneeRole"
                          label="Role"
                          options={ASSIGNEE_ROLE_OPTIONS}
                        />
                      </div>

                      <TextareaFormField control={form.control} name="notes" label="Notes" />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={createOcc.isPending || createProgram.isPending}
                    >
                      Save event
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
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
