import { db } from "@/lib/db"
import { campuses } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const DEMO_CAMPUSES = [
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

export const campusService = {
  async listCampuses() {
    try {
      const rows = await db.select().from(campuses).where(eq(campuses.isActive, true))
      if (rows.length === 0) return DEMO_CAMPUSES
      return rows
    } catch {
      return DEMO_CAMPUSES
    }
  },

  async getBySlug(slug: string) {
    try {
      const rows = await db.select().from(campuses).where(eq(campuses.slug, slug)).limit(1)
      if (rows[0]) return rows[0]
    } catch {
      /* demo fallback */
    }
    return DEMO_CAMPUSES.find((c) => c.slug === slug) || DEMO_CAMPUSES[0]
  },
}
