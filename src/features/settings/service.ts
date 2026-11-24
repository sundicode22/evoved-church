import { db } from "@/lib/db"
import { tenantNomenclatures, customFieldDefinitions } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { CreateCustomFieldInput, UpdateNomenclatureInput } from "./schemas"

const DEFAULT_NOM = {
  tenantId: "default",
  churchName: "Grace City Church",
  churchEmail: "hello@gracecity.church",
  churchPhone: "",
  churchAddress: "",
  churchCity: "",
  churchState: "",
  churchZip: "",
  logoUrl: "",
  memberTermSingular: "Member",
  memberTermPlural: "Members",
  visitorTermSingular: "First-Time Guest",
  visitorTermPlural: "First-Time Guests",
  groupTermSingular: "Small Group",
  groupTermPlural: "Small Groups",
  campusTermSingular: "Location",
  campusTermPlural: "Locations",
  pastorTermSingular: "Pastor",
  givingTerm: "Tithes & Offerings",
  currencyCode: "USD",
  onboardingCompletedAt: null as string | null,
}

/** Demo/in-memory onboarding completion when DB is unavailable. */
let demoOnboardingCompletedAt: string | null = null

export const settingsService = {
  async getNomenclature(tenantId: string) {
    try {
      const rows = await db
        .select()
        .from(tenantNomenclatures)
        .where(eq(tenantNomenclatures.tenantId, tenantId))
        .limit(1)
      if (rows[0]) return rows[0]
    } catch {
      /* demo */
    }
    return { ...DEFAULT_NOM, tenantId }
  },

  async updateNomenclature(tenantId: string, input: UpdateNomenclatureInput) {
    try {
      const existing = await db
        .select()
        .from(tenantNomenclatures)
        .where(eq(tenantNomenclatures.tenantId, tenantId))
        .limit(1)

      if (existing[0]) {
        const [updated] = await db
          .update(tenantNomenclatures)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(tenantNomenclatures.tenantId, tenantId))
          .returning()
        return updated
      }

      const [created] = await db
        .insert(tenantNomenclatures)
        .values({ ...DEFAULT_NOM, ...input, tenantId })
        .returning()
      return created
    } catch {
      return { ...DEFAULT_NOM, tenantId, ...input }
    }
  },

  async listCustomFields(tenantId: string, entityType?: string) {
    try {
      const conditions = [eq(customFieldDefinitions.tenantId, tenantId)]
      if (entityType) conditions.push(eq(customFieldDefinitions.entityType, entityType))
      return await db
        .select()
        .from(customFieldDefinitions)
        .where(and(...conditions))
    } catch {
      return []
    }
  },

  async createCustomField(tenantId: string, input: CreateCustomFieldInput) {
    try {
      const [created] = await db
        .insert(customFieldDefinitions)
        .values({
          tenantId,
          entityType: input.entityType,
          fieldKey: input.fieldKey,
          fieldLabel: input.fieldLabel,
          fieldType: input.fieldType,
          options: input.options || null,
          isRequired: input.isRequired,
          isConfidential: input.isConfidential,
        })
        .returning()
      return created
    } catch {
      return { id: `cf-${Date.now()}`, tenantId, ...input }
    }
  },

  async getOnboardingStatus(tenantId: string) {
    try {
      const rows = await db
        .select()
        .from(tenantNomenclatures)
        .where(eq(tenantNomenclatures.tenantId, tenantId))
        .limit(1)
      if (rows[0]?.onboardingCompletedAt) {
        return {
          completed: true,
          completedAt: rows[0].onboardingCompletedAt.toISOString(),
        }
      }
    } catch {
      /* demo */
    }
    if (demoOnboardingCompletedAt) {
      return { completed: true, completedAt: demoOnboardingCompletedAt }
    }
    return { completed: false, completedAt: null }
  },

  async completeOnboarding(tenantId: string) {
    const completedAt = new Date()
    try {
      const existing = await db
        .select()
        .from(tenantNomenclatures)
        .where(eq(tenantNomenclatures.tenantId, tenantId))
        .limit(1)
      if (existing[0]) {
        await db
          .update(tenantNomenclatures)
          .set({ onboardingCompletedAt: completedAt, updatedAt: completedAt })
          .where(eq(tenantNomenclatures.tenantId, tenantId))
      } else {
        await db.insert(tenantNomenclatures).values({
          ...DEFAULT_NOM,
          tenantId,
          onboardingCompletedAt: completedAt,
        })
      }
    } catch {
      demoOnboardingCompletedAt = completedAt.toISOString()
    }
    demoOnboardingCompletedAt = completedAt.toISOString()
    return { completed: true, completedAt: completedAt.toISOString() }
  },
}
