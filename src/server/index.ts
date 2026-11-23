import { Elysia } from "elysia"
import { visitorController } from "@/features/visitors/controller"
import { accountingController } from "@/features/accounting/controller"
import { attendanceController } from "@/features/attendance/controller"
import { memberController } from "@/features/members/controller"
import { formatErrorResponse } from "@/lib/errors"

export const app = new Elysia({ prefix: "/api" })
  // Centralized Error Handler
  .onError(({ error, set }) => {
    const { status, body } = formatErrorResponse(error)
    set.status = status
    return body
  })

  // Global Health check
  .get("/health", () => ({
    status: "ok",
    app: "Evolve Church Management API",
    timestamp: new Date().toISOString(),
  }))

  // Campuses / Multi-Branch
  .group("/campuses", (campusesApp) =>
    campusesApp
      .get("/", () => [
        {
          id: "1",
          name: "Grace City - Main Campus",
          slug: "main-campus",
          type: "main",
          city: "Atlanta",
          isMainCampus: true,
        },
        {
          id: "2",
          name: "Grace City - North Campus",
          slug: "north-campus",
          type: "regional",
          city: "Alpharetta",
          isMainCampus: false,
        },
        {
          id: "3",
          name: "Grace City - Online Global",
          slug: "online-global",
          type: "online",
          city: "Digital Hub",
          isMainCampus: false,
        },
      ])
  )

  // Organigram / Structure
  .group("/organigram", (orgApp) =>
    orgApp
      .get("/tree", ({ query }) => {
        return {
          campusId: query.campusId || "all",
          nodes: [
            {
              id: "node-1",
              title: "Senior Pastor",
              department: "Executive Leadership",
              name: "Pastor David Johnson",
              parentId: null,
              spanOfCare: 1420,
            },
            {
              id: "node-2",
              title: "Executive Pastor (Operations)",
              department: "Executive Leadership",
              name: "Rev. Marcus Vance",
              parentId: "node-1",
              spanOfCare: 680,
            },
            {
              id: "node-3",
              title: "Campus Pastor (Main)",
              department: "Pastoral Care",
              name: "Ahmad Fawaid",
              parentId: "node-2",
              spanOfCare: 450,
            },
            {
              id: "node-4",
              title: "Worship & Creative Arts Director",
              department: "Creative Arts",
              name: "Sarah Miller",
              parentId: "node-3",
              spanOfCare: 45,
            },
            {
              id: "node-5",
              title: "Life Group Coordinator",
              department: "Discipleship",
              name: "Kathryn Murphy",
              parentId: "node-3",
              spanOfCare: 180,
            },
          ],
        }
      })
  )

  // Feature Controllers Mounted
  .use(visitorController)
  .use(accountingController)
  .use(attendanceController)
  .use(memberController)

export type App = typeof app
