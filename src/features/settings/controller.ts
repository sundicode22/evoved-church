import { Elysia } from "elysia"
import { settingsService } from "./service"
import { rbacService } from "./rbac-service"
import { updateNomenclatureSchema, createCustomFieldSchema } from "./schemas"
import {
  createRoleSchema,
  updateRoleSchema,
  setRolePermissionsSchema,
  assignUserRoleSchema,
} from "./rbac-schemas"
import { formatErrorResponse } from "@/lib/errors"
import { getUserIdFromHeaders } from "@/features/auth/require-permission"

export const settingsController = new Elysia({ prefix: "/settings" })
  .get("/nomenclature", async ({ query, set }) => {
    try {
      const tenantId = (query.tenantId as string) || "default"
      const data = await settingsService.getNomenclature(tenantId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .patch("/nomenclature", async ({ body, query, set }) => {
    try {
      const tenantId = (query.tenantId as string) || "default"
      const parsed = updateNomenclatureSchema.parse(body)
      const data = await settingsService.updateNomenclature(tenantId, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .get("/custom-fields", async ({ query, set }) => {
    try {
      const tenantId = (query.tenantId as string) || "default"
      const entityType = query.entityType as string | undefined
      const data = await settingsService.listCustomFields(tenantId, entityType)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/custom-fields", async ({ body, query, set }) => {
    try {
      const tenantId = (query.tenantId as string) || "default"
      const parsed = createCustomFieldSchema.parse(body)
      const data = await settingsService.createCustomField(tenantId, parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  /** Current user's abilities — loaded from DB, never from cookies */
  .get("/abilities", async ({ headers, set }) => {
    try {
      const userId = getUserIdFromHeaders(headers) || "demo-admin"
      const data = await rbacService.getAbilityForUser(userId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .get("/permissions", async ({ set }) => {
    try {
      return { success: true, data: rbacService.listPermissionCatalog() }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .get("/roles", async ({ set }) => {
    try {
      const data = await rbacService.listRoles()
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/roles", async ({ body, set }) => {
    try {
      const parsed = createRoleSchema.parse(body)
      const data = await rbacService.createRole(parsed)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .patch("/roles/:id", async ({ params, body, set }) => {
    try {
      const parsed = updateRoleSchema.parse(body)
      const data = await rbacService.updateRole(params.id, parsed)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .put("/roles/:id/permissions", async ({ params, body, set }) => {
    try {
      const parsed = setRolePermissionsSchema.parse(body)
      const data = await rbacService.setRolePermissions(params.id, parsed.permissionKeys)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .delete("/roles/:id", async ({ params, set }) => {
    try {
      const data = await rbacService.deleteRole(params.id)
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .post("/users/:userId/roles", async ({ params, body, set }) => {
    try {
      const parsed = assignUserRoleSchema.parse(body)
      const data = await rbacService.assignUserRole(params.userId, parsed.roleId, parsed.campusId)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  /** Queue team invites from onboarding (email send is optional / Resend). */
  .post("/invites", async ({ body, set }) => {
    try {
      const emails = Array.isArray((body as { emails?: unknown })?.emails)
        ? ((body as { emails: unknown[] }).emails.filter(
            (e) => typeof e === "string" && e.includes("@")
          ) as string[])
        : []

      if (emails.length > 0 && process.env.RESEND_API_KEY) {
        try {
          const { emailService } = await import("@/features/communications/resend")
          for (const email of emails) {
            await emailService.sendRawCampaign({
              to: email,
              subject: "You're invited to Evolve ChMS",
              html: `<p>You've been invited to join your church workspace on Evolve.</p>`,
            })
          }
        } catch {
          /* soft-fail invite send */
        }
      }

      set.status = 201
      return {
        success: true,
        data: { queued: emails.length, emails },
      }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })

  .get("/onboarding", async ({ query, set }) => {
    try {
      const tenantId = (query.tenantId as string) || "default"
      const data = await settingsService.getOnboardingStatus(tenantId)
      return { success: true, data }
    } catch (error) {
      const { status, body } = formatErrorResponse(error)
      set.status = status
      return body
    }
  })

  .post("/onboarding/complete", async ({ query, set }) => {
    try {
      const tenantId = (query.tenantId as string) || "default"
      const data = await settingsService.completeOnboarding(tenantId)
      set.status = 201
      return { success: true, data }
    } catch (error) {
      const { status, body: errBody } = formatErrorResponse(error)
      set.status = status
      return errBody
    }
  })
