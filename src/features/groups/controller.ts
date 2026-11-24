import { Elysia } from "elysia"
import { groupsService } from "./service"
import { addMembershipSchema, createGroupSchema, updateGroupSchema } from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const groupsController = new Elysia({ prefix: "/groups" })
  .get("/", ({ set }) => apiOk(set, () => groupsService.list()))
  .get("/memberships", ({ query, set }) =>
    apiOk(set, () => groupsService.listMemberships(query.groupId as string | undefined))
  )
  .get("/:id", ({ params, set }) => apiOk(set, () => groupsService.getById(params.id)))
  .post("/", ({ body, set }) =>
    apiOk(set, () => groupsService.create(createGroupSchema.parse(body)), { status: 201 })
  )
  .patch("/:id", ({ params, body, set }) =>
    apiOk(set, () => groupsService.update(params.id, updateGroupSchema.parse(body)))
  )
  .delete("/:id", ({ params, set }) => apiOk(set, () => groupsService.remove(params.id)))
  .post("/:id/memberships", ({ params, body, set }) =>
    apiOk(set, () => groupsService.addMembership(params.id, addMembershipSchema.parse(body)), {
      status: 201,
    })
  )
