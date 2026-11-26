import { Elysia } from "elysia"
import { formsService } from "./service"
import {
  createFormSchema,
  formFieldSchema,
  reorderFormFieldsSchema,
  submitFormSchema,
} from "./schemas"
import { apiOk } from "@/lib/api-handler"
import { formatErrorResponse } from "@/lib/errors"

export const formsController = new Elysia({ prefix: "/forms" })
  .get("/", ({ set }) => apiOk(set, () => formsService.list()))
  .get("/visitor-intake", ({ set }) =>
    apiOk(set, () => formsService.ensureVisitorIntakeForm())
  )
  .get("/by-slug/:slug", ({ params, set }) =>
    apiOk(set, () => formsService.getBySlug(params.slug))
  )
  .post("/by-slug/:slug/submit", ({ params, body, set }) =>
    apiOk(set, () => formsService.submit(params.slug, submitFormSchema.parse(body)), {
      status: 201,
    })
  )
  .get("/:id", ({ params, set }) => apiOk(set, () => formsService.getById(params.id)))
  .get("/:id/submissions", async ({ params, set }) => {
    try {
      const data = await formsService.listSubmissions(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })
  .post("/", ({ body, set }) =>
    apiOk(set, () => formsService.create(createFormSchema.parse(body)), { status: 201 })
  )
  .post("/:id/fields", async ({ params, body, set }) => {
    try {
      const parsed = formFieldSchema.parse(body)
      const data = await formsService.addField(params.id, parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
  .delete("/:id/fields/:fieldId", async ({ params, set }) => {
    try {
      const data = await formsService.removeField(params.id, params.fieldId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })
  .post("/:id/fields/reorder", async ({ params, body, set }) => {
    try {
      const parsed = reorderFormFieldsSchema.parse(body)
      const data = await formsService.reorderFields(params.id, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
  .post("/:id/publish", ({ params, set }) => apiOk(set, () => formsService.publish(params.id)))
  .post("/:id/unpublish", ({ params, set }) => apiOk(set, () => formsService.unpublish(params.id)))
