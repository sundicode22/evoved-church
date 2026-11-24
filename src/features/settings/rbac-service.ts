import { db } from "@/lib/db"
import { appRoles, appPermissions, rolePermissions, userRoles } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import { PERMISSION_CATALOG } from "@/features/auth/permissions-catalog"
import {
  AbilitySnapshot,
  createDemoAdminAbility,
  createEmptyAbility,
} from "@/features/auth/abilities"
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors"
import { CreateRoleInput, UpdateRoleInput } from "./rbac-schemas"

const DEMO_ROLES = [
  {
    id: "role-admin",
    slug: "admin",
    name: "Administrator",
    description: "Full access to all modules",
    isSystem: true,
    isAdmin: true,
    permissionKeys: PERMISSION_CATALOG.map((p) => p.key) as string[],
  },
  {
    id: "role-finance",
    slug: "finance_director",
    name: "Finance Director",
    description: "Funds, ledger posting, giving, reports",
    isSystem: true,
    isAdmin: false,
    permissionKeys: [
      "accounting.read",
      "accounting.requisitions",
      "accounting.journal.post",
      "accounting.transfers",
      "reports.read",
      "members.read",
      "campaigns.read",
    ],
  },
  {
    id: "role-campus-pastor",
    slug: "campus_pastor",
    name: "Location Pastor",
    description: "Pastoral care, visitors, mid-tier approvals",
    isSystem: true,
    isAdmin: false,
    permissionKeys: [
      "visitors.read",
      "visitors.write",
      "visitors.stage",
      "members.read",
      "members.write",
      "members.lifecycle",
      "groups.read",
      "groups.write",
      "accounting.read",
      "accounting.requisitions",
      "organigram.read",
      "services.read",
      "services.write",
      "projects.read",
      "projects.write",
      "campaigns.read",
      "campaigns.write",
      "reports.read",
    ],
  },
  {
    id: "role-volunteer",
    slug: "volunteer",
    name: "Volunteer",
    description: "Limited check-in and assigned project access",
    isSystem: true,
    isAdmin: false,
    permissionKeys: ["visitors.read", "projects.read", "services.read", "groups.read"],
  },
]

let memoryRoles = [...DEMO_ROLES]
let memoryUserRoles: { userId: string; roleId: string }[] = [
  { userId: "demo-admin", roleId: "role-admin" },
]

