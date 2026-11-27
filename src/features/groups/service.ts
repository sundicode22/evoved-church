import { db } from "@/lib/db"
import { campuses, groupMemberships, ministryGroups } from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { NotFoundError } from "@/lib/errors"
import {
  addMembershipSchema,
  createGroupSchema,
  updateGroupSchema,
  type AddMembershipInput,
  type CreateGroupInput,
  type GroupMembership,
  type MinistryGroup,
  type UpdateGroupInput,
} from "./schemas"
import type { z } from "zod"

const now = () => new Date().toISOString()
const DEMO_CAMPUS = "campus-demo-1"

const groups: MinistryGroup[] = []
const memberships: GroupMembership[] = []

function findGroup(id: string) {
  const g = groups.find((x) => x.id === id)
  if (!g) throw new NotFoundError("Group", id)
  return g
}

async function resolveCampusId(preferred?: string | null) {
  if (preferred) return preferred
  try {
    const rows = await db.select({ id: campuses.id }).from(campuses).limit(1)
    if (rows[0]?.id) return rows[0].id
  } catch {
    /* demo */
  }
  return DEMO_CAMPUS
}

function recount(groupId: string) {
  const g = groups.find((x) => x.id === groupId)
  if (g) g.memberCount = memberships.filter((m) => m.groupId === groupId).length
}

