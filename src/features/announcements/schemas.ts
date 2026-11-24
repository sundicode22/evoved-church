import { z } from "zod"

export const ANNOUNCEMENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "posted", label: "Posted" },
] as const

export const createAnnouncementSchema = z.object({
  title: z.string().min(2, "Title is required"),
  bodyHtml: z.string().min(1, "Body is required"),
  campusId: z.string().optional(),
  isPinned: z.boolean().default(false),
  status: z.enum(["draft", "scheduled", "posted"]).default("draft"),
  scheduledAt: z.string().optional().nullable(),
})

export const updateAnnouncementSchema = createAnnouncementSchema.partial()

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>

export type Announcement = {
  id: string
  campusId: string | null
  title: string
  bodyHtml: string
  isPinned: boolean
  status: "draft" | "scheduled" | "posted"
  scheduledAt: string | null
  postedAt: string | null
  postedByName: string
  createdAt: string
  updatedAt: string
}