export const rbacService = {
  listPermissionCatalog() {
    return PERMISSION_CATALOG.map((p) => ({ ...p }))
  },

  async ensureSeeded() {
    try {
      const existing = await db.select().from(appPermissions).limit(1)
      if (existing.length === 0) {
        await db.insert(appPermissions).values(
          PERMISSION_CATALOG.map((p) => ({
            key: p.key,
            label: p.label,
            groupName: p.groupName,
          }))
        )
      }
      const roles = await db.select().from(appRoles).limit(1)
      if (roles.length === 0) {
        for (const r of DEMO_ROLES) {
          const [created] = await db
            .insert(appRoles)
            .values({
              slug: r.slug,
              name: r.name,
              description: r.description,
              isSystem: r.isSystem,
              isAdmin: r.isAdmin,
            })
            .returning()
          if (!r.isAdmin) {
            const perms = await db
              .select()
              .from(appPermissions)
              .where(inArray(appPermissions.key, r.permissionKeys))
            if (perms.length) {
              await db.insert(rolePermissions).values(
                perms.map((p) => ({ roleId: created.id, permissionId: p.id }))
              )
            }
          }
        }
      }
    } catch {
      /* demo memory mode */
    }
  },

  async listRoles() {
    await this.ensureSeeded()
    try {
      const roles = await db.select().from(appRoles)
      if (roles.length === 0) return memoryRoles.map(stripDemo)

      const allRp = await db.select().from(rolePermissions)
      const allPerms = await db.select().from(appPermissions)
      const permById = Object.fromEntries(allPerms.map((p) => [p.id, p.key]))

      return roles.map((r) => ({
        ...r,
        permissionKeys: r.isAdmin
          ? PERMISSION_CATALOG.map((p) => p.key)
          : allRp.filter((rp) => rp.roleId === r.id).map((rp) => permById[rp.permissionId]).filter(Boolean),
      }))
    } catch {
      return memoryRoles.map(stripDemo)
    }
  },

  async createRole(input: CreateRoleInput) {
    await this.ensureSeeded()
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")
    try {
      const [created] = await db
        .insert(appRoles)
        .values({
          slug,
          name: input.name,
          description: input.description || null,
          isSystem: false,
          isAdmin: false,
        })
        .returning()

      if (input.permissionKeys?.length) {
        const perms = await db
          .select()
          .from(appPermissions)
          .where(inArray(appPermissions.key, input.permissionKeys))
        if (perms.length) {
          await db.insert(rolePermissions).values(
            perms.map((p) => ({ roleId: created.id, permissionId: p.id }))
          )
        }
      }
      return { ...created, permissionKeys: input.permissionKeys || [] }
    } catch {
      if (memoryRoles.some((r) => r.slug === slug)) {
        throw new ConflictError(`Role '${slug}' already exists`)
      }
      const role = {
        id: `role-${Date.now()}`,
        slug,
        name: input.name,
        description: input.description || "",
        isSystem: false,
        isAdmin: false,
        permissionKeys: input.permissionKeys || [],
      }
      memoryRoles.push(role)
      return stripDemo(role)
    }
  },

  async updateRole(id: string, input: UpdateRoleInput) {
    try {
      const existing = await db.select().from(appRoles).where(eq(appRoles.id, id)).limit(1)
      if (!existing[0]) throw new NotFoundError("Role", id)
      if (existing[0].isAdmin && input.isAdmin === false) {
        throw new ForbiddenError("Cannot remove admin wildcard from the Administrator role.")
      }
      const [updated] = await db
        .update(appRoles)
        .set({
          name: input.name ?? existing[0].name,
          description: input.description ?? existing[0].description,
          updatedAt: new Date(),
        })
        .where(eq(appRoles.id, id))
        .returning()
      return updated
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof ForbiddenError) throw e
      const idx = memoryRoles.findIndex((r) => r.id === id)
      if (idx < 0) throw new NotFoundError("Role", id)
      if (memoryRoles[idx].isAdmin) {
        /* keep admin */
      }
      memoryRoles[idx] = {
        ...memoryRoles[idx],
        name: input.name ?? memoryRoles[idx].name,
        description: input.description ?? memoryRoles[idx].description,
      }
      return stripDemo(memoryRoles[idx])
    }
  },

  async setRolePermissions(roleId: string, permissionKeys: string[]) {
    try {
      const role = await db.select().from(appRoles).where(eq(appRoles.id, roleId)).limit(1)
      if (!role[0]) throw new NotFoundError("Role", roleId)
      if (role[0].isAdmin) {
        return { roleId, permissionKeys: PERMISSION_CATALOG.map((p) => p.key), note: "Admin always has all permissions" }
      }
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))
      const perms = await db
        .select()
        .from(appPermissions)
        .where(inArray(appPermissions.key, permissionKeys))
      if (perms.length) {
        await db.insert(rolePermissions).values(
          perms.map((p) => ({ roleId, permissionId: p.id }))
        )
      }
      return { roleId, permissionKeys }
    } catch (e) {
      if (e instanceof NotFoundError) throw e
      const role = memoryRoles.find((r) => r.id === roleId)
      if (!role) throw new NotFoundError("Role", roleId)
      if (role.isAdmin) {
        return { roleId, permissionKeys: PERMISSION_CATALOG.map((p) => p.key) }
      }
      role.permissionKeys = permissionKeys
      return { roleId, permissionKeys }
    }
  },

  async deleteRole(id: string) {
    try {
      const role = await db.select().from(appRoles).where(eq(appRoles.id, id)).limit(1)
      if (!role[0]) throw new NotFoundError("Role", id)
      if (role[0].isSystem || role[0].isAdmin) {
        throw new ForbiddenError("System or admin roles cannot be deleted.")
      }
      await db.delete(appRoles).where(eq(appRoles.id, id))
      return { deleted: true }
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof ForbiddenError) throw e
      const role = memoryRoles.find((r) => r.id === id)
      if (!role) throw new NotFoundError("Role", id)
      if (role.isSystem || role.isAdmin) throw new ForbiddenError("System or admin roles cannot be deleted.")
      memoryRoles = memoryRoles.filter((r) => r.id !== id)
      return { deleted: true }
    }
  },

  async assignUserRole(userId: string, roleId: string, campusId?: string) {
    if (!userId || !roleId) throw new ValidationError("userId and roleId are required")
    try {
      const [row] = await db
        .insert(userRoles)
        .values({ userId, roleId, campusId: campusId || null })
        .returning()
      return row
    } catch {
      memoryUserRoles.push({ userId, roleId })
      return { userId, roleId, campusId: campusId || null }
    }
  },

  async getAbilityForUser(userId: string): Promise<AbilitySnapshot> {
    await this.ensureSeeded()
    try {
      const assignments = await db.select().from(userRoles).where(eq(userRoles.userId, userId))
      if (assignments.length === 0) {
        // Fall back to users.role text field via demo mapping
        return createDemoAdminAbility(userId)
      }
      const roleIds = assignments.map((a) => a.roleId)
      const roles = await db.select().from(appRoles).where(inArray(appRoles.id, roleIds))
      const isAdmin = roles.some((r) => r.isAdmin)
      if (isAdmin) {
        return {
          userId,
          isAdmin: true,
          roleSlugs: roles.map((r) => r.slug),
          permissions: PERMISSION_CATALOG.map((p) => p.key),
        }
      }
      const rps = await db.select().from(rolePermissions).where(inArray(rolePermissions.roleId, roleIds))
      const permIds = rps.map((r) => r.permissionId)
      const perms =
        permIds.length > 0
          ? await db.select().from(appPermissions).where(inArray(appPermissions.id, permIds))
          : []
      return {
        userId,
        isAdmin: false,
        roleSlugs: roles.map((r) => r.slug),
        permissions: [...new Set(perms.map((p) => p.key))],
      }
    } catch {
      const assigned = memoryUserRoles.filter((u) => u.userId === userId)
      if (assigned.length === 0) return createDemoAdminAbility(userId)
      const roles = memoryRoles.filter((r) => assigned.some((a) => a.roleId === r.id))
      const isAdmin = roles.some((r) => r.isAdmin)
      return {
        userId,
        isAdmin,
        roleSlugs: roles.map((r) => r.slug),
        permissions: isAdmin
          ? PERMISSION_CATALOG.map((p) => p.key)
          : [...new Set(roles.flatMap((r) => r.permissionKeys))],
      }
    }
  },
}

function stripDemo(r: (typeof DEMO_ROLES)[number]) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    isAdmin: r.isAdmin,
    permissionKeys: r.isAdmin ? PERMISSION_CATALOG.map((p) => p.key) : r.permissionKeys,
  }
}
