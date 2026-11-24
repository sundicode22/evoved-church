import { Elysia } from "elysia"
import { formsService } from "./service"
import { createFormSchema, submitFormSchema } from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const formsController = new Elysia({ prefix: "/forms" })
  .get("/", ({ set }) => apiOk(set, () => formsService.list()))
  .get("/by-slug/:slug", ({ params, set }) =>
    apiOk(set, () => formsService.getBySlug(params.slug))
  )
  .post("/by-slug/:slug/submit", ({ params, body, set }) =>
    apiOk(set, () => formsService.submit(params.slug, submitFormSchema.parse(body)), {
      status: 201,
    })
  )
  .get("/:id", ({ params, set }) => apiOk(set, () => formsService.getById(params.id)))
  .post("/", ({ body, set }) =>
    apiOk(set, () => formsService.create(createFormSchema.parse(body)), { status: 201 })
  )
  .post("/:id/publish", ({ params, set }) => apiOk(set, () => formsService.publish(params.id)))
