import { Elysia } from "elysia"
import { visitorController } from "@/features/visitors/controller"
import { accountingController } from "@/features/accounting/controller"
import { attendanceController } from "@/features/attendance/controller"
import { memberController } from "@/features/members/controller"
import { campusController } from "@/features/campuses/controller"
import { organigramController } from "@/features/organigram/controller"
import { settingsController } from "@/features/settings/controller"
import { documentsController } from "@/features/documents/controller"
import { campaignsController } from "@/features/campaigns/controller"
import { projectsController } from "@/features/projects/controller"
import { policiesController } from "@/features/policies/controller"
import { servicesController } from "@/features/services/controller"
import { calendarController } from "@/features/calendar/controller"
import { importController } from "@/features/import/controller"
import { facilitiesController } from "@/features/facilities/controller"
import { appointmentsController } from "@/features/appointments/controller"
import { followUpsController } from "@/features/follow-ups/controller"
import { dripsController } from "@/features/drips/controller"
import { announcementsController } from "@/features/announcements/controller"
import { formsController } from "@/features/forms/controller"
import { kanbanController } from "@/features/kanban/controller"
import { givingController } from "@/features/giving/controller"
import { groupsController } from "@/features/groups/controller"
import { reportsController } from "@/features/reports/controller"
import { blogController } from "@/features/blog/controller"
import { billingController } from "@/features/billing/controller"
import { formatErrorResponse } from "@/lib/errors"

export const app = new Elysia({ prefix: "/api" })
  .onError(({ error, set }) => {
    const { status, body } = formatErrorResponse(error)
    set.status = status
    return body
  })

  .get("/health", () => ({
    status: "ok",
    app: "Evolve Church Management API",
    timestamp: new Date().toISOString(),
  }))

  .use(campusController)
  .use(organigramController)
  .use(visitorController)
  .use(accountingController)
  .use(attendanceController)
  .use(memberController)
  .use(settingsController)
  .use(documentsController)
  .use(campaignsController)
  .use(projectsController)
  .use(policiesController)
  .use(servicesController)
  .use(calendarController)
  .use(importController)
  .use(facilitiesController)
  .use(appointmentsController)
  .use(followUpsController)
  .use(dripsController)
  .use(announcementsController)
  .use(formsController)
  .use(kanbanController)
  .use(givingController)
  .use(groupsController)
  .use(reportsController)
  .use(blogController)
  .use(billingController)

export type App = typeof app
