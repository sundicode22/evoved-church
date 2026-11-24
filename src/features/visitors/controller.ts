import { Elysia } from "elysia"
import { visitorService } from "./service"
import { createLeadSchema, updateLeadStageSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const visitorController = new Elysia({ prefix: "/visitors" })
  /**
   * GET /api/visitors/board - Kanban columns with church visitor stages
   */
  .get("/board", async ({ query, headers, set }) => {
    try {
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const search = (query.search as string) || undefined
      const data = await visitorService.getVisitorBoard(campusId, search)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * GET /api/visitors - Paginated visitor list
   */
  .get("/", async ({ query, headers, set }) => {
    try {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const search = (query.search as string) || undefined
      const stage = (query.stage as string) || undefined

      const result = await visitorService.getPaginatedLeads({
        page,
        pageSize,
        campusId,
        search,
        stage,
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
   * GET /api/visitors/:id - Detail for slide-over drawer
   */
  .get("/:id", async ({ params, set }) => {
    try {
      const lead = await visitorService.getLeadById(params.id)
      return { success: true, data: lead }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * POST /api/visitors - Create visitor lead
   */
  .post("/", async ({ body, headers, set }) => {
    try {
      const parsed = createLeadSchema.parse(body)
      const campusId = parsed.campusId || (headers["x-campus-id"] as string)
      const created = await visitorService.createLead({ ...parsed, campusId })
      set.status = 201
      return { success: true, data: created }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  /**
   * PATCH /api/visitors/:id/stage - Move lead between kanban stages
   */
  .patch("/:id/stage", async ({ params, body, set }) => {
    try {
      const parsed = updateLeadStageSchema.parse(body)
      const updated = await visitorService.updateLeadStage(params.id, parsed)
      return { success: true, data: updated }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
