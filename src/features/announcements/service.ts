import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  type Announcement,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from "./schemas"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

const store: Announcement[] = [
  {
    id: "ann-1",
    campusId: DEMO_CAMPUS,
    title: "Easter Sunday Schedule",
    bodyHtml:
      "<p>Join us for <strong>Easter Sunday</strong> services at 9am and 11am. Childcare available.</p>",
    isPinned: true,
    status: "posted",
    scheduledAt: null,
    postedAt: daysAgo(5),
    postedByName: "Communications Team",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(5),
  },
  {
    id: "ann-2",
    campusId: DEMO_CAMPUS,
    title: "Volunteer Appreciation Night",
    bodyHtml: "<p>Dinner is on us this Friday evening for all serving volunteers.</p>",
    isPinned: false,
    status: "draft",
    scheduledAt: null,
    postedAt: null,
    postedByName: "",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
]

function find(id: string) {
  const row = store.find((x) => x.id === id)
  if (!row) throw new NotFoundError("Announcement", id)
  return row
}

export const announcementsService = {
  async list(): Promise<Announcement[]> {
    return [...store].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  },

  async listPosted(): Promise<Announcement[]> {
    return (await this.list()).filter((a) => a.status === "posted")
  },

  async create(input: CreateAnnouncementInput): Promise<Announcement> {
    const parsed = createAnnouncementSchema.parse(input)
    const ts = now()
    const row: Announcement = {
      id: `ann-${crypto.randomUUID()}`,
      campusId: parsed.campusId || DEMO_CAMPUS,
      title: parsed.title,
      bodyHtml: parsed.bodyHtml,
      isPinned: parsed.isPinned ?? false,
      status: parsed.status ?? "draft",
      scheduledAt: parsed.scheduledAt ?? null,
      postedAt: parsed.status === "posted" ? ts : null,
      postedByName: parsed.status === "posted" ? "Staff" : "",
      createdAt: ts,
      updatedAt: ts,
    }
    store.unshift(row)
    return { ...row }
  },

  async update(id: string, input: UpdateAnnouncementInput): Promise<Announcement> {
    const row = find(id)
    const parsed = updateAnnouncementSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    Object.assign(row, {
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(parsed.bodyHtml !== undefined && { bodyHtml: parsed.bodyHtml }),
      ...(parsed.isPinned !== undefined && { isPinned: parsed.isPinned }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      ...(parsed.scheduledAt !== undefined && { scheduledAt: parsed.scheduledAt }),
      updatedAt: now(),
    })
    return { ...row }
  },

  async publish(id: string): Promise<Announcement> {
    const row = find(id)
    if (row.status === "posted") throw new ValidationError("Already posted")
    row.status = "posted"
    row.postedAt = now()
    row.postedByName = "Staff"
    row.updatedAt = row.postedAt
    return { ...row }
  },
}
