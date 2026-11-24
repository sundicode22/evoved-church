import { ForbiddenError, UnauthorizedError } from "@/lib/errors"
import { rbacService } from "@/features/settings/rbac-service"
import { can, createDemoAdminAbility } from "./abilities"
import type { PermissionKey } from "./permissions-catalog"

/**
 * Server-side permission check. Roles/permissions are loaded from DB — never from cookies.
 * Pass userId from session; if missing and AUTH_DISABLED, demo admin is used.
 */
export async function requirePermission(
  userId: string | undefined | null,
  permission: PermissionKey | string
) {
  if (!userId) {
    if (process.env.AUTH_DISABLED === "true" || !process.env.BETTER_AUTH_SECRET) {
      const demo = createDemoAdminAbility()
      if (can(demo, permission)) return demo
    }
    throw new UnauthorizedError()
  }

  const ability = await rbacService.getAbilityForUser(userId)
  if (!can(ability, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`)
  }
  return ability
}

export function getUserIdFromHeaders(headers: Headers | Record<string, string | undefined>): string | undefined {
  if (headers instanceof Headers) {
    return headers.get("x-user-id") || undefined
  }
  return headers["x-user-id"]
}
