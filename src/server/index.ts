import { Elysia, t } from "elysia"
import { qrService } from "@/features/attendance/qr-service"

export const app = new Elysia({ prefix: "/api" })
  // Health check
  .get("/health", () => ({
    status: "ok",
    app: "Evolve Church Management API",
    timestamp: new Date().toISOString(),
  }))

  // Dynamic Nomenclature & Church Terms
  .group("/nomenclature", (nomApp) =>
    nomApp
      .get("/", () => ({
        churchName: "Evolve Church",
        memberTermSingular: "Member",
        memberTermPlural: "Members",
        visitorTermSingular: "First-Time Guest",
        visitorTermPlural: "First-Time Guests",
        groupTermSingular: "Small Group",
        groupTermPlural: "Small Groups",
        campusTermSingular: "Campus",
        campusTermPlural: "Campuses",
        pastorTermSingular: "Pastor",
        givingTerm: "Tithes & Offerings",
        currencyCode: "USD",
      }))
  )

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

  // People & Members (Explicit Separation)
  .group("/people", (peopleApp) =>
    peopleApp
      .get("/", ({ query }) => {
        const type = query.type || "all"
        return [
          {
            id: "mem-1",
            firstName: "David",
            lastName: "Johnson",
            personType: "staff_minister",
            recordedTitle: "Senior Pastor",
            ministryRoles: ["Preaching", "Board of Elders"],
            ordinationDate: "2010-06-15",
            ordinationCredentials: "Acts Assemblies Presbytery #4492",
            backgroundCheckStatus: "cleared",
            backgroundCheckExpiresAt: "2027-01-01",
            campus: "Main Campus",
          },
          {
            id: "mem-2",
            firstName: "Marcus",
            lastName: "Vance",
            personType: "staff_minister",
            recordedTitle: "Executive Pastor (Operations)",
            ministryRoles: ["Operations", "Finance Oversight"],
            ordinationDate: "2014-08-20",
            backgroundCheckStatus: "cleared",
            campus: "Main Campus",
          },
          {
            id: "mem-3",
            firstName: "Kathryn",
            lastName: "Murphy",
            personType: "leader",
            recordedTitle: "Deaconess & Life Group Leader",
            ministryRoles: ["Small Groups", "Hospitality"],
            sacraments: { baptismDate: "2018-04-12", confirmed: true },
            backgroundCheckStatus: "cleared",
            campus: "Main Campus",
          },
          {
            id: "mem-4",
            firstName: "Jane",
            lastName: "Cooper",
            personType: "prospect", // 2nd time visitor
            recordedTitle: null,
            ministryRoles: [],
            campus: "Main Campus",
            followUpStage: "Pastoral Coffee Scheduled",
          },
        ]
      })
  )

  // QR Code Check-in & Kiosks
  .group("/attendance", (attendApp) =>
    attendApp
      .get("/qr-connection-card", async ({ query }) => {
        const slug = (query.campusSlug as string) || "main-campus"
        const targetUrl = qrService.getConnectionCardUrl(slug)
        const qrCodeDataUrl = await qrService.generateDataUrl(targetUrl)
        return {
          targetUrl,
          qrCodeDataUrl,
          session: "Sunday Service Digital Connection",
        }
      })
      .post("/child-checkin", ({ body }) => {
        const pickupCode = qrService.generateChildSecurityCode()
        return {
          status: "checked_in",
          securityPickupCode: pickupCode,
          badgePrintPayload: {
            childName: "Noah Cooper",
            guardianName: "Jane Cooper",
            emergencyPhone: "(555) 234-5678",
            allergies: "Peanuts / Dairy",
            pickupCode,
            checkedInTime: new Date().toLocaleTimeString(),
          },
        }
      })
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

  // Dynamic Fund Accounting & Multi-Tier Expense Control
  .group("/accounting", (accApp) =>
    accApp
      .get("/funds", () => [
        { id: "fund-1", name: "General Operating Fund", type: "unrestricted", budget: 250000.0, balance: 145890.5 },
        { id: "fund-2", name: "Sanctuary Expansion Fund", type: "temporarily_restricted", budget: 500000.0, balance: 320400.0 },
        { id: "fund-3", name: "World Missions", type: "temporarily_restricted", budget: 75000.0, balance: 48900.0 },
        { id: "fund-4", name: "Benevolence / Community Care", type: "temporarily_restricted", budget: 30000.0, balance: 18250.0 },
      ])
      .get("/approval-rules", () => [
        { tierLevel: 1, minAmount: 0.0, maxAmount: 500.0, approver: "Department Head", description: "Standard supplies & local ministry needs" },
        { tierLevel: 2, minAmount: 500.01, maxAmount: 2500.0, approver: "Campus Pastor", description: "Campus equipment & guest speaker honorariums" },
        { tierLevel: 3, minAmount: 2500.01, maxAmount: 10000.0, approver: "Executive Pastor / Finance Director", description: "Major ministry contracts & technology upgrades" },
        { tierLevel: 4, minAmount: 10000.01, maxAmount: 1000000.0, approver: "Senior Pastor & Board of Trustees", description: "Capital expenditures & building renovations" },
      ])
      .get("/requisitions", () => [
        {
          id: "req-1",
          requisitionNumber: "REQ-2024-001",
          amount: 1450.0,
          vendor: "Sweetwater Sound",
          department: "Creative Arts & Worship",
          purpose: "Replacement Wireless In-Ear Monitors",
          status: "pending_tier_2",
          currentApprover: "Campus Pastor (Ahmad Fawaid)",
          fund: "General Operating Fund",
          receiptUrl: "https://res.cloudinary.com/evolve-church/receipts/req001.pdf",
        },
      ])
  )

  // Visitor CRM & Kanban Pipeline
  .group("/pipeline", (pipelineApp) =>
    pipelineApp
      .get("/deals", () => {
        return {
          projectedDeals: 32,
          projectedRevenue: 24598.0,
          stages: [
            {
              id: "prospection",
              title: "PROSPECTION",
              totalAmount: 6500.0,
              dealCount: 8,
              deals: [
                {
                  id: "deal-1",
                  dealNumber: "#192740",
                  title: "Plumbing Services",
                  location: "345 Park Ave S",
                  contactName: "Jane Cooper",
                  contactAvatar: "J",
                  amount: 860.0,
                  elapsed: "1m",
                  assignee: { name: "Ahmad Fawaid", avatar: "/avatars/ahmad.jpg" },
                  metrics: { calendar: 1, checklist: 2, files: 0, images: 1 },
                },
                {
                  id: "deal-2",
                  dealNumber: "#192741",
                  title: "Roofing Repairs",
                  location: "4517 Washington Ave",
                  contactName: "Annette Willie",
                  contactAvatar: "A",
                  amount: 1520.0,
                  elapsed: "30m",
                  assignee: { name: "Brian Robbin", avatar: "/avatars/brian.jpg" },
                  metrics: { calendar: 1, checklist: 2, files: 1, images: 0 },
                },
              ],
            },
            {
              id: "request_received",
              title: "REQUEST RECEIVED",
              totalAmount: 4290.0,
              dealCount: 5,
              deals: [
                {
                  id: "deal-6",
                  dealNumber: "#192745",
                  title: "Landscaping",
                  location: "26 Federal Plaza #3541",
                  contactName: "Darlene Robertson",
                  contactAvatar: "D",
                  amount: 1200.0,
                  elapsed: "5m",
                  assignee: { name: "Ahmad Fawaid", avatar: "/avatars/ahmad.jpg" },
                  metrics: { calendar: 3, checklist: 1, files: 0, images: 12 },
                },
              ],
            },
            {
              id: "proposal_sent",
              title: "PROPOSAL SENT",
              totalAmount: 7280.0,
              dealCount: 7,
              deals: [
                {
                  id: "deal-10",
                  dealNumber: "#192748",
                  title: "Paint & Drywall Repairs",
                  location: "2972 Washington Ave",
                  contactName: "Brian Robbin",
                  contactAvatar: "B",
                  amount: 2480.0,
                  elapsed: "47m",
                  assignee: { name: "Ahmad Fawaid", avatar: "/avatars/ahmad.jpg" },
                  metrics: { calendar: 1, checklist: 3, files: 1, images: 8 },
                },
              ],
            },
            {
              id: "proposal_accepted",
              title: "PROPOSAL ACCEPTED",
              totalAmount: 12920.0,
              dealCount: 12,
              deals: [
                {
                  id: "deal-11",
                  dealNumber: "#192750",
                  title: "Plumbing Services",
                  location: "2972 Westheimer Rd",
                  contactName: "Eleanor Pena",
                  contactAvatar: "E",
                  amount: 990.0,
                  elapsed: "1m",
                  assignee: { name: "Ahmad Fawaid", avatar: "/avatars/ahmad.jpg" },
                  metrics: { calendar: 0, checklist: 2, files: 0, images: 12 },
                },
              ],
            },
          ],
        }
      })
      .get("/deals/:id", ({ params }) => {
        return {
          id: params.id,
          dealNumber: "#192748",
          title: "Paint & Drywall Repairs",
          location: "2972 Washington Ave",
          stage: "proposal_sent",
          pipeline: "Deals Pipeline",
          stageDwellMinutes: 48,
          stages: [
            { id: "new_leads", label: "New Leads", completed: true },
            { id: "request_rec", label: "Request Rec...", completed: true },
            { id: "in_draft", label: "In Draft", completed: true },
            { id: "proposal_sent", label: "Proposal Sent", active: true },
            { id: "approved", label: "Approved", completed: false },
            { id: "rejected", label: "Rejected", completed: false },
          ],
          activeSequence: {
            title: "Proposals Sequence",
            nextDrip: "Follow up proposal",
            scheduledFor: "Tomorrow 12:39 PM",
          },
          contact: {
            initials: "BR",
            name: "Brian Robbin",
            email: "brianrobbin@gmail.com",
            phone: "(831) 522-5847",
            source: "LinkedIn",
          },
          salesperson: {
            name: "Ahmad Fawaid",
            avatar: "/avatars/ahmad.jpg",
          },
          amount: 2480.0,
          tags: ["HOT LEADS", "REPEAT"],
          latestActivity: [
            {
              id: "act-1",
              type: "email",
              title: "Email Delivered: Proposal Sent",
              description: "Proposal has been sent the message to the customer's email.",
              time: "Today 9:49 AM",
            },
            {
              id: "act-2",
              type: "stage_change",
              title: "Stage: Request Received → Proposal Sent",
              description: "Deal #192748 has been moved to the Proposal Sent stage.",
              time: "Today 9:48 AM",
            },
          ],
          appointments: [
            {
              id: "app-1",
              date: "Monday, January 19, 2024",
              time: "10 AM - 10:30 AM",
              title: "On-Site Estimate with Brian Robbin",
              location: "4517 Washington Ave, Manchester, KY 39495",
              staff: "Ahmad Fawaid",
            },
          ],
          proposals: [
            {
              id: "prop-1",
              code: "#192783",
              title: "Paint & Drywall Repairs",
              amount: 2480.0,
              status: "PENDING",
              sentDate: "Jan 18, 2024",
              acceptedDate: "-",
            },
          ],
        }
      })
  )

export type App = typeof app
