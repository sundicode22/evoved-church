import { format, startOfWeek, subWeeks, parseISO, isValid } from "date-fns"
import { accountingService } from "@/features/accounting/service"
import { givingService } from "@/features/giving/service"
import { visitorService } from "@/features/visitors/service"
import { attendanceService } from "@/features/attendance/service"
import { appointmentsService } from "@/features/appointments/service"
import { memberService } from "@/features/members/service"
import { groupsService } from "@/features/groups/service"
import { projectService } from "@/features/projects/service"
import { campaignService } from "@/features/campaigns/service"
import { followUpsService } from "@/features/follow-ups/service"
import type { GivingContribution } from "@/features/giving/schemas"

export type CompareMetric = {
  current: number
  previous: number
  deltaPct: number | null
}

export type NamedValue = { name: string; value: number }

export type WeekPoint = {
  week: string
  label: string
  value: number
}

export type ReportsOverview = {
  funds: {
    count: number
    netAvailable: number
    totalBudget: number
    totalExpended: number
    utilizationPct: number | null
    rows: {
      name: string
      budget: number
      expended: number
      encumbered: number
      available: number
    }[]
  }
  giving: {
    total: number
    inPerson: number
    online: number
    recurring: number
    recordedCount: number
    postedCount: number
    donors90d: number
    recurringSharePct: number
    byWeek: { week: string; label: string; total: number; online: number; inPerson: number }[]
    byMethod: NamedValue[]
    byFund: NamedValue[]
    compare: { total: CompareMetric; donors: CompareMetric }
  }
  visitors: {
    totalLeads: number
    stages: { id: string; title: string; count: number }[]
  }
  attendance: {
    sessionCount: number
    headcountAdults: number
    headcountChildren: number
    rollingAvg: number
    byWeek: {
      week: string
      label: string
      adults: number
      children: number
      total: number
    }[]
    compare: CompareMetric
  }
  appointments: {
    openSchedules: number
    upcomingBookings: number
    completedThisWeek: number
    closedSchedules: number
  }
  members: {
    total: number
    households: number
    byLifecycle: NamedValue[]
  }
  groups: {
    total: number
    active: number
    members: number
  }
  projects: {
    total: number
    byStage: { id: string; title: string; count: number }[]
  }
  campaigns: {
    total: number
    sent: number
    draft: number
    scheduled: number
  }
  followUps: {
    open: number
    done: number
    overdue: number
  }
  generatedAt: string
}

function weekKey(d: Date) {
  return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd")
}

function weekLabel(key: string) {
  const d = parseISO(key)
  return isValid(d) ? format(d, "MMM d") : key
}

function lastNWeeks(n: number) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = startOfWeek(subWeeks(now, n - 1 - i), { weekStartsOn: 1 })
    const key = format(d, "yyyy-MM-dd")
    return { week: key, label: format(d, "MMM d") }
  })
}

