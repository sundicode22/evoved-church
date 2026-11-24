import { Elysia } from "elysia"
import { organigramService } from "./service"
import { updateNodeParentSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const organigramController = new Elysia({ prefix: "/organigram" })
  .get("/tree", async ({ query, set }) => {
    try {
      const campusId = (query.campusId as string) || "all"
      const data = await organigramService.getTree(campusId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .patch("/nodes/:id", async ({ params, body, set }) => {
    try {
      const parsed = updateNodeParentSchema.parse(body)
      const data = await organigramService.updateParent(params.id, parsed.parentId, parsed.orderIndex)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
