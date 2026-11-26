import { Elysia } from "elysia"
import { reportsService } from "./service"
import { reportsExportService } from "./export-service"
import { auditService } from "@/features/audit/service"
import { apiOk } from "@/lib/api-handler"
import { formatErrorResponse } from "@/lib/errors"

export const reportsController = new Elysia({ prefix: "/reports" })
  .get("/overview", ({ query, set }) =>
    apiOk(set, () => reportsService.overview(query.campusId as string | undefined))
  )
  .get("/catalog", ({ set }) => apiOk(set, async () => reportsExportService.catalog()))
  .get("/export/:id", async ({ params, set }) => {
    try {
      const data = await reportsExportService.run(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })
  .get("/audit", async ({ query, set }) => {
    try {
      const limit = Number(query.limit || 100)
      const data = await auditService.list(limit)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })
