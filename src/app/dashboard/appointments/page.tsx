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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  Download01Icon,
  PlusSignIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  Calendar03Icon,
  Location01Icon,
  UserCircle02Icon,
} from "@hugeicons/core-free-icons"

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
      <SidebarInset className="bg-[#fbfcfb] dark:bg-zinc-950 min-h-screen">
        
        {/* TOP HEADER */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Appointments & Pastoral Care Visits</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pastoral discovery sessions, baptism counseling, hospital visits, and newcomer coffees.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>

              <Button variant="outline" className="h-9 px-3.5 rounded-lg border-zinc-200 text-xs font-semibold gap-1.5 shadow-2xs">
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-3.5 text-zinc-600" />
                <span>Sync Calendar</span>
              </Button>

              <Button
                onClick={() => setDialogOpen(true)}
                className="h-9 px-4 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Schedule Visit</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>Scheduled: <strong className="text-zinc-800 dark:text-zinc-200">{appointments.length} visits</strong></span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>Lead Shepherd: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Pastor Ahmad Fawaid</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400"
                />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs bg-zinc-50 border-zinc-200 rounded-lg focus-visible:ring-emerald-500"
                />
              </div>

              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
                <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-3 text-zinc-500" />
                <span>Filter</span>
              </Button>

              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-zinc-600 border-zinc-200 rounded-lg gap-1.5">
                <HugeiconsIcon icon={ArrowUpDownIcon} strokeWidth={2} className="size-3 text-zinc-500" />
                <span>Sort</span>
              </Button>
            </div>
          </div>
        </div>

        {/* APPOINTMENTS LIST */}
        <div className="p-8 max-w-5xl space-y-4">
          {appointments
            .filter((app) => app.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
            .map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-48 shrink-0">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{app.day}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{app.date}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{app.time}</p>
                  <span className="inline-block mt-2 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                    {app.type}
                  </span>
                </div>

                <div className="flex-1 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {app.title}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className="size-3.5 text-zinc-400" />
                    <span>{app.location}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="size-5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white shadow-2xs">
                      AF
                    </div>
                    <span>Assigned Shepherd: <strong className="text-zinc-700 dark:text-zinc-300">{app.staff}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="size-8">
                    <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4 text-zinc-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
                  <Label htmlFor="appt-title" className="text-xs font-semibold text-zinc-700">
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
                    <Label className="text-xs font-semibold text-zinc-700">Date</Label>
                    <DatePicker
                      value={form.date}
                      onChange={(date) => setForm({ ...form, date })}
                      disablePast
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="appt-type" className="text-xs font-semibold text-zinc-700">
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
                    <Label className="text-xs font-semibold text-zinc-700">Starts</Label>
                    <TimePicker
                      value={form.startTime}
                      onChange={(startTime) =>
                        setForm({ ...form, startTime, endTime: addMinutes(startTime, 30) })
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold text-zinc-700">Ends</Label>
                    <TimePicker
                      value={form.endTime}
                      onChange={(endTime) => setForm({ ...form, endTime })}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="appt-location" className="text-xs font-semibold text-zinc-700">
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
                  <Label htmlFor="appt-notes" className="text-xs font-semibold text-zinc-700">
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

                <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-[#f8faf9] px-3.5 py-3">
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">Send a reminder</p>
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
                  className="h-9 rounded-lg bg-[#22c55e] px-4 font-semibold text-white hover:bg-[#16a34a]"
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
