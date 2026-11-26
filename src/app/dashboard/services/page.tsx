"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  SelectFormField,
  TextFormField,
  TextareaFormField,
  TimeFormField,
} from "@/components/form-fields"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ConfirmAction } from "@/components/confirm-action"
import { TableToolbar } from "@/components/table-toolbar"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/features/services/hooks/use-services"
import {
  DAY_LABELS,
  SERVICE_TYPES,
  serviceTypeSchema,
  type ChurchService,
} from "@/features/services/schemas"
import { PageHeader } from "@/components/page-header"
import { ArrowDown, ArrowUp, Church, Pencil, Plus, Trash2 } from "lucide-react"

type Segment = ChurchService["segments"][number]
type Volunteer = ChurchService["volunteers"][number]

const serviceFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  type: serviceTypeSchema,
  locationLabel: z.string(),
  defaultDayOfWeek: z.string().min(1, "Default day is required"),
  defaultStartTime: z.string().min(1, "Start time is required"),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

const segmentFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  leader: z.string(),
  durationMinutes: z.string().refine((v) => {
    const n = Number(v)
    return Number.isInteger(n) && n >= 1 && n <= 240
  }, "1–240 minutes"),
  details: z.string(),
})

type SegmentFormValues = z.infer<typeof segmentFormSchema>

const volunteerFormSchema = z.object({
  role: z.string().trim().min(2, "Role is required"),
  assigneeName: z.string(),
  status: z.enum(["needed", "confirmed", "declined"]),
})

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>

const SERVICE_FORM_DEFAULTS: ServiceFormValues = {
  name: "",
  type: "sunday_worship",
  locationLabel: "",
  defaultDayOfWeek: "0",
  defaultStartTime: "10:00",
}

const SEGMENT_FORM_DEFAULTS: SegmentFormValues = {
  title: "",
  leader: "",
  durationMinutes: "10",
  details: "",
}

const VOLUNTEER_FORM_DEFAULTS: VolunteerFormValues = {
  role: "",
  assigneeName: "",
  status: "needed",
}

