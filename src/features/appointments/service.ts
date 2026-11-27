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

const schedules: AppointmentSchedule[] = []
const bookings: AppointmentBooking[] = []

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
