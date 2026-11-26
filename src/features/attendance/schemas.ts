import { z } from "zod"

export const sundayCheckinSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().min(7, "Valid phone required").optional().or(z.literal("")),
  campusId: z.string().uuid("Valid campus ID required").optional(),
  isFirstTimer: z.boolean().default(false),
  serviceName: z.string().default("Sunday 10:00 AM Main Service"),
  notes: z.string().optional(),
})

export const childKioskCheckinSchema = z.object({
  guardianName: z.string().min(2, "Guardian name is required"),
  guardianPhone: z.string().min(7, "Guardian phone is required"),
  childName: z.string().min(2, "Child name is required"),
  childAge: z.number().int().min(0).max(18),
  allergies: z.string().optional(),
  specialNotes: z.string().optional(),
  campusId: z.string().uuid().optional(),
})

export const createAttendanceSessionSchema = z.object({
  sessionName: z.string().min(2, "Session name is required"),
  sessionDate: z.string().min(1, "Service day is required"),
  sessionType: z.enum(["service", "kids", "youth", "class"]).default("service"),
  campusId: z.string().uuid().optional(),
})

export type SundayCheckinInput = z.infer<typeof sundayCheckinSchema>
export type ChildKioskCheckinInput = z.infer<typeof childKioskCheckinSchema>
export type CreateAttendanceSessionInput = z.infer<typeof createAttendanceSessionSchema>

export type AttendanceSession = {
  id: string
  campusId: string
  sessionName: string
  sessionDate: string
  sessionType: "service" | "kids" | "youth" | "class"
  qrToken: string
  checkinUrl: string
  headcountAdults: number
  headcountChildren: number
  createdAt: string
}
