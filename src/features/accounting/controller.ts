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
   * GET /api/accounting/chart-of-accounts - Lists standard double-entry Chart of Accounts
   */
  .get("/chart-of-accounts", async ({ query, headers, set }) => {
    try {
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const coa = await accountingService.getChartOfAccounts(campusId)
      return { success: true, data: coa }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * GET /api/accounting/requisitions - Real SQL-level paginated requisitions & approvals
   */
  .get("/requisitions", async ({ query, headers, set }) => {
    try {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const status = (query.status as string) || undefined
      const search = (query.search as string) || undefined

      const result = await accountingService.getPaginatedRequisitions({
        page,
        pageSize,
        campusId,
        status,
        search,
      })

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
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
