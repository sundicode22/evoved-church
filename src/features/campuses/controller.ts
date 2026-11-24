import { Elysia } from "elysia"
import { campusService } from "./service"
import { formatErrorResponse } from "@/lib/errors"

export const campusController = new Elysia({ prefix: "/campuses" }).get("/", async ({ set }) => {
  try {
    const data = await campusService.listCampuses()
    return { success: true, data }
  } catch (error) {
    const { status, body } = formatErrorResponse(error)
    set.status = status
    return body
  }
})
