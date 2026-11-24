import { Elysia } from "elysia"
import { appointmentsService } from "./service"
import { createScheduleSchema, updateScheduleSchema } from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const appointmentsController = new Elysia({ prefix: "/appointments" })
  .get("/summary", ({ set }) => apiOk(set, () => appointmentsService.summary()))
  .get("/schedules", ({ set }) => apiOk(set, () => appointmentsService.listSchedules()))
  .post("/schedules", ({ body, set }) =>
    apiOk(set, () => appointmentsService.createSchedule(createScheduleSchema.parse(body)), {
      status: 201,
    })
  )
  .patch("/schedules/:id", ({ params, body, set }) =>
    apiOk(set, () =>
      appointmentsService.updateSchedule(params.id, updateScheduleSchema.parse(body))
    )
  )
  .get("/bookings", ({ set }) => apiOk(set, () => appointmentsService.listBookings()))
