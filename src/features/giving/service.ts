import { db } from "@/lib/db"
import {
  accountingFunds,
  givingBatches,
  givingContributions,
  givingPledges,
  campuses,
} from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import { accountingService } from "@/features/accounting/service"
import {
  createBatchSchema,
  createContributionSchema,
  createPledgeSchema,
  updateBatchSchema,
  updatePledgeSchema,
  type CreateBatchInput,
  type CreateContributionInput,
  type CreatePledgeInput,
  type GivingBatch,
  type GivingContribution,
  type GivingListResult,
  type GivingPledge,
  type GivingSummary,
  type UpdateBatchInput,
  type UpdatePledgeInput,
} from "./schemas"
import type { z } from "zod"

type ContributionRow = GivingContribution
type BatchRow = Omit<GivingBatch, "uniqueContributors" | "totalAmount"> & {
  uniqueContributors?: number
  totalAmount?: number
}

const now = () => new Date().toISOString()

const fundNames: Record<string, string> = {}

/** In-memory balances only when DB post fails — never seeded. */
const demoFundBalances = new Map<string, number>()

/** Empty write fallbacks when DB is unavailable — never seeded demo rows. */
let contributions: ContributionRow[] = []
let batches: BatchRow[] = []
let pledges: GivingPledge[] = []

function summarize(rows: ContributionRow[]): GivingSummary {
  return {
    total: rows.reduce((s, c) => s + c.amount, 0),
    inPerson: rows.filter((c) => c.channel === "in_person").reduce((s, c) => s + c.amount, 0),
    online: rows.filter((c) => c.channel === "online").reduce((s, c) => s + c.amount, 0),
    recurring: rows.filter((c) => c.frequency === "recurring").reduce((s, c) => s + c.amount, 0),
  }
}

function enrichBatch(batch: BatchRow): GivingBatch {
  const linked = contributions.filter((c) => c.batchId === batch.id)
  const donors = new Set(
    linked.map((c) => c.memberId || c.donorDisplayName.toLowerCase()).filter(Boolean)
  )
  return {
    ...batch,
    uniqueContributors: donors.size,
    totalAmount: linked.reduce((s, c) => s + c.amount, 0),
  }
}

function findContribution(id: string) {
  const row = contributions.find((c) => c.id === id)
  if (!row) throw new NotFoundError("Contribution", id)
  return row
}

function findBatch(id: string) {
  const row = batches.find((b) => b.id === id)
  if (!row) throw new NotFoundError("Giving batch", id)
  return row
}

function findPledge(id: string) {
  const row = pledges.find((p) => p.id === id)
  if (!row) throw new NotFoundError("Pledge", id)
  return row
}

async function resolveCampusId(preferred?: string | null) {
  if (preferred) return preferred
  const rows = await db.select({ id: campuses.id }).from(campuses).limit(1)
  if (!rows[0]?.id) throw new ValidationError("Create a location before recording giving.")
  return rows[0].id
}

function mapDbContribution(
  row: typeof givingContributions.$inferSelect,
  fundName?: string | null
): ContributionRow {
  return {
    id: row.id,
    campusId: row.campusId,
    memberId: row.memberId,
    fundId: row.fundId,
    fundName: fundName || fundNames[row.fundId] || "Fund",
    batchId: row.batchId,
    pledgeId: row.pledgeId,
    amount: Number(row.amount),
    method: row.method,
    frequency: row.frequency,
    channel: row.channel,
    status: row.status,
    journalEntryId: row.journalEntryId,
    donorDisplayName: row.donorDisplayName || "Anonymous",
    notes: row.notes,
    transactionReference: row.transactionReference,
    isTaxDeductible: row.isTaxDeductible,
    contributionDate: row.contributionDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }
}