export const groupsService = {
  async list(): Promise<MinistryGroup[]> {
    try {
      const rows = await db
        .select()
        .from(ministryGroups)
        .orderBy(desc(ministryGroups.createdAt))

      if (rows.length > 0) {
        const result: MinistryGroup[] = []
        for (const group of rows) {
          const count = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(groupMemberships)
            .where(eq(groupMemberships.groupId, group.id))
          result.push({
            id: group.id,
            campusId: group.campusId,
            name: group.name,
            type: group.type,
            imageUrl: group.imageUrl,
            description: group.description,
            leaderMemberId: group.leaderMemberId,
            leaderName: null,
            isActive: group.isActive,
            memberCount: count[0]?.count || 0,
            createdAt: group.createdAt.toISOString(),
            updatedAt: group.updatedAt.toISOString(),
          })
        }
        return result
      }
    } catch (err) {
      console.error("[groupsService.list] demo", err)
    }
    return [...groups].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async getById(id: string): Promise<MinistryGroup> {
    try {
      const rows = await db
        .select()
        .from(ministryGroups)
        .where(eq(ministryGroups.id, id))
        .limit(1)
      if (rows[0]) {
        const count = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(groupMemberships)
          .where(eq(groupMemberships.groupId, id))
        return {
          id: rows[0].id,
          campusId: rows[0].campusId,
          name: rows[0].name,
          type: rows[0].type,
          imageUrl: rows[0].imageUrl,
          description: rows[0].description,
          leaderMemberId: rows[0].leaderMemberId,
          leaderName: null,
          isActive: rows[0].isActive,
          memberCount: count[0]?.count || 0,
          createdAt: rows[0].createdAt.toISOString(),
          updatedAt: rows[0].updatedAt.toISOString(),
        }
      }
    } catch {
      /* demo */
    }
    return { ...findGroup(id) }
  },

  async create(input: CreateGroupInput): Promise<MinistryGroup> {
    const parsed = createGroupSchema.parse(input) as z.output<typeof createGroupSchema>
    const campusId = await resolveCampusId(parsed.campusId)
    const imageUrl = parsed.imageUrl ? parsed.imageUrl : null

    try {
      const [row] = await db
        .insert(ministryGroups)
        .values({
          campusId,
          name: parsed.name,
          type: parsed.type,
          imageUrl,
          description: parsed.description || null,
          leaderMemberId: parsed.leaderMemberId || null,
          isActive: parsed.isActive,
        })
        .returning()
      if (row) {
        return {
          id: row.id,
          campusId: row.campusId,
          name: row.name,
          type: row.type,
          imageUrl: row.imageUrl,
          description: row.description,
          leaderMemberId: row.leaderMemberId,
          leaderName: null,
          isActive: row.isActive,
          memberCount: 0,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        }
      }
    } catch (err) {
      console.error("[groupsService.create] demo", err)
    }

    const row: MinistryGroup = {
      id: `grp-${crypto.randomUUID()}`,
      campusId,
      name: parsed.name,
      type: parsed.type,
      imageUrl,
      description: parsed.description || null,
      leaderMemberId: parsed.leaderMemberId || null,
      leaderName: null,
      isActive: parsed.isActive,
      memberCount: 0,
      createdAt: now(),
      updatedAt: now(),
    }
    groups.unshift(row)
    return row
  },

  async update(id: string, input: UpdateGroupInput): Promise<MinistryGroup> {
    const parsed = updateGroupSchema.parse(input)
    try {
      const [row] = await db
        .update(ministryGroups)
        .set({
          ...(parsed.name !== undefined && { name: parsed.name }),
          ...(parsed.type !== undefined && { type: parsed.type }),
          ...(parsed.imageUrl !== undefined && {
            imageUrl: parsed.imageUrl ? parsed.imageUrl : null,
          }),
          ...(parsed.description !== undefined && {
            description: parsed.description || null,
          }),
          ...(parsed.leaderMemberId !== undefined && {
            leaderMemberId: parsed.leaderMemberId || null,
          }),
          ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
          updatedAt: new Date(),
        })
        .where(eq(ministryGroups.id, id))
        .returning()
      if (row) return this.getById(row.id)
    } catch {
      /* demo */
    }

    const g = findGroup(id)
    Object.assign(g, {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.type !== undefined && { type: parsed.type }),
      ...(parsed.imageUrl !== undefined && {
        imageUrl: parsed.imageUrl ? parsed.imageUrl : null,
      }),
      ...(parsed.description !== undefined && { description: parsed.description || null }),
      ...(parsed.leaderMemberId !== undefined && {
        leaderMemberId: parsed.leaderMemberId || null,
      }),
      ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
      updatedAt: now(),
    })
    return { ...g }
  },

  async remove(id: string): Promise<{ id: string }> {
    try {
      await db.delete(ministryGroups).where(eq(ministryGroups.id, id))
    } catch {
      /* demo */
    }
    const idx = groups.findIndex((g) => g.id === id)
    if (idx === -1 && !id.startsWith("grp-")) throw new NotFoundError("Group", id)
    if (idx >= 0) groups.splice(idx, 1)
    for (let i = memberships.length - 1; i >= 0; i--) {
      if (memberships[i].groupId === id) memberships.splice(i, 1)
    }
    return { id }
  },

  async listMemberships(groupId?: string): Promise<GroupMembership[]> {
    try {
      const rows = groupId
        ? await db
            .select()
            .from(groupMemberships)
            .where(eq(groupMemberships.groupId, groupId))
        : await db.select().from(groupMemberships)
      if (rows.length > 0) {
        return rows.map((m) => ({
          id: m.id,
          groupId: m.groupId,
          memberId: m.memberId,
          memberDisplayName: "Member",
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        }))
      }
    } catch (err) {
      console.error("[groupsService.listMemberships] demo", err)
    }
    return groupId ? memberships.filter((m) => m.groupId === groupId) : [...memberships]
  },

  async addMembership(groupId: string, input: AddMembershipInput): Promise<GroupMembership> {
    const parsed = addMembershipSchema.parse(input) as z.output<typeof addMembershipSchema>
    const group = await this.getById(groupId)

    try {
      const [row] = await db
        .insert(groupMemberships)
        .values({
          groupId,
          memberId: parsed.memberId,
          role: parsed.role,
        })
        .returning()
      if (row) {
        return {
          id: row.id,
          groupId: row.groupId,
          groupName: group.name,
          memberId: row.memberId,
          memberDisplayName: parsed.memberDisplayName || "Member",
          role: row.role,
          joinedAt: row.joinedAt.toISOString(),
        }
      }
    } catch (err) {
      console.error("[groupsService.addMembership] demo", err)
    }

    const row: GroupMembership = {
      id: `gm-${crypto.randomUUID()}`,
      groupId,
      groupName: group.name,
      memberId: parsed.memberId,
      memberDisplayName: parsed.memberDisplayName || "Member",
      role: parsed.role,
      joinedAt: now(),
    }
    memberships.push(row)
    recount(groupId)
    return row
  },
}
