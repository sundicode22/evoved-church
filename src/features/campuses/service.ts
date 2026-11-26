import { db } from "@/lib/db"
import { campuses } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import {
  provisionAllCampusBooks,
  provisionCampusBooks,
} from "@/features/accounting/default-books"
import { billingService } from "@/features/billing/service"
import type { CreateCampusInput } from "./schemas"

type CampusRecord = {
  id: string
  organizationId?: string | null
  name: string
  slug: string
  type: CreateCampusInput["type"]
  city: string
  isMainCampus: boolean
}

/** In-memory campuses when DB write fails (onboarding). */
const memoryCampuses: CampusRecord[] = []

export const campusService = {
  async listCampuses(organizationId?: string | null) {
    try {
      const rows = organizationId
        ? await db
            .select()
            .from(campuses)
            .where(and(eq(campuses.isActive, true), eq(campuses.organizationId, organizationId)))
        : await db.select().from(campuses).where(eq(campuses.isActive, true))
      // Ensure every location has the standard COA + funds (idempotent).
      if (rows.length > 0) {
        await provisionAllCampusBooks()
        return rows
      }
      // If org filter returned empty but unscoped rows exist (legacy), show those once.
      if (organizationId) {
        const legacy = await db.select().from(campuses).where(eq(campuses.isActive, true))
        if (legacy.length > 0) {
          await provisionAllCampusBooks()
          return legacy
        }
      }
      return [...memoryCampuses]
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

  async createCampus(input: CreateCampusInput, organizationId?: string | null) {
    if (organizationId) {
      await billingService.assertCanAddLocation(organizationId)
    }

    const isMain = (input.type ?? "main") === "main"
    const payload = {
      name: input.name,
      slug: input.slug,
      type: input.type ?? "main",
      city: input.city || "",
      isMainCampus: isMain,
      organizationId: organizationId || null,
    }

    try {
      const [row] = await db
        .insert(campuses)
        .values({
          name: payload.name,
          slug: payload.slug,
          type: payload.type,
          city: payload.city,
          isMainCampus: isMain,
          isActive: true,
          organizationId: payload.organizationId,
        })
        .returning()
      if (row) {
        await provisionCampusBooks(row.id)
        return row
      }
    } catch {
      /* fall through to memory */
    }

    const created: CampusRecord = {
      id: `campus-${crypto.randomUUID()}`,
      organizationId: payload.organizationId,
      name: payload.name,
      slug: payload.slug,
      type: payload.type,
      city: payload.city,
      isMainCampus: isMain,
    }
    memoryCampuses.push(created)
    return created
  },
}
