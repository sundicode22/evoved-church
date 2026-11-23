import { Elysia, t } from "elysia"
import { visitorService } from "./service"
import { createLeadSchema, updateLeadStageSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const visitorController = new Elysia({ prefix: "/pipeline" })
  /**
   * GET /api/pipeline/deals - Returns all leads organized into Kanban columns
   */
  .get("/deals", async ({ query, set }) => {
    try {
      const data = await visitorService.getPipelineDeals(query.campusId)
      return { success: true, data }
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
  .post("/deals", async ({ body, set }) => {
    try {
      const parsed = createLeadSchema.parse(body)
      const created = await visitorService.createLead(parsed)
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
