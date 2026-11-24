import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  type CreateFollowUpInput,
  type FollowUp,
  type UpdateFollowUpInput,
} from "./schemas"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()
const daysFromNow = (d: number) => {
  const dt = new Date()
  dt.setDate(dt.getDate() + d)
  dt.setHours(17, 0, 0, 0)
  return dt.toISOString()
}

const store: FollowUp[] = [
  {
    id: "fu-1",
    campusId: DEMO_CAMPUS,
    title: "Welcome call — first visit",
    relatedMemberName: "",
    relatedLeadName: "Brian Robbin",
    assignedToName: "Ruth Williams",
    dueAt: daysFromNow(1),
    status: "open",
    notes: "Visited Easter Sunday; interested in kids ministry",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "fu-2",
    campusId: DEMO_CAMPUS,
    title: "Hospital check-in",
    relatedMemberName: "Eleanor Pena",
    relatedLeadName: "",
    assignedToName: "Pastor David Johnson",
    dueAt: daysFromNow(0),
    status: "in_progress",
    notes: "Room 412 — St. Jude Memorial",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "fu-3",
    campusId: DEMO_CAMPUS,
    title: "Foundations class invite",
    relatedMemberName: "",
    relatedLeadName: "Maria Santos",
    assignedToName: "Daniel Okafor",
    dueAt: daysFromNow(3),
    status: "open",
    notes: "",
    createdAt: now(),
    updatedAt: now(),
  },
]

function find(id: string) {
  const row = store.find((x) => x.id === id)
  if (!row) throw new NotFoundError("Follow-up", id)
  return row
}

export const followUpsService = {
  async list(): Promise<FollowUp[]> {
    return [...store].sort((a, b) => {
      const da = a.dueAt || "9999"
      const db = b.dueAt || "9999"
      return da.localeCompare(db)
    })
  },

  async create(input: CreateFollowUpInput): Promise<FollowUp> {
    const parsed = createFollowUpSchema.parse(input)
    const ts = now()
    const row: FollowUp = {
      id: `fu-${crypto.randomUUID()}`,
      campusId: parsed.campusId || DEMO_CAMPUS,
      title: parsed.title,
      relatedMemberName: parsed.relatedMemberName ?? "",
      relatedLeadName: parsed.relatedLeadName ?? "",
      assignedToName: parsed.assignedToName ?? "",
      dueAt: parsed.dueAt ? new Date(parsed.dueAt).toISOString() : null,
      status: parsed.status ?? "open",
      notes: parsed.notes ?? "",
      createdAt: ts,
      updatedAt: ts,
    }
    store.unshift(row)
    return { ...row }
  },

  async update(id: string, input: UpdateFollowUpInput): Promise<FollowUp> {
    const row = find(id)
    const parsed = updateFollowUpSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    Object.assign(row, {
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(parsed.relatedMemberName !== undefined && {
        relatedMemberName: parsed.relatedMemberName,
      }),
      ...(parsed.relatedLeadName !== undefined && {
        relatedLeadName: parsed.relatedLeadName,
      }),
      ...(parsed.assignedToName !== undefined && {
        assignedToName: parsed.assignedToName,
      }),
      ...(parsed.dueAt !== undefined && {
        dueAt: parsed.dueAt ? new Date(parsed.dueAt).toISOString() : null,
      }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      ...(parsed.notes !== undefined && { notes: parsed.notes }),
      updatedAt: now(),
    })
    return { ...row }
  },
}
