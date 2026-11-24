import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createOccurrenceSchema,
  createProgramSchema,
  updateOccurrenceSchema,
  type CalendarOccurrence,
  type ChurchProgram,
  type CreateOccurrenceInput,
  type CreateProgramInput,
  type UpdateOccurrenceInput,
} from "./schemas"

const now = () => new Date().toISOString()
const daysFromNow = (d: number, hour = 10) => {
  const dt = new Date()
  dt.setDate(dt.getDate() + d)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString()
}

const programs: ChurchProgram[] = [
  {
    id: "prog-1",
    title: "Community Food Pantry",
    type: "outreach",
    description: "Monthly food distribution for neighbors in need.",
    locationLabel: "Fellowship Hall",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "prog-2",
    title: "Foundations Class",
    type: "training",
    description: "New believer / membership class.",
    locationLabel: "Room B",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "prog-3",
    title: "Sunday Morning Worship",
    type: "worship",
    description: "Linked to the primary weekend service.",
    locationLabel: "Main Sanctuary",
    serviceId: "svc-sunday-am",
    createdAt: now(),
    updatedAt: now(),
  },
]

const occurrences: CalendarOccurrence[] = [
  {
    id: "occ-1",
    programId: "prog-1",
    programTitle: "Community Food Pantry",
    programType: "outreach",
    locationLabel: "Fellowship Hall",
    startsAt: daysFromNow(3, 9),
    endsAt: daysFromNow(3, 12),
    allDay: false,
    status: "scheduled",
    notes: "Bring gloves and sorting tables",
    assignees: [
      { id: "as-1", displayName: "Ruth Williams", roleLabel: "lead" },
      { id: "as-2", displayName: "Daniel Okafor", roleLabel: "volunteer" },
    ],
  },
  {
    id: "occ-2",
    programId: "prog-2",
    programTitle: "Foundations Class",
    programType: "training",
    locationLabel: "Room B",
    startsAt: daysFromNow(5, 18),
    endsAt: daysFromNow(5, 20),
    allDay: false,
    status: "scheduled",
    notes: "",
    assignees: [{ id: "as-3", displayName: "Pastor Ahmad", roleLabel: "speaker" }],
  },
  {
    id: "occ-3",
    programId: "prog-3",
    programTitle: "Sunday Morning Worship",
    programType: "worship",
    locationLabel: "Main Sanctuary",
    startsAt: daysFromNow(7 - new Date().getDay(), 10),
    endsAt: daysFromNow(7 - new Date().getDay(), 12),
    allDay: false,
    status: "scheduled",
    notes: "",
    serviceId: "svc-sunday-am",
    assignees: [{ id: "as-4", displayName: "Worship Team", roleLabel: "lead" }],
  },
]

function findProgram(id: string) {
  const p = programs.find((x) => x.id === id)
  if (!p) throw new NotFoundError("Program", id)
  return p
}

function findOccurrence(id: string) {
  const o = occurrences.find((x) => x.id === id)
  if (!o) throw new NotFoundError("Occurrence", id)
  return o
}

export const calendarService = {
  async listPrograms(): Promise<ChurchProgram[]> {
    return [...programs].sort((a, b) => a.title.localeCompare(b.title))
  },

  async listOccurrences(from?: string, to?: string): Promise<CalendarOccurrence[]> {
    let rows = [...occurrences]
    if (from) rows = rows.filter((o) => o.startsAt >= from)
    if (to) rows = rows.filter((o) => o.startsAt <= to)
    return rows.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  },

  async createProgram(input: CreateProgramInput): Promise<ChurchProgram> {
    const parsed = createProgramSchema.parse(input)
    const ts = now()
    const program: ChurchProgram = {
      id: `prog-${crypto.randomUUID()}`,
      title: parsed.title,
      type: parsed.type ?? "ministry",
      description: parsed.description ?? "",
      locationLabel: parsed.locationLabel ?? "",
      serviceId: parsed.serviceId,
      createdAt: ts,
      updatedAt: ts,
    }
    programs.unshift(program)
    return { ...program }
  },

  async createOccurrence(input: CreateOccurrenceInput): Promise<CalendarOccurrence> {
    const parsed = createOccurrenceSchema.parse(input)
    const program = findProgram(parsed.programId)
    const occ: CalendarOccurrence = {
      id: `occ-${crypto.randomUUID()}`,
      programId: program.id,
      programTitle: program.title,
      programType: program.type,
      locationLabel: program.locationLabel,
      startsAt: new Date(parsed.startsAt).toISOString(),
      endsAt: parsed.endsAt ? new Date(parsed.endsAt).toISOString() : null,
      allDay: parsed.allDay ?? false,
      status: parsed.status ?? "scheduled",
      notes: parsed.notes ?? "",
      serviceId: program.serviceId,
      assignees: (parsed.assignees ?? []).map((a) => ({
        id: `as-${crypto.randomUUID().slice(0, 8)}`,
        displayName: a.displayName,
        roleLabel: a.roleLabel ?? "volunteer",
        memberId: a.memberId,
      })),
    }
    occurrences.unshift(occ)
    return structuredClone(occ)
  },

  async updateOccurrence(id: string, input: UpdateOccurrenceInput): Promise<CalendarOccurrence> {
    const o = findOccurrence(id)
    const parsed = updateOccurrenceSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    if (parsed.startsAt) o.startsAt = new Date(parsed.startsAt).toISOString()
    if (parsed.endsAt !== undefined)
      o.endsAt = parsed.endsAt ? new Date(parsed.endsAt).toISOString() : null
    if (parsed.allDay !== undefined) o.allDay = parsed.allDay
    if (parsed.status) o.status = parsed.status
    if (parsed.notes !== undefined) o.notes = parsed.notes
    if (parsed.assignees) {
      o.assignees = parsed.assignees.map((a) => ({
        id: `as-${crypto.randomUUID().slice(0, 8)}`,
        displayName: a.displayName,
        roleLabel: a.roleLabel ?? "volunteer",
        memberId: a.memberId,
      }))
    }
    return structuredClone(o)
  },

  async deleteOccurrence(id: string): Promise<void> {
    const idx = occurrences.findIndex((o) => o.id === id)
    if (idx < 0) throw new NotFoundError("Occurrence", id)
    occurrences.splice(idx, 1)
  },
}
