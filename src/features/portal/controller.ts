import { Elysia } from "elysia"
import { portalService } from "./service"
import { apiOk } from "@/lib/api-handler"

export const portalController = new Elysia({ prefix: "/portal" })
  .get("/", ({ set }) => apiOk(set, () => portalService.list()))
  .get("/:slug", ({ params, set }) => apiOk(set, () => portalService.getBySlug(params.slug)))
  .post("/:slug/activate-giving", ({ params, set }) =>
    apiOk(set, () => portalService.activateOnlineGiving(params.slug))
  )
