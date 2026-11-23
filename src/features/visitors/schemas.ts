import { z } from "zod"

export const visitorStageSchema = z.enum([
  "new_leads",
  "request_received",
  "in_draft",
  "proposal_sent",
  "approved",
  "rejected",
  "integrated_member",
])

export const createLeadSchema = z.object({
  title: z.string().min(2, "Title is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  contactPhone: z.string().min(7, "Valid phone number is required").optional().or(z.literal("")),
  location: z.string().optional(),
  campusId: z.string().uuid("Valid campus ID required").optional(),
  source: z.string().default("Sunday Service QR"),
  value: z.number().nonnegative("Value cannot be negative").default(0),
  tags: z.array(z.string()).default([]),
  assignedToUserId: z.string().optional(),
})

export const updateLeadStageSchema = z.object({
  stage: visitorStageSchema,
  reason: z.string().optional(),
})

export const scheduleAppointmentSchema = z.object({
  title: z.string().min(3, "Appointment title is required"),
  appointmentDate: z.string().datetime("Valid ISO date string is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(2, "Location is required"),
  assignedStaffId: z.string().optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadStageInput = z.infer<typeof updateLeadStageSchema>
export type ScheduleAppointmentInput = z.infer<typeof scheduleAppointmentSchema>
export type VisitorStage = z.infer<typeof visitorStageSchema>
