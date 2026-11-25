"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SelectFormField, TextFormField } from "@/components/form-fields"
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
import { Church, Plus } from "lucide-react"

const serviceFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  type: serviceTypeSchema,
  locationLabel: z.string(),
  defaultDayOfWeek: z.string().min(1, "Default day is required"),
  defaultStartTime: z.string().min(1, "Start time is required"),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

const SERVICE_FORM_DEFAULTS: ServiceFormValues = {
  name: "",
  type: "sunday_worship",
  locationLabel: "",
  defaultDayOfWeek: "0",
  defaultStartTime: "10:00",
}

const SERVICE_TYPE_OPTIONS = SERVICE_TYPES.map((t) => ({ value: t.value, label: t.label }))
const DAY_OPTIONS = DAY_LABELS.map((d, i) => ({ value: String(i), label: d }))

export default function ServicesPage() {
  const { data, isLoading } = useServices()
  const create = useCreateService()
  const remove = useDeleteService()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState<ChurchService | null>(null)
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: SERVICE_FORM_DEFAULTS,
  })

  React.useEffect(() => {
    if (createOpen) form.reset(SERVICE_FORM_DEFAULTS)
  }, [createOpen, form])

  const selected = data?.find((s) => s.id === (selectedId ?? data[0]?.id)) ?? null
  const update = useUpdateService(selected?.id || "")

  React.useEffect(() => {
    if (!selectedId && data?.[0]) setSelectedId(data[0].id)
  }, [data, selectedId])

  function onSubmit(values: ServiceFormValues) {
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
          form.reset(SERVICE_FORM_DEFAULTS)
          setSelectedId(s.id)
        },
      }
    )
  }

  function saveSegments(segments: ChurchService["segments"]) {
    if (!selected) return
    update.mutate({ segments })
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
                <Button
                  onClick={() => setCreateOpen(true)}
                >
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
                      {selected.segments.length === 0 && (
                        <p className="text-xs text-zinc-400">No segments yet.</p>
                      )}
                      {selected.segments
                        .slice()
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((seg, i) => (
                          <div
                            key={seg.id}
                            className="rounded-lg border border-zinc-200/80 bg-[#f4f6f5] px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-2">
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
                          </div>
                        ))}
                      <Can permission="services.write">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() =>
                            saveSegments([
                              ...selected.segments,
                              {
                                id: `seg-${Date.now()}`,
                                title: "New segment",
                                leader: "",
                                durationMinutes: 10,
                                details: "",
                                orderIndex: selected.segments.length,
                              },
                            ])
                          }
                        >
                          Add segment
                        </Button>
                      </Can>
                    </TabsContent>
                    <TabsContent value="volunteers" className="space-y-3 pt-4">
                      {selected.volunteers.length === 0 && (
                        <p className="text-xs text-zinc-400">No volunteer slots.</p>
                      )}
                      {selected.volunteers.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-lg border border-zinc-200/80 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{v.role}</p>
                            <p className="text-xs text-zinc-500">
                              {v.assigneeName || "Open slot"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              v.status === "confirmed"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }
                          >
                            {v.status}
                          </Badge>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>

          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle>New service</SheetTitle>
                    <SheetDescription>
                      Any gathering — not only Sunday. Set type, day, and default start time.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField control={form.control} name="name" label="Name" />
                      <SelectFormField
                        control={form.control}
                        name="type"
                        label="Type"
                        options={SERVICE_TYPE_OPTIONS}
                      />
                      <TextFormField
                        control={form.control}
                        name="locationLabel"
                        label="Location"
                        placeholder="Main Sanctuary"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <SelectFormField
                          control={form.control}
                          name="defaultDayOfWeek"
                          label="Default day"
                          options={DAY_OPTIONS}
                        />
                        <TextFormField
                          control={form.control}
                          name="defaultStartTime"
                          label="Start time"
                          type="time"
                          description="24h local time"
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
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
