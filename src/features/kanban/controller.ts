import { Elysia } from "elysia"
import { apiOk } from "@/lib/api-handler"
import { formatErrorResponse } from "@/lib/errors"
import { kanbanService } from "./service"
import {
  createKanbanColumnSchema,
  kanbanBoardTypeSchema,
  reorderKanbanColumnsSchema,
  updateKanbanColumnSchema,
} from "./schemas"

export const kanbanController = new Elysia({ prefix: "/kanban" })
  .get("/columns/:boardType", ({ params, set }) =>
    apiOk(set, async () => {
      const boardType = kanbanBoardTypeSchema.parse(params.boardType)
      return kanbanService.list(boardType)
    })
  )
  .post("/columns", ({ body, set }) =>
    apiOk(set, () => kanbanService.create(createKanbanColumnSchema.parse(body)), {
      status: 201,
    })
  )
  .patch("/columns/:id", async ({ params, body, set }) => {
    try {
      const data = await kanbanService.update(params.id, updateKanbanColumnSchema.parse(body))
      return { success: true, data }
    } catch (error) {
      const { status, body: err } = formatErrorResponse(error)
      set.status = status
      return err
    }
  })
  .post("/columns/reorder", ({ body, set }) =>
    apiOk(set, () => kanbanService.reorder(reorderKanbanColumnsSchema.parse(body)))
  )
  .delete("/columns/:id", async ({ params, query, set }) => {
    try {
      const moveTo =
        typeof query.moveTo === "string" && query.moveTo ? query.moveTo : undefined
      const data = await kanbanService.remove(params.id, moveTo)
      return { success: true, data }
    } catch (error) {
      const { status, body: err } = formatErrorResponse(error)
      set.status = status
      return err
    }
  })
