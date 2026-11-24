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

const DEMO_CAMPUSES: CampusRecord[] = [
  {
    id: "1",
    name: "Grace City - Main Campus",
    slug: "main-campus",
    type: "main",
    city: "Atlanta",
    isMainCampus: true,
  },
  {
    id: "2",
    name: "Grace City - North Campus",
    slug: "north-campus",
    type: "regional",
    city: "Alpharetta",
    isMainCampus: false,
  },
  {
    id: "3",
    name: "Grace City - Online Global",
    slug: "online-global",
    type: "online",
    city: "Digital Hub",
    isMainCampus: false,
  },
]

/** In-memory campuses created during onboarding when DB write fails / demos. */
const memoryCampuses: CampusRecord[] = []

export const campusService = {
  async listCampuses() {
    try {
      const rows = await db.select().from(campuses).where(eq(campuses.isActive, true))
      if (rows.length === 0) return [...DEMO_CAMPUSES, ...memoryCampuses]
      return rows
    } catch {
      return [...DEMO_CAMPUSES, ...memoryCampuses]
    }
  },

  async getBySlug(slug: string) {
    try {
      const rows = await db.select().from(campuses).where(eq(campuses.slug, slug)).limit(1)
      if (rows[0]) return rows[0]
    } catch {
      /* demo fallback */
    }
    return (
      memoryCampuses.find((c) => c.slug === slug) ||
      DEMO_CAMPUSES.find((c) => c.slug === slug) ||
      DEMO_CAMPUSES[0]
    )
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
