import { Elysia } from "elysia"
import { facilitiesService } from "./service"
import {
  createResourceSchema,
  createRoomSchema,
  updateResourceSchema,
  updateRoomSchema,
} from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const facilitiesController = new Elysia({ prefix: "/facilities" })
  .get("/rooms", ({ set }) => apiOk(set, () => facilitiesService.listRooms()))
  .post("/rooms", ({ body, set }) =>
    apiOk(set, () => facilitiesService.createRoom(createRoomSchema.parse(body)), { status: 201 })
  )
  .patch("/rooms/:id", ({ params, body, set }) =>
    apiOk(set, () => facilitiesService.updateRoom(params.id, updateRoomSchema.parse(body)))
  )
  .get("/resources", ({ set }) => apiOk(set, () => facilitiesService.listResources()))
  .post("/resources", ({ body, set }) =>
    apiOk(set, () => facilitiesService.createResource(createResourceSchema.parse(body)), {
      status: 201,
    })
  )
  .patch("/resources/:id", ({ params, body, set }) =>
    apiOk(set, () => facilitiesService.updateResource(params.id, updateResourceSchema.parse(body)))
  )
