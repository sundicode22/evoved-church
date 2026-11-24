import { db } from "@/lib/db"
import { visitorLeads, visitorActivities, campuses } from "@/lib/db/schema"
import { eq, desc, and, or, ilike, sql } from "drizzle-orm"
import { ValidationError } from "@/lib/errors"
import {
  CreateLeadInput,
  UpdateLeadStageInput,
  VISITOR_STAGES,
  VISITOR_STAGE_LABELS,
  VisitorStage,
} from "./schemas"
import { emailService } from "@/features/communications/resend"
import { DbPaginationResult } from "@/lib/db/pagination"

function elapsedLabel(from: Date): string {
  const mins = Math.max(1, Math.floor((Date.now() - from.getTime()) / 60000))
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function emptyBoard() {
  return VISITOR_STAGES.map((id) => ({
    id,
    title: VISITOR_STAGE_LABELS[id].toUpperCase(),
    totalAmount: 0,
    leadCount: 0,
    leads: [] as Array<Record<string, unknown>>,
  }))
}

const DEMO_LEADS = [
  {
    id: "lead-1",
    leadNumber: "#192740",
    title: "First-Time Family — Cooper",
    location: "Main Sanctuary",
    stage: "first_visit" as VisitorStage,
    contactName: "Jane Cooper",
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
    value: 0,
    createdAt: new Date(Date.now() - 24 * 60 * 60000),
  },
]

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

      const stages = emptyBoard()
      const stageIndex = Object.fromEntries(stages.map((s, i) => [s.id, i])) as Record<
        string,
        number
      >

      const source = allLeads.length === 0 && !search ? DEMO_LEADS : allLeads

      for (const lead of source) {
        const stageId = (lead.stage as string) in stageIndex ? (lead.stage as string) : "first_visit"
        const col = stages[stageIndex[stageId]]
        const val = Number((lead as { value?: string | number }).value || 0)
        col.totalAmount += val
        col.leadCount += 1
        const createdAt =
          lead.createdAt instanceof Date ? lead.createdAt : new Date(lead.createdAt as string)
        col.leads.push({
          id: lead.id,
          leadNumber: "leadNumber" in lead ? lead.leadNumber : (lead as { leadNumber: string }).leadNumber,
          title: lead.title,
          location: lead.location || "Main Sanctuary",
          contactName: lead.contactName,
          contactAvatar: lead.contactName.charAt(0).toUpperCase(),
          amount: val > 0 ? `$${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : undefined,
          elapsed: elapsedLabel(createdAt),
          stage: stageId,
          assignee: { name: "Pastor Ahmad", avatar: "/avatars/ahmad.jpg" },
          metrics: { calendar: 1, checklist: 2, files: 1, notes: 1 },
        })
      }

      return {
        totalLeads: source.length,
        stages,
      }
    } catch (error) {
      console.error("[visitorService.getVisitorBoard] DB Error:", error)
      const stages = emptyBoard()
      for (const lead of DEMO_LEADS) {
        const col = stages.find((s) => s.id === lead.stage)!
        col.leadCount += 1
        col.leads.push({
          id: lead.id,
          leadNumber: lead.leadNumber,
          title: lead.title,
          location: lead.location,
          contactName: lead.contactName,
          contactAvatar: lead.contactName.charAt(0).toUpperCase(),
          elapsed: elapsedLabel(lead.createdAt),
          stage: lead.stage,
          assignee: { name: "Pastor Ahmad", avatar: "/avatars/ahmad.jpg" },
          metrics: { calendar: 1, checklist: 2, files: 0, notes: 1 },
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
      return {
        data: [],
        pagination: { page, pageSize, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
      }
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
        const stageOrder = VISITOR_STAGES
        const activeIdx = stageOrder.indexOf(row.stage as VisitorStage)
        return {
          ...row,
          pipeline: "Visitor Pipeline",
          stages: stageOrder.map((s, i) => ({
            id: s,
            label: VISITOR_STAGE_LABELS[s],
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
          latestActivity: activities,
        }
      }
    } catch (e) {
      console.error("[visitorService.getLeadById]", e)
    }

    const demo = DEMO_LEADS.find((l) => l.id === id) || DEMO_LEADS[3]
    const activeIdx = VISITOR_STAGES.indexOf(demo.stage)
    return {
      id: demo.id,
      leadNumber: demo.leadNumber,
      title: demo.title,
      location: demo.location,
      stage: demo.stage,
      pipeline: "Visitor Pipeline",
      stages: VISITOR_STAGES.map((s, i) => ({
        id: s,
        label: VISITOR_STAGE_LABELS[s],
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
        email: `${demo.contactName.toLowerCase().replace(" ", ".")}@email.com`,
        phone: "(555) 010-2000",
        source: "QR Check-in",
      },
      activeSequence: {
        title: "Welcome Drip Sequence",
        nextDrip: "Shepherd coffee invite",
        scheduledFor: "Tomorrow 10:00 AM",
      },
      latestActivity: [
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

    let campusId = input.campusId
    if (!campusId) {
      const defaultCampus = await db.select().from(campuses).limit(1)
      if (defaultCampus.length > 0) campusId = defaultCampus[0].id
    }

    if (!campusId) {
      // Soft create for demo / no-DB environments
      return {
        id: `lead-${Date.now()}`,
        leadNumber,
        title: input.title,
        contactName: input.contactName,
        stage: "first_visit",
        campusId: "demo-campus",
      }
    }

    const [created] = await db
      .insert(visitorLeads)
      .values({
        leadNumber,
        campusId,
        title: input.title,
        location: input.location || "Main Sanctuary",
        contactName: input.contactName,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        source: input.source,
        value: input.value.toString(),
        tags: input.tags,
        stage: "first_visit",
        activeSequence: "Welcome Drip Sequence",
        nextDripAction: "Welcome email in 2 hours",
      })
      .returning()

    await db.insert(visitorActivities).values({
      leadId: created.id,
      type: "lead_created",
      title: `Lead ${leadNumber} Created`,
      description: `Visitor ${input.contactName} registered via ${input.source}.`,
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
        description: input.reason || `Lead moved to ${VISITOR_STAGE_LABELS[input.stage]}`,
      })

      return updated
    } catch {
      return { success: true, id, stage: input.stage }
    }
  },
}
