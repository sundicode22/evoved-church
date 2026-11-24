import { Elysia } from "elysia"
import { blogService } from "./service"
import { createBlogPostSchema, updateBlogPostSchema } from "./schemas"
import { apiOk } from "@/lib/api-handler"

export const blogController = new Elysia({ prefix: "/blog" })
  .get("/", ({ set }) => apiOk(set, () => blogService.list()))
  .get("/published", ({ set }) => apiOk(set, () => blogService.listPublished()))
  .get("/published/:slug", ({ params, set }) =>
    apiOk(set, () => blogService.getPublishedBySlug(params.slug))
  )
  .get("/:id", ({ params, set }) => apiOk(set, () => blogService.getById(params.id)))
  .post("/", ({ body, set }) =>
    apiOk(set, () => blogService.create(createBlogPostSchema.parse(body)), { status: 201 })
  )
  .patch("/:id", ({ params, body, set }) =>
    apiOk(set, () => blogService.update(params.id, updateBlogPostSchema.parse(body)))
  )
  .post("/:id/publish", ({ params, set }) => apiOk(set, () => blogService.publish(params.id)))
  .delete("/:id", ({ params, set }) => apiOk(set, () => blogService.remove(params.id)))
