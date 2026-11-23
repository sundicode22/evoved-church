import { Elysia, t } from "elysia"

export const app = new Elysia({ prefix: "/api" })
  // Health check
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

  // Visitor CRM & Kanban Pipeline (matching the screenshot schema)
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
                {
                  id: "deal-3",
                  dealNumber: "#192742",
                  title: "Paint & Drywall Repairs",
                  location: "255 Columbus Cir",
                  contactName: "Kathryn Murphy",
                  contactAvatar: "K",
                  amount: 2480.0,
                  elapsed: "2h",
                  assignee: { name: "Ahmad Fawaid", avatar: "/avatars/ahmad.jpg" },
                  metrics: { calendar: 1, checklist: 3, files: 1, images: 6 },
                },
                {
                  id: "deal-4",
                  dealNumber: "#192743",
                  title: "Cleaning",
                  location: "190 Beach 64th St",
                  contactName: "Bryan Smith",
                  contactAvatar: "B",
                  amount: 520.0,
                  elapsed: "5h",
                  assignee: { name: "Leslie Alexander", avatar: "/avatars/leslie.jpg" },
                  metrics: { calendar: 1, checklist: 2, files: 1, images: 8 },
                },
                {
                  id: "deal-5",
                  dealNumber: "#192744",
                  title: "Chimney Sweeps",
                  location: "8502 Preston St",
                  contactName: "Eleanor Pena",
                  contactAvatar: "E",
                  amount: 1250.0,
                  elapsed: "1d",
                  assignee: { name: "Guy Hawkins", avatar: "/avatars/guy.jpg" },
                  metrics: { calendar: 2, checklist: 1, files: 0, images: 2 },
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
                {
                  id: "deal-7",
                  dealNumber: "#192746",
                  title: "Kitchen Installation",
                  location: "1740 Madison Ave",
                  contactName: "Leslie Alexander",
                  contactAvatar: "L",
                  amount: 960.0,
                  elapsed: "23m",
                  assignee: { name: "Ahmad Fawaid", avatar: "/avatars/ahmad.jpg" },
                  metrics: { calendar: 1, checklist: 0, files: 1, images: 9 },
                },
                {
                  id: "deal-8",
                  dealNumber: "#192747",
                  title: "Backyard Cleaning",
                  location: "2118 Thornridge Cir",
                  contactName: "Ronald Richards",
                  contactAvatar: "R",
                  amount: 1120.0,
                  elapsed: "2h",
                  assignee: { name: "Brian Robbin", avatar: "/avatars/brian.jpg" },
                  metrics: { calendar: 1, checklist: 2, files: 1, images: 10 },
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
                  id: "deal-9",
                  dealNumber: "#192748",
                  title: "Roofing Repairs",
                  location: "110 William St",
                  contactName: "Jenny Wilson",
                  contactAvatar: "J",
                  amount: 1970.0,
                  elapsed: "3m",
                  assignee: { name: "Ahmad Fawaid", avatar: "/avatars/ahmad.jpg" },
                  metrics: { calendar: 1, checklist: 4, files: 1, images: 19 },
                },
                {
                  id: "deal-10",
                  dealNumber: "#192749",
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
                {
                  id: "deal-12",
                  dealNumber: "#192751",
                  title: "Roofing Repairs",
                  location: "58 Columbus Cir",
                  contactName: "Dianne Russel",
                  contactAvatar: "D",
                  amount: 1520.0,
                  elapsed: "1w",
                  assignee: { name: "Kathryn Murphy", avatar: "/avatars/kathryn.jpg" },
                  metrics: { calendar: 3, checklist: 1, files: 0, images: 8 },
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

  // Fund Accounting
  .group("/accounting", (accApp) =>
    accApp
      .get("/funds", () => [
        { id: "fund-1", name: "General Operating Fund", type: "unrestricted", balance: 145890.5 },
        { id: "fund-2", name: "Sanctuary Expansion Fund", type: "temporarily_restricted", balance: 320400.0 },
        { id: "fund-3", name: "World Missions", type: "temporarily_restricted", balance: 48900.0 },
        { id: "fund-4", name: "Benevolence / Community Care", type: "temporarily_restricted", balance: 18250.0 },
      ])
  )

export type App = typeof app
