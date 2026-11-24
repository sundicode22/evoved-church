import { accountingService } from "@/features/accounting/service"
import { givingService } from "@/features/giving/service"
import { visitorService } from "@/features/visitors/service"
import { attendanceService } from "@/features/attendance/service"
import { appointmentsService } from "@/features/appointments/service"

export type ReportsOverview = {
  funds: {
    count: number
    netAvailable: number
    totalBudget: number
    totalExpended: number
    utilizationPct: number | null
  }
  giving: {
    total: number
    inPerson: number
    online: number
    recurring: number
    recordedCount: number
    postedCount: number
  }
  visitors: {
    totalLeads: number
    stages: { id: string; title: string; count: number }[]
  }
  attendance: {
    sessionCount: number
    headcountAdults: number
    headcountChildren: number
  }
  appointments: {
    openSchedules: number
    upcomingBookings: number
    completedThisWeek: number
    closedSchedules: number
  }
  generatedAt: string
}

export const reportsService = {
  async overview(campusId?: string): Promise<ReportsOverview> {
    const [funds, giving, board, sessions, apptSummary] = await Promise.all([
      accountingService.getFunds(campusId),
      givingService.listContributions(),
      visitorService.getVisitorBoard(campusId).catch(() => null),
      attendanceService.listSessions().catch(() => [] as Awaited<ReturnType<typeof attendanceService.listSessions>>),
      appointmentsService.summary().catch(() => ({
        openSchedules: 0,
        upcomingBookings: 0,
        completedThisWeek: 0,
        closedSchedules: 0,
      })),
    ])

    const fundList = (funds as { balance?: number; encumberedAmount?: number; budgetAmount?: number; expendedAmount?: number }[]) || []
    const netAvailable = fundList.reduce(
      (s, f) => s + (Number(f.balance || 0) - Number(f.encumberedAmount || 0)),
      0
    )
    const totalBudget = fundList.reduce((s, f) => s + Number(f.budgetAmount || 0), 0)
    const totalExpended = fundList.reduce((s, f) => s + Number(f.expendedAmount || 0), 0)

    const summary = giving.summary
    const items = giving.items || []
    const postedCount = items.filter((c) => c.status === "posted_to_ledger").length
    const recordedCount = items.filter((c) => c.status === "recorded").length

    const stages =
      (board as { stages?: { id: string; title: string; leadCount?: number; leads?: unknown[] }[] })
        ?.stages || []
    const totalLeads =
      (board as { totalLeads?: number })?.totalLeads ??
      stages.reduce((s, st) => s + (st.leadCount || st.leads?.length || 0), 0)

    const sessionList = (sessions as { headcountAdults?: number; headcountChildren?: number }[]) || []
    const headcountAdults = sessionList.reduce((s, x) => s + Number(x.headcountAdults || 0), 0)
    const headcountChildren = sessionList.reduce((s, x) => s + Number(x.headcountChildren || 0), 0)

    return {
      funds: {
        count: fundList.length,
        netAvailable,
        totalBudget,
        totalExpended,
        utilizationPct: totalBudget ? Math.round((totalExpended / totalBudget) * 100) : null,
      },
      giving: {
        total: Number(summary?.total || 0),
        inPerson: Number(summary?.inPerson || 0),
        online: Number(summary?.online || 0),
        recurring: Number(summary?.recurring || 0),
        recordedCount,
        postedCount,
      },
      visitors: {
        totalLeads,
        stages: stages.map((s) => ({
          id: s.id,
          title: s.title,
          count: s.leadCount || s.leads?.length || 0,
        })),
      },
      attendance: {
        sessionCount: sessionList.length,
        headcountAdults,
        headcountChildren,
      },
      appointments: apptSummary as ReportsOverview["appointments"],
      generatedAt: new Date().toISOString(),
    }
  },
}
