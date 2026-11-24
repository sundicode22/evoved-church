import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createScheduleSchema,
  updateScheduleSchema,
  type AppointmentBooking,
  type AppointmentSchedule,
  type AppointmentSummary,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from "./schemas"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()
const daysFromNow = (d: number, hour = 10) => {
  const dt = new Date()
  dt.setDate(dt.getDate() + d)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString()
}

const schedules: AppointmentSchedule[] = [
  {
    id: "sched-1",
    campusId: DEMO_CAMPUS,
    name: "Pastoral Discovery Coffee",
    ownerDisplayName: "Pastor Ahmad Fawaid",
    durationMinutes: 30,
    windowStart: daysFromNow(1, 9),
    windowEnd: daysFromNow(14, 17),
    status: "open_for_bookings",
    bookingUrlSlug: "pastoral-coffee",
    bookingCount: 2,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "sched-2",
    campusId: DEMO_CAMPUS,
    name: "Baptism Counseling",
    ownerDisplayName: "Pastor Marcus Vance",
    durationMinutes: 60,
    windowStart: daysFromNow(2, 10),
    windowEnd: daysFromNow(21, 16),
    status: "open_for_bookings",
    bookingUrlSlug: "baptism-counseling",
    bookingCount: 1,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "sched-3",
    campusId: DEMO_CAMPUS,
    name: "Hospital Visits (staff only)",
    ownerDisplayName: "Pastor David Johnson",
    durationMinutes: 45,
    windowStart: daysFromNow(-7, 9),
    windowEnd: daysFromNow(-1, 17),
    status: "closed",
    bookingUrlSlug: "hospital-care",
    bookingCount: 0,
    createdAt: now(),
    updatedAt: now(),
  },
]

const bookings: AppointmentBooking[] = [
  {
    id: "book-1",
    scheduleId: "sched-1",
    scheduleName: "Pastoral Discovery Coffee",
    guestName: "Brian Robbin",
    guestEmail: "brian@example.org",
    startsAt: daysFromNow(2, 10),
    status: "upcoming",
    createdAt: now(),
  },
  {
    id: "book-2",
    scheduleId: "sched-1",
    scheduleName: "Pastoral Discovery Coffee",
    guestName: "Jane Cooper",
    guestEmail: "jane@example.org",
    startsAt: daysFromNow(5, 14),
    status: "upcoming",
    createdAt: now(),
  },
  {
    id: "book-3",
    scheduleId: "sched-2",
    scheduleName: "Baptism Counseling",
    guestName: "Eleanor Pena",
    guestEmail: "eleanor@example.org",
    startsAt: daysFromNow(-2, 11),
    status: "completed",
    createdAt: now(),
  },
]

function findSchedule(id: string) {
  const s = schedules.find((x) => x.id === id)
  if (!s) throw new NotFoundError("Schedule", id)
  return s
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

export const appointmentsService = {
  async summary(): Promise<AppointmentSummary> {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return {
      openSchedules: schedules.filter((s) => s.status === "open_for_bookings").length,
      upcomingBookings: bookings.filter((b) => b.status === "upcoming").length,
      completedThisWeek: bookings.filter(
        (b) => b.status === "completed" && new Date(b.startsAt) >= weekAgo
      ).length,
      closedSchedules: schedules.filter((s) => s.status === "closed").length,
    }
  },

  async listSchedules(): Promise<AppointmentSchedule[]> {
    return [...schedules].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async listBookings(): Promise<AppointmentBooking[]> {
    return [...bookings].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  },

  async createSchedule(input: CreateScheduleInput): Promise<AppointmentSchedule> {
    const parsed = createScheduleSchema.parse(input)
    if (new Date(parsed.windowEnd) <= new Date(parsed.windowStart)) {
      throw new ValidationError("Window end must be after window start")
    }
    const ts = now()
    const schedule: AppointmentSchedule = {
      id: `sched-${crypto.randomUUID()}`,
      campusId: parsed.campusId || DEMO_CAMPUS,
      name: parsed.name,
      ownerDisplayName: parsed.ownerDisplayName || "Staff",
      durationMinutes: parsed.durationMinutes ?? 30,
      windowStart: new Date(parsed.windowStart).toISOString(),
      windowEnd: new Date(parsed.windowEnd).toISOString(),
      status: parsed.status ?? "open_for_bookings",
      bookingUrlSlug: parsed.bookingUrlSlug || slugify(parsed.name),
      bookingCount: 0,
      createdAt: ts,
      updatedAt: ts,
    }
    schedules.unshift(schedule)
    return { ...schedule }
  },

  async updateSchedule(id: string, input: UpdateScheduleInput): Promise<AppointmentSchedule> {
    const schedule = findSchedule(id)
    const parsed = updateScheduleSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    Object.assign(schedule, {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.ownerDisplayName !== undefined && {
        ownerDisplayName: parsed.ownerDisplayName,
      }),
      ...(parsed.durationMinutes !== undefined && {
        durationMinutes: parsed.durationMinutes,
      }),
      ...(parsed.windowStart !== undefined && {
        windowStart: new Date(parsed.windowStart).toISOString(),
      }),
      ...(parsed.windowEnd !== undefined && {
        windowEnd: new Date(parsed.windowEnd).toISOString(),
      }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      ...(parsed.bookingUrlSlug !== undefined && { bookingUrlSlug: parsed.bookingUrlSlug }),
      updatedAt: now(),
    })
    return { ...schedule }
  },
}
