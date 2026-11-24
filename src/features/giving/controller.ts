import { Elysia } from "elysia"
import { givingService } from "./service"
import {
  createBatchSchema,
  createContributionSchema,
  createPledgeSchema,
  postContributionSchema,
  updateBatchSchema,
  updatePledgeSchema,
} from "./schemas"
import { apiOk } from "@/lib/api-handler"
import { getUserIdFromHeaders } from "@/features/auth/require-permission"

export const givingController = new Elysia({ prefix: "/giving" })
  .get("/contributions", ({ set }) => apiOk(set, () => givingService.listContributions()))

  .post("/contributions", ({ body, set }) =>
    apiOk(set, () => givingService.createContribution(createContributionSchema.parse(body)), {
      status: 201,
    })
  )

  .post("/contributions/:id/post", ({ params, body, headers, set }) =>
    apiOk(set, async () => {
      const parsed = postContributionSchema.parse(
        body && typeof body === "object" && Object.keys(body as object).length
          ? body
          : { postedByUserId: getUserIdFromHeaders(headers) || "demo-user" }
      )
      return givingService.postContributionToBooks(params.id, parsed.postedByUserId)
    })
  )

  .get("/batches", ({ set }) => apiOk(set, () => givingService.listBatches()))

  .post("/batches", ({ body, headers, set }) =>
    apiOk(
      set,
      () => givingService.createBatch(createBatchSchema.parse(body), getUserIdFromHeaders(headers)),
      { status: 201 }
    )
  )

  .patch("/batches/:id", ({ params, body, set }) =>
    apiOk(set, () => givingService.updateBatch(params.id, updateBatchSchema.parse(body)))
  )

  .delete("/batches/:id", ({ params, set }) =>
    apiOk(set, () => givingService.deleteBatch(params.id))
  )

  .get("/pledges", ({ set }) => apiOk(set, () => givingService.listPledges()))

  .post("/pledges", ({ body, set }) =>
    apiOk(set, () => givingService.createPledge(createPledgeSchema.parse(body)), { status: 201 })
  )

  .patch("/pledges/:id", ({ params, body, set }) =>
    apiOk(set, () => givingService.updatePledge(params.id, updatePledgeSchema.parse(body)))
  )

  .delete("/pledges/:id", ({ params, set }) =>
    apiOk(set, () => givingService.deletePledge(params.id))
  )
