import { Elysia } from "elysia"
import { accountingService } from "./service"
import { createRequisitionSchema, approveRequisitionSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const accountingController = new Elysia({ prefix: "/accounting" })
  /**
   * GET /api/accounting/funds - Lists all church funds with budget, encumbrance, and balances
   */
  .get("/funds", async ({ query, headers, set }) => {
    try {
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const funds = await accountingService.getFunds(campusId)
      return { success: true, data: funds }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * GET /api/accounting/requisitions - Lists paginated requisitions & approvals
   */
  .get("/requisitions", async ({ query, headers, set }) => {
    try {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)

      const allReqs = await accountingService.getRequisitions(campusId)
      const total = allReqs.length
      const totalPages = Math.ceil(total / pageSize) || 1
      const offset = (page - 1) * pageSize
      const paginatedData = allReqs.slice(offset, offset + pageSize)

      return {
        success: true,
        data: paginatedData,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * POST /api/accounting/requisitions - Creates a new expense requisition with budget check
   */
  .post("/requisitions", async ({ body, headers, set }) => {
    try {
      const parsed = createRequisitionSchema.parse(body)
      const campusId = parsed.campusId || (headers["x-campus-id"] as string)
      const created = await accountingService.createRequisition({ ...parsed, campusId })
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
