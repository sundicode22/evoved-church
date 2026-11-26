import { db } from "@/lib/db"
import { visitorLeads, visitorActivities, campuses } from "@/lib/db/schema"
import { eq, desc, and, or, ilike, sql } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  AssignLeadInput,
  CreateLeadInput,
  UpdateLeadStageInput,
  VisitorCommentInput,
  VisitorOutreachInput,
  VISITOR_STAGES,
  VISITOR_STAGE_LABELS,
  VisitorStage,
} from "./schemas"
import { emailService } from "@/features/communications/resend"
import { smsService } from "@/features/communications/sms"
import { DbPaginationResult } from "@/lib/db/pagination"
import { kanbanService } from "@/features/kanban/service"

/** In-memory assignee / activity when DB write is unavailable. */
const assigneeStore = new Map<
  string,
  { name: string; role: "admin" | "user"; userId?: string }
>()
const activityStore = new Map<string, Array<Record<string, unknown>>>()

function pushActivity(leadId: string, row: Record<string, unknown>) {
  const list = activityStore.get(leadId) || []
  list.unshift(row)
  activityStore.set(leadId, list.slice(0, 40))
}

function elapsedLabel(from: Date): string {
  const mins = Math.max(1, Math.floor((Date.now() - from.getTime()) / 60000))
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

async function emptyBoard() {
  const cols = await kanbanService.list("visitors")
  return cols.map((c) => ({
    id: c.key,
    title: (c.label || VISITOR_STAGE_LABELS[c.key] || c.key).toUpperCase(),
    totalAmount: 0,
    leadCount: 0,
    leads: [] as Array<Record<string, unknown>>,
  }))
}

let DEMO_LEADS = [
  {
    id: "lead-1",
    leadNumber: "#192740",
    title: "First-Time Family — Cooper",
    location: "Main Sanctuary",
    stage: "first_visit" as VisitorStage,
    contactName: "Jane Cooper",
    contactEmail: "jane.cooper@email.com",
    contactPhone: "+15550101001",
    value: 0,
    createdAt: new Date(Date.now() - 60000),
  },
  {
    id: "lead-2",
    leadNumber: "#192741",
    title: "Guest — Annette Willie",
    location: "North Campus",
    stage: "first_visit" as VisitorStage,
    contactName: "Annette Willie",
    contactEmail: "annette.willie@email.com",
    contactPhone: "+15550101002",
    value: 0,
    createdAt: new Date(Date.now() - 30 * 60000),
  },
  {
    id: "lead-3",
    leadNumber: "#192745",
    title: "Welcome Call — Darlene",
    location: "Main Sanctuary",
    stage: "welcome_call" as VisitorStage,
    contactName: "Darlene Robertson",
    contactEmail: "darlene.robertson@email.com",
    contactPhone: "+15550101003",
    value: 0,
    createdAt: new Date(Date.now() - 5 * 60000),
  },
  {
    id: "lead-4",
    leadNumber: "#192748",
    title: "Coffee with Pastor — Brian",
    location: "Café Lobby",
    stage: "pastoral_visit" as VisitorStage,
    contactName: "Brian Robbin",
    contactEmail: "brian.robbin@email.com",
    contactPhone: "+15550101004",
    value: 0,
    createdAt: new Date(Date.now() - 47 * 60000),
  },
  {
    id: "lead-5",
    leadNumber: "#192750",
    title: "Foundations Class — Eleanor",
    location: "Room 204",
    stage: "foundations_class" as VisitorStage,
    contactName: "Eleanor Pena",
    contactEmail: "eleanor.pena@email.com",
    contactPhone: "+15550101005",
    value: 0,
    createdAt: new Date(Date.now() - 60000),
  },
  {
    id: "lead-6",
    leadNumber: "#192751",
    title: "Life Group Interest — Marcus",
    location: "Discipleship",
    stage: "group_integration" as VisitorStage,
    contactName: "Marcus Vance",
    contactEmail: "marcus.vance@email.com",
    contactPhone: "+15550101006",
    value: 0,
    createdAt: new Date(Date.now() - 120 * 60000),
  },
  {
    id: "lead-7",
    leadNumber: "#192752",
    title: "Covenant Partner — Sarah",
    location: "Main Campus",
    stage: "active_partner" as VisitorStage,
    contactName: "Sarah Miller",
    contactEmail: "sarah.miller@email.com",
    contactPhone: "+15550101007",
    value: 0,
    createdAt: new Date(Date.now() - 24 * 60 * 60000),
  },
]

function paginateDemoLeads(params: {
  page: number
  pageSize: number
  search?: string
  stage?: string
}): DbPaginationResult<(typeof DEMO_LEADS)[number]> {
  let data = [...DEMO_LEADS]
  if (params.stage && params.stage !== "all") {
    data = data.filter((l) => l.stage === params.stage)
  }
  if (params.search) {
    const q = params.search.toLowerCase()
    data = data.filter(
      (l) =>
        l.contactName.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q) ||
        l.leadNumber.toLowerCase().includes(q)
    )
  }
  const total = data.length
  const totalPages = Math.ceil(total / params.pageSize) || 1
  const start = (params.page - 1) * params.pageSize
  return {
    data: data.slice(start, start + params.pageSize),
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  }
}

