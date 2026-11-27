import { NotFoundError } from "@/lib/errors"
import {
  type CreateProjectCardInput,
  type ProjectBoard,
  type ProjectCard,
  type ProjectStage,
} from "./schemas"
import { createProjectCardSchema } from "./schemas"
import { kanbanService } from "@/features/kanban/service"

const cards: ProjectCard[] = []

export const projectService = {
  async getBoard(): Promise<ProjectBoard> {
    const cols = await kanbanService.list("projects")
    return {
      totalCards: cards.length,
      columns: cols.map((c) => ({
        id: c.key,
        title: c.label,
        cards: cards.filter((card) => card.stage === c.key),
      })),
    }
  },

  async updateStage(id: string, stage: ProjectStage): Promise<ProjectCard> {
    const card = cards.find((c) => c.id === id)
    if (!card) throw new NotFoundError("Project card", id)
    card.stage = stage
    card.stageChangedAt = new Date().toISOString()
    const cols = await kanbanService.list("projects")
    const terminal = cols[cols.length - 1]?.key
    if (terminal && stage === terminal) card.dueLabel = "Completed"
    return card
  },

  async create(input: CreateProjectCardInput): Promise<ProjectCard> {
    const parsed = createProjectCardSchema.parse(input)
    const cols = await kanbanService.list("projects")
    const defaultStage = cols[0]?.key || "backlog"
    const card: ProjectCard = {
      id: `prj-${crypto.randomUUID()}`,
      title: parsed.title,
      description: parsed.description,
      projectName: parsed.projectName,
      priority: parsed.priority,
      assigneeName: parsed.assigneeName,
      dueLabel: parsed.dueLabel,
      stage: parsed.stage || defaultStage,
      stageChangedAt: new Date().toISOString(),
    }
    cards.unshift(card)
    return card
  },
}
