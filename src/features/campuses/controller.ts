import { Elysia } from "elysia"
import { campusService } from "./service"
import { createCampusSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const campusController = new Elysia({ prefix: "/campuses" })
  .get("/", async ({ set }) => {
    try {
      const data = await campusService.listCampuses()
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/", async ({ body, set }) => {
    try {
      const parsed = createCampusSchema.parse(body)
      const data = await campusService.createCampus(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
