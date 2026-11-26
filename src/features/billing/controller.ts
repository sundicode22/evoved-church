import { Elysia } from "elysia"
import { billingService } from "./service"
import { selectPlanSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"
import { resolveTenantId } from "./tenant-context"

export const billingController = new Elysia({ prefix: "/billing" })
  .get("/plans", async ({ set }) => {
    try {
      const data = await billingService.listPlans()
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .get("/subscription", async ({ request, set }) => {
    try {
      const organizationId = await resolveTenantId(request.headers)
      const data = await billingService.getSubscription(organizationId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/subscription", async ({ request, body, set }) => {
    try {
      const parsed = selectPlanSchema.parse(body)
      const organizationId = await resolveTenantId(request.headers)
      const data = await billingService.selectPlan(parsed, organizationId)
      set.status = 200
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
