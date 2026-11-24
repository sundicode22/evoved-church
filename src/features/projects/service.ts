import { NotFoundError } from "@/lib/errors"
import {
  PROJECT_STAGES,
  PROJECT_STAGE_LABELS,
  type CreateProjectCardInput,
  type ProjectBoard,
  type ProjectCard,
  type ProjectStage,
} from "./schemas"
import { createProjectCardSchema } from "./schemas"

const mins = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

const cards: ProjectCard[] = [
  { id: "prj-1", title: "Plan Easter outreach flyers", projectName: "Easter Outreach", priority: "high", assigneeName: "SM", dueLabel: "Fri", stage: "backlog", stageChangedAt: mins(300) },
  { id: "prj-2", title: "Book worship team rehearsal space", projectName: "Sunday Services", priority: "normal", assigneeName: "DO", dueLabel: "Next week", stage: "backlog", stageChangedAt: mins(1500) },
  { id: "prj-3", title: "Repaint children's wing", projectName: "Facilities", priority: "low", assigneeName: "RW", dueLabel: "Mar 28", stage: "in_progress", stageChangedAt: mins(120) },
  { id: "prj-4", title: "Launch new small-group sign-ups", projectName: "Groups", priority: "high", assigneeName: "GT", dueLabel: "This week", stage: "in_progress", stageChangedAt: mins(45) },
  { id: "prj-5", title: "Review volunteer background checks", projectName: "Safety & Compliance", priority: "high", assigneeName: "SL", dueLabel: "Tomorrow", stage: "review", stageChangedAt: mins(600) },
  { id: "prj-6", title: "Publish Q1 giving report", projectName: "Finance", priority: "normal", assigneeName: "DO", dueLabel: "Completed", stage: "done", stageChangedAt: mins(4000) },
]

export const projectService = {
  async getBoard(): Promise<ProjectBoard> {
    return {
      totalCards: cards.length,
      columns: PROJECT_STAGES.map((id) => ({
        id,
        title: PROJECT_STAGE_LABELS[id],
        cards: cards.filter((c) => c.stage === id),
      })),
    }
  },

  async updateStage(id: string, stage: ProjectStage): Promise<ProjectCard> {
    const card = cards.find((c) => c.id === id)
    if (!card) throw new NotFoundError("Project card", id)
    card.stage = stage
    card.stageChangedAt = new Date().toISOString()
    if (stage === "done") card.dueLabel = "Completed"
    return card
  },

  async create(input: CreateProjectCardInput): Promise<ProjectCard> {
    const parsed = createProjectCardSchema.parse(input)
    const card: ProjectCard = {
      id: `prj-${crypto.randomUUID()}`,
      title: parsed.title,
      description: parsed.description,
      projectName: parsed.projectName,
      priority: parsed.priority,
      assigneeName: parsed.assigneeName,
      dueLabel: parsed.dueLabel,
      stage: parsed.stage,
      stageChangedAt: new Date().toISOString(),
    }
    cards.unshift(card)
    return card
  },
}
