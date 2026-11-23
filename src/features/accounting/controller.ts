import { Elysia } from "elysia"
import { accountingService } from "./service"
import { createRequisitionSchema, approveRequisitionSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const accountingController = new Elysia({ prefix: "/accounting" })
  /**
   * GET /api/accounting/funds - Lists all church funds with budget, encumbrance, and balances
   */
  .get("/funds", async ({ query, set }) => {
    try {
      const funds = await accountingService.getFunds(query.campusId)
      return { success: true, data: funds }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * GET /api/accounting/requisitions - Lists all requisitions & approvals
   */
  .get("/requisitions", async ({ query, set }) => {
    try {
      const requisitions = await accountingService.getRequisitions(query.campusId)
      return { success: true, data: requisitions }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * POST /api/accounting/requisitions - Creates a new expense requisition with budget check
   */
  .post("/requisitions", async ({ body, set }) => {
    try {
      const parsed = createRequisitionSchema.parse(body)
      const created = await accountingService.createRequisition(parsed)
      set.status = 201
      return { success: true, data: created }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  /**
   * PATCH /api/accounting/requisitions/:id/approve - Approves or rejects an expense requisition
   */
  .patch("/requisitions/:id/approve", async ({ params, body, set }) => {
    try {
      const parsed = approveRequisitionSchema.parse(body)
      const updated = await accountingService.approveRequisition(params.id, parsed)
      return { success: true, data: updated }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
