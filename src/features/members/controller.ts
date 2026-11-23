import { Elysia } from "elysia"
import { memberService } from "./service"
import { createCategorySchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const memberController = new Elysia({ prefix: "/people" })
  /**
   * GET /api/people - Retrieves paginated people filtered by lifecycle type and campus
   */
  .get("/", async ({ query, headers, set }) => {
    try {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const personType = query.personType as string | undefined

      const records = await memberService.getMembers({ personType, campusId })
      const total = records.length
      const totalPages = Math.ceil(total / pageSize) || 1
      const offset = (page - 1) * pageSize
      const paginatedData = records.slice(offset, offset + pageSize)

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
