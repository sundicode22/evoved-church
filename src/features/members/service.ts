import { db } from "@/lib/db"
import { members, userCategories, campuses, households } from "@/lib/db/schema"
import { eq, desc, and, or, ilike, sql } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  CreateCategoryInput,
  CreateMemberInput,
  UpdatePersonTypeInput,
  AttachHouseholdInput,
} from "./schemas"
import { DbPaginationResult } from "@/lib/db/pagination"

function emptyPage<T>(page: number, pageSize: number): DbPaginationResult<T> {
  return {
    data: [],
    pagination: {
      page,
      pageSize,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  }
}

function optionalDate(value?: string | null) {
  if (!value?.trim()) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export const memberService = {
  /**
   * Real SQL-level database paginated members query with LIMIT, OFFSET, and SQL COUNT
   */
  async getPaginatedMembers(params: {
    page?: number
    pageSize?: number
    personType?: string
    campusId?: string
    search?: string
  }): Promise<DbPaginationResult<(typeof members.$inferSelect)>> {
    const page = Math.max(1, Number(params.page || 1))
    const pageSize = Math.max(1, Math.min(100, Number(params.pageSize || 10)))
    const offset = (page - 1) * pageSize

    const conditions = []
    if (params.campusId && params.campusId !== "all") {
      conditions.push(eq(members.campusId, params.campusId))
    }
    if (params.personType && params.personType !== "all") {
      conditions.push(eq(members.personType, params.personType as typeof members.personType.enumValues[number]))
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(members.firstName, `%${params.search}%`),
          ilike(members.lastName, `%${params.search}%`),
          ilike(members.email, `%${params.search}%`),
          ilike(members.phoneNumber, `%${params.search}%`),
          ilike(members.recordedTitle, `%${params.search}%`),
          ilike(members.city, `%${params.search}%`),
          ilike(members.address, `%${params.search}%`)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    try {
      const [countResult, records] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(members)
          .where(whereClause),
        db
          .select()
          .from(members)
          .where(whereClause)
          .orderBy(desc(members.createdAt))
          .limit(pageSize)
          .offset(offset),
      ])

      const total = countResult[0]?.count || 0
      const totalPages = Math.ceil(total / pageSize) || 1

      return {
        data: records,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    } catch (err) {
      console.error("[memberService.getPaginatedMembers] DB error:", err)
      return emptyPage(page, pageSize)
    }
  },

  async createMember(input: CreateMemberInput) {
    if (!input.firstName?.trim() || !input.lastName?.trim()) {
      throw new ValidationError("First and last name are required")
    }

    let campusId = input.campusId
    if (!campusId) {
      const rows = await db.select().from(campuses).limit(1)
      campusId = rows[0]?.id
    }
    if (!campusId) {
      throw new ValidationError("Create a location before adding members.")
    }

    const [created] = await db
      .insert(members)
      .values({
        campusId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        preferredName: input.preferredName?.trim() || null,
        email: input.email || null,
        phoneNumber: input.phoneNumber || null,
        personType: input.personType || "covenant_member",
        recordedTitle: input.recordedTitle || null,
        gender: input.gender || null,
        maritalStatus: input.maritalStatus || null,
        address: input.address?.trim() || null,
        city: input.city?.trim() || null,
        state: input.state?.trim() || null,
        zipCode: input.zipCode?.trim() || null,
        country: input.country?.trim() || "US",
        occupation: input.occupation?.trim() || null,
        notes: input.notes?.trim() || null,
        membershipDate: optionalDate(input.membershipDate),
        birthDate: optionalDate(input.birthDate),
        salvationDate: optionalDate(input.salvationDate),
        baptismDate: optionalDate(input.baptismDate),
        baptismOfficiant: input.baptismOfficiant || null,
        ordinationDate: optionalDate(input.ordinationDate),
        ordinationCredentials: input.ordinationCredentials || null,
        ministryRoles: input.ministryRoles || [],
        backgroundCheckStatus: input.backgroundCheckStatus || "none",
      })
      .returning()

    if (!created) throw new ValidationError("Could not create member")

    const { writeAuditLog } = await import("@/features/audit/service")
    void writeAuditLog({
      campusId: created.campusId,
      action: "member.create",
      entityType: "member",
      entityId: created.id,
      summary: `Created member ${created.firstName} ${created.lastName}`,
      metadata: { personType: created.personType },
    })

    return created
  },

  async getCategories() {
    try {
      return await db.select().from(userCategories)
    } catch (err) {
      console.error("[memberService.getCategories] DB error:", err)
      return []
    }
  },

  async createCategory(input: CreateCategoryInput) {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const [created] = await db
      .insert(userCategories)
      .values({
        name: input.name,
        slug,
        badgeColor: input.badgeColor,
        description: input.description || null,
        permissions: input.permissions,
      })
      .returning()
    return created
  },

  async getMemberById(id: string) {
    const rows = await db.select().from(members).where(eq(members.id, id)).limit(1)
    if (!rows[0]) throw new NotFoundError("Member not found")

    let householdName: string | null = null
    let householdPeers: (typeof members.$inferSelect)[] = []
    let householdAddress: {
      address: string | null
      city: string | null
      state: string | null
      zipCode: string | null
    } | null = null

    if (rows[0].householdId) {
      const [hh] = await db
        .select()
        .from(households)
        .where(eq(households.id, rows[0].householdId))
        .limit(1)
      if (hh) {
        householdName = hh.name
        householdAddress = {
          address: hh.address,
          city: hh.city,
          state: hh.state,
          zipCode: hh.zipCode,
        }
      }
      householdPeers = await db
        .select()
        .from(members)
        .where(eq(members.householdId, rows[0].householdId))
    }

    return {
      ...rows[0],
      householdName,
      householdAddress,
      householdPeers,
    }
  },

  async attachHousehold(id: string, input: AttachHouseholdInput) {
    let householdId = input.householdId
    if (!householdId && input.householdName) {
      let campusId = input.campusId
      if (!campusId) {
        const c = await db.select().from(campuses).limit(1)
        campusId = c[0]?.id
      }
      if (!campusId) throw new ValidationError("Campus/location required to create household")
      const [hh] = await db
        .insert(households)
        .values({ name: input.householdName, campusId })
        .returning()
      householdId = hh.id
    }
    if (!householdId) throw new ValidationError("householdId or householdName required")

    const [updated] = await db
      .update(members)
      .set({
        householdId,
        householdRole: input.householdRole,
        isHeadOfHousehold: input.householdRole === "head" || input.householdRole === "father",
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning()

    if (!updated) throw new NotFoundError("Member not found")
    return updated
  },

  async createHousehold(input: {
    name: string
    campusId?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }) {
    let campusId = input.campusId
    if (!campusId) {
      const c = await db.select().from(campuses).limit(1)
      campusId = c[0]?.id
    }
    if (!campusId) throw new ValidationError("Campus/location required to create household")

    const [hh] = await db
      .insert(households)
      .values({
        name: input.name,
        campusId,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
        zipCode: input.zipCode || null,
      })
      .returning()

    return {
      id: hh.id,
      name: hh.name,
      campusId: hh.campusId,
      address: hh.address,
      city: hh.city,
      state: hh.state,
      zipCode: hh.zipCode,
      memberCount: 0,
      members: [],
      createdAt: hh.createdAt.toISOString(),
    }
  },

  /** Household directory for Families page - real DB only, never seeded demo rows. */
  async listHouseholds() {
    try {
      const rows = await db.select().from(households).orderBy(desc(households.createdAt))
      const result = []
      for (const hh of rows) {
        const membersInHh = await db
          .select()
          .from(members)
          .where(eq(members.householdId, hh.id))
        result.push({
          id: hh.id,
          name: hh.name,
          campusId: hh.campusId,
          address: hh.address,
          city: hh.city,
          state: hh.state,
          zipCode: hh.zipCode,
          memberCount: membersInHh.length,
          members: membersInHh.map((m) => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            phoneNumber: m.phoneNumber,
            householdRole: m.householdRole,
            personType: m.personType,
            address: m.address,
            city: m.city,
            state: m.state,
            zipCode: m.zipCode,
          })),
          createdAt: hh.createdAt.toISOString(),
        })
      }
      return result
    } catch (err) {
      console.error("[memberService.listHouseholds]", err)
      return []
    }
  },

  async updatePersonType(id: string, input: UpdatePersonTypeInput) {
    const existing = await db.select().from(members).where(eq(members.id, id)).limit(1)
    if (existing.length === 0) throw new NotFoundError("Member not found")

    const previous = existing[0].personType
    const [updated] = await db
      .update(members)
      .set({ personType: input.personType, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning()

    return {
      ...updated,
      lifecycleAudit: {
        previous,
        next: input.personType,
        changedByUserId: input.changedByUserId,
        reason: input.reason || null,
        changedAt: new Date().toISOString(),
      },
    }
  },
}
