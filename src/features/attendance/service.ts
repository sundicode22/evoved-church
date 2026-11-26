import { db } from "@/lib/db"
import { visitorLeads, visitorActivities, campuses } from "@/lib/db/schema"
import { SundayCheckinInput, ChildKioskCheckinInput, type AttendanceSession } from "./schemas"
import { qrService } from "./qr-service"
import { emailService } from "@/features/communications/resend"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()
const sundayAt = (hour: number) => {
  const dt = new Date()
  const day = dt.getDay()
  const diff = day === 0 ? 0 : 7 - day
  dt.setDate(dt.getDate() + diff)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString()
}

const demoSessions: AttendanceSession[] = [
  {
    id: "sess-sunday-am",
    campusId: DEMO_CAMPUS,
    sessionName: "Sunday 10:00 AM Main Service",
    sessionDate: sundayAt(10),
    sessionType: "service",
    qrToken: "qr-sunday-am",
    checkinUrl: qrService.getCheckinUrl("sess-sunday-am"),
    headcountAdults: 312,
    headcountChildren: 48,
    createdAt: now(),
  },
  {
    id: "sess-sunday-kids",
    campusId: DEMO_CAMPUS,
    sessionName: "Kids Check-in — Sunday AM",
    sessionDate: sundayAt(9),
    sessionType: "kids",
    qrToken: "qr-kids-am",
    checkinUrl: qrService.getCheckinUrl("sess-sunday-kids"),
    headcountAdults: 0,
    headcountChildren: 48,
    createdAt: now(),
  },
  {
    id: "sess-midweek",
    campusId: DEMO_CAMPUS,
    sessionName: "Wednesday Prayer",
    sessionDate: (() => {
      const dt = new Date()
      const day = dt.getDay()
      const diff = (3 - day + 7) % 7
      dt.setDate(dt.getDate() + diff)
      dt.setHours(19, 0, 0, 0)
      return dt.toISOString()
    })(),
    sessionType: "service",
    qrToken: "qr-wed-prayer",
    checkinUrl: qrService.getCheckinUrl("sess-midweek"),
    headcountAdults: 64,
    headcountChildren: 8,
    createdAt: now(),
  },
]

