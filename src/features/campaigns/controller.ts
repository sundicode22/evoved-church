import { Elysia } from "elysia"
import { campaignService } from "./service"
import { createCampaignSchema, updateCampaignSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"
import { getUserIdFromHeaders } from "@/features/auth/require-permission"

export const campaignsController = new Elysia({ prefix: "/campaigns" })
  .get("/", async ({ set }) => {
    try {
      return { success: true, data: await campaignService.list() }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .get("/:id", async ({ params, set }) => {
    try {
      return { success: true, data: await campaignService.getById(params.id) }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/", async ({ body, headers, set }) => {
    try {
      const userId = getUserIdFromHeaders(headers)
      const parsed = createCampaignSchema.parse(body)
      const data = await campaignService.create(parsed, userId)
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
      const parsed = updateCampaignSchema.parse(body)
      return { success: true, data: await campaignService.update(params.id, parsed) }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/:id/send", async ({ params, set }) => {
    try {
      return { success: true, data: await campaignService.send(params.id) }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })
