import { Elysia } from "elysia"
import { documentsService } from "./service"
import { createFolderSchema, createDocumentSchema, signUploadSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const documentsController = new Elysia({ prefix: "/documents" })
  .get("/folders", async ({ query, headers, set }) => {
    try {
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const data = await documentsService.listFolders(campusId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/folders", async ({ body, set }) => {
    try {
      const parsed = createFolderSchema.parse(body)
      const data = await documentsService.createFolder(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .get("/", async ({ query, headers, set }) => {
    try {
      const campusId = (query.campusId as string) || (headers["x-campus-id"] as string)
      const data = await documentsService.listDocuments(query.folderId as string | undefined, campusId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/", async ({ body, set }) => {
    try {
      const parsed = createDocumentSchema.parse(body)
      const data = await documentsService.createDocument(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/sign-upload", async ({ body, set }) => {
    try {
      const parsed = signUploadSchema.parse(body ?? {})
      const data = await documentsService.signUpload(parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
