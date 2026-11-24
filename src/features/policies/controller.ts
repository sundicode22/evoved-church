import { Elysia } from "elysia"
import { policiesService } from "./service"
import { createPolicySchema, updatePolicySchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const policiesController = new Elysia({ prefix: "/policies" })
  .get("/", async ({ query, set }) => {
    try {
      const module = (query.module as string) || undefined
      const data = await policiesService.list(module)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .get("/:id", async ({ params, set }) => {
    try {
      const data = await policiesService.getById(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/", async ({ body, set }) => {
    try {
      const parsed = createPolicySchema.parse(body)
      const data = await policiesService.create(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .patch("/:id", async ({ params, body, set }) => {
    try {
      const parsed = updatePolicySchema.parse(body)
      const data = await policiesService.update(params.id, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/:id/publish", async ({ params, set }) => {
    try {
      const data = await policiesService.publish(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .delete("/:id", async ({ params, set }) => {
    try {
      await policiesService.remove(params.id)
      return { success: true }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