const SERVICE_TYPE_OPTIONS = SERVICE_TYPES.map((t) => ({ value: t.value, label: t.label }))
const DAY_OPTIONS = DAY_LABELS.map((d, i) => ({ value: String(i), label: d }))
const VOLUNTEER_STATUS_OPTIONS = [
  { value: "needed", label: "Needed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "declined", label: "Declined" },
]

function serviceToFormValues(s: ChurchService): ServiceFormValues {
  return {
    name: s.name,
    type: s.type,
    locationLabel: s.locationLabel || "",
    defaultDayOfWeek: String(s.defaultDayOfWeek ?? 0),
    defaultStartTime: s.defaultStartTime || "10:00",
  }
}

function segmentToFormValues(seg: Segment): SegmentFormValues {
  return {
    title: seg.title,
    leader: seg.leader || "",
    durationMinutes: String(seg.durationMinutes || 10),
    details: seg.details || "",
  }
}

function volunteerToFormValues(v: Volunteer): VolunteerFormValues {
  return {
    role: v.role,
    assigneeName: v.assigneeName || "",
    status: v.status,
  }
}

export default function ServicesPage() {
  const { data, isLoading } = useServices()
  const create = useCreateService()
  const remove = useDeleteService()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editServiceOpen, setEditServiceOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState<ChurchService | null>(null)
  const [editingSegment, setEditingSegment] = React.useState<Segment | null>(null)
  const [segmentSheetOpen, setSegmentSheetOpen] = React.useState(false)
  const [editingVolunteer, setEditingVolunteer] = React.useState<Volunteer | null>(null)
  const [volunteerSheetOpen, setVolunteerSheetOpen] = React.useState(false)
  const [confirmDeleteSegment, setConfirmDeleteSegment] = React.useState<Segment | null>(null)
  const [confirmDeleteVolunteer, setConfirmDeleteVolunteer] = React.useState<Volunteer | null>(
    null
  )

  const createForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: SERVICE_FORM_DEFAULTS,
  })
  const editServiceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: SERVICE_FORM_DEFAULTS,
  })
  const segmentForm = useForm<SegmentFormValues>({
    resolver: zodResolver(segmentFormSchema),
    defaultValues: SEGMENT_FORM_DEFAULTS,
  })
  const volunteerForm = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: VOLUNTEER_FORM_DEFAULTS,
  })

  React.useEffect(() => {
    if (createOpen) createForm.reset(SERVICE_FORM_DEFAULTS)
  }, [createOpen, createForm])

  const selected = data?.find((s) => s.id === (selectedId ?? data[0]?.id)) ?? null
  const update = useUpdateService(selected?.id || "")

  React.useEffect(() => {
    if (!selectedId && data?.[0]) setSelectedId(data[0].id)
  }, [data, selectedId])

  React.useEffect(() => {
    if (editServiceOpen && selected) {
      editServiceForm.reset(serviceToFormValues(selected))
    }
  }, [editServiceOpen, selected, editServiceForm])

  React.useEffect(() => {
    if (!segmentSheetOpen) return
    if (editingSegment) segmentForm.reset(segmentToFormValues(editingSegment))
    else segmentForm.reset(SEGMENT_FORM_DEFAULTS)
  }, [segmentSheetOpen, editingSegment, segmentForm])

  React.useEffect(() => {
    if (!volunteerSheetOpen) return
    if (editingVolunteer) volunteerForm.reset(volunteerToFormValues(editingVolunteer))
    else volunteerForm.reset(VOLUNTEER_FORM_DEFAULTS)
  }, [volunteerSheetOpen, editingVolunteer, volunteerForm])

  const sortedSegments = React.useMemo(
    () =>
      selected
        ? selected.segments.slice().sort((a, b) => a.orderIndex - b.orderIndex)
        : [],
    [selected]
  )

  const sortedVolunteers = React.useMemo(
    () =>
      selected
        ? selected.volunteers.slice().sort((a, b) => a.orderIndex - b.orderIndex)
        : [],
    [selected]
  )

  function onCreateService(values: ServiceFormValues) {
    create.mutate(
      {
        name: values.name,
        type: values.type,
        locationLabel: values.locationLabel,
        defaultStartTime: values.defaultStartTime,
        defaultDayOfWeek: Number(values.defaultDayOfWeek),
        recurrence: "weekly",
      },
      {
        onSuccess: (s) => {
          setCreateOpen(false)
          createForm.reset(SERVICE_FORM_DEFAULTS)
          setSelectedId(s.id)
        },
      }
    )
  }

  function onSaveService(values: ServiceFormValues) {
    if (!selected) return
    update.mutate(
      {
        name: values.name,
        type: values.type,
        locationLabel: values.locationLabel,
        defaultStartTime: values.defaultStartTime,
        defaultDayOfWeek: Number(values.defaultDayOfWeek),
      },
      { onSuccess: () => setEditServiceOpen(false) }
    )
  }

  function saveSegments(segments: Segment[]) {
    if (!selected) return
    update.mutate({
      segments: segments.map((seg, i) => ({ ...seg, orderIndex: i })),
    })
  }

  function saveVolunteers(volunteers: Volunteer[]) {
    if (!selected) return
    update.mutate({
      volunteers: volunteers.map((v, i) => ({ ...v, orderIndex: i })),
    })
  }

  function openNewSegment() {
    setEditingSegment(null)
    setSegmentSheetOpen(true)
  }

  function openEditSegment(seg: Segment) {
    setEditingSegment(seg)
    setSegmentSheetOpen(true)
  }

  function onSaveSegment(values: SegmentFormValues) {
    if (!selected) return
    const next: Segment = {
      id: editingSegment?.id || `seg-${crypto.randomUUID().slice(0, 8)}`,
      title: values.title,
      leader: values.leader.trim(),
      durationMinutes: Number(values.durationMinutes),
      details: values.details.trim(),
      orderIndex: editingSegment?.orderIndex ?? sortedSegments.length,
    }
    if (editingSegment) {
      saveSegments(sortedSegments.map((s) => (s.id === editingSegment.id ? next : s)))
    } else {
      saveSegments([...sortedSegments, next])
    }
    setSegmentSheetOpen(false)
    setEditingSegment(null)
  }

  function moveSegment(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= sortedSegments.length) return
    const next = sortedSegments.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    saveSegments(next)
  }

  function openNewVolunteer() {
    setEditingVolunteer(null)
    setVolunteerSheetOpen(true)
  }

  function openEditVolunteer(v: Volunteer) {
    setEditingVolunteer(v)
    setVolunteerSheetOpen(true)
  }

  function onSaveVolunteer(values: VolunteerFormValues) {
    if (!selected) return
    const next: Volunteer = {
      id: editingVolunteer?.id || `vol-${crypto.randomUUID().slice(0, 8)}`,
      role: values.role,
      assigneeName: values.assigneeName.trim(),
      status: values.status,
      orderIndex: editingVolunteer?.orderIndex ?? sortedVolunteers.length,
    }
    if (editingVolunteer) {
      saveVolunteers(
        sortedVolunteers.map((v) => (v.id === editingVolunteer.id ? next : v))
      )
    } else {
      saveVolunteers([...sortedVolunteers, next])
    }
    setVolunteerSheetOpen(false)
    setEditingVolunteer(null)
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="services.read">
          <PageHeader
            title="Services"
            description="Worship, midweek, prayer, youth, and special gatherings."
            icon={<Church className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="services.write">
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus strokeWidth={2} className="size-3.5" />
                  New service
                </Button>
              </Can>
            }
          />

          <div className="grid gap-6 p-8 lg:grid-cols-[280px_1fr]">
            <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-xs">
              <TableToolbar title="All services" count={data?.length} />
              <ScrollArea className="max-h-[70vh]">
                {isLoading && (
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}
                {!isLoading && (data?.length ?? 0) === 0 && (
                  <Empty className="py-10">
                    <EmptyHeader>
                      <EmptyTitle>No services</EmptyTitle>
                      <EmptyDescription>Create your first gathering.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
                <ul className="p-2">
                  {data?.map((s) => {
                    const active = s.id === selected?.id
                    const typeLabel =
                      SERVICE_TYPES.find((t) => t.value === s.type)?.label || s.type
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(s.id)}
                          className={`flex w-full flex-col rounded-xl px-3 py-2.5 text-left transition-colors ${
                            active
                              ? "bg-brand-soft text-brand-ink"
                              : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <Badge variant="outline" className="text-[10px]">
                              {typeLabel}
                            </Badge>
                            {s.defaultDayOfWeek != null && DAY_LABELS[s.defaultDayOfWeek]}{" "}
                            {s.defaultStartTime}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            </div>

            <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-xs">
              {!selected ? (
                <Empty className="py-16">
                  <EmptyHeader>
                    <EmptyTitle>Select a service</EmptyTitle>
                    <EmptyDescription>Pick one from the list to edit the run sheet.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                    <div>
                      <h2 className="text-base font-medium text-zinc-900">{selected.name}</h2>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {selected.locationLabel || "No location"} ·{" "}
                        {selected.defaultDayOfWeek != null
                          ? DAY_LABELS[selected.defaultDayOfWeek]
                          : "—"}{" "}
                        {selected.defaultStartTime}
                      </p>
                    </div>
                    <Can permission="services.write">
                      <RowActionsMenu
                        label="Service"
                        groups={[
                          {
                            items: [
                              {
                                label: "Edit service",
                                onClick: () => setEditServiceOpen(true),
                              },
                              {
                                label: "Archive service",
                                destructive: true,
                                onClick: () => setConfirmDelete(selected),
                              },
                            ],
                          },
                        ]}
                      />
                    </Can>
                  </div>

                  <Tabs defaultValue="run" className="p-5">
                    <TabsList>
                      <TabsTrigger value="run">Run of service</TabsTrigger>
                      <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                    </TabsList>
                    <TabsContent value="run" className="space-y-3 pt-4">
                      {sortedSegments.length === 0 && (
                        <p className="text-xs text-zinc-400">
                          No segments yet. Add worship, message, offering, and more.
                        </p>
                      )}
                      {sortedSegments.map((seg, i) => (
                        <div
                          key={seg.id}
                          className="rounded-lg border border-zinc-200/80 bg-[#f4f6f5] px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left"
                              onClick={() => openEditSegment(seg)}
                            >
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-zinc-900">
                                  {i + 1}. {seg.title}
                                </p>
                                <Badge variant="outline" className="text-[10px] tabular-nums">
                                  {seg.durationMinutes} min
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-zinc-500">
                                {seg.leader || "Unassigned"}
                                {seg.details ? ` · ${seg.details}` : ""}
                              </p>
                            </button>
                            <Can permission="services.write">
                              <div className="flex shrink-0 items-center gap-0.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-7"
                                  disabled={i === 0 || update.isPending}
                                  onClick={() => moveSegment(i, -1)}
                                  aria-label="Move up"
                                >
                                  <ArrowUp className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-7"
                                  disabled={i === sortedSegments.length - 1 || update.isPending}
                                  onClick={() => moveSegment(i, 1)}
                                  aria-label="Move down"
                                >
                                  <ArrowDown className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-7"
                                  onClick={() => openEditSegment(seg)}
                                  aria-label="Edit segment"
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-7 text-zinc-500 hover:text-red-600"
                                  onClick={() => setConfirmDeleteSegment(seg)}
                                  aria-label="Delete segment"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </Can>
                          </div>
                        </div>
                      ))}
                      <Can permission="services.write">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={openNewSegment}
                        >
                          Add segment
                        </Button>
                      </Can>
                    </TabsContent>
                    <TabsContent value="volunteers" className="space-y-3 pt-4">
                      {sortedVolunteers.length === 0 && (
                        <p className="text-xs text-zinc-400">
                          No volunteer slots. Add roles like greeter, tech, or kids check-in.
                        </p>
                      )}
                      {sortedVolunteers.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/80 px-4 py-3"
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => openEditVolunteer(v)}
                          >
                            <p className="text-sm font-medium text-zinc-900">{v.role}</p>
                            <p className="text-xs text-zinc-500">
                              {v.assigneeName || "Open slot"}
                            </p>
                          </button>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={
                                v.status === "confirmed"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : v.status === "declined"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                              }
                            >
                              {v.status}
                            </Badge>
                            <Can permission="services.write">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="size-7"
                                onClick={() => openEditVolunteer(v)}
                                aria-label="Edit volunteer"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="size-7 text-zinc-500 hover:text-red-600"
                                onClick={() => setConfirmDeleteVolunteer(v)}
                                aria-label="Delete volunteer"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </Can>
                          </div>
                        </div>
                      ))}
                      <Can permission="services.write">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={openNewVolunteer}
                        >
                          Add volunteer slot
                        </Button>
                      </Can>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>

          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...createForm}>
                <form
                  onSubmit={createForm.handleSubmit(onCreateService)}
                  className="flex h-full flex-col"
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>New service</SheetTitle>
                    <SheetDescription>
                      Any gathering — not only Sunday. Set type, day, and default start time.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField control={createForm.control} name="name" label="Name" />
                      <SelectFormField
                        control={createForm.control}
                        name="type"
                        label="Type"
                        options={SERVICE_TYPE_OPTIONS}
                      />
                      <TextFormField
                        control={createForm.control}
                        name="locationLabel"
                        label="Location"
                        placeholder="Main Sanctuary"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <SelectFormField
                          control={createForm.control}
                          name="defaultDayOfWeek"
                          label="Default day"
                          options={DAY_OPTIONS}
                        />
                        <TimeFormField
                          control={createForm.control}
                          name="defaultStartTime"
                          label="Start time"
                          description="24h local time"
                          minuteStep={5}
                        />
                      </div>
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={create.isPending}>
                      Create service
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>

          <Sheet open={editServiceOpen} onOpenChange={setEditServiceOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...editServiceForm}>
                <form
                  onSubmit={editServiceForm.handleSubmit(onSaveService)}
                  className="flex h-full flex-col"
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>Edit service</SheetTitle>
                    <SheetDescription>
                      Update name, type, location, and default schedule.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField
                        control={editServiceForm.control}
                        name="name"
                        label="Name"
                      />
                      <SelectFormField
                        control={editServiceForm.control}
                        name="type"
                        label="Type"
                        options={SERVICE_TYPE_OPTIONS}
                      />
                      <TextFormField
                        control={editServiceForm.control}
                        name="locationLabel"
                        label="Location"
                        placeholder="Main Sanctuary"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <SelectFormField
                          control={editServiceForm.control}
                          name="defaultDayOfWeek"
                          label="Default day"
                          options={DAY_OPTIONS}
                        />
                        <TimeFormField
                          control={editServiceForm.control}
                          name="defaultStartTime"
                          label="Start time"
                          minuteStep={5}
                        />
                      </div>
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditServiceOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={update.isPending}>
                      Save changes
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>

          <Sheet
            open={segmentSheetOpen}
            onOpenChange={(open) => {
              setSegmentSheetOpen(open)
              if (!open) setEditingSegment(null)
            }}
          >
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...segmentForm}>
                <form
                  onSubmit={segmentForm.handleSubmit(onSaveSegment)}
                  className="flex h-full flex-col"
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>
                      {editingSegment ? "Edit segment" : "Add segment"}
                    </SheetTitle>
                    <SheetDescription>
                      Set the title, who leads it, duration, and any notes for the run sheet.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField
                        control={segmentForm.control}
                        name="title"
                        label="Title"
                        placeholder="Worship"
                        autoFocus
                      />
                      <TextFormField
                        control={segmentForm.control}
                        name="leader"
                        label="Leader / assignee"
                        placeholder="Worship Director"
                      />
                      <TextFormField
                        control={segmentForm.control}
                        name="durationMinutes"
                        label="Duration (minutes)"
                        type="number"
                        inputMode="numeric"
                      />
                      <TextareaFormField
                        control={segmentForm.control}
                        name="details"
                        label="Details"
                        placeholder="Songs, slides, cues…"
                        rows={3}
                      />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSegmentSheetOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={update.isPending}>
                      {editingSegment ? "Save segment" : "Add segment"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>

          <Sheet
            open={volunteerSheetOpen}
            onOpenChange={(open) => {
              setVolunteerSheetOpen(open)
              if (!open) setEditingVolunteer(null)
            }}
          >
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...volunteerForm}>
                <form
                  onSubmit={volunteerForm.handleSubmit(onSaveVolunteer)}
                  className="flex h-full flex-col"
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>
                      {editingVolunteer ? "Edit volunteer slot" : "Add volunteer slot"}
                    </SheetTitle>
                    <SheetDescription>
                      Role, assignee, and whether the slot is still needed.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField
                        control={volunteerForm.control}
                        name="role"
                        label="Role"
                        placeholder="Greeter"
                        autoFocus
                      />
                      <TextFormField
                        control={volunteerForm.control}
                        name="assigneeName"
                        label="Assignee"
                        placeholder="Leave blank for open slot"
                      />
                      <SelectFormField
                        control={volunteerForm.control}
                        name="status"
                        label="Status"
                        options={VOLUNTEER_STATUS_OPTIONS}
                      />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVolunteerSheetOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={update.isPending}>
                      {editingVolunteer ? "Save slot" : "Add slot"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(confirmDelete)}
            onOpenChange={(o) => !o && setConfirmDelete(null)}
            title={`Archive ${confirmDelete?.name}?`}
            description="The service is deactivated but run-sheet history stays available for reporting."
            confirmLabel="Archive"
            variant="destructive"
            onConfirm={async () => {
              if (!confirmDelete) return
              await remove.mutateAsync(confirmDelete.id)
              setSelectedId(null)
            }}
          />

          <ConfirmAction
            open={Boolean(confirmDeleteSegment)}
            onOpenChange={(o) => !o && setConfirmDeleteSegment(null)}
            title={`Remove “${confirmDeleteSegment?.title}”?`}
            description="This segment will be removed from the run of service."
            confirmLabel="Remove"
            variant="destructive"
            onConfirm={async () => {
              if (!confirmDeleteSegment) return
              saveSegments(sortedSegments.filter((s) => s.id !== confirmDeleteSegment.id))
              setConfirmDeleteSegment(null)
            }}
          />

          <ConfirmAction
            open={Boolean(confirmDeleteVolunteer)}
            onOpenChange={(o) => !o && setConfirmDeleteVolunteer(null)}
            title={`Remove “${confirmDeleteVolunteer?.role}” slot?`}
            description="This volunteer role will be removed from the service."
            confirmLabel="Remove"
            variant="destructive"
            onConfirm={async () => {
              if (!confirmDeleteVolunteer) return
              saveVolunteers(
                sortedVolunteers.filter((v) => v.id !== confirmDeleteVolunteer.id)
              )
              setConfirmDeleteVolunteer(null)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
