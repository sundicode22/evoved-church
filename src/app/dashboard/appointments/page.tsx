"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarClock, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DateTimeFormField,
  NumberFormField,
  SelectFormField,
  TextFormField,
} from "@/components/form-fields"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Can, RequireAbility } from "@/components/auth/can"
import { StatusPill, TableChrome, TablePanel } from "@/components/table-panel"
import { TableExportButton } from "@/components/table-export-button"
import {
  useAppointmentSchedules,
  useAppointmentSummary,
  useCreateSchedule,
} from "@/features/appointments/hooks/use-appointments"
import { SCHEDULE_STATUSES } from "@/features/appointments/schemas"

const scheduleFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  ownerDisplayName: z.string(),
  durationMinutes: z
    .number({ error: "Duration is required" })
    .int("Duration must be a whole number")
    .min(15, "Minimum 15 minutes")
    .max(240, "Maximum 240 minutes"),
  windowStart: z.string().min(1, "Window start is required"),
  windowEnd: z.string().min(1, "Window end is required"),
  status: z.enum(["open_for_bookings", "closed"]),
})

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>

const SCHEDULE_DEFAULTS: ScheduleFormValues = {
  name: "",
  ownerDisplayName: "",
  durationMinutes: 30,
  windowStart: "",
  windowEnd: "",
  status: "open_for_bookings",
}

const STATUS_OPTIONS = SCHEDULE_STATUSES.map((s) => ({ value: s.value, label: s.label }))

export default function AppointmentsPage() {
  const { data: summary } = useAppointmentSummary()
  const { data: schedules, isLoading } = useAppointmentSchedules()
  const create = useCreateSchedule()

  const [open, setOpen] = React.useState(false)
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: SCHEDULE_DEFAULTS,
  })

  function openCreate() {
    const start = new Date()
    start.setHours(9, 0, 0, 0)
    const end = new Date()
    end.setDate(end.getDate() + 14)
    end.setHours(17, 0, 0, 0)
    form.reset({
      ...SCHEDULE_DEFAULTS,
      windowStart: format(start, "yyyy-MM-dd'T'HH:mm"),
      windowEnd: format(end, "yyyy-MM-dd'T'HH:mm"),
    })
    setOpen(true)
  }

  function onSubmit(values: ScheduleFormValues) {
    create.mutate(
      {
        name: values.name,
        ownerDisplayName: values.ownerDisplayName,
        durationMinutes: values.durationMinutes || 30,
        windowStart: new Date(values.windowStart).toISOString(),
        windowEnd: new Date(values.windowEnd).toISOString(),
        status: values.status,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset(SCHEDULE_DEFAULTS)
        },
      }
    )
  }

  const cards = [
    { label: "Open schedules", value: summary?.openSchedules ?? 0 },
    { label: "Upcoming bookings", value: summary?.upcomingBookings ?? 0 },
    { label: "Completed this week", value: summary?.completedThisWeek ?? 0 },
    { label: "Closed schedules", value: summary?.closedSchedules ?? 0 },
  ]

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="appointments.read">
          <PageHeader
            title="Appointments"
            description="Pastoral booking windows guests can schedule into."
            icon={<CalendarClock className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="appointments.write">
                <Button
                  onClick={openCreate}
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  Create schedule
                </Button>
              </Can>
            }
          />

          <div className="space-y-6 p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="flex min-h-[112px] flex-col justify-between rounded-xl border border-border bg-card px-5 py-5 shadow-xs"
                >
                  <p className="text-sm font-normal text-zinc-500">{c.label}</p>
                  <p className="text-3xl font-medium tracking-tight text-foreground">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {!isLoading && (schedules?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-border/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No schedules yet</EmptyTitle>
                  <EmptyDescription>
                    Create a booking window for coffee visits, counseling, or care.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <TablePanel>
                <TableChrome
                  trailing={
                    <TableExportButton
                      payload={{
                        filename: "appointments",
                        title: "Appointment schedules",
                        headers: [
                          "Schedule",
                          "Shepherd",
                          "Duration",
                          "Window start",
                          "Window end",
                          "Bookings",
                          "Status",
                        ],
                        rows: (schedules ?? []).map((s) => [
                          s.name,
                          s.ownerDisplayName || "",
                          s.durationMinutes,
                          s.windowStart,
                          s.windowEnd,
                          s.bookingCount ?? 0,
                          s.status,
                        ]),
                      }}
                    />
                  }
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Schedule</TableHead>
                      <TableHead>Shepherd</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {(schedules ?? []).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="pl-4">
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-zinc-400">/{s.bookingUrlSlug}</p>
                        </TableCell>
                        <TableCell>{s.ownerDisplayName || "—"}</TableCell>
                        <TableCell>{s.durationMinutes} min</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(parseISO(s.windowStart), "MMM d")} –{" "}
                          {format(parseISO(s.windowEnd), "MMM d")}
                        </TableCell>
                        <TableCell>{s.bookingCount}</TableCell>
                        <TableCell>
                          <StatusPill
                            tone={s.status === "open_for_bookings" ? "success" : "neutral"}
                          >
                            {s.status === "open_for_bookings" ? "Open" : "Closed"}
                          </StatusPill>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TablePanel>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle>Create schedule</SheetTitle>
                    <SheetDescription>
                      Define who hosts, slot length, and the booking window.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField control={form.control} name="name" label="Name" />
                      <TextFormField
                        control={form.control}
                        name="ownerDisplayName"
                        label="Shepherd / host"
                        placeholder="Pastor name"
                      />
                      <NumberFormField
                        control={form.control}
                        name="durationMinutes"
                        label="Duration (minutes)"
                        min={15}
                        step={15}
                      />
                      <DateTimeFormField
                        control={form.control}
                        name="windowStart"
                        label="Window start"
                      />
                      <DateTimeFormField
                        control={form.control}
                        name="windowEnd"
                        label="Window end"
                      />
                      <SelectFormField
                        control={form.control}
                        name="status"
                        label="Status"
                        options={STATUS_OPTIONS}
                      />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={create.isPending}>
                      Save schedule
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
