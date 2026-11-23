import { db } from "@/lib/db"
import { attendanceSessions, visitorLeads, visitorActivities, members, campuses } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { SundayCheckinInput, ChildKioskCheckinInput } from "./schemas"
import { qrService } from "./qr-service"
import { emailService } from "@/features/communications/resend"

export const attendanceService = {
  /**
   * Processes a Sunday Service check-in.
   * If the person is marked as isFirstTimer = true, it automatically:
   * 1. Creates a visitor lead in the Kanban pipeline in 'new_leads' stage.
   * 2. Triggers the automated Welcome Drip email via Resend.
   */
  async processSundayCheckin(input: SundayCheckinInput) {
    let campusId = input.campusId
    if (!campusId) {
      const defaultCampus = await db.select().from(campuses).limit(1)
      if (defaultCampus.length > 0) campusId = defaultCampus[0].id
    }

    let visitorLeadId: string | null = null

    // If marked as first-timer, automatically link into Kanban CRM pipeline
    if (input.isFirstTimer && campusId) {
      const dealNumber = `#${Math.floor(100000 + Math.random() * 900000)}`
      const [lead] = await db
        .insert(visitorLeads)
        .values({
          dealNumber,
          campusId,
          title: `First Visit: ${input.fullName}`,
          location: "Sunday Sanctuary Service",
          contactName: input.fullName,
          contactEmail: input.email || null,
          contactPhone: input.phone || null,
          source: "Sunday Service Check-in",
          stage: "new_leads",
          tags: ["HOT LEADS", "FIRST-TIMER", "SUNDAY CHECK-IN"],
          activeSequence: "Welcome Drip Sequence",
          nextDripAction: "Welcome email sent via Resend",
        })
        .returning()

      visitorLeadId = lead.id

      // Log activity
      await db.insert(visitorActivities).values({
        leadId: lead.id,
        type: "sunday_checkin",
        title: "Checked In on Sunday",
        description: `${input.fullName} checked in for ${input.serviceName}.`,
      })

      // Send automated Welcome Drip Email via Resend
      if (input.email) {
        await emailService.sendWelcomeDrip({
          to: input.email,
          visitorName: input.fullName,
          churchName: "Grace City Church",
          pastorName: "Pastor David Johnson",
          nextSundayTime: "10:00 AM",
        }).catch((err) => console.error("[Attendance Welcome Drip Error]:", err))
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
