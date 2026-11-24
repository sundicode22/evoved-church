import { Elysia } from "elysia"
import { reportsService } from "./service"
import { apiOk } from "@/lib/api-handler"

export const reportsController = new Elysia({ prefix: "/reports" })
  .get("/overview", ({ query, set }) =>
    apiOk(set, () => reportsService.overview(query.campusId as string | undefined))
  )
