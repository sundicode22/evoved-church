import { z } from "zod"

export const DRIP_TRIGGERS = [
  { value: "first_visit", label: "First visit / check-in" },
  { value: "new_member", label: "New member" },
  { value: "missed_two_weeks", label: "Missed two weeks" },
  { value: "manual", label: "Manual enroll" },
] as const

export const createSequenceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  campusId: z.string().optional(),
  triggerEvent: z.string().default("first_visit"),
  isActive: z.boolean().default(true),
})

export const createStepSchema = z.object({
  sequenceId: z.string().min(1),
  stepOrder: z.number().int().min(1).optional(),
  delayHours: z.number().int().min(0).default(2),
  channel: z.enum(["email", "sms"]).default("email"),
  subject: z.string().optional(),
  body: z.string().min(1, "Body is required"),
})

export const updateSequenceSchema = createSequenceSchema.partial()

export type CreateSequenceInput = z.infer<typeof createSequenceSchema>
export type CreateStepInput = z.infer<typeof createStepSchema>
export type UpdateSequenceInput = z.infer<typeof updateSequenceSchema>

export type DripStep = {
  id: string
  sequenceId: string
  stepOrder: number
  delayHours: number
  channel: "email" | "sms"
  subject: string
  body: string
}

export type DripSequence = {
  id: string
  campusId: string
  name: string
  triggerEvent: string
  isActive: boolean
  enrollmentCount: number
  steps: DripStep[]
  createdAt: string
  updatedAt: string
}