export const attendanceService = {
  async listSessions(): Promise<AttendanceSession[]> {
    try {
      const { attendanceSessions } = await import("@/lib/db/schema")
      const { desc } = await import("drizzle-orm")
      const rows = await db
        .select()
        .from(attendanceSessions)
        .orderBy(desc(attendanceSessions.sessionDate))
        .limit(50)
      if (rows.length > 0) {
        return rows.map((row) => ({
          id: row.id,
          campusId: row.campusId,
          sessionName: row.sessionName,
          sessionDate: row.sessionDate.toISOString(),
          sessionType: (row.sessionType as AttendanceSession["sessionType"]) || "service",
          qrToken: row.qrToken,
          checkinUrl: qrService.getCheckinUrl(row.id),
          headcountAdults: row.headcountAdults,
          headcountChildren: row.headcountChildren,
          createdAt: row.createdAt.toISOString(),
        }))
      }
    } catch (err) {
      console.info("[attendance] listSessions falling back to demo", err)
    }
    return [...demoSessions].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
  },

  async createSession(input: {
    sessionName: string
    sessionDate: string
    sessionType: AttendanceSession["sessionType"]
    campusId?: string
  }): Promise<AttendanceSession> {
    const when = new Date(input.sessionDate)
    if (Number.isNaN(when.getTime())) {
      throw new Error("Invalid service day")
    }

    let campusId = input.campusId
    if (!campusId) {
      try {
        const defaultCampus = await db.select().from(campuses).limit(1)
        if (defaultCampus.length > 0) campusId = defaultCampus[0].id
      } catch {
        campusId = DEMO_CAMPUS
      }
    }
    if (!campusId) campusId = DEMO_CAMPUS

    const qrToken = `qr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

    try {
      const { attendanceSessions } = await import("@/lib/db/schema")
      const [row] = await db
        .insert(attendanceSessions)
        .values({
          campusId,
          sessionName: input.sessionName,
          sessionDate: when,
          sessionType: input.sessionType,
          qrToken,
        })
        .returning()

      return {
        id: row.id,
        campusId: row.campusId,
        sessionName: row.sessionName,
        sessionDate: row.sessionDate.toISOString(),
        sessionType: (row.sessionType as AttendanceSession["sessionType"]) || "service",
        qrToken: row.qrToken,
        checkinUrl: qrService.getCheckinUrl(row.id),
        headcountAdults: row.headcountAdults,
        headcountChildren: row.headcountChildren,
        createdAt: row.createdAt.toISOString(),
      }
    } catch (err) {
      console.info("[attendance] createSession demo fallback", err)
      const session: AttendanceSession = {
        id: `sess-${Date.now()}`,
        campusId,
        sessionName: input.sessionName,
        sessionDate: when.toISOString(),
        sessionType: input.sessionType,
        qrToken,
        checkinUrl: qrService.getCheckinUrl(`sess-${Date.now()}`),
        headcountAdults: 0,
        headcountChildren: 0,
        createdAt: now(),
      }
      demoSessions.unshift(session)
      return session
    }
  },

  /**
   * Processes a Sunday Service check-in.
   * If the person is marked as isFirstTimer = true, it automatically:
   * 1. Creates a visitor lead in the Kanban at 'first_visit' stage.
   * 2. Triggers the automated Welcome Drip email via Resend.
   * Falls back to demo response when DB is unavailable.
   */
  async processSundayCheckin(input: SundayCheckinInput) {
    try {
      let campusId = input.campusId
      if (!campusId) {
        const defaultCampus = await db.select().from(campuses).limit(1)
        if (defaultCampus.length > 0) campusId = defaultCampus[0].id
      }

      let visitorLeadId: string | null = null

      if (input.isFirstTimer && campusId) {
        const leadNumber = `#${Math.floor(100000 + Math.random() * 900000)}`
        const [lead] = await db
          .insert(visitorLeads)
          .values({
            leadNumber,
            campusId,
            title: `First Visit: ${input.fullName}`,
            location: "Sunday Sanctuary Service",
            contactName: input.fullName,
            contactEmail: input.email || null,
            contactPhone: input.phone || null,
            source: "Sunday Service Check-in",
            stage: "first_visit",
            tags: ["FIRST-TIMER", "SUNDAY CHECK-IN"],
            activeSequence: "Welcome Drip Sequence",
            nextDripAction: "Welcome email sent via Resend",
          })
          .returning()

        visitorLeadId = lead.id

        await db.insert(visitorActivities).values({
          leadId: lead.id,
          type: "sunday_checkin",
          title: "Checked In on Sunday",
          description: `${input.fullName} checked in for ${input.serviceName}.`,
        })

        if (input.email) {
          await emailService
            .sendWelcomeDrip({
              to: input.email,
              visitorName: input.fullName,
              churchName: "Grace City Church",
              pastorName: "Pastor David Johnson",
              nextSundayTime: "10:00 AM",
            })
            .catch((err) => console.error("[Attendance Welcome Drip Error]:", err))
        }
      }

      return {
        status: "checked_in",
        fullName: input.fullName,
        serviceName: input.serviceName,
        isFirstTimer: input.isFirstTimer,
        visitorLeadId,
        welcomeEmailQueued: Boolean(input.isFirstTimer && input.email),
        checkinTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    } catch (err) {
      console.info("[attendance:demo] DB unavailable, returning offline check-in", err)
      const session = demoSessions.find((s) => s.sessionType === "service")
      if (session) session.headcountAdults += 1
      return {
        status: "checked_in",
        fullName: input.fullName,
        serviceName: input.serviceName,
        isFirstTimer: input.isFirstTimer,
        visitorLeadId: input.isFirstTimer ? `demo-lead-${Date.now()}` : null,
        welcomeEmailQueued: Boolean(input.isFirstTimer && input.email),
        checkinTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        demo: true,
      }
    }
  },

  /**
   * Processes Child Check-in with high-security random pickup code & printable tag payload
   */
  async processChildCheckin(input: ChildKioskCheckinInput) {
    const pickupCode = qrService.generateChildSecurityCode()

    return {
      status: "child_checked_in",
      childName: input.childName,
      guardianName: input.guardianName,
      securityPickupCode: pickupCode,
      badgePrintPayload: {
        churchName: "Grace City Kids Ministry",
        childName: input.childName,
        childAge: input.childAge,
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        allergies: input.allergies || "No Known Allergies (Safe)",
        specialNotes: input.specialNotes || "None",
        pickupCode,
        checkedInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    }
  },
}
