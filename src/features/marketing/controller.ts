import { Elysia } from "elysia"
import { ZodError } from "zod"
import { formatErrorResponse, ValidationError } from "@/lib/errors"
import { demoInterestSchema } from "./schemas"
import { marketingService } from "./service"

export const marketingController = new Elysia({ prefix: "/marketing" })
  .post("/interest", async ({ body, set }) => {
    try {
      const parsed = demoInterestSchema.parse(body)
      const data = await marketingService.submitInterest(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const normalized =
        error instanceof ZodError
          ? new ValidationError(error.issues[0]?.message || "Invalid request", error.flatten())
          : error
      const { status, body: errBody } = formatErrorResponse(normalized)
      set.status = status
      return errBody
    }
  })
