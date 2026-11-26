import { Elysia } from "elysia"
import { campusService } from "./service"
import { createCampusSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"
import { resolveTenantId, DEFAULT_TENANT_ID } from "@/features/billing/tenant-context"

export const campusController = new Elysia({ prefix: "/campuses" })
  .get("/", async ({ request, set }) => {
    try {
      const tenantId = await resolveTenantId(request.headers)
      const data = await campusService.listCampuses(
        tenantId === DEFAULT_TENANT_ID ? null : tenantId
      )
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/", async ({ request, body, set }) => {
    try {
      const parsed = createCampusSchema.parse(body)
      const tenantId = await resolveTenantId(request.headers)
      const data = await campusService.createCampus(
        parsed,
        tenantId === DEFAULT_TENANT_ID ? null : tenantId
      )
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
