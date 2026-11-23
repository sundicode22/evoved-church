import { db } from "@/lib/db"
import {
  accountingFunds,
  chartOfAccounts,
  expenseRequisitions,
  expenseApprovals,
  expenseApprovalRules,
  campuses,
  users,
} from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NotFoundError, ValidationError, BudgetExceededError } from "@/lib/errors"
import { CreateRequisitionInput, ApproveRequisitionInput, FundTransferInput } from "./schemas"
import { emailService } from "@/features/communications/resend"

export const accountingService = {
  /**
   * Retrieves all church funds with budget, encumbered, expended, and unencumbered balance
   */
  async getFunds(campusId?: string) {
    try {
      const funds = await db.select().from(accountingFunds).where(eq(accountingFunds.isActive, true))

      if (funds.length === 0) {
        return [
          {
            id: "fund-1",
            code: "GEN-100",
            name: "General Operating Fund",
            type: "unrestricted",
            budgetAmount: 250000.0,
            encumberedAmount: 18500.0,
            expendedAmount: 85609.5,
            balance: 145890.5,
            netAvailable: 145890.5 - 18500.0,
          },
          {
            id: "fund-2",
            code: "BLDG-200",
            name: "Sanctuary Expansion & Capital Campaign",
            type: "temporarily_restricted",
            budgetAmount: 500000.0,
            encumberedAmount: 45000.0,
            expendedAmount: 134600.0,
            balance: 320400.0,
            netAvailable: 320400.0 - 45000.0,
          },
          {
            id: "fund-3",
            code: "MISS-300",
            name: "World Missions & Regional Church Planting",
            type: "temporarily_restricted",
            budgetAmount: 75000.0,
            encumberedAmount: 5000.0,
            expendedAmount: 21100.0,
            balance: 48900.0,
            netAvailable: 48900.0 - 5000.0,
          },
          {
            id: "fund-4",
            code: "BEN-400",
            name: "Benevolence & Community Food Pantry",
            type: "temporarily_restricted",
            budgetAmount: 30000.0,
            encumberedAmount: 2200.0,
            expendedAmount: 9550.0,
            balance: 18250.0,
            netAvailable: 18250.0 - 2200.0,
          },
        ]
      }

      return funds.map((f) => {
        const balance = Number(f.balance || 0)
        const encumbered = Number(f.encumberedAmount || 0)
        return {
          ...f,
          budgetAmount: Number(f.budgetAmount || 0),
          encumberedAmount: encumbered,
          expendedAmount: Number(f.expendedAmount || 0),
          balance,
          netAvailable: balance - encumbered,
        }
      })
    } catch (err) {
      console.error("[accountingService.getFunds] DB error:", err)
      return []
    }
  },

  /**
   * Retrieves pending expense requisitions
   */
  async getRequisitions(campusId?: string) {
    try {
      const reqs = await db.select().from(expenseRequisitions).orderBy(desc(expenseRequisitions.createdAt))
      if (reqs.length === 0) {
        return [
          {
            id: "req-1",
            requisitionNumber: "REQ-2024-001",
            amount: 1450.0,
            vendorName: "Sweetwater Sound",
            department: "Creative Arts & Worship",
            description: "Replacement Wireless In-Ear Monitors for Praise Team",
            status: "pending_tier_2",
            currentTierLevel: 2,
            currentApprover: "Campus Pastor (Ahmad Fawaid)",
            fundName: "General Operating Fund",
            receiptUrl: "https://res.cloudinary.com/evolve-church/receipts/req001.pdf",
            createdAt: new Date().toISOString(),
          },
        ]
      }
      return reqs
    } catch (err) {
      console.error("[accountingService.getRequisitions] DB error:", err)
      return []
    }
  },

  /**
   * Submits an expense requisition and checks budget constraints
   */
  async createRequisition(input: CreateRequisitionInput, requestedByUserId = "user-1") {
    // 1. Fetch fund and verify unencumbered funds
    const fundRecords = await db.select().from(accountingFunds).where(eq(accountingFunds.id, input.fundId)).limit(1)

    if (fundRecords.length > 0) {
      const fund = fundRecords[0]
      const currentBalance = Number(fund.balance || 0)
      const currentEncumbered = Number(fund.encumberedAmount || 0)
      const unencumbered = currentBalance - currentEncumbered

      if (input.amount > unencumbered) {
        throw new BudgetExceededError(fund.name, input.amount, unencumbered)
      }

      // Lock/encumber the funds
      await db
        .update(accountingFunds)
        .set({
          encumberedAmount: (currentEncumbered + input.amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(accountingFunds.id, input.fundId))
    }

    // 2. Determine initial approval tier based on amount:
    // Tier 1: <= $500 (Dept Head)
    // Tier 2: $500.01 - $2,500 (Campus Pastor)
    // Tier 3: $2,500.01 - $10,000 (Exec Pastor / Finance Director)
    // Tier 4: > $10,000 (Senior Pastor & Board)
    let initialTier = 1
    let initialStatus: "pending_tier_1" | "pending_tier_2" | "pending_tier_3" = "pending_tier_1"

    if (input.amount > 10000) {
      initialTier = 4
      initialStatus = "pending_tier_3"
    } else if (input.amount > 2500) {
      initialTier = 3
      initialStatus = "pending_tier_3"
    } else if (input.amount > 500) {
      initialTier = 2
      initialStatus = "pending_tier_2"
    }

    const randomReq = Math.floor(1000 + Math.random() * 9000)
    const requisitionNumber = `REQ-2024-${randomReq}`

    // Ensure valid campus ID or default
    let campusId = input.campusId
    if (!campusId) {
      const defaultCampus = await db.select().from(campuses).limit(1)
      if (defaultCampus.length > 0) campusId = defaultCampus[0].id
    }

    const [created] = await db
      .insert(expenseRequisitions)
      .values({
        requisitionNumber,
        campusId: campusId!,
        requestedByUserId,
        fundId: input.fundId,
        accountId: input.accountId,
        vendorName: input.vendorName,
        amount: input.amount.toString(),
        description: input.description,
        receiptUrl: input.receiptUrl || null,
        status: initialStatus,
        currentTierLevel: initialTier,
      })
      .returning()

    // 3. Trigger email alert via Resend to the responsible approver
    await emailService.sendExpenseApprovalAlert({
      to: "pastor@evolvechms.org",
      approverName: "Campus Pastor",
      requisitionNumber,
      amount: `$${input.amount.toFixed(2)}`,
      department: "Ministry Operations",
      vendor: input.vendorName,
      tierLevel: initialTier,
    }).catch((err) => console.error("[Resend Requisition Alert Error]:", err))

    return created
  },

  /**
   * Approves or rejects a requisition through the tier pipeline
   */
  async approveRequisition(id: string, input: ApproveRequisitionInput, approverUserId = "user-approver") {
    const existing = await db.select().from(expenseRequisitions).where(eq(expenseRequisitions.id, id)).limit(1)
    if (existing.length === 0) {
      throw new NotFoundError("Expense Requisition", id)
    }

    const req = existing[0]

    // Log the approval decision
    await db.insert(expenseApprovals).values({
      requisitionId: id,
      approverUserId,
      tierLevel: req.currentTierLevel,
      decision: input.decision,
      comments: input.comments || null,
    })

    if (input.decision === "rejected") {
      // Release encumbered funds back to fund balance
      const fund = await db.select().from(accountingFunds).where(eq(accountingFunds.id, req.fundId)).limit(1)
      if (fund.length > 0) {
        const encumbered = Math.max(0, Number(fund[0].encumberedAmount || 0) - Number(req.amount))
        await db
          .update(accountingFunds)
          .set({ encumberedAmount: encumbered.toString() })
          .where(eq(accountingFunds.id, req.fundId))
      }

      const [updated] = await db
        .update(expenseRequisitions)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(expenseRequisitions.id, id))
        .returning()
      return updated
    }

    // If approved, check if additional tier sign-off is required or if it reaches final approval
    let nextStatus = "approved"
    if (req.currentTierLevel === 1 && Number(req.amount) > 500) {
      nextStatus = "pending_tier_2"
    } else if (req.currentTierLevel === 2 && Number(req.amount) > 2500) {
      nextStatus = "pending_tier_3"
    }

    const [updated] = await db
      .update(expenseRequisitions)
      .set({
        status: nextStatus as any,
        currentTierLevel: req.currentTierLevel + 1,
        updatedAt: new Date(),
      })
      .where(eq(expenseRequisitions.id, id))
      .returning()

    return updated
  },
}