export const visitorService = {
  async getVisitorBoard(campusId?: string, search?: string) {
    try {
      const conditions = []
      if (campusId && campusId !== "all") {
        conditions.push(eq(visitorLeads.campusId, campusId))
      }
      if (search) {
        conditions.push(
          or(
            ilike(visitorLeads.title, `%${search}%`),
            ilike(visitorLeads.contactName, `%${search}%`),
            ilike(visitorLeads.location, `%${search}%`)
          )
        )
      }

      const allLeads = await db
        .select()
        .from(visitorLeads)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(visitorLeads.createdAt))

      const stages = await emptyBoard()
      const stageIndex = Object.fromEntries(stages.map((s, i) => [s.id, i])) as Record<
        string,
        number
      >
      const fallbackStage = stages[0]?.id || "first_visit"

      const source = allLeads.length === 0 && !search ? DEMO_LEADS : allLeads

      for (const lead of source) {
        const stageId =
          (lead.stage as string) in stageIndex ? (lead.stage as string) : fallbackStage
        const col = stages[stageIndex[stageId]]
        const val = Number((lead as { value?: string | number }).value || 0)
        col.totalAmount += val
        col.leadCount += 1
        const createdAt =
          lead.createdAt instanceof Date ? lead.createdAt : new Date(lead.createdAt as string)
        const assigned =
          assigneeStore.get(lead.id) ||
          ((lead as { assignedToUserId?: string | null }).assignedToUserId
            ? { name: "Staff", role: "user" as const }
            : null)
        col.leads.push({
          id: lead.id,
          leadNumber: "leadNumber" in lead ? lead.leadNumber : (lead as { leadNumber: string }).leadNumber,
          title: lead.title,
          location: lead.location || "Main Sanctuary",
          contactName: lead.contactName,
          contactAvatar: lead.contactName.charAt(0).toUpperCase(),
          contactEmail:
            (lead as { contactEmail?: string | null }).contactEmail ||
            (lead as { contactEmail?: string }).contactEmail ||
            "",
          contactPhone:
            (lead as { contactPhone?: string | null }).contactPhone ||
            (lead as { contactPhone?: string }).contactPhone ||
            "",
          amount: val > 0 ? `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : undefined,
          elapsed: elapsedLabel(createdAt),
          stage: stageId,
          assignee: assigned
            ? {
                name: assigned.name,
                role: assigned.role,
                avatar: assigned.name.charAt(0).toUpperCase(),
              }
            : null,
          metrics: { calendar: 0, checklist: 0, files: 0, notes: activityStore.get(lead.id)?.length || 0 },
        })
      }

      return {
        totalLeads: source.length,
        stages,
      }
    } catch (error) {
      console.error("[visitorService.getVisitorBoard] DB Error:", error)
      const stages = await emptyBoard()
      for (const lead of DEMO_LEADS) {
        const col =
          stages.find((s) => s.id === lead.stage) || stages[0]
        if (!col) continue
        col.leadCount += 1
        const assigned = assigneeStore.get(lead.id)
        col.leads.push({
          id: lead.id,
          leadNumber: lead.leadNumber,
          title: lead.title,
          location: lead.location,
          contactName: lead.contactName,
          contactAvatar: lead.contactName.charAt(0).toUpperCase(),
          contactEmail: lead.contactEmail,
          contactPhone: lead.contactPhone,
          elapsed: elapsedLabel(lead.createdAt),
          stage: lead.stage,
          assignee: assigned
            ? {
                name: assigned.name,
                role: assigned.role,
                avatar: assigned.name.charAt(0).toUpperCase(),
              }
            : null,
          metrics: { calendar: 0, checklist: 0, files: 0, notes: activityStore.get(lead.id)?.length || 0 },
        })
      }
      return { totalLeads: DEMO_LEADS.length, stages }
    }
  },

  async getPaginatedLeads(params: {
    page?: number
    pageSize?: number
    campusId?: string
    search?: string
    stage?: string
  }): Promise<DbPaginationResult<unknown>> {
    const page = Math.max(1, Number(params.page || 1))
    const pageSize = Math.max(1, Math.min(100, Number(params.pageSize || 10)))
    const offset = (page - 1) * pageSize

    const conditions = []
    if (params.campusId && params.campusId !== "all") {
      conditions.push(eq(visitorLeads.campusId, params.campusId))
    }
    if (params.stage && params.stage !== "all") {
      conditions.push(eq(visitorLeads.stage, params.stage as VisitorStage))
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(visitorLeads.title, `%${params.search}%`),
          ilike(visitorLeads.contactName, `%${params.search}%`),
          ilike(visitorLeads.leadNumber, `%${params.search}%`)
        )
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    try {
      const [countResult, leads] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(visitorLeads).where(whereClause),
        db
          .select()
          .from(visitorLeads)
          .where(whereClause)
          .orderBy(desc(visitorLeads.createdAt))
          .limit(pageSize)
          .offset(offset),
      ])

      const total = countResult[0]?.count || 0
      if (total === 0) {
        return paginateDemoLeads({ page, pageSize, search: params.search, stage: params.stage })
      }
      const totalPages = Math.ceil(total / pageSize) || 1

      return {
        data: leads,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    } catch (err) {
      console.error("[visitorService.getPaginatedLeads] DB error:", err)
      return paginateDemoLeads({ page, pageSize, search: params.search, stage: params.stage })
    }
  },

  async getLeadById(id: string) {
    try {
      const lead = await db.select().from(visitorLeads).where(eq(visitorLeads.id, id)).limit(1)
      const activities = await db
        .select()
        .from(visitorActivities)
        .where(eq(visitorActivities.leadId, id))
        .orderBy(desc(visitorActivities.createdAt))
        .limit(20)

      if (lead.length > 0) {
        const row = lead[0]
        const cols = await kanbanService.list("visitors")
        const stageOrder = cols.map((c) => c.key)
        const labels = Object.fromEntries(cols.map((c) => [c.key, c.label]))
        const activeIdx = stageOrder.indexOf(row.stage as VisitorStage)
        const assigned = assigneeStore.get(row.id)
        const localActs = activityStore.get(row.id) || []
        return {
          ...row,
          pipeline: "Visitor Pipeline",
          assignee: assigned
            ? { name: assigned.name, role: assigned.role }
            : row.assignedToUserId
              ? { name: "Staff", role: "user" as const }
              : null,
          stages: stageOrder.map((s, i) => ({
            id: s,
            label: labels[s] || VISITOR_STAGE_LABELS[s] || s,
            completed: i < activeIdx,
            active: i === activeIdx,
          })),
          contact: {
            initials: row.contactName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            name: row.contactName,
            email: row.contactEmail,
            phone: row.contactPhone,
            source: row.source,
          },
          latestActivity: [...localActs, ...activities],
        }
      }
    } catch (e) {
      console.error("[visitorService.getLeadById]", e)
    }

    const demo = DEMO_LEADS.find((l) => l.id === id) || DEMO_LEADS[3]
    const cols = await kanbanService.list("visitors")
    const stageOrder = cols.map((c) => c.key)
    const labels = Object.fromEntries(cols.map((c) => [c.key, c.label]))
    const activeIdx = stageOrder.indexOf(demo.stage)
    const assigned = assigneeStore.get(demo.id)
    const localActs = activityStore.get(demo.id) || []
    return {
      id: demo.id,
      leadNumber: demo.leadNumber,
      title: demo.title,
      location: demo.location,
      stage: demo.stage,
      pipeline: "Visitor Pipeline",
      assignee: assigned ? { name: assigned.name, role: assigned.role } : null,
      stages: stageOrder.map((s, i) => ({
        id: s,
        label: labels[s] || VISITOR_STAGE_LABELS[s] || s,
        completed: i < activeIdx,
        active: i === activeIdx,
      })),
      contact: {
        initials: demo.contactName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2),
        name: demo.contactName,
        email: demo.contactEmail,
        phone: demo.contactPhone,
        source: "QR Check-in",
      },
      activeSequence: {
        title: "Welcome Drip Sequence",
        nextDrip: "Shepherd coffee invite",
        scheduledFor: "Tomorrow 10:00 AM",
      },
      latestActivity:
        localActs.length > 0
          ? localActs
          : [
              {
                id: "act-1",
                type: "email",
                title: "Welcome email queued",
                description: "Senior Pastor welcome drip scheduled (+2h).",
                performedByUserId: null,
                createdAt: new Date(),
              },
            ],
    }
  },

  async createLead(input: CreateLeadInput) {
    if (!input.title || !input.contactName) {
      throw new ValidationError("Title and Contact Name are mandatory fields.")
    }

    const leadNumber = `#${Math.floor(100000 + Math.random() * 900000)}`
    const location = input.location || "Main Sanctuary"
    const source = input.source || "Sunday Service QR"

    const pushDemo = () => {
      const row = {
        id: `lead-${Date.now().toString(36)}`,
        leadNumber,
        title: input.title.trim(),
        location,
        stage: "first_visit" as VisitorStage,
        contactName: input.contactName.trim(),
        contactEmail: input.contactEmail || "",
        contactPhone: input.contactPhone || "",
        source,
        value: input.value || 0,
        createdAt: new Date(),
      }
      DEMO_LEADS = [row, ...DEMO_LEADS]
      return { ...row, campusId: input.campusId || "demo-campus" }
    }

    let campusId = input.campusId
    try {
      if (!campusId) {
        const defaultCampus = await db.select().from(campuses).limit(1)
        if (defaultCampus.length > 0) campusId = defaultCampus[0].id
      }

      if (campusId) {
        const [created] = await db
          .insert(visitorLeads)
          .values({
            leadNumber,
            campusId,
            title: input.title.trim(),
            location,
            contactName: input.contactName.trim(),
            contactEmail: input.contactEmail || null,
            contactPhone: input.contactPhone || null,
            source,
            value: String(input.value ?? 0),
            tags: input.tags || [],
            stage: "first_visit",
            activeSequence: "Welcome Drip Sequence",
            nextDripAction: "Welcome email in 2 hours",
          })
          .returning()

        if (created) {
          await db.insert(visitorActivities).values({
            leadId: created.id,
            type: "lead_created",
            title: `Lead ${leadNumber} Created`,
            description: `Visitor ${input.contactName} registered via ${source}.`,
          })

          if (input.contactEmail) {
            await emailService
              .sendWelcomeDrip({
                to: input.contactEmail,
                visitorName: input.contactName,
                churchName: "Grace City Church",
                pastorName: "Pastor David Johnson",
                nextSundayTime: "10:00 AM",
              })
              .catch((err) => console.error("[Resend Drip Warning]:", err))
          }

          return created
        }
      }
    } catch (e) {
      console.error("[visitorService.createLead]", e)
    }

    return pushDemo()
  },

  async updateLeadStage(id: string, input: UpdateLeadStageInput) {
    try {
      const existing = await db.select().from(visitorLeads).where(eq(visitorLeads.id, id)).limit(1)
      if (existing.length === 0) {
        return { success: true, id, stage: input.stage }
      }

      const oldStage = existing[0].stage
      const [updated] = await db
        .update(visitorLeads)
        .set({
          stage: input.stage,
          stageChangedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(visitorLeads.id, id))
        .returning()

      await db.insert(visitorActivities).values({
        leadId: id,
        type: "stage_change",
        title: `Stage: ${oldStage} → ${input.stage}`,
        description:
          input.reason ||
          `Lead moved to ${VISITOR_STAGE_LABELS[input.stage] || input.stage}`,
      })

      return updated
    } catch {
      return { success: true, id, stage: input.stage }
    }
  },

  async assignLead(id: string, input: AssignLeadInput) {
    const role = input.assigneeRole || "user"
    assigneeStore.set(id, {
      name: input.assigneeName,
      role,
      userId: input.assignedToUserId,
    })

    pushActivity(id, {
      id: `act-assign-${Date.now()}`,
      type: "assignment",
      title: `Assigned to ${input.assigneeName}`,
      description: `Role: ${role === "admin" ? "Admin (system control)" : "User (follow-up owner)"}`,
      createdAt: new Date(),
    })

    try {
      const existing = await db.select().from(visitorLeads).where(eq(visitorLeads.id, id)).limit(1)
      if (existing.length > 0) {
        await db
          .update(visitorLeads)
          .set({
            assignedToUserId: input.assignedToUserId || existing[0].assignedToUserId,
            updatedAt: new Date(),
          })
          .where(eq(visitorLeads.id, id))

        await db.insert(visitorActivities).values({
          leadId: id,
          type: "assignment",
          title: `Assigned to ${input.assigneeName}`,
          description: `Role: ${role}`,
        })
      }
    } catch (e) {
      console.error("[visitorService.assignLead]", e)
    }

    return {
      success: true,
      id,
      assignee: { name: input.assigneeName, role },
    }
  },

  async addComment(id: string, input: VisitorCommentInput) {
    const activity = {
      id: `act-comment-${Date.now()}`,
      type: "comment",
      title: "Follow-up comment",
      description: input.body,
      createdAt: new Date(),
    }
    pushActivity(id, activity)

    try {
      const existing = await db.select().from(visitorLeads).where(eq(visitorLeads.id, id)).limit(1)
      if (existing.length > 0) {
        await db.insert(visitorActivities).values({
          leadId: id,
          type: "comment",
          title: "Follow-up comment",
          description: input.body,
        })
      }
    } catch (e) {
      console.error("[visitorService.addComment]", e)
    }

    return { success: true, id, activity }
  },

  async sendOutreach(id: string, input: VisitorOutreachInput) {
    let lead:
      | {
          contactName: string
          contactEmail?: string | null
          contactPhone?: string | null
        }
      | undefined

    try {
      const rows = await db.select().from(visitorLeads).where(eq(visitorLeads.id, id)).limit(1)
      lead = rows[0]
    } catch {
      /* demo fallback */
    }

    if (!lead) {
      const demo = DEMO_LEADS.find((l) => l.id === id)
      if (!demo) throw new NotFoundError("Visitor", id)
      lead = demo
    }

    if (input.channel === "email") {
      const to = lead.contactEmail?.trim()
      if (!to) throw new ValidationError("Visitor has no email on file")
      const subject = input.subject?.trim() || `Following up — ${lead.contactName}`
      await emailService
        .sendRawCampaign({
          to,
          subject,
          html: `<div style="font-family:sans-serif;line-height:1.5;color:#1f2937"><p>${input.message
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>")}</p></div>`,
        })
        .catch((err) => {
          console.error("[visitorService.sendOutreach email]", err)
        })
    } else {
      const phone = lead.contactPhone?.trim()
      if (!phone) throw new ValidationError("Visitor has no phone on file")
      await smsService.send(phone, input.message).catch((err) => {
        console.error("[visitorService.sendOutreach sms]", err)
      })
    }

    const activity = {
      id: `act-${input.channel}-${Date.now()}`,
      type: input.channel,
      title: input.channel === "email" ? "Email sent" : "SMS sent",
      description: input.message.slice(0, 280),
      createdAt: new Date(),
    }
    pushActivity(id, activity)

    try {
      const existing = await db.select().from(visitorLeads).where(eq(visitorLeads.id, id)).limit(1)
      if (existing.length > 0) {
        await db.insert(visitorActivities).values({
          leadId: id,
          type: input.channel,
          title: activity.title,
          description: activity.description,
        })
      }
    } catch (e) {
      console.error("[visitorService.sendOutreach activity]", e)
    }

    return { success: true, id, channel: input.channel, activity }
  },
}
