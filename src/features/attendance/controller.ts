import { Elysia } from "elysia"
import { attendanceService } from "./service"
import {
  sundayCheckinSchema,
  childKioskCheckinSchema,
  createAttendanceSessionSchema,
} from "./schemas"
import { qrService } from "./qr-service"
import { formatErrorResponse } from "@/lib/errors"
import { campusIdFromHeaders } from "@/features/billing/tenant-context"

export const attendanceController = new Elysia({ prefix: "/attendance" })
  .get("/sessions", async ({ request, set }) => {
    try {
      const data = await attendanceService.listSessions(campusIdFromHeaders(request.headers))
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/sessions", async ({ request, body, set }) => {
    try {
      const parsed = createAttendanceSessionSchema.parse(body)
      const campusId = parsed.campusId || campusIdFromHeaders(request.headers) || undefined
      const data = await attendanceService.createSession({ ...parsed, campusId })
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

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
