import { z } from "zod"

export const SCHEDULE_STATUSES = [
  { value: "open_for_bookings", label: "Open for bookings" },
  { value: "closed", label: "Closed" },
] as const

export const createScheduleSchema = z.object({
  name: z.string().min(2, "Name is required"),
  campusId: z.string().optional(),
  ownerDisplayName: z.string().optional(),
  durationMinutes: z.number().int().min(15).max(240).default(30),
  windowStart: z.string().min(8),
  windowEnd: z.string().min(8),
  status: z.enum(["open_for_bookings", "closed"]).default("open_for_bookings"),
  bookingUrlSlug: z.string().optional(),
})

export const updateScheduleSchema = createScheduleSchema.partial()

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>

export type AppointmentSchedule = {
  id: string
  campusId: string
  name: string
  ownerUserId?: string
  ownerDisplayName: string
  durationMinutes: number
  windowStart: string
  windowEnd: string
  status: "open_for_bookings" | "closed"
  bookingUrlSlug: string
  bookingCount: number
  createdAt: string
  updatedAt: string
}

export type AppointmentBooking = {
  id: string
  scheduleId: string
  scheduleName: string
  guestName: string
  guestEmail: string
  startsAt: string
  status: "upcoming" | "completed" | "cancelled"
  createdAt: string
}

export type AppointmentSummary = {
  openSchedules: number
  upcomingBookings: number
  completedThisWeek: number
  closedSchedules: number
}
