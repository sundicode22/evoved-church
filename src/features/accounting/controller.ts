import { Elysia } from "elysia"
import { accountingService } from "./service"
import {
  createRequisitionSchema,
  approveRequisitionSchema,
  createJournalEntrySchema,
  postJournalEntrySchema,
  fundTransferSchema,
  createFundSchema,
  createBudgetLineSchema,
} from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const accountingController = new Elysia({ prefix: "/accounting" })
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

  .post("/funds", async ({ body, set }) => {
    try {
      const parsed = createFundSchema.parse(body)
      const created = await accountingService.createFund(parsed)
      set.status = 201
      return { success: true, data: created }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .get("/budget-lines", async ({ query, set }) => {
    try {
      const fundId = (query.fundId as string) || undefined
      const data = await accountingService.listBudgetLines(fundId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/budget-lines", async ({ body, set }) => {
    try {
      const parsed = createBudgetLineSchema.parse(body)
      const created = await accountingService.createBudgetLine(parsed)
      set.status = 201
      return { success: true, data: created }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

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

  .get("/requisitions", async ({ query, headers, set }) => {
    try {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const statusFilter = (query.status as string) || undefined
      const search = (query.search as string) || undefined

      const result = await accountingService.getPaginatedRequisitions({
        page,
        pageSize,
        campusId,
        status: statusFilter,
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

  .post("/requisitions/:id/approvals", async ({ params, body, set }) => {
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

  .get("/journal-entries", async ({ query, headers, set }) => {
    try {
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const data = await accountingService.getJournalEntries(campusId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/journal-entries", async ({ body, set }) => {
    try {
      const parsed = createJournalEntrySchema.parse(body)
      const created = await accountingService.createJournalEntry(parsed)
      set.status = 201
      return { success: true, data: created }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/journal-entries/:id/post", async ({ params, body, set }) => {
    try {
      const parsed = postJournalEntrySchema.parse(body)
      const posted = await accountingService.postJournalEntry(params.id, parsed)
      return { success: true, data: posted }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/fund-transfers", async ({ body, headers, set }) => {
    try {
      const parsed = fundTransferSchema.parse(body)
      const authorizedBy =
        (headers["x-user-id"] as string) || (body as { authorizedByUserId?: string }).authorizedByUserId || "user-1"
      const transfer = await accountingService.createFundTransfer(parsed, authorizedBy)
      set.status = 201
      return { success: true, data: transfer }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
