import { Elysia } from "elysia"
import { announcementsService } from "./service"
import { createAnnouncementSchema, updateAnnouncementSchema } from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const announcementsController = new Elysia({ prefix: "/announcements" })
  .get("/", ({ set }) => apiOk(set, () => announcementsService.list()))
  .post("/", ({ body, set }) =>
    apiOk(set, () => announcementsService.create(createAnnouncementSchema.parse(body)), {
      status: 201,
    })
  )
  .patch("/:id", ({ params, body, set }) =>
    apiOk(set, () => announcementsService.update(params.id, updateAnnouncementSchema.parse(body)))
  )
  .post("/:id/publish", ({ params, set }) =>
    apiOk(set, () => announcementsService.publish(params.id))
  )
  .delete("/:id", ({ params, set }) =>
    apiOk(set, () => announcementsService.remove(params.id))
  )
