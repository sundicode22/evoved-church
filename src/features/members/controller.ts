import { Elysia } from "elysia"
import { memberService } from "./service"
import { createCategorySchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const memberController = new Elysia({ prefix: "/people" })
  /**
   * GET /api/people - Retrieves people filtered by lifecycle type
   */
  .get("/", async ({ query, set }) => {
    try {
      const data = await memberService.getMembers({
        personType: query.personType as string | undefined,
        campusId: query.campusId as string | undefined,
      })
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * GET /api/people/categories - Retrieves dynamic user categories
   */
  .get("/categories", async ({ set }) => {
    try {
      const data = await memberService.getCategories()
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  /**
   * POST /api/people/categories - Creates a new dynamic user category
   */
  .post("/categories", async ({ body, set }) => {
    try {
      const parsed = createCategorySchema.parse(body)
      const data = await memberService.createCategory(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
