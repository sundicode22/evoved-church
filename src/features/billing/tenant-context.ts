import { auth } from "@/features/auth/auth"

/** Legacy single-tenant fallback used before orgs are linked. */
export const DEFAULT_TENANT_ID = "default"

/**
 * Resolve the active church tenant id.
 * Prefer Better Auth activeOrganizationId; fall back to "default" for local/demo.
 */
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

export function campusIdFromHeaders(h: Headers | { get(name: string): string | null }) {
  const raw = h.get("x-campus-id")?.trim()
  return raw || null
}
