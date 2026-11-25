import { Elysia } from "elysia"
import { organigramService } from "./service"
import {
  createOrgNodeSchema,
  updateNodeParentSchema,
  updateOrgNodeSchema,
} from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const organigramController = new Elysia({ prefix: "/organigram" })
  .get("/tree", async ({ query, headers, set }) => {
    try {
      const campusId =
        (query.campusId as string) || (headers["x-campus-id"] as string) || "all"
      const data = await organigramService.getTree(campusId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/nodes", async ({ body, query, headers, set }) => {
    try {
      const parsed = createOrgNodeSchema.parse(body)
      const campusId =
        parsed.campusId ||
        (query.campusId as string) ||
        (headers["x-campus-id"] as string)
      const data = await organigramService.createNode({ ...parsed, campusId })
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .patch("/nodes/:id", async ({ params, body, set }) => {
    try {
      // Reparent-only payload (drag & drop) vs full edit
      const asParent = updateNodeParentSchema.safeParse(body)
      const asFull = updateOrgNodeSchema.safeParse(body)

      if (
        asParent.success &&
        body &&
        typeof body === "object" &&
        "parentId" in body &&
        !("title" in body) &&
        !("name" in body) &&
        !("department" in body)
      ) {
        const data = await organigramService.updateParent(
          params.id,
          asParent.data.parentId,
          asParent.data.orderIndex
        )
        return { success: true, data }
      }

      if (!asFull.success) {
        const parsed = updateOrgNodeSchema.parse(body)
        const data = await organigramService.updateNode(params.id, parsed)
        return { success: true, data }
      }

      const data = await organigramService.updateNode(params.id, asFull.data)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .delete("/nodes/:id", async ({ params, set }) => {
    try {
      const data = await organigramService.deleteNode(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
