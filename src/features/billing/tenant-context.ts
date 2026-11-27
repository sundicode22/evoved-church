import { auth } from "@/features/auth/auth"
import { DEFAULT_TENANT_ID } from "@/features/billing/tenant-constants"

export { DEFAULT_TENANT_ID, campusIdFromHeaders } from "@/features/billing/tenant-constants"

/**
 * Resolve the active church tenant id.
 * Prefer Better Auth activeOrganizationId; fall back to "default" for local/demo.
 */
export async function hasActiveOrganization(requestHeaders?: Headers): Promise<boolean> {
  if (!requestHeaders) return false
  try {
    const session = await auth.api.getSession({ headers: requestHeaders })
    const orgId = session?.session?.activeOrganizationId
    return typeof orgId === "string" && orgId.trim().length > 0
  } catch {
    return false
  }
}

export async function resolveTenantId(requestHeaders?: Headers): Promise<string> {
  if (!requestHeaders) return DEFAULT_TENANT_ID
  try {
    const session = await auth.api.getSession({ headers: requestHeaders })
    const orgId = session?.session?.activeOrganizationId
    if (orgId && typeof orgId === "string" && orgId.trim()) return orgId.trim()
  } catch {
    /* unauthenticated or non-Next context */
  }
  return DEFAULT_TENANT_ID
}
