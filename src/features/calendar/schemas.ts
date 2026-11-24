import { z } from "zod"

export const PROGRAM_TYPES = [
  { value: "ministry", label: "Ministry program" },
  { value: "worship", label: "Worship / service" },
  { value: "outreach", label: "Outreach" },
  { value: "training", label: "Training / class" },
  { value: "fellowship", label: "Fellowship" },
  { value: "other", label: "Other" },
] as const

export const ASSIGNEE_ROLES = [
  { value: "lead", label: "Lead" },
  { value: "volunteer", label: "Volunteer" },
  { value: "speaker", label: "Speaker" },
] as const

export const createProgramSchema = z.object({
  title: z.string().min(2),
  type: z.string().default("ministry"),
  description: z.string().optional(),
  locationLabel: z.string().optional(),
  serviceId: z.string().optional(),
  campusId: z.string().optional(),
})

export const createOccurrenceSchema = z.object({
  programId: z.string().min(1),
  startsAt: z.string().min(8),
  endsAt: z.string().optional(),
  allDay: z.boolean().default(false),
  status: z.enum(["scheduled", "cancelled", "completed"]).default("scheduled"),
  notes: z.string().optional(),
  campusId: z.string().optional(),
  assignees: z
    .array(
      z.object({
        displayName: z.string().min(1),
        roleLabel: z.enum(["lead", "volunteer", "speaker"]).default("volunteer"),
        memberId: z.string().optional(),
      })
    )
    .optional(),
})

export const updateOccurrenceSchema = createOccurrenceSchema.partial().omit({ programId: true })

export type CreateProgramInput = z.infer<typeof createProgramSchema>
export type CreateOccurrenceInput = z.infer<typeof createOccurrenceSchema>
export type UpdateOccurrenceInput = z.infer<typeof updateOccurrenceSchema>

export type CalendarAssignee = {
  id: string
  displayName: string
  roleLabel: "lead" | "volunteer" | "speaker"
  memberId?: string
}

export type CalendarOccurrence = {
  id: string
  programId: string
  programTitle: string
  programType: string
  locationLabel: string
  startsAt: string
  endsAt: string | null
  allDay: boolean
  status: "scheduled" | "cancelled" | "completed"
  notes: string
  serviceId?: string
  assignees: CalendarAssignee[]
}

export type ChurchProgram = {
  id: string
  title: string
  type: string
  description: string
  locationLabel: string
  serviceId?: string
  createdAt: string
  updatedAt: string
}
