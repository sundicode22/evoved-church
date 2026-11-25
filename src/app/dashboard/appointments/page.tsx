"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarClock, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
import { StatusPill, TablePanel } from "@/components/table-panel"
import {
  useAppointmentSchedules,
  useAppointmentSummary,
  useCreateSchedule,
} from "@/features/appointments/hooks/use-appointments"
import { SCHEDULE_STATUSES } from "@/features/appointments/schemas"

export default function AppointmentsPage() {
  const { data: summary } = useAppointmentSummary()
  const { data: schedules, isLoading } = useAppointmentSchedules()
  const create = useCreateSchedule()

  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [ownerDisplayName, setOwnerDisplayName] = React.useState("")
  const [durationMinutes, setDurationMinutes] = React.useState("30")
  const [windowStart, setWindowStart] = React.useState("")
  const [windowEnd, setWindowEnd] = React.useState("")
  const [status, setStatus] = React.useState<"open_for_bookings" | "closed">(
    "open_for_bookings"
  )

  function openCreate() {
    const start = new Date()
    start.setHours(9, 0, 0, 0)
    const end = new Date()
    end.setDate(end.getDate() + 14)
    end.setHours(17, 0, 0, 0)
    setWindowStart(format(start, "yyyy-MM-dd'T'HH:mm"))
    setWindowEnd(format(end, "yyyy-MM-dd'T'HH:mm"))
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(
      {
        name,
        ownerDisplayName,
        durationMinutes: Number(durationMinutes) || 30,
        windowStart: new Date(windowStart).toISOString(),
        windowEnd: new Date(windowEnd).toISOString(),
        status,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setName("")
          setOwnerDisplayName("")
          setDurationMinutes("30")
          setStatus("open_for_bookings")
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
      <SidebarInset className="min-h-screen bg-white">
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
                  className="rounded-lg border border-zinc-200/80 bg-[#f4f6f5] px-4 py-3 shadow-xs"
                >
                  <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                    {c.label}
                  </p>
                  <p className="mt-1 text-2xl font-medium text-zinc-900">{c.value}</p>
                </div>
              ))}
            </div>

            {!isLoading && (schedules?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-zinc-200/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No schedules yet</EmptyTitle>
                  <EmptyDescription>
                    Create a booking window for coffee visits, counseling, or care.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <TablePanel>
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
                          <p className="font-medium text-zinc-900">{s.name}</p>
                          <p className="text-xs text-zinc-400">/{s.bookingUrlSlug}</p>
                        </TableCell>
                        <TableCell>{s.ownerDisplayName || "—"}</TableCell>
                        <TableCell>{s.durationMinutes} min</TableCell>
                        <TableCell className="text-xs text-zinc-600">
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
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Create schedule</SheetTitle>
                  <SheetDescription>
                    Define who hosts, slot length, and the booking window.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        className="h-9"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Shepherd / host</FieldLabel>
                      <Input
                        className="h-9"
                        value={ownerDisplayName}
                        onChange={(e) => setOwnerDisplayName(e.target.value)}
                        placeholder="Pastor name"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Duration (minutes)</FieldLabel>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        className="h-9"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>Window start</FieldLabel>
                        <Input
                          type="datetime-local"
                          className="h-9"
                          value={windowStart}
                          onChange={(e) => setWindowStart(e.target.value)}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Window end</FieldLabel>
                        <Input
                          type="datetime-local"
                          className="h-9"
                          value={windowEnd}
                          onChange={(e) => setWindowEnd(e.target.value)}
                          required
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        value={status}
                        items={SCHEDULE_STATUSES.map((s) => ({
                          value: s.value,
                          label: s.label,
                        }))}
                        onValueChange={(v) =>
                          v && setStatus(v as "open_for_bookings" | "closed")
                        }
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHEDULE_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={create.isPending || name.trim().length < 2}
                  >
                    Save schedule
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
