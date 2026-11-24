import { formatErrorResponse } from "@/lib/errors"

type SetStatus = { status?: number | string }

/**
 * Shared Elysia route wrapper — Zod/service work stays in the callback;
 * errors always return the standard { success: false, error } body.
 */
export async function apiOk<T>(
  set: SetStatus,
  fn: () => Promise<T>,
  opts?: { status?: number }
): Promise<{ success: true; data: T } | ReturnType<typeof formatErrorResponse>["body"]> {
  try {
    const data = await fn()
    if (opts?.status) set.status = opts.status
    return { success: true, data }
  } catch (error) {
    const { status, body } = formatErrorResponse(error)
    set.status = status
    return body
  }
}