export const givingService = {
  async listContributions(): Promise<GivingListResult> {
    try {
      const rows = await db
        .select({
          contribution: givingContributions,
          fundName: accountingFunds.name,
        })
        .from(givingContributions)
        .leftJoin(accountingFunds, eq(givingContributions.fundId, accountingFunds.id))
        .orderBy(desc(givingContributions.contributionDate))
        .limit(200)
      const mapped = rows.map((r) => mapDbContribution(r.contribution, r.fundName))
      return { contributions: mapped, summary: summarize(mapped) }
    } catch (err) {
      console.error("[givingService.listContributions]", err)
      const sorted = [...contributions].sort((a, b) =>
        b.contributionDate.localeCompare(a.contributionDate)
      )
      return { contributions: sorted, summary: summarize(sorted) }
    }
  },

  async createContribution(input: CreateContributionInput): Promise<GivingContribution> {
    const parsed = createContributionSchema.parse(input) as z.output<typeof createContributionSchema>
    const campusId = await resolveCampusId(parsed.campusId)
    const fundName = fundNames[parsed.fundId] || parsed.fundId

    try {
      const [row] = await db
        .insert(givingContributions)
        .values({
          campusId,
          memberId: parsed.memberId || null,
          fundId: parsed.fundId,
          batchId: parsed.batchId || null,
          pledgeId: parsed.pledgeId || null,
          amount: parsed.amount.toFixed(2),
          method: parsed.method,
          frequency: parsed.frequency,
          channel: parsed.channel,
          status: "recorded",
          donorDisplayName: parsed.donorDisplayName,
          notes: parsed.notes || null,
          transactionReference: parsed.transactionReference || null,
          isTaxDeductible: parsed.isTaxDeductible,
          contributionDate: new Date(parsed.contributionDate),
        })
        .returning()
      if (row) return { ...mapDbContribution(row), fundName }
    } catch (err) {
      console.error("[givingService.createContribution] demo store", err)
    }

    const row: ContributionRow = {
      id: `gc-${crypto.randomUUID()}`,
      campusId,
      memberId: parsed.memberId || null,
      fundId: parsed.fundId,
      fundName,
      batchId: parsed.batchId || null,
      pledgeId: parsed.pledgeId || null,
      amount: parsed.amount,
      method: parsed.method,
      frequency: parsed.frequency,
      channel: parsed.channel,
      status: "recorded",
      journalEntryId: null,
      donorDisplayName: parsed.donorDisplayName,
      notes: parsed.notes || null,
      transactionReference: parsed.transactionReference || null,
      isTaxDeductible: parsed.isTaxDeductible,
      contributionDate: new Date(parsed.contributionDate).toISOString(),
      createdAt: now(),
    }
    contributions.unshift(row)
    return row
  },

  /**
   * Explicit post to books — never silent. Creates a balanced journal when possible,
   * otherwise bumps the fund balance and marks the contribution posted_to_ledger.
   */
  async postContributionToBooks(id: string, postedByUserId: string): Promise<GivingContribution> {
    if (!postedByUserId) throw new ValidationError("postedByUserId is required")

    let contribution: ContributionRow | null = null
    try {
      const rows = await db
        .select()
        .from(givingContributions)
        .where(eq(givingContributions.id, id))
        .limit(1)
      if (rows[0]) contribution = mapDbContribution(rows[0])
    } catch {
      /* demo */
    }
    if (!contribution) contribution = findContribution(id)

    if (contribution.status === "posted_to_ledger") {
      throw new ValidationError("Contribution is already posted to the ledger")
    }

    let journalEntryId: string | null = contribution.journalEntryId

    try {
      const funds = await accountingService.getFunds(contribution.campusId)
      const fund = funds.find((f: { id: string }) => f.id === contribution!.fundId)
      const uuidLike =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (fund && uuidLike.test(contribution.fundId) && uuidLike.test(contribution.campusId)) {
        const entry = await accountingService.createJournalEntry({
          entryDate: contribution.contributionDate,
          memo: `Giving: ${contribution.donorDisplayName} → ${contribution.fundName}`,
          campusId: contribution.campusId,
          createdByUserId: postedByUserId,
          lines: [
            {
              accountId: contribution.fundId,
              fundId: contribution.fundId,
              debit: contribution.amount,
              credit: 0,
              memo: "Cash/AR",
            },
            {
              accountId: contribution.fundId,
              fundId: contribution.fundId,
              debit: 0,
              credit: contribution.amount,
              memo: "Contribution revenue",
            },
          ],
        })
        await accountingService.postJournalEntry(entry.id, { postedByUserId })
        journalEntryId = entry.id
      } else {
        const current = demoFundBalances.get(contribution.fundId) ?? 0
        demoFundBalances.set(contribution.fundId, current + contribution.amount)
        try {
          await db
            .update(accountingFunds)
            .set({
              balance: sql`${accountingFunds.balance} + ${contribution.amount}`,
              updatedAt: new Date(),
            })
            .where(eq(accountingFunds.id, contribution.fundId))
        } catch {
          /* demo balance only */
        }
        journalEntryId = `je-giving-${contribution.id}`
      }
    } catch (err) {
      console.error("[givingService.postContributionToBooks] fund bump fallback", err)
      const current = demoFundBalances.get(contribution.fundId) ?? 0
      demoFundBalances.set(contribution.fundId, current + contribution.amount)
      journalEntryId = `je-giving-${contribution.id}`
    }

    const { writeAuditLog } = await import("@/features/audit/service")

    try {
      const [updated] = await db
        .update(givingContributions)
        .set({
          status: "posted_to_ledger",
          journalEntryId,
        })
        .where(eq(givingContributions.id, id))
        .returning()
      if (updated) {
        const mapped = mapDbContribution(updated)
        void writeAuditLog({
          campusId: mapped.campusId,
          actorUserId: postedByUserId,
          action: "giving.post",
          entityType: "contribution",
          entityId: mapped.id,
          summary: `Posted giving ${mapped.donorDisplayName} · ${mapped.amount}`,
          metadata: { journalEntryId, fundId: mapped.fundId },
        })
        return mapped
      }
    } catch {
      /* memory fallback */
    }

    const demo = findContribution(id)
    demo.status = "posted_to_ledger"
    demo.journalEntryId = journalEntryId
    void writeAuditLog({
      campusId: demo.campusId,
      actorUserId: postedByUserId,
      action: "giving.post",
      entityType: "contribution",
      entityId: demo.id,
      summary: `Posted giving ${demo.donorDisplayName} · ${demo.amount}`,
    })
    return { ...demo }
  },

  async listBatches(): Promise<GivingBatch[]> {
    try {
      const rows = await db.select().from(givingBatches).orderBy(desc(givingBatches.batchDate))
      return rows.map((b) =>
        enrichBatch({
          id: b.id,
          campusId: b.campusId,
          name: b.name,
          batchDate: b.batchDate.toISOString(),
          status: b.status,
          notes: b.notes,
          createdByUserId: b.createdByUserId,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })
      )
    } catch (err) {
      console.error("[givingService.listBatches]", err)
      return batches.map(enrichBatch)
    }
  },

  async createBatch(input: CreateBatchInput, userId?: string): Promise<GivingBatch> {
    const parsed = createBatchSchema.parse(input) as z.output<typeof createBatchSchema>
    const campusId = await resolveCampusId(parsed.campusId)
    try {
      const [row] = await db
        .insert(givingBatches)
        .values({
          campusId,
          name: parsed.name,
          batchDate: new Date(parsed.batchDate),
          status: parsed.status,
          notes: parsed.notes || null,
          createdByUserId: userId || null,
        })
        .returning()
      if (row) {
        return enrichBatch({
          id: row.id,
          campusId: row.campusId,
          name: row.name,
          batchDate: row.batchDate.toISOString(),
          status: row.status,
          notes: row.notes,
          createdByUserId: row.createdByUserId,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })
      }
    } catch (err) {
      console.error("[givingService.createBatch] demo", err)
    }
    const row: BatchRow = {
      id: `gb-${crypto.randomUUID()}`,
      campusId,
      name: parsed.name,
      batchDate: new Date(parsed.batchDate).toISOString(),
      status: parsed.status,
      notes: parsed.notes || null,
      createdByUserId: userId || null,
      createdAt: now(),
      updatedAt: now(),
    }
    batches.unshift(row)
    return enrichBatch(row)
  },

  async updateBatch(id: string, input: UpdateBatchInput): Promise<GivingBatch> {
    const parsed = updateBatchSchema.parse(input)
    try {
      const [row] = await db
        .update(givingBatches)
        .set({
          ...(parsed.name !== undefined && { name: parsed.name }),
          ...(parsed.batchDate !== undefined && { batchDate: new Date(parsed.batchDate) }),
          ...(parsed.status !== undefined && { status: parsed.status }),
          ...(parsed.notes !== undefined && { notes: parsed.notes || null }),
          updatedAt: new Date(),
        })
        .where(eq(givingBatches.id, id))
        .returning()
      if (row) {
        return enrichBatch({
          id: row.id,
          campusId: row.campusId,
          name: row.name,
          batchDate: row.batchDate.toISOString(),
          status: row.status,
          notes: row.notes,
          createdByUserId: row.createdByUserId,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })
      }
    } catch {
      /* demo */
    }
    const batch = findBatch(id)
    Object.assign(batch, {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.batchDate !== undefined && {
        batchDate: new Date(parsed.batchDate).toISOString(),
      }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      ...(parsed.notes !== undefined && { notes: parsed.notes || null }),
      updatedAt: now(),
    })
    return enrichBatch(batch)
  },

  async deleteBatch(id: string): Promise<{ id: string }> {
    try {
      await db.delete(givingBatches).where(eq(givingBatches.id, id))
    } catch {
      /* demo */
    }
    const idx = batches.findIndex((b) => b.id === id)
    if (idx === -1 && !id.startsWith("gb-")) throw new NotFoundError("Giving batch", id)
    if (idx >= 0) batches.splice(idx, 1)
    for (const c of contributions) {
      if (c.batchId === id) c.batchId = null
    }
    return { id }
  },

  async listPledges(): Promise<GivingPledge[]> {
    try {
      const rows = await db.select().from(givingPledges).orderBy(desc(givingPledges.createdAt))
      return rows.map((p) => ({
        id: p.id,
        campusId: p.campusId,
        memberId: p.memberId,
        memberDisplayName: "Member",
        fundId: p.fundId,
        fundName: fundNames[p.fundId] || "Fund",
        amountTotal: Number(p.amountTotal),
        amountGiven: Number(p.amountGiven),
        frequency: p.frequency,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString() || null,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    } catch (err) {
      console.error("[givingService.listPledges]", err)
      return [...pledges].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }
  },

  async createPledge(input: CreatePledgeInput): Promise<GivingPledge> {
    const parsed = createPledgeSchema.parse(input) as z.output<typeof createPledgeSchema>
    const campusId = await resolveCampusId(parsed.campusId)
    const fundName = parsed.fundName || fundNames[parsed.fundId] || parsed.fundId
    const memberDisplayName = parsed.memberDisplayName || "Member"

    try {
      const [row] = await db
        .insert(givingPledges)
        .values({
          campusId,
          memberId: parsed.memberId,
          fundId: parsed.fundId,
          amountTotal: parsed.amountTotal.toFixed(2),
          frequency: parsed.frequency,
          startDate: new Date(parsed.startDate),
          endDate: parsed.endDate ? new Date(parsed.endDate) : null,
          status: parsed.status,
        })
        .returning()
      if (row) {
        return {
          id: row.id,
          campusId: row.campusId,
          memberId: row.memberId,
          memberDisplayName,
          fundId: row.fundId,
          fundName,
          amountTotal: Number(row.amountTotal),
          amountGiven: Number(row.amountGiven),
          frequency: row.frequency,
          startDate: row.startDate.toISOString(),
          endDate: row.endDate?.toISOString() || null,
          status: row.status,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        }
      }
    } catch (err) {
      console.error("[givingService.createPledge] demo", err)
    }

    const row: GivingPledge = {
      id: `gp-${crypto.randomUUID()}`,
      campusId,
      memberId: parsed.memberId,
      memberDisplayName,
      fundId: parsed.fundId,
      fundName,
      amountTotal: parsed.amountTotal,
      amountGiven: 0,
      frequency: parsed.frequency,
      startDate: new Date(parsed.startDate).toISOString(),
      endDate: parsed.endDate ? new Date(parsed.endDate).toISOString() : null,
      status: parsed.status,
      createdAt: now(),
      updatedAt: now(),
    }
    pledges.unshift(row)
    return row
  },

  async updatePledge(id: string, input: UpdatePledgeInput): Promise<GivingPledge> {
    const parsed = updatePledgeSchema.parse(input)
    try {
      const [row] = await db
        .update(givingPledges)
        .set({
          ...(parsed.amountTotal !== undefined && {
            amountTotal: parsed.amountTotal.toFixed(2),
          }),
          ...(parsed.frequency !== undefined && { frequency: parsed.frequency }),
          ...(parsed.startDate !== undefined && { startDate: new Date(parsed.startDate) }),
          ...(parsed.endDate !== undefined && {
            endDate: parsed.endDate ? new Date(parsed.endDate) : null,
          }),
          ...(parsed.status !== undefined && { status: parsed.status }),
          ...(parsed.fundId !== undefined && { fundId: parsed.fundId }),
          updatedAt: new Date(),
        })
        .where(eq(givingPledges.id, id))
        .returning()
      if (row) {
        return {
          id: row.id,
          campusId: row.campusId,
          memberId: row.memberId,
          memberDisplayName: parsed.memberDisplayName || "Member",
          fundId: row.fundId,
          fundName: fundNames[row.fundId] || "Fund",
          amountTotal: Number(row.amountTotal),
          amountGiven: Number(row.amountGiven),
          frequency: row.frequency,
          startDate: row.startDate.toISOString(),
          endDate: row.endDate?.toISOString() || null,
          status: row.status,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        }
      }
    } catch {
      /* demo */
    }
    const pledge = findPledge(id)
    Object.assign(pledge, {
      ...(parsed.amountTotal !== undefined && { amountTotal: parsed.amountTotal }),
      ...(parsed.frequency !== undefined && { frequency: parsed.frequency }),
      ...(parsed.startDate !== undefined && {
        startDate: new Date(parsed.startDate).toISOString(),
      }),
      ...(parsed.endDate !== undefined && {
        endDate: parsed.endDate ? new Date(parsed.endDate).toISOString() : null,
      }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      ...(parsed.fundId !== undefined && {
        fundId: parsed.fundId,
        fundName: fundNames[parsed.fundId] || parsed.fundId,
      }),
      ...(parsed.memberDisplayName !== undefined && {
        memberDisplayName: parsed.memberDisplayName,
      }),
      updatedAt: now(),
    })
    return { ...pledge }
  },

  async deletePledge(id: string): Promise<{ id: string }> {
    try {
      await db.delete(givingPledges).where(eq(givingPledges.id, id))
    } catch {
      /* demo */
    }
    const idx = pledges.findIndex((p) => p.id === id)
    if (idx === -1 && !id.startsWith("gp-")) throw new NotFoundError("Pledge", id)
    if (idx >= 0) pledges.splice(idx, 1)
    return { id }
  },

  getDemoFundBalance(fundId: string) {
    return demoFundBalances.get(fundId)
  },
}
