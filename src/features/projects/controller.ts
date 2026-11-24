import { Elysia } from "elysia"
import { projectService } from "./service"
import { createProjectCardSchema, updateProjectStageSchema } from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const projectsController = new Elysia({ prefix: "/projects" })
  .get("/board", async ({ set }) => {
    try {
      return { success: true, data: await projectService.getBoard() }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .patch("/:id/stage", async ({ params, body, set }) => {
    try {
      const parsed = updateProjectStageSchema.parse(body)
      return { success: true, data: await projectService.updateStage(params.id, parsed.stage) }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/", async ({ body, set }) => {
    try {
      const parsed = createProjectCardSchema.parse(body)
      const data = await projectService.create(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
