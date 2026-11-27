import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createServiceSchema,
  updateServiceSchema,
  type ChurchService,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "./schemas"

const now = () => new Date().toISOString()

const store: ChurchService[] = []

function find(id: string) {
  const s = store.find((x) => x.id === id)
  if (!s) throw new NotFoundError("Service", id)
  return s
}

export const churchServicesService = {
  async list(type?: string): Promise<ChurchService[]> {
    const rows = type ? store.filter((s) => s.type === type && s.isActive) : store.filter((s) => s.isActive)
    return [...rows].sort((a, b) => a.name.localeCompare(b.name))
  },

  async getById(id: string): Promise<ChurchService> {
    return structuredClone(find(id))
  },

  async create(input: CreateServiceInput): Promise<ChurchService> {
    const parsed = createServiceSchema.parse(input)
    const ts = now()
    const service: ChurchService = {
      id: `svc-${crypto.randomUUID()}`,
      name: parsed.name,
      type: parsed.type,
      locationLabel: parsed.locationLabel ?? "",
      defaultDayOfWeek: parsed.defaultDayOfWeek ?? null,
      defaultStartTime: parsed.defaultStartTime ?? "10:00",
      recurrence: parsed.recurrence ?? "weekly",
      isActive: true,
      notes: parsed.notes ?? "",
      segments: (parsed.segments ?? []).map((seg, i) => ({
        id: seg.id || `seg-${crypto.randomUUID().slice(0, 8)}`,
        title: seg.title,
        leader: seg.leader ?? "",
        durationMinutes: seg.durationMinutes ?? 10,
        details: seg.details ?? "",
        orderIndex: seg.orderIndex ?? i,
      })),
      volunteers: (parsed.volunteers ?? []).map((v, i) => ({
        id: v.id || `vol-${crypto.randomUUID().slice(0, 8)}`,
        role: v.role,
        assigneeName: v.assigneeName ?? "",
        status: v.status ?? "needed",
        orderIndex: v.orderIndex ?? i,
      })),
      createdAt: ts,
      updatedAt: ts,
    }
    store.unshift(service)
    return structuredClone(service)
  },

  async update(id: string, input: UpdateServiceInput): Promise<ChurchService> {
    const s = find(id)
    const parsed = updateServiceSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")

    if (parsed.name !== undefined) s.name = parsed.name
    if (parsed.type !== undefined) s.type = parsed.type
    if (parsed.locationLabel !== undefined) s.locationLabel = parsed.locationLabel
    if (parsed.defaultDayOfWeek !== undefined) s.defaultDayOfWeek = parsed.defaultDayOfWeek
    if (parsed.defaultStartTime !== undefined) s.defaultStartTime = parsed.defaultStartTime
    if (parsed.recurrence !== undefined) s.recurrence = parsed.recurrence
    if (parsed.notes !== undefined) s.notes = parsed.notes
    if (parsed.segments) {
      s.segments = parsed.segments.map((seg, i) => ({
        id: seg.id || `seg-${crypto.randomUUID().slice(0, 8)}`,
        title: seg.title,
        leader: seg.leader ?? "",
        durationMinutes: seg.durationMinutes ?? 10,
        details: seg.details ?? "",
        orderIndex: seg.orderIndex ?? i,
      }))
    }
    if (parsed.volunteers) {
      s.volunteers = parsed.volunteers.map((v, i) => ({
        id: v.id || `vol-${crypto.randomUUID().slice(0, 8)}`,
        role: v.role,
        assigneeName: v.assigneeName ?? "",
        status: v.status ?? "needed",
        orderIndex: v.orderIndex ?? i,
      }))
    }
    s.updatedAt = now()
    return structuredClone(s)
  },

  async remove(id: string): Promise<void> {
    const idx = store.findIndex((s) => s.id === id)
    if (idx < 0) throw new NotFoundError("Service", id)
    store[idx].isActive = false
    store[idx].updatedAt = now()
  },
}
