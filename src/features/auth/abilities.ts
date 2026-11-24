import type { PermissionKey } from "./permissions-catalog"
import { PERMISSION_CATALOG } from "./permissions-catalog"

export type AbilitySnapshot = {
  userId: string | null
  isAdmin: boolean
  roleSlugs: string[]
  permissions: string[]
}

export function createEmptyAbility(): AbilitySnapshot {
  return { userId: null, isAdmin: false, roleSlugs: [], permissions: [] }
}

/** Demo/dev fallback when DB roles are empty — finance-capable admin */
export function createDemoAdminAbility(userId = "demo-admin"): AbilitySnapshot {
  return {
    userId,
    isAdmin: true,
    roleSlugs: ["admin"],
    permissions: PERMISSION_CATALOG.map((p) => p.key),
  }
}

export function can(ability: AbilitySnapshot, permission: PermissionKey | string): boolean {
  if (ability.isAdmin) return true
  return ability.permissions.includes(permission)
}

export function canAny(ability: AbilitySnapshot, permissions: (PermissionKey | string)[]): boolean {
  if (ability.isAdmin) return true
  return permissions.some((p) => ability.permissions.includes(p))
}

export function canAll(ability: AbilitySnapshot, permissions: (PermissionKey | string)[]): boolean {
  if (ability.isAdmin) return true
  return permissions.every((p) => ability.permissions.includes(p))
}
