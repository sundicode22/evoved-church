import { and, asc, count, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  campuses,
  organizationMembers,
  saasPlans,
  tenantSubscriptions,
} from "@/lib/db/schema"
import { ValidationError, NotFoundError } from "@/lib/errors"
import { DEFAULT_TENANT_ID } from "./tenant-context"
import type { SaasPlan, SelectPlanInput, TenantSubscription } from "./schemas"

const DEMO_PLANS: SaasPlan[] = [
  {
    id: "plan-starter",
    slug: "starter",
    name: "Starter",
    description: "One location — members, visitors, forms, and attendance.",
    priceMonthlyCents: 0,
    currencyCode: "USD",
    maxLocations: 1,
    maxSeats: 3,
    features: [
      "Members & families",
      "Visitor CRM",
      "Forms + submissions",
      "Guest QR check-in",
      "1 location",
      "3 staff seats",
    ],
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "plan-growth",
    slug: "growth",
    name: "Growth",
    description: "Multi-location ops with campaigns and deeper reporting.",
    priceMonthlyCents: 4900,
    currencyCode: "USD",
    maxLocations: 3,
    maxSeats: 15,
    features: [
      "Everything in Starter",
      "Up to 3 locations",
      "15 staff seats",
      "Campaigns (email + SMS)",
      "Audit log & exports",
      "Priority support",
    ],
    isActive: true,
    sortOrder: 20,
  },
  {
    id: "plan-campus",
    slug: "campus",
    name: "Campus",
    description: "Church networks and multi-site teams with full fund accounting.",
    priceMonthlyCents: 12900,
    currencyCode: "USD",
    maxLocations: 50,
    maxSeats: 50,
    features: [
      "Everything in Growth",
      "Up to 50 locations",
      "50 staff seats",
      "Fund accounting & ledger",
      "Import / migration tools",
      "Dedicated onboarding",
    ],
    isActive: true,
    sortOrder: 30,
  },
]

function mapPlan(row: typeof saasPlans.$inferSelect): SaasPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || "",
    priceMonthlyCents: row.priceMonthlyCents,
    currencyCode: row.currencyCode,
    maxLocations: row.maxLocations,
    maxSeats: row.maxSeats,
    features: (row.features as string[]) || [],
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  }
}

async function usageForOrg(organizationId: string) {
  try {
    const [loc] = await db
      .select({ n: count() })
      .from(campuses)
      .where(eq(campuses.organizationId, organizationId))
    const [seat] = await db
      .select({ n: count() })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId))
    return {
      locations: Number(loc?.n || 0),
      seats: Number(seat?.n || 0),
    }
  } catch {
    return { locations: 0, seats: 0 }
  }
}

export const billingService = {
  async listPlans(): Promise<SaasPlan[]> {
    try {
      const rows = await db
        .select()
        .from(saasPlans)
        .where(eq(saasPlans.isActive, true))
        .orderBy(asc(saasPlans.sortOrder))
      if (rows.length) return rows.map(mapPlan)
    } catch (err) {
      console.info("[billing] listPlans demo fallback", err)
    }
    return DEMO_PLANS
  },

  async getSubscription(organizationId = DEFAULT_TENANT_ID): Promise<TenantSubscription> {
    const plans = await this.listPlans()
    const starter = plans.find((p) => p.slug === "starter") || plans[0]

    try {
      const [row] = await db
        .select()
        .from(tenantSubscriptions)
        .where(eq(tenantSubscriptions.organizationId, organizationId))
        .limit(1)

      if (row) {
        const [planRow] = await db
          .select()
          .from(saasPlans)
          .where(eq(saasPlans.id, row.planId))
          .limit(1)
        const plan = planRow ? mapPlan(planRow) : starter
        return {
          id: row.id,
          organizationId: row.organizationId,
          planId: row.planId,
          status: row.status,
          billingInterval: row.billingInterval,
          currentPeriodStart: row.currentPeriodStart?.toISOString() || null,
          currentPeriodEnd: row.currentPeriodEnd?.toISOString() || null,
          trialEndsAt: row.trialEndsAt?.toISOString() || null,
          plan,
          usage: await usageForOrg(organizationId),
        }
      }
    } catch (err) {
      console.info("[billing] getSubscription demo fallback", err)
    }

    return {
      id: `demo-sub-${organizationId}`,
      organizationId,
      planId: starter.id,
      status: "active",
      billingInterval: "month",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      trialEndsAt: null,
      plan: starter,
      usage: await usageForOrg(organizationId),
    }
  },

  async selectPlan(input: SelectPlanInput, organizationId: string): Promise<TenantSubscription> {
    const plans = await this.listPlans()
    const plan = plans.find((p) => p.slug === input.planSlug)
    if (!plan) throw new NotFoundError("Plan", input.planSlug)

    const orgId = input.organizationId?.trim() || organizationId || DEFAULT_TENANT_ID
    const usage = await usageForOrg(orgId)

    if (usage.locations > plan.maxLocations) {
      throw new ValidationError(
        `This plan allows ${plan.maxLocations} location(s). You currently have ${usage.locations}. Remove a location or pick a higher plan.`
      )
    }
    if (usage.seats > plan.maxSeats) {
      throw new ValidationError(
        `This plan allows ${plan.maxSeats} seat(s). You currently have ${usage.seats} team members.`
      )
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    try {
      const existing = await db
        .select()
        .from(tenantSubscriptions)
        .where(eq(tenantSubscriptions.organizationId, orgId))
        .limit(1)

      if (existing[0]) {
        await db
          .update(tenantSubscriptions)
          .set({
            planId: plan.id,
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            updatedAt: now,
            canceledAt: null,
          })
          .where(eq(tenantSubscriptions.id, existing[0].id))
      } else {
        await db.insert(tenantSubscriptions).values({
          organizationId: orgId,
          planId: plan.id,
          status: plan.priceMonthlyCents === 0 ? "active" : "trial",
          billingInterval: "month",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialEndsAt: plan.priceMonthlyCents === 0 ? null : periodEnd,
        })
      }
    } catch (err) {
      console.info("[billing] selectPlan demo write skipped", err)
    }

    return this.getSubscription(orgId)
  },

  async assertCanAddLocation(organizationId: string) {
    const sub = await this.getSubscription(organizationId)
    if (sub.usage.locations >= sub.plan.maxLocations) {
      throw new ValidationError(
        `Your ${sub.plan.name} plan allows ${sub.plan.maxLocations} location(s). Upgrade under Settings → Billing.`
      )
    }
  },
}
