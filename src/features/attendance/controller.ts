import { Elysia } from "elysia"
import { attendanceService } from "./service"
import { sundayCheckinSchema, childKioskCheckinSchema } from "./schemas"
import { qrService } from "./qr-service"
import { formatErrorResponse } from "@/lib/errors"

export const attendanceController = new Elysia({ prefix: "/attendance" })
  /**
   * GET /api/attendance/qr-code - Generates scannable QR code for connection card
   */
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

  /**
   * POST /api/attendance/checkin - Sunday service check-in with automatic newcomer lead pipeline linkage
   */
  .post("/checkin", async ({ body, set }) => {
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

  /**
   * POST /api/attendance/child-checkin - Kids check-in with 4-character security pickup code
   */
  .post("/child-checkin", async ({ body, set }) => {
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
