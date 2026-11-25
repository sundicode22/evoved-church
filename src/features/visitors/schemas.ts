import { z } from "zod"

export const VISITOR_STAGES = [
  "first_visit",
  "welcome_call",
  "pastoral_visit",
  "foundations_class",
  "group_integration",
  "active_partner",
] as const

export const VISITOR_STAGE_LABELS: Record<(typeof VISITOR_STAGES)[number], string> = {
  first_visit: "First Visit",
  welcome_call: "Welcome Call",
  pastoral_visit: "Pastoral Visit / Coffee",
  foundations_class: "Foundations Class",
  group_integration: "Group Integration",
  active_partner: "Active Partner",
}

export const visitorStageSchema = z.enum(VISITOR_STAGES)

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

export const assignLeadSchema = z.object({
  assigneeName: z.string().min(2, "Assignee name is required"),
  /** Admin = full system control; User = staff follow-up owner. */
  assigneeRole: z.enum(["admin", "user"]).default("user"),
  assignedToUserId: z.string().optional(),
})

export const visitorCommentSchema = z.object({
  body: z.string().min(1, "Comment is required").max(4000),
})

export const visitorOutreachSchema = z.object({
  channel: z.enum(["email", "sms"]),
  message: z.string().min(1, "Message is required").max(2000),
  subject: z.string().max(200).optional(),
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
export type AssignLeadInput = z.infer<typeof assignLeadSchema>
export type VisitorCommentInput = z.infer<typeof visitorCommentSchema>
export type VisitorOutreachInput = z.infer<typeof visitorOutreachSchema>
export type ScheduleAppointmentInput = z.infer<typeof scheduleAppointmentSchema>
export type VisitorStage = z.infer<typeof visitorStageSchema>
