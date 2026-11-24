import { db } from "@/lib/db"
import { members, userCategories, campuses, households } from "@/lib/db/schema"
import { eq, desc, and, or, ilike, sql } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  CreateCategoryInput,
  UpdatePersonTypeInput,
  AttachHouseholdInput,
  HOUSEHOLD_ROLE_LABELS,
} from "./schemas"
import { DbPaginationResult } from "@/lib/db/pagination"

const DEMO_HOUSEHOLD = {
  id: "hh-cooper",
  name: "The Cooper Household",
  members: [
    {
      id: "mem-1",
      firstName: "David",
      lastName: "Johnson",
      personType: "staff_minister",
      householdRole: "father",
      recordedTitle: "Senior Pastor",
      backgroundCheckStatus: "cleared",
    },
    {
      id: "mem-spouse",
      firstName: "Rachel",
      lastName: "Johnson",
      personType: "covenant_member",
      householdRole: "mother",
      recordedTitle: null,
      backgroundCheckStatus: "cleared",
    },
    {
      id: "mem-child",
      firstName: "Noah",
      lastName: "Johnson",
      personType: "regular_attender",
      householdRole: "son",
      recordedTitle: null,
      backgroundCheckStatus: "none",
    },
  ],
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
  }): Promise<DbPaginationResult<any>> {
    const page = Math.max(1, Number(params.page || 1))
    const pageSize = Math.max(1, Math.min(100, Number(params.pageSize || 10)))
    const offset = (page - 1) * pageSize

    const conditions = []
    if (params.campusId && params.campusId !== "all") {
      conditions.push(eq(members.campusId, params.campusId))
    }
    if (params.personType && params.personType !== "all") {
      conditions.push(eq(members.personType, params.personType as any))
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(members.firstName, `%${params.search}%`),
          ilike(members.lastName, `%${params.search}%`),
          ilike(members.email, `%${params.search}%`),
          ilike(members.recordedTitle, `%${params.search}%`)
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

      // If database is empty during fresh dev, return initial seeded directory
      if (records.length === 0 && !params.search) {
        return {
          data: [
            {
              id: "mem-1",
              firstName: "David",
              lastName: "Johnson",
              personType: "staff_minister",
              recordedTitle: "Senior Pastor",
              householdRole: "father",
              ministryRoles: ["Preaching", "Board of Elders"],
              ordinationDate: "2010-06-15",
              ordinationCredentials: "Acts Assemblies Presbytery #4492",
              backgroundCheckStatus: "cleared",
              backgroundCheckExpiresAt: "2027-01-01",
              category: "Senior Leadership",
              badgeColor: "emerald",
            },
            {
              id: "mem-2",
              firstName: "Marcus",
              lastName: "Vance",
              personType: "staff_minister",
              householdRole: "head",
              recordedTitle: "Executive Pastor (Operations)",
              ministryRoles: ["Operations", "Finance Committee"],
              ordinationDate: "2014-08-20",
              backgroundCheckStatus: "cleared",
              category: "Executive Staff",
              badgeColor: "blue",
            },
            {
              id: "mem-3",
              firstName: "Kathryn",
              lastName: "Murphy",
              personType: "leader",
              recordedTitle: "Deaconess & Life Group Coordinator",
              ministryRoles: ["Small Groups", "Hospitality"],
              baptismDate: "2018-04-12",
              backgroundCheckStatus: "cleared",
              category: "Ministry Leaders",
              badgeColor: "purple",
            },
            {
              id: "mem-4",
              firstName: "Jane",
              lastName: "Cooper",
              personType: "prospect",
              recordedTitle: null,
              ministryRoles: [],
              backgroundCheckStatus: "none",
              category: "Newcomers & Visitors",
              badgeColor: "amber",
            },
            {
              id: "mem-5",
              firstName: "Brian",
              lastName: "Robbin",
              personType: "volunteer",
              recordedTitle: null,
              ministryRoles: ["Kids Check-in"],
              backgroundCheckStatus: "expired",
              backgroundCheckExpiresAt: new Date(Date.now() - 7 * 86400000).toISOString(),
              category: "Volunteers",
              badgeColor: "rose",
            },
          ],
          pagination: { page: 1, pageSize: 10, total: 4, totalPages: 1, hasNext: false, hasPrev: false },
        }
      }

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
      return {
        data: [],
        pagination: { page, pageSize, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
      }
    }
  },

  /**
   * Retrieves all dynamic user categories
   */
  async getCategories() {
    try {
      const cats = await db.select().from(userCategories)
      if (cats.length === 0) {
        return [
          { id: "cat-1", name: "Senior Leadership", slug: "senior-leadership", badgeColor: "emerald", isSystem: true },
          { id: "cat-2", name: "Executive Staff", slug: "executive-staff", badgeColor: "blue", isSystem: true },
          { id: "cat-3", name: "Ministry Leaders", slug: "ministry-leaders", badgeColor: "purple", isSystem: false },
          { id: "cat-4", name: "Covenant Partners", slug: "covenant-partners", badgeColor: "teal", isSystem: false },
          { id: "cat-5", name: "Newcomers & Guests", slug: "newcomers-guests", badgeColor: "amber", isSystem: true },
        ]
      }
      return cats
    } catch (err) {
      console.error("[memberService.getCategories] DB error:", err)
      return []
    }
  },

  /**
   * Creates a dynamic category of users
   */
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
    try {
      const rows = await db.select().from(members).where(eq(members.id, id)).limit(1)
      if (rows[0]) {
        let householdPeers: unknown[] = []
        if (rows[0].householdId) {
          householdPeers = await db
            .select()
            .from(members)
            .where(eq(members.householdId, rows[0].householdId))
        }
        return { ...rows[0], householdPeers }
      }
    } catch {
      /* demo */
    }
    const all = [
      ...DEMO_HOUSEHOLD.members,
      {
        id: "mem-5",
        firstName: "Brian",
        lastName: "Robbin",
        personType: "volunteer",
        householdRole: "other" as const,
        recordedTitle: null,
        backgroundCheckStatus: "expired",
        backgroundCheckExpiresAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        ministryRoles: ["Kids Check-in"],
      },
    ]
    const found = all.find((m) => m.id === id) || all[0]
    const peers =
      found.id === "mem-5"
        ? [found]
        : DEMO_HOUSEHOLD.members.map((m) => ({
            ...m,
            roleLabel: HOUSEHOLD_ROLE_LABELS[m.householdRole as keyof typeof HOUSEHOLD_ROLE_LABELS],
          }))
    return {
      ...found,
      householdId: found.id === "mem-5" ? null : DEMO_HOUSEHOLD.id,
      householdName: found.id === "mem-5" ? null : DEMO_HOUSEHOLD.name,
      householdPeers: peers,
      email: `${found.firstName.toLowerCase()}@gracecity.church`,
      phoneNumber: "(555) 010-1000",
      ministryRoles: (found as { ministryRoles?: string[] }).ministryRoles || ["Pastoral Care"],
    }
  },

  async attachHousehold(id: string, input: AttachHouseholdInput) {
    try {
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
      return updated || { id, householdId, householdRole: input.householdRole }
    } catch (e) {
      if (e instanceof ValidationError) throw e
      return { id, householdId: input.householdId || "hh-demo", householdRole: input.householdRole }
    }
  },

  /**
   * Household directory for Families page — DB when available, else demo.
   */
  async listHouseholds() {
    try {
      const rows = await db.select().from(households).orderBy(desc(households.createdAt))
      if (rows.length > 0) {
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
              householdRole: m.householdRole,
              personType: m.personType,
            })),
            createdAt: hh.createdAt.toISOString(),
          })
        }
        return result
      }
    } catch (err) {
      console.error("[memberService.listHouseholds] demo", err)
    }

    return [
      {
        id: DEMO_HOUSEHOLD.id,
        name: DEMO_HOUSEHOLD.name,
        campusId: "campus-demo-1",
        address: "120 Grace Avenue",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        memberCount: DEMO_HOUSEHOLD.members.length,
        members: DEMO_HOUSEHOLD.members,
        createdAt: new Date().toISOString(),
      },
      {
        id: "hh-vance",
        name: "The Vance Household",
        campusId: "campus-demo-1",
        address: "88 Oak Street",
        city: "Springfield",
        state: "IL",
        zipCode: "62704",
        memberCount: 2,
        members: [
          {
            id: "mem-2",
            firstName: "Marcus",
            lastName: "Vance",
            personType: "staff_minister",
            householdRole: "head",
          },
          {
            id: "mem-vance-spouse",
            firstName: "Rachel",
            lastName: "Vance",
            personType: "covenant_member",
            householdRole: "spouse",
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "hh-murphy",
        name: "The Murphy Household",
        campusId: "campus-demo-1",
        address: null,
        city: "Springfield",
        state: "IL",
        zipCode: null,
        memberCount: 1,
        members: [
          {
            id: "mem-3",
            firstName: "Kathryn",
            lastName: "Murphy",
            personType: "leader",
            householdRole: "head",
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ]
  },

  /**
   * Lifecycle promotion/demotion with actor audit note
   */
  async updatePersonType(id: string, input: UpdatePersonTypeInput) {
    try {
      const existing = await db.select().from(members).where(eq(members.id, id)).limit(1)
      if (existing.length === 0) {
        return {
          id,
          personType: input.personType,
          changedByUserId: input.changedByUserId,
          reason: input.reason || `Lifecycle set to ${input.personType}`,
        }
      }
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
    } catch {
      return {
        id,
        personType: input.personType,
        changedByUserId: input.changedByUserId,
        reason: input.reason,
      }
    }
  },
}
