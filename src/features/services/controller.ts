import { Elysia } from "elysia"
import { churchServicesService } from "./service"
import { createServiceSchema, updateServiceSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const servicesController = new Elysia({ prefix: "/services" })
  .get("/", async ({ query, set }) => {
    try {
      const type = (query.type as string) || undefined
      const data = await churchServicesService.list(type)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .get("/:id", async ({ params, set }) => {
    try {
      const data = await churchServicesService.getById(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/", async ({ body, set }) => {
    try {
      const parsed = createServiceSchema.parse(body)
      const data = await churchServicesService.create(parsed)
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
      const parsed = updateServiceSchema.parse(body)
      const data = await churchServicesService.update(params.id, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .delete("/:id", async ({ params, set }) => {
    try {
      await churchServicesService.remove(params.id)
      return { success: true }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
