/** Legacy single-tenant fallback used before orgs are linked. */
export const DEFAULT_TENANT_ID = "default"

export function campusIdFromHeaders(h: Headers | { get(name: string): string | null }) {
  const raw = h.get("x-campus-id")?.trim()
  return raw || null
}
