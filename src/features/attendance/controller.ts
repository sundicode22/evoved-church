import { Elysia } from "elysia"
import { attendanceService } from "./service"
import { sundayCheckinSchema, childKioskCheckinSchema } from "./schemas"
import { qrService } from "./qr-service"
import { formatErrorResponse } from "@/lib/errors"

export const attendanceController = new Elysia({ prefix: "/attendance" })
  .get("/qr-code", async ({ query, set }) => {
    try {
      const slug = (query.campusSlug as string) || "main-campus"
      const targetUrl = qrService.getConnectionCardUrl(slug)
      const qrDataUrl = await qrService.generateDataUrl(targetUrl)
      return { success: true, data: { targetUrl, qrDataUrl } }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/check-ins", async ({ body, set }) => {
    try {
      const parsed = sundayCheckinSchema.parse(body)
      const result = await attendanceService.processSundayCheckin(parsed)
      set.status = 201
      return { success: true, data: result }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/child-check-ins", async ({ body, set }) => {
    try {
      const parsed = childKioskCheckinSchema.parse(body)
      const result = await attendanceService.processChildCheckin(parsed)
      set.status = 201
      return { success: true, data: result }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
