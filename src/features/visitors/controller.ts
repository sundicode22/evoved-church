import { Elysia } from "elysia"
import { visitorService } from "./service"
import { createLeadSchema, updateLeadStageSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const visitorController = new Elysia({ prefix: "/pipeline" })
  /**
   * GET /api/pipeline/deals - Returns all leads organized into Kanban columns
   */
  .get("/deals", async ({ query, headers, set }) => {
    try {
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const data = await visitorService.getPipelineDeals(campusId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * GET /api/pipeline/deals/list - Returns paginated list of leads with branch scoping
   */
  .get("/deals/list", async ({ query, headers, set }) => {
    try {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const search = (query.search as string) || ""

      // Fetch deals
      const pipelineData = await visitorService.getPipelineDeals(campusId)
      const allDeals = pipelineData.stages.flatMap((s: any) => s.deals)

      const filtered = search
        ? allDeals.filter(
            (d: any) =>
              d.title.toLowerCase().includes(search.toLowerCase()) ||
              d.contactName.toLowerCase().includes(search.toLowerCase())
          )
        : allDeals

      const total = filtered.length
      const totalPages = Math.ceil(total / pageSize) || 1
      const offset = (page - 1) * pageSize
      const paginatedData = filtered.slice(offset, offset + pageSize)

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
   * GET /api/pipeline/deals/:id - Returns details for slide-over drawer
   */
  .get("/deals/:id", async ({ params, set }) => {
    try {
      const deal = await visitorService.getLeadById(params.id)
      return { success: true, data: deal }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * POST /api/pipeline/deals - Creates a new visitor lead
   */
  .post("/deals", async ({ body, headers, set }) => {
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
   * PATCH /api/pipeline/deals/:id/stage - Moves a lead between Kanban stages
   */
  .patch("/deals/:id/stage", async ({ params, body, set }) => {
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
