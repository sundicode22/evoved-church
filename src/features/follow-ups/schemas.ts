import { z } from "zod"

export const FOLLOW_UP_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
] as const

export const createFollowUpSchema = z.object({
  title: z.string().min(2, "Title is required"),
  campusId: z.string().optional(),
  relatedMemberName: z.string().optional(),
  relatedLeadName: z.string().optional(),
  assignedToName: z.string().optional(),
  dueAt: z.string().optional(),
  status: z.enum(["open", "in_progress", "done", "cancelled"]).default("open"),
  notes: z.string().optional(),
})

export const updateFollowUpSchema = createFollowUpSchema.partial()

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>

export type FollowUp = {
  id: string
  campusId: string
  title: string
  relatedMemberName: string
  relatedLeadName: string
  assignedToName: string
  dueAt: string | null
  status: "open" | "in_progress" | "done" | "cancelled"
  notes: string
  createdAt: string
  updatedAt: string
}
