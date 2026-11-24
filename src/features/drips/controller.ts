import { Elysia } from "elysia"
import { dripsService } from "./service"
import { createSequenceSchema, createStepSchema, updateSequenceSchema } from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const dripsController = new Elysia({ prefix: "/drips" })
  .get("/", ({ set }) => apiOk(set, () => dripsService.list()))
  .get("/:id", ({ params, set }) => apiOk(set, () => dripsService.getById(params.id)))
  .post("/", ({ body, set }) =>
    apiOk(set, () => dripsService.create(createSequenceSchema.parse(body)), { status: 201 })
  )
  .patch("/:id", ({ params, body, set }) =>
    apiOk(set, () => dripsService.update(params.id, updateSequenceSchema.parse(body)))
  )
  .post("/:id/steps", ({ params, body, set }) =>
    apiOk(
      set,
      () =>
        dripsService.addStep(createStepSchema.parse({ ...(body as object), sequenceId: params.id })),
      { status: 201 }
    )
  )
