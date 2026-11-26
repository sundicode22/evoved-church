import { db } from "@/lib/db"
import {
  accountingFunds,
  attendanceSessions,
  givingContributions,
  journalEntries,
  members,
  visitorLeads,
} from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { auditService } from "@/features/audit/service"

export type ReportFormat = "csv" | "pdf" | "doc"

export type ReportDefinition = {
  id: string
  title: string
  description: string
  category: "People" | "Finances" | "Ministry" | "Compliance"
}

export const REPORT_CATALOG: ReportDefinition[] = [
  {
    id: "members",
    title: "Members directory",
    description: "All church members with contact, address, lifecycle, and household role.",
    category: "People",
  },
  {
    id: "giving",
    title: "Giving contributions",
    description: "Recorded and posted gifts with donor, fund, method, channel, and amount.",
    category: "Finances",
  },
  {
    id: "funds",
    title: "Fund balances",
    description: "Fund budget, expended, encumbered, and available balances by location.",
    category: "Finances",
  },
  {
    id: "ledger",
    title: "Ledger activity",
    description: "Journal entries with status, memo, and who created / posted them.",
    category: "Finances",
  },
  {
    id: "visitors",
    title: "Visitor pipeline",
    description: "Active visitor leads with stage, contact, and first-visit context.",
    category: "Ministry",
  },
  {
    id: "attendance",
    title: "Attendance sessions",
    description: "Service headcounts by session date with adult and child totals.",
    category: "Ministry",
  },
  {
    id: "audit",
    title: "Audit log",
    description: "Who did what, when — ledger posts, member changes, and other audited actions.",
    category: "Compliance",
  },
]

export type ReportPayload = {
  id: string
  title: string
  headers: string[]
  rows: (string | number)[][]
  generatedAt: string
}

export const reportsExportService = {
  catalog() {
    return REPORT_CATALOG
  },

  async run(reportId: string): Promise<ReportPayload> {
    const def = REPORT_CATALOG.find((r) => r.id === reportId)
    if (!def) throw new Error(`Unknown report: ${reportId}`)

    const generatedAt = new Date().toISOString()

    try {
    switch (reportId) {
      case "members": {
        const rows = await db.select().from(members).orderBy(desc(members.createdAt)).limit(2000)
        return {
          id: reportId,
          title: def.title,
          headers: [
            "First name",
            "Last name",
            "Preferred",
            "Email",
            "Phone",
            "Lifecycle",
            "Household role",
            "Address",
            "City",
            "State",
            "ZIP",
            "Gender",
            "Marital status",
            "Created",
          ],
          rows: rows.map((m) => [
            m.firstName,
            m.lastName,
            m.preferredName || "",
            m.email || "",
            m.phoneNumber || "",
            m.personType,
            m.householdRole || "",
            m.address || "",
            m.city || "",
            m.state || "",
            m.zipCode || "",
            m.gender || "",
            m.maritalStatus || "",
            m.createdAt.toISOString(),
          ]),
          generatedAt,
        }
      }
      case "giving": {
        const rows = await db
          .select({
            c: givingContributions,
            fundName: accountingFunds.name,
          })
          .from(givingContributions)
          .leftJoin(accountingFunds, eq(givingContributions.fundId, accountingFunds.id))
          .orderBy(desc(givingContributions.contributionDate))
          .limit(2000)
        return {
          id: reportId,
          title: def.title,
          headers: [
            "Date",
            "Donor",
            "Amount",
            "Fund",
            "Method",
            "Channel",
            "Frequency",
            "Status",
            "Reference",
          ],
          rows: rows.map(({ c, fundName }) => [
            c.contributionDate.toISOString().slice(0, 10),
            c.donorDisplayName || "",
            Number(c.amount),
            fundName || c.fundId,
            c.method,
            c.channel,
            c.frequency,
            c.status,
            c.transactionReference || "",
          ]),
          generatedAt,
        }
      }
      case "funds": {
        const rows = await db
          .select()
          .from(accountingFunds)
          .orderBy(desc(accountingFunds.updatedAt))
          .limit(500)
        return {
          id: reportId,
          title: def.title,
          headers: ["Name", "Code", "Balance", "Budget", "Expended", "Encumbered", "Available", "Active"],
          rows: rows.map((f) => {
            const balance = Number(f.balance || 0)
            const budget = Number(f.budgetAmount || 0)
            const expended = Number(f.expendedAmount || 0)
            const encumbered = Number(f.encumberedAmount || 0)
            return [
              f.name,
              f.code,
              balance,
              budget,
              expended,
              encumbered,
              balance - encumbered,
              f.isActive ? "yes" : "no",
            ]
          }),
          generatedAt,
        }
      }
      case "ledger": {
        const rows = await db
          .select()
          .from(journalEntries)
          .orderBy(desc(journalEntries.createdAt))
          .limit(1000)
        return {
          id: reportId,
          title: def.title,
          headers: [
            "Entry #",
            "Date",
            "Status",
            "Memo",
            "Created by",
            "Posted by",
            "Posted at",
          ],
          rows: rows.map((j) => [
            j.entryNumber,
            j.entryDate.toISOString().slice(0, 10),
            j.status,
            j.memo || "",
            j.createdByUserId,
            j.postedByUserId || "",
            j.postedAt?.toISOString() || "",
          ]),
          generatedAt,
        }
      }
      case "visitors": {
        const rows = await db
          .select()
          .from(visitorLeads)
          .orderBy(desc(visitorLeads.createdAt))
          .limit(2000)
        return {
          id: reportId,
          title: def.title,
          headers: ["Lead #", "Title", "Contact", "Stage", "Email", "Phone", "Source", "Created"],
          rows: rows.map((v) => [
            v.leadNumber,
            v.title,
            v.contactName,
            v.stage,
            v.contactEmail || "",
            v.contactPhone || "",
            v.source || "",
            v.createdAt.toISOString(),
          ]),
          generatedAt,
        }
      }
      case "attendance": {
        const rows = await db
          .select()
          .from(attendanceSessions)
          .orderBy(desc(attendanceSessions.sessionDate))
          .limit(1000)
        return {
          id: reportId,
          title: def.title,
          headers: ["Session", "Date", "Type", "Adults", "Children", "Total"],
          rows: rows.map((s) => [
            s.sessionName,
            s.sessionDate.toISOString().slice(0, 10),
            s.sessionType || "",
            s.headcountAdults,
            s.headcountChildren,
            s.headcountAdults + s.headcountChildren,
          ]),
          generatedAt,
        }
      }
      case "audit": {
        const rows = await auditService.list(500)
        return {
          id: reportId,
          title: def.title,
          headers: ["When", "Action", "Actor", "Entity", "Entity ID", "Summary"],
          rows: rows.map((r) => [
            r.createdAt,
            r.action,
            r.actorName || r.actorUserId || "",
            r.entityType,
            r.entityId || "",
            r.summary,
          ]),
          generatedAt,
        }
      }
      default:
        throw new Error(`Unknown report: ${reportId}`)
    }
    } catch (err) {
      console.error(`[reports.export.${reportId}]`, err)
      return {
        id: reportId,
        title: def.title,
        headers: ["Message"],
        rows: [["No data available yet for this report."]],
        generatedAt,
      }
    }
  },
}