function parseDate(value?: string | null) {
  if (!value) return null
  const d = parseISO(value)
  return isValid(d) ? d : null
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function compare(current: number, previous: number): CompareMetric {
  return { current, previous, deltaPct: deltaPct(current, previous) }
}

function inRange(d: Date, start: Date, end: Date) {
  return d >= start && d < end
}

export const reportsService = {
  async overview(campusId?: string): Promise<ReportsOverview> {
    const [
      funds,
      giving,
      board,
      sessions,
      apptSummary,
      membersPage,
      households,
      groups,
      projects,
      campaigns,
      followUps,
    ] = await Promise.all([
      accountingService.getFunds(campusId),
      givingService.listContributions(),
      visitorService.getVisitorBoard(campusId).catch(() => null),
      attendanceService
        .listSessions()
        .catch(() => [] as Awaited<ReturnType<typeof attendanceService.listSessions>>),
      appointmentsService.summary().catch(() => ({
        openSchedules: 0,
        upcomingBookings: 0,
        completedThisWeek: 0,
        closedSchedules: 0,
      })),
      memberService
        .getPaginatedMembers({ page: 1, pageSize: 100, campusId })
        .catch(() => ({ data: [] as any[], total: 0 })),
      memberService.listHouseholds().catch(() => [] as any[]),
      groupsService.list().catch(() => [] as any[]),
      projectService.getBoard().catch(() => ({ totalCards: 0, columns: [] as any[] })),
      campaignService.list().catch(() => [] as any[]),
      followUpsService.list().catch(() => [] as any[]),
    ])

    const fundList =
      (funds as {
        name?: string
        balance?: number
        encumberedAmount?: number
        budgetAmount?: number
        expendedAmount?: number
      }[]) || []
    const netAvailable = fundList.reduce(
      (s, f) => s + (Number(f.balance || 0) - Number(f.encumberedAmount || 0)),
      0
    )
    const totalBudget = fundList.reduce((s, f) => s + Number(f.budgetAmount || 0), 0)
    const totalExpended = fundList.reduce((s, f) => s + Number(f.expendedAmount || 0), 0)

    const contributions = (giving.contributions || []) as GivingContribution[]
    const summary = giving.summary
    const postedCount = contributions.filter((c) => c.status === "posted_to_ledger").length
    const recordedCount = contributions.filter((c) => c.status === "recorded").length

    const weeks = lastNWeeks(12)
    const givingByWeek = weeks.map(({ week, label }) => {
      const rows = contributions.filter((c) => {
        const d = parseDate(c.contributionDate)
        return d && weekKey(d) === week
      })
      return {
        week,
        label,
        total: rows.reduce((s, c) => s + Number(c.amount || 0), 0),
        online: rows
          .filter((c) => c.channel === "online")
          .reduce((s, c) => s + Number(c.amount || 0), 0),
        inPerson: rows
          .filter((c) => c.channel === "in_person")
          .reduce((s, c) => s + Number(c.amount || 0), 0),
      }
    })

    const now = new Date()
    const d90 = subWeeks(now, 13)
    const d180 = subWeeks(now, 26)
    const gifts90 = contributions.filter((c) => {
      const d = parseDate(c.contributionDate)
      return d && inRange(d, d90, now)
    })
    const giftsPrev90 = contributions.filter((c) => {
      const d = parseDate(c.contributionDate)
      return d && inRange(d, d180, d90)
    })
    const donors90 = new Set(gifts90.map((c) => c.donorDisplayName || c.memberId || c.id)).size
    const donorsPrev = new Set(
      giftsPrev90.map((c) => c.donorDisplayName || c.memberId || c.id)
    ).size
    const total90 = gifts90.reduce((s, c) => s + Number(c.amount || 0), 0)
    const totalPrev90 = giftsPrev90.reduce((s, c) => s + Number(c.amount || 0), 0)
    const recurring90 = gifts90
      .filter((c) => c.frequency !== "one_time")
      .reduce((s, c) => s + Number(c.amount || 0), 0)

    const methodMap = new Map<string, number>()
    for (const c of contributions) {
      const key = String(c.method || "other").replaceAll("_", " ")
      methodMap.set(key, (methodMap.get(key) || 0) + Number(c.amount || 0))
    }
    const fundMap = new Map<string, number>()
    for (const c of contributions) {
      const key = c.fundName || "Fund"
      fundMap.set(key, (fundMap.get(key) || 0) + Number(c.amount || 0))
    }

    const stages =
      (board as { stages?: { id: string; title: string; leadCount?: number; leads?: unknown[] }[] })
        ?.stages || []
    const totalLeads =
      (board as { totalLeads?: number })?.totalLeads ??
      stages.reduce((s, st) => s + (st.leadCount || st.leads?.length || 0), 0)

    const sessionList =
      (sessions as {
        sessionDate?: string
        headcountAdults?: number
        headcountChildren?: number
      }[]) || []
    const headcountAdults = sessionList.reduce((s, x) => s + Number(x.headcountAdults || 0), 0)
    const headcountChildren = sessionList.reduce(
      (s, x) => s + Number(x.headcountChildren || 0),
      0
    )

    const attendanceByWeek = weeks.map(({ week, label }) => {
      const rows = sessionList.filter((s) => {
        const d = parseDate(s.sessionDate)
        return d && weekKey(d) === week
      })
      const adults = rows.reduce((s, x) => s + Number(x.headcountAdults || 0), 0)
      const children = rows.reduce((s, x) => s + Number(x.headcountChildren || 0), 0)
      return { week, label, adults, children, total: adults + children }
    })
    const recent4 = attendanceByWeek.slice(-4).reduce((s, w) => s + w.total, 0)
    const prior4 = attendanceByWeek.slice(-8, -4).reduce((s, w) => s + w.total, 0)
    const rollingAvg =
      Math.round(
        (attendanceByWeek.slice(-8).reduce((s, w) => s + w.total, 0) /
          Math.max(1, Math.min(8, attendanceByWeek.filter((w) => w.total > 0).length || 1))) *
          10
      ) / 10

    const memberRows = (membersPage as { data?: any[]; total?: number })?.data || []
    const memberTotal =
      Number((membersPage as { total?: number })?.total) || memberRows.length
    const lifecycleMap = new Map<string, number>()
    for (const m of memberRows) {
      const key = String(m.personType || m.lifecycle || "member").replaceAll("_", " ")
      lifecycleMap.set(key, (lifecycleMap.get(key) || 0) + 1)
    }

    const groupList = (groups as { status?: string; memberCount?: number }[]) || []
    const projectBoard = projects as {
      totalCards?: number
      columns?: { id: string; title: string; cards?: unknown[] }[]
    }
    const campaignList = (campaigns as { status?: string }[]) || []
    const followUpList = (followUps as { status?: string; dueAt?: string | null }[]) || []
    const overdue = followUpList.filter(
      (f) => f.status === "open" && f.dueAt && new Date(f.dueAt) < now
    ).length

    return {
      funds: {
        count: fundList.length,
        netAvailable,
        totalBudget,
        totalExpended,
        utilizationPct: totalBudget ? Math.round((totalExpended / totalBudget) * 100) : null,
        rows: fundList.map((f) => ({
          name: f.name || "Fund",
          budget: Number(f.budgetAmount || 0),
          expended: Number(f.expendedAmount || 0),
          encumbered: Number(f.encumberedAmount || 0),
          available: Number(f.balance || 0) - Number(f.encumberedAmount || 0),
        })),
      },
      giving: {
        total: Number(summary?.total || 0),
        inPerson: Number(summary?.inPerson || 0),
        online: Number(summary?.online || 0),
        recurring: Number(summary?.recurring || 0),
        recordedCount,
        postedCount,
        donors90d: donors90,
        recurringSharePct: total90 ? Math.round((recurring90 / total90) * 100) : 0,
        byWeek: givingByWeek,
        byMethod: [...methodMap.entries()]
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        byFund: [...fundMap.entries()]
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6),
        compare: {
          total: compare(total90, totalPrev90),
          donors: compare(donors90, donorsPrev),
        },
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
        rollingAvg: Number.isFinite(rollingAvg) ? rollingAvg : 0,
        byWeek: attendanceByWeek,
        compare: compare(recent4, prior4),
      },
      appointments: apptSummary as ReportsOverview["appointments"],
      members: {
        total: memberTotal,
        households: (households as unknown[])?.length || 0,
        byLifecycle: [...lifecycleMap.entries()]
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
      },
      groups: {
        total: groupList.length,
        active: groupList.filter((g) => (g.status || "active") === "active").length,
        members: groupList.reduce((s, g) => s + Number(g.memberCount || 0), 0),
      },
      projects: {
        total: Number(projectBoard.totalCards || 0),
        byStage: (projectBoard.columns || []).map((c) => ({
          id: c.id,
          title: c.title,
          count: c.cards?.length || 0,
        })),
      },
      campaigns: {
        total: campaignList.length,
        sent: campaignList.filter((c) => c.status === "sent").length,
        draft: campaignList.filter((c) => c.status === "draft").length,
        scheduled: campaignList.filter((c) => c.status === "scheduled").length,
      },
      followUps: {
        open: followUpList.filter((f) => f.status === "open" || f.status === "in_progress")
          .length,
        done: followUpList.filter((f) => f.status === "done").length,
        overdue,
      },
      generatedAt: new Date().toISOString(),
    }
  },
}
