import { db } from "@/lib/db"
import { campuses } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { CreateCampusInput } from "./schemas"

type CampusRecord = {
  id: string
  name: string
  slug: string
  type: CreateCampusInput["type"]
  city: string
  isMainCampus: boolean
}

/** In-memory campuses when DB write fails (onboarding). */
const memoryCampuses: CampusRecord[] = []

export const campusService = {
  async listCampuses() {
    try {
      const rows = await db.select().from(campuses).where(eq(campuses.isActive, true))
      return rows.length > 0 ? rows : [...memoryCampuses]
    } catch {
      return [...memoryCampuses]
    }
  },

  async getBySlug(slug: string) {
    try {
      const rows = await db.select().from(campuses).where(eq(campuses.slug, slug)).limit(1)
      if (rows[0]) return rows[0]
    } catch {
      /* memory fallback */
    }
    return memoryCampuses.find((c) => c.slug === slug) || null
  },

  async createCampus(input: CreateCampusInput) {
    const payload = {
      name: input.name,
      slug: input.slug,
      type: input.type ?? "main",
      city: input.city || "",
      isMainCampus: true,
    }

    try {
      const [row] = await db
        .insert(campuses)
        .values({
          name: payload.name,
          slug: payload.slug,
          type: payload.type,
          city: payload.city,
          isMainCampus: true,
          isActive: true,
        })
        .returning()
      if (row) return row
    } catch {
      /* fall through to memory */
    }

    const created: CampusRecord = {
      id: `campus-${crypto.randomUUID()}`,
      name: payload.name,
      slug: payload.slug,
      type: payload.type,
      city: payload.city,
      isMainCampus: true,
    }
    memoryCampuses.unshift(created)
    return created
  },
}
