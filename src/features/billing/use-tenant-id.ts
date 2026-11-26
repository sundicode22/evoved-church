"use client"

import { useSession } from "@/features/auth/auth-client"
import { DEFAULT_TENANT_ID } from "@/features/billing/tenant-constants"

/**
 * Active church tenant = Better Auth activeOrganizationId.
 * Falls back to "default" until an organization is created/selected.
 */
export function useTenantId() {
  const { data } = useSession()
  const orgId = (data?.session as { activeOrganizationId?: string | null } | undefined)
    ?.activeOrganizationId
  if (orgId && typeof orgId === "string" && orgId.trim()) return orgId.trim()
  return DEFAULT_TENANT_ID
}
