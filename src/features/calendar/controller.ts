import { Elysia } from "elysia"
import { calendarService } from "./service"
import {
  createOccurrenceSchema,
  createProgramSchema,
  updateOccurrenceSchema,
} from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const calendarController = new Elysia({ prefix: "/calendar" })
  .get("/programs", async ({ set }) => {
    try {
      const data = await calendarService.listPrograms()
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/programs", async ({ body, set }) => {
    try {
      const parsed = createProgramSchema.parse(body)
      const data = await calendarService.createProgram(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .get("/occurrences", async ({ query, set }) => {
    try {
      const from = (query.from as string) || undefined
      const to = (query.to as string) || undefined
      const data = await calendarService.listOccurrences(from, to)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/occurrences", async ({ body, set }) => {
    try {
      const parsed = createOccurrenceSchema.parse(body)
      const data = await calendarService.createOccurrence(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .patch("/occurrences/:id", async ({ params, body, set }) => {
    try {
      const parsed = updateOccurrenceSchema.parse(body)
      const data = await calendarService.updateOccurrence(params.id, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .delete("/occurrences/:id", async ({ params, set }) => {
    try {
      await calendarService.deleteOccurrence(params.id)
      return { success: true }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
