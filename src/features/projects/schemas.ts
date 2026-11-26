import { z } from "zod"

/** Default seed keys — boards use customizable kanban_columns at runtime. */
export const PROJECT_STAGES = ["backlog", "in_progress", "review", "done"] as const
export const PROJECT_STAGE_LABELS: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
}

export const projectStageSchema = z.string().min(1)
export const projectPrioritySchema = z.enum(["low", "normal", "high"])

export const createProjectCardSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  projectName: z.string().optional().default("General"),
  priority: projectPrioritySchema.default("normal"),
  assigneeName: z.string().optional(),
  dueLabel: z.string().optional(),
  stage: projectStageSchema.default("backlog"),
})

export const updateProjectStageSchema = z.object({
  stage: projectStageSchema,
})

export type ProjectStage = string
export type CreateProjectCardInput = z.input<typeof createProjectCardSchema>
export type UpdateProjectStageInput = z.infer<typeof updateProjectStageSchema>

export interface ProjectCard {
  id: string
  title: string
  description?: string
  projectName: string
  priority: "low" | "normal" | "high"
  assigneeName?: string
  dueLabel?: string
  stage: ProjectStage
  stageChangedAt: string
}

export interface ProjectBoard {
  totalCards: number
  columns: { id: ProjectStage; title: string; cards: ProjectCard[] }[]
}
