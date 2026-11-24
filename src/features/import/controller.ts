import { Elysia } from "elysia"
import { importService } from "./service"
import {
  GIVING_CSV_HEADERS,
  MEMBER_CSV_HEADERS,
  importGivingBodySchema,
  importMembersBodySchema,
} from "./schemas"
import { formatErrorResponse } from "@/lib/errors"

export const importController = new Elysia({ prefix: "/import" })
  .get("/templates/members", () => ({
    success: true,
    data: {
      headers: MEMBER_CSV_HEADERS,
      csv: MEMBER_CSV_HEADERS.join(",") + "\nJane,Doe,jane@example.org,+15551212,Doe Household,mother\n",
    },
  }))

  .get("/templates/giving", () => ({
    success: true,
    data: {
      headers: GIVING_CSV_HEADERS,
      csv:
        GIVING_CSV_HEADERS.join(",") +
        "\njane@example.org,Jane Doe,50.00,GEN-100,2024-01-07,card,txn-1\n",
    },
  }))

  .get("/stats", () => ({
    success: true,
    data: importService.getImportedCounts(),
  }))

  .post("/members", async ({ body, set }) => {
    try {
      const parsed = importMembersBodySchema.parse(body)
      const data = await importService.importMembers(parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/giving", async ({ body, set }) => {
    try {
      const parsed = importGivingBodySchema.parse(body)
      const data = await importService.importGiving(parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
