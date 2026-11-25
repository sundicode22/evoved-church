import { Elysia } from "elysia"
import { portalService } from "./service"
import { apiOk } from "@/lib/api-handler"
import {
  createNewsletterIssueSchema,
  newsletterSubscribeSchema,
  portalBlockTypeSchema,
  updatePortalBlockSchema,
  updatePortalFlagsSchema,
  updatePortalLayoutSchema,
  updatePortalThemeSchema,
} from "./schemas"

export const portalController = new Elysia({ prefix: "/portal" })
  .get("/", ({ set }) => apiOk(set, () => portalService.list()))
  .get("/newsletter/subscribers", ({ set }) =>
    apiOk(set, () => portalService.listSubscribers())
  )
  .delete("/newsletter/subscribers/:id", ({ params, set }) =>
    apiOk(set, () => portalService.deleteSubscriber(params.id))
  )
  .post("/newsletter/subscribers/:id/unsubscribe", ({ params, set }) =>
    apiOk(set, () => portalService.unsubscribe(params.id))
  )
  .get("/newsletter/issues", ({ set }) => apiOk(set, () => portalService.listIssues()))
  .post("/newsletter/issues", ({ body, set }) =>
    apiOk(set, () => portalService.createIssue(createNewsletterIssueSchema.parse(body)), {
      status: 201,
    })
  )
  .patch("/newsletter/issues/:id", ({ params, body, set }) =>
    apiOk(set, () =>
      portalService.updateIssue(params.id, createNewsletterIssueSchema.partial().parse(body))
    )
  )
  .delete("/newsletter/issues/:id", ({ params, set }) =>
    apiOk(set, () => portalService.deleteIssue(params.id))
  )
  .post("/newsletter/issues/:id/send", ({ params, set }) =>
    apiOk(set, () => portalService.sendIssue(params.id))
  )
  .get("/:slug", ({ params, set }) => apiOk(set, () => portalService.getBySlug(params.slug)))
  .patch("/:slug/layout", ({ params, body, set }) =>
    apiOk(set, () => portalService.updateLayout(params.slug, updatePortalLayoutSchema.parse(body)))
  )
  .patch("/:slug/theme", ({ params, body, set }) =>
    apiOk(set, () => portalService.updateTheme(params.slug, updatePortalThemeSchema.parse(body)))
  )
  .patch("/:slug/flags", ({ params, body, set }) =>
    apiOk(set, () => portalService.updateFlags(params.slug, updatePortalFlagsSchema.parse(body)))
  )
  .patch("/:slug/blocks/:blockId", ({ params, body, set }) =>
    apiOk(set, () =>
      portalService.updateBlock(
        params.slug,
        updatePortalBlockSchema.parse({ ...(body as object), id: params.blockId })
      )
    )
  )
  .post("/:slug/blocks", ({ params, body, set }) => {
    const type = portalBlockTypeSchema.parse((body as { type?: string })?.type)
    return apiOk(set, () => portalService.addBlock(params.slug, type), { status: 201 })
  })
  .delete("/:slug/blocks/:blockId", ({ params, set }) =>
    apiOk(set, () => portalService.removeBlock(params.slug, params.blockId))
  )
  .post("/:slug/activate-giving", ({ params, set }) =>
    apiOk(set, () => portalService.activateOnlineGiving(params.slug))
  )
  .post("/:slug/newsletter/subscribe", ({ params, body, set }) =>
    apiOk(
      set,
      () => portalService.subscribeNewsletter(params.slug, newsletterSubscribeSchema.parse(body)),
      { status: 201 }
    )
  )
