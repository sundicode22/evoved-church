"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DatePicker } from "@/components/date-picker"
import { TimePicker } from "@/components/time-picker"
import { format } from "date-fns"
import { toast } from "sonner"
import { Calendar as Calendar, Download, MapPin, MoreHorizontal, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"

interface Appointment {
  id: string
  day: string
  date: string
  time: string
  title: string
  location: string
  type: string
  staff: string
  status: string
}

const APPOINTMENT_TYPES = [
  "First-Timer Follow-up",
  "Spiritual Milestone",
  "Hospital & Benevolence",
  "Leadership Development",
  "Pastoral Counseling",
]

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return format(d, "h:mm a")
}

function addMinutes(value: string, minutes: number) {
  const [h, m] = value.split(":").map(Number)
  const total = (h * 60 + m + minutes) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

const COLUMNS: ColumnOption[] = [
  { id: "when", label: "When" },
  { id: "title", label: "Visit" },
  { id: "type", label: "Type" },
  { id: "location", label: "Location" },
  { id: "staff", label: "Shepherd" },
  { id: "status", label: "Status" },
]

const selectClass =
  "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20"

const INITIAL_APPOINTMENTS: Appointment[] = [
    {
      id: "app-1",
      day: "Monday",
      date: "January 19, 2024",
      time: "10:00 AM - 10:30 AM",
      title: "Pastoral Discovery Coffee with Brian Robbin",
      location: "4517 Washington Ave, Manchester, KY 39495",
      type: "First-Timer Follow-up",
      staff: "Pastor Ahmad Fawaid",
      status: "confirmed",
    },
    {
      id: "app-2",
      day: "Tuesday",
      date: "January 20, 2024",
      time: "2:00 PM - 3:00 PM",
      title: "Baptism Counseling & Foundations with Jane Cooper",
      location: "Main Sanctuary - Pastoral Office 102",
      type: "Spiritual Milestone",
      staff: "Pastor Marcus Vance",
      status: "confirmed",
    },
    {
      id: "app-3",
      day: "Thursday",
      date: "January 22, 2024",
      time: "11:30 AM - 12:30 PM",
      title: "Hospital Pastoral Care Visit with Eleanor Pena",
      location: "St. Jude Memorial Hospital - Room 412",
      type: "Hospital & Benevolence",
      staff: "Pastor David Johnson",
      status: "confirmed",
    },
    {
      id: "app-4",
      day: "Saturday",
      date: "January 24, 2024",
      time: "9:00 AM - 10:30 AM",
      title: "Life Group Leader Orientation with Kathryn Murphy",
      location: "Fellowship Hall - Room B",
      type: "Leadership Development",
      staff: "Pastor Ahmad Fawaid",
      status: "scheduled",
    },
]

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)
  const [appointments, setAppointments] = React.useState<Appointment[]>(INITIAL_APPOINTMENTS)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    title: "",
    type: APPOINTMENT_TYPES[0],
    location: "",
    notes: "",
    date: undefined as Date | undefined,
    startTime: "10:00",
    endTime: "10:30",
    reminder: true,
  })

  const filtered = React.useMemo(
    () =>
      appointments.filter((app) =>
        app.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [appointments, searchQuery]
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const resetForm = () =>
    setForm({
      title: "",
      type: APPOINTMENT_TYPES[0],
      location: "",
      notes: "",
      date: undefined,
      startTime: "10:00",
      endTime: "10:30",
      reminder: true,
    })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Please give the visit a title.")
      return
    }
    if (!form.date) {
      toast.error("Please choose a date.")
      return
    }
    if (form.endTime <= form.startTime) {
      toast.error("The end time must be after the start time.")
      return
    }

    const created: Appointment = {
      id: `app-${Date.now()}`,
      day: format(form.date, "EEEE"),
      date: format(form.date, "MMMM d, yyyy"),
      time: `${formatTime(form.startTime)} - ${formatTime(form.endTime)}`,
      title: form.title.trim(),
      location: form.location.trim() || "Location to be confirmed",
      type: form.type,
      staff: "Pastor Ahmad Fawaid",
      status: "scheduled",
    }
    setAppointments((prev) => [created, ...prev])
    setDialogOpen(false)
    resetForm()
    toast.success(`Visit scheduled for ${created.date} at ${formatTime(form.startTime)}`)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white dark:bg-zinc-950">
        
        <PageHeader
          title="Appointments"
          description="Pastoral visits, counseling, and newcomer coffees."
          icon={<Calendar className="size-5 text-[#16a34a]" strokeWidth={1.75} />}
          actions={
            <>
              <TableAddButton>
                <Download className="size-3.5 text-zinc-500" strokeWidth={1.75} />
                Sync Calendar
              </TableAddButton>
              <TableAddButton onClick={() => setDialogOpen(true)}>
                <Plus className="size-3.5" strokeWidth={1.75} />
                Schedule Visit
              </TableAddButton>
            </>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <span>
              Scheduled: <span className="text-zinc-800">{appointments.length} visits</span>
            </span>
            <Input
              placeholder="Search appointments…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="h-8 w-full max-w-sm rounded-lg border-zinc-200 bg-zinc-50 text-xs shadow-xs"
            />
          </div>
        </PageHeader>

        <div className="p-6 md:p-8">
          <TablePanel>
            <TableChrome
              trailing={
                <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
              }
            />
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {isVisible("when") && <TableHead className="pl-4">When</TableHead>}
                  {isVisible("title") && <TableHead>Visit</TableHead>}
                  {isVisible("type") && <TableHead>Type</TableHead>}
                  {isVisible("location") && <TableHead>Location</TableHead>}
                  {isVisible("staff") && <TableHead>Shepherd</TableHead>}
                  {isVisible("status") && <TableHead>Status</TableHead>}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-zinc-500">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                )}
                {pageRows.map((app) => (
                  <TableRow key={app.id}>
                    {isVisible("when") && (
                      <TableCell className="pl-4">
                        <div className="font-medium text-zinc-900">{app.date}</div>
                        <div className="text-xs text-zinc-500">
                          {app.day} · {app.time}
                        </div>
                      </TableCell>
                    )}
                    {isVisible("title") && (
                      <TableCell className="max-w-xs whitespace-normal font-medium text-zinc-900">
                        {app.title}
                      </TableCell>
                    )}
                    {isVisible("type") && (
                      <TableCell>
                        <StatusPill>{app.type}</StatusPill>
                      </TableCell>
                    )}
                    {isVisible("location") && (
                      <TableCell className="max-w-xs whitespace-normal text-zinc-600">
                        <span className="inline-flex items-start gap-1.5">
                          <MapPin strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-zinc-400" />
                          {app.location}
                        </span>
                      </TableCell>
                    )}
                    {isVisible("staff") && (
                      <TableCell className="text-zinc-600">{app.staff}</TableCell>
                    )}
                    {isVisible("status") && (
                      <TableCell>
                        <StatusPill tone={app.status === "confirmed" ? "success" : "neutral"}>
                          {app.status === "confirmed" ? "Confirmed" : "Scheduled"}
                        </StatusPill>
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" className="size-8" />}
                        >
                          <MoreHorizontal className="size-4 text-zinc-400" strokeWidth={1.75} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-xs"
                            onClick={() =>
                              setAppointments((prev) => prev.filter((a) => a.id !== app.id))
                            }
                          >
                            Cancel visit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s)
                setPage(1)
              }}
            />
          </TablePanel>
        </div>

        <Sheet
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <SheetContent side="right" inset size="md" className="p-0">
            <form onSubmit={handleCreate} className="flex h-full flex-col">
              <SheetHeader className="pr-12">
                <SheetTitle>Schedule a visit</SheetTitle>
                <SheetDescription>
                  Set a time to meet with a guest or member. A reminder can be sent ahead of the visit.
                </SheetDescription>
              </SheetHeader>

              <SheetBody>
                <div className="grid gap-1.5">
                  <Label htmlFor="appt-title" className="text-xs font-medium text-zinc-700">
                    Title
                  </Label>
                  <Input
                    id="appt-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Pastoral coffee with Jane Cooper"
                    className="h-9 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-zinc-700">Date</Label>
                    <DatePicker
                      value={form.date}
                      onChange={(date) => setForm({ ...form, date })}
                      disablePast
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="appt-type" className="text-xs font-medium text-zinc-700">
                      Type
                    </Label>
                    <select
                      id="appt-type"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className={selectClass}
                    >
                      {APPOINTMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-zinc-700">Starts</Label>
                    <TimePicker
                      value={form.startTime}
                      onChange={(startTime) =>
                        setForm({ ...form, startTime, endTime: addMinutes(startTime, 30) })
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-zinc-700">Ends</Label>
                    <TimePicker
                      value={form.endTime}
                      onChange={(endTime) => setForm({ ...form, endTime })}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="appt-location" className="text-xs font-medium text-zinc-700">
                    Location
                  </Label>
                  <Input
                    id="appt-location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Fellowship Hall - Room B"
                    className="h-9 rounded-lg"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="appt-notes" className="text-xs font-medium text-zinc-700">
                    Notes
                  </Label>
                  <Textarea
                    id="appt-notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Anything the shepherd should know before the visit"
                    className="min-h-20 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-[#f8faf9] px-3.5 py-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-800">Send a reminder</p>
                    <p className="text-[11px] text-zinc-500">
                      Email the guest 24 hours before the visit.
                    </p>
                  </div>
                  <Switch
                    checked={form.reminder}
                    onCheckedChange={(reminder) => setForm({ ...form, reminder })}
                    className="data-checked:bg-emerald-600"
                  />
                </div>
              </SheetBody>

              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg px-4"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 rounded-lg bg-[#22c55e] px-4 font-normal text-white hover:bg-[#16a34a]"
                >
                  Schedule visit
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

      </SidebarInset>
    </SidebarProvider>
  )
}
