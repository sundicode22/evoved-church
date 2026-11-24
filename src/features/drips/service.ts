import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createSequenceSchema,
  createStepSchema,
  updateSequenceSchema,
  type CreateSequenceInput,
  type CreateStepInput,
  type DripSequence,
  type DripStep,
  type UpdateSequenceInput,
} from "./schemas"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()

const steps: DripStep[] = [
  {
    id: "step-1",
    sequenceId: "drip-1",
    stepOrder: 1,
    delayHours: 2,
    channel: "email",
    subject: "Welcome — we're glad you visited!",
    body: "Warm welcome from the pastoral team with a short video message.",
  },
  {
    id: "step-2",
    sequenceId: "drip-1",
    stepOrder: 2,
    delayHours: 24,
    channel: "sms",
    subject: "",
    body: "Hi! This is your shepherd. Coffee this week?",
  },
  {
    id: "step-3",
    sequenceId: "drip-1",
    stepOrder: 3,
    delayHours: 96,
    channel: "email",
    subject: "This Sunday + kids ministry preview",
    body: "Sneak peek of the upcoming sermon, parking guide, and kids check-in tips.",
  },
  {
    id: "step-4",
    sequenceId: "drip-1",
    stepOrder: 4,
    delayHours: 240,
    channel: "email",
    subject: "Invitation to Foundations class",
    body: "Join Step 1 of membership: Discovering our vision and core theology.",
  },
]

const sequences: Omit<DripSequence, "steps">[] = [
  {
    id: "drip-1",
    campusId: DEMO_CAMPUS,
    name: "New Guest Follow-Up",
    triggerEvent: "first_visit",
    isActive: true,
    enrollmentCount: 18,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "drip-2",
    campusId: DEMO_CAMPUS,
    name: "New Member Onboarding",
    triggerEvent: "new_member",
    isActive: true,
    enrollmentCount: 5,
    createdAt: now(),
    updatedAt: now(),
  },
]

function withSteps(seq: Omit<DripSequence, "steps">): DripSequence {
  return {
    ...seq,
    steps: steps
      .filter((s) => s.sequenceId === seq.id)
      .sort((a, b) => a.stepOrder - b.stepOrder),
  }
}

function findSequence(id: string) {
  const s = sequences.find((x) => x.id === id)
  if (!s) throw new NotFoundError("Drip sequence", id)
  return s
}

export const dripsService = {
  async list(): Promise<DripSequence[]> {
    return sequences
      .map(withSteps)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  async getById(id: string): Promise<DripSequence> {
    return withSteps(findSequence(id))
  },

  async create(input: CreateSequenceInput): Promise<DripSequence> {
    const parsed = createSequenceSchema.parse(input)
    const ts = now()
    const seq: Omit<DripSequence, "steps"> = {
      id: `drip-${crypto.randomUUID()}`,
      campusId: parsed.campusId || DEMO_CAMPUS,
      name: parsed.name,
      triggerEvent: parsed.triggerEvent ?? "first_visit",
      isActive: parsed.isActive ?? true,
      enrollmentCount: 0,
      createdAt: ts,
      updatedAt: ts,
    }
    sequences.unshift(seq)
    return withSteps(seq)
  },

  async update(id: string, input: UpdateSequenceInput): Promise<DripSequence> {
    const seq = findSequence(id)
    const parsed = updateSequenceSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    Object.assign(seq, {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.triggerEvent !== undefined && { triggerEvent: parsed.triggerEvent }),
      ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
      updatedAt: now(),
    })
    return withSteps(seq)
  },

  async addStep(input: CreateStepInput): Promise<DripStep> {
    const parsed = createStepSchema.parse(input)
    findSequence(parsed.sequenceId)
    const existing = steps.filter((s) => s.sequenceId === parsed.sequenceId)
    const step: DripStep = {
      id: `step-${crypto.randomUUID()}`,
      sequenceId: parsed.sequenceId,
      stepOrder: parsed.stepOrder ?? existing.length + 1,
      delayHours: parsed.delayHours ?? 2,
      channel: parsed.channel ?? "email",
      subject: parsed.subject ?? "",
      body: parsed.body,
    }
    steps.push(step)
    const seq = findSequence(parsed.sequenceId)
    seq.updatedAt = now()
    return { ...step }
  },
}
