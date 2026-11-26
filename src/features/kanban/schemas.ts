import { z } from "zod"

export const KANBAN_BOARD_TYPES = ["visitors", "projects"] as const
export const kanbanBoardTypeSchema = z.enum(KANBAN_BOARD_TYPES)
export type KanbanBoardType = z.infer<typeof kanbanBoardTypeSchema>

export const DEFAULT_VISITOR_COLUMNS = [
  { key: "first_visit", label: "First Visit" },
  { key: "welcome_call", label: "Welcome Call" },
  { key: "pastoral_visit", label: "Pastoral Visit / Coffee" },
  { key: "foundations_class", label: "Foundations Class" },
  { key: "group_integration", label: "Group Integration" },
  { key: "active_partner", label: "Active Partner" },
] as const

export const DEFAULT_PROJECT_COLUMNS = [
  { key: "backlog", label: "Backlog" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "In Review" },
  { key: "done", label: "Done" },
] as const

export const createKanbanColumnSchema = z.object({
  boardType: kanbanBoardTypeSchema,
  label: z.string().trim().min(2, "Label is required").max(120),
  key: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, underscores")
    .min(2)
    .max(80)
    .optional(),
  color: z.string().max(40).optional(),
})

export const updateKanbanColumnSchema = z.object({
  label: z.string().trim().min(2).max(120).optional(),
  color: z.string().max(40).nullable().optional(),
})

export const reorderKanbanColumnsSchema = z.object({
  boardType: kanbanBoardTypeSchema,
  orderedKeys: z.array(z.string().min(1)).min(1),
})

export type CreateKanbanColumnInput = z.infer<typeof createKanbanColumnSchema>
export type UpdateKanbanColumnInput = z.infer<typeof updateKanbanColumnSchema>
export type ReorderKanbanColumnsInput = z.infer<typeof reorderKanbanColumnsSchema>

export type KanbanColumn = {
  id: string
  boardType: KanbanBoardType
  key: string
  label: string
  orderIndex: number
  color: string | null
  isDefault: boolean
}
