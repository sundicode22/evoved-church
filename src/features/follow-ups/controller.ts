import { Elysia } from "elysia"
import { followUpsService } from "./service"
import { createFollowUpSchema, updateFollowUpSchema } from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const followUpsController = new Elysia({ prefix: "/follow-ups" })
  .get("/", ({ set }) => apiOk(set, () => followUpsService.list()))
  .post("/", ({ body, set }) =>
    apiOk(set, () => followUpsService.create(createFollowUpSchema.parse(body)), { status: 201 })
  )
  .patch("/:id", ({ params, body, set }) =>
    apiOk(set, () => followUpsService.update(params.id, updateFollowUpSchema.parse(body)))
  )
