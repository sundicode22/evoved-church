import { Elysia } from "elysia"
import { memberService } from "./service"
import {
  createCategorySchema,
  updatePersonTypeSchema,
  attachHouseholdSchema,
} from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const memberController = new Elysia({ prefix: "/members" })
  .get("/", async ({ query, headers, set }) => {
    try {
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const personType = query.personType as string | undefined
      const search = query.search as string | undefined

      const result = await memberService.getPaginatedMembers({
        page,
        pageSize,
        campusId,
        personType,
        search,
      })

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

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

  .get("/:id", async ({ params, set }) => {
    try {
      const data = await memberService.getMemberById(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/:id/household", async ({ params, body, set }) => {
    try {
      const parsed = attachHouseholdSchema.parse(body)
      const data = await memberService.attachHousehold(params.id, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .patch("/:id/person-type", async ({ params, body, set }) => {
    try {
      const parsed = updatePersonTypeSchema.parse(body)
      const data = await memberService.updatePersonType(params.id, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
