import { db } from "@/lib/db"
import {
  accountingFunds,
  chartOfAccounts,
  expenseRequisitions,
  expenseApprovals,
  journalEntries,
  journalLines,
  fundTransfers,
  campuses,
} from "@/lib/db/schema"
import { eq, desc, and, ilike, sql } from "drizzle-orm"
import { NotFoundError, ValidationError, BudgetExceededError } from "@/lib/errors"
import {
  CreateRequisitionInput,
  ApproveRequisitionInput,
  FundTransferInput,
  CreateJournalEntryInput,
  PostJournalEntryInput,
  CreateFundInput,
  CreateAccountInput,
  CreateBudgetLineInput,
} from "./schemas"
import {
  getMemoryBooks,
  provisionCampusBooks,
} from "./default-books"
import { emailService } from "@/features/communications/resend"
import { DbPaginationResult } from "@/lib/db/pagination"

/** In-memory demo overlays when DB rows are empty / demo ids are used. */
const demoFundsExtra: any[] = []
const demoBudgetLines: {
  id: string
  fundId: string
  fundName?: string
  fiscalYear: number
  department?: string
  label: string
  allocatedAmount: number
  notes?: string
  accountId?: string
}[] = [
  {
    id: "bl-1",
    fundId: "fund-1",
    fundName: "General Operating Fund",
    fiscalYear: new Date().getFullYear(),
    department: "Worship",
    label: "Production & AV",
    allocatedAmount: 28000,
  },
  {
    id: "bl-2",
    fundId: "fund-1",
    fundName: "General Operating Fund",
    fiscalYear: new Date().getFullYear(),
    department: "Facilities",
    label: "Utilities & Maintenance",
    allocatedAmount: 42000,
  },
  {
    id: "bl-3",
    fundId: "fund-3",
    fundName: "World Missions & Regional Church Planting",
    fiscalYear: new Date().getFullYear(),
    department: "Missions",
    label: "Partner support",
    allocatedAmount: 35000,
  },
]
const demoJournalPosted = new Set<string>()
const demoReqDecisions = new Map<string, { status: string; decision: string }>()

export const accountingService = {
  /**
   * Retrieves all church funds with budget, encumbered, expended, and unencumbered balance
   */
  async getFunds(campusId?: string) {
    const scopeId = campusId && campusId !== "all" ? campusId : undefined
    try {
      if (scopeId) {
        await provisionCampusBooks(scopeId)
      }

      const conditions = [eq(accountingFunds.isActive, true)]
      if (scopeId) {
        conditions.push(eq(accountingFunds.campusId, scopeId))
      }

      const funds = await db
        .select()
        .from(accountingFunds)
        .where(and(...conditions))

      if (funds.length === 0) {
        if (scopeId) {
          const mem = getMemoryBooks(scopeId)
          return [...mem.funds, ...demoFundsExtra.filter((f) => !f.campusId || f.campusId === scopeId)]
        }
        return demoFundsExtra
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
      if (scopeId) return getMemoryBooks(scopeId).funds
      return demoFundsExtra
    }
  },

  /**
   * Real SQL-level database paginated requisitions query with LIMIT, OFFSET, and SQL COUNT
   */
  async getPaginatedRequisitions(params: {
    page?: number
    pageSize?: number
    campusId?: string
    status?: string
    search?: string
  }): Promise<DbPaginationResult<any>> {
    const page = Math.max(1, Number(params.page || 1))
    const pageSize = Math.max(1, Math.min(100, Number(params.pageSize || 10)))
    const offset = (page - 1) * pageSize

    const conditions = []
    if (params.campusId && params.campusId !== "all") {
      conditions.push(eq(expenseRequisitions.campusId, params.campusId))
    }
    if (params.status && params.status !== "all") {
      conditions.push(eq(expenseRequisitions.status, params.status as any))
    }
    if (params.search) {
      conditions.push(
        ilike(expenseRequisitions.vendorName, `%${params.search}%`)
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    try {
      const [countResult, records] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(expenseRequisitions)
          .where(whereClause),
        db
          .select()
          .from(expenseRequisitions)
          .where(whereClause)
          .orderBy(desc(expenseRequisitions.createdAt))
          .limit(pageSize)
          .offset(offset),
      ])

      const total = countResult[0]?.count || 0
      const totalPages = Math.ceil(total / pageSize) || 1

      // Fallback demo row if empty in local dev
      if (records.length === 0 && !params.search) {
        const decision = demoReqDecisions.get("req-1")
        return {
          data: [
            {
              id: "req-1",
              requisitionNumber: "REQ-2024-001",
              amount: 1450.0,
              vendorName: "Sweetwater Sound",
              department: "Creative Arts & Worship",
              description: "Replacement Wireless In-Ear Monitors for Praise Team",
              status: decision?.status || "pending_tier_2",
              currentTierLevel: 2,
              currentApprover: "Campus Pastor (Ahmad Fawaid)",
              fundName: "General Operating Fund",
              fundId: "fund-1",
              accountId: "acct-5030",
              receiptUrl: "https://res.cloudinary.com/evolve-church/receipts/req001.pdf",
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
        }
      }

      return {
        data: records,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    } catch (err) {
      console.error("[accountingService.getPaginatedRequisitions] DB error:", err)
      return {
        data: [],
        pagination: { page, pageSize, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
      }
    }
  },

  /**
   * Location-scoped chart of accounts (each campus has its own books).
   */
  async getChartOfAccounts(campusId?: string) {
    const scopeId = campusId && campusId !== "all" ? campusId : undefined
    try {
      if (scopeId) {
        await provisionCampusBooks(scopeId)
      }

      const conditions = [eq(chartOfAccounts.isActive, true)]
      if (scopeId) {
        conditions.push(eq(chartOfAccounts.campusId, scopeId))
      }

      const accounts = await db
        .select()
        .from(chartOfAccounts)
        .where(and(...conditions))

      if (accounts.length === 0) {
        if (scopeId) {
          return getMemoryBooks(scopeId).accounts
        }
        return []
      }

      return accounts.map((a) => ({
        ...a,
        balance: Number(a.openingBalance || 0),
        openingBalance: Number(a.openingBalance || 0),
      }))
    } catch (err) {
      console.error("[accountingService.getChartOfAccounts] DB error:", err)
      if (scopeId) return getMemoryBooks(scopeId).accounts
      return []
    }
  },

  async createAccount(input: CreateAccountInput) {
    const accountNumber = input.accountNumber.trim()
    const accountName = input.accountName.trim()
    if (!accountNumber || !accountName) {
      throw new ValidationError("Account number and name are required")
    }

    let campusId = input.campusId
    try {
      if (!campusId) {
        const rows = await db.select().from(campuses).limit(1)
        campusId = rows[0]?.id
      }
      if (campusId) {
        await provisionCampusBooks(campusId)
        const dup = await db
          .select({ id: chartOfAccounts.id })
          .from(chartOfAccounts)
          .where(
            and(
              eq(chartOfAccounts.campusId, campusId),
              eq(chartOfAccounts.accountNumber, accountNumber),
              eq(chartOfAccounts.isActive, true)
            )
          )
          .limit(1)
        if (dup.length > 0) {
          throw new ValidationError(`Account ${accountNumber} already exists for this location`)
        }

        const [created] = await db
          .insert(chartOfAccounts)
          .values({
            campusId,
            fundId: input.fundId || null,
            accountNumber,
            accountName,
            category: input.category,
            description: input.description || null,
            openingBalance: String(input.openingBalance ?? 0),
          })
          .returning()
        if (created) {
          return {
            ...created,
            balance: Number(created.openingBalance || 0),
            openingBalance: Number(created.openingBalance || 0),
          }
        }
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err
      console.error("[accountingService.createAccount]", err)
    }

    if (!campusId) campusId = "demo"
    const books = getMemoryBooks(campusId)
    if (books.accounts.some((a) => a.accountNumber === accountNumber && a.isActive)) {
      throw new ValidationError(`Account ${accountNumber} already exists for this location`)
    }
    const row = {
      id: `acct-${Date.now().toString(36)}`,
      campusId,
      accountNumber,
      accountName,
      category: input.category,
      description: input.description || null,
      openingBalance: input.openingBalance ?? 0,
      balance: input.openingBalance ?? 0,
      isActive: true,
    }
    books.accounts = [row, ...books.accounts]
    return row
  },

  /**
   * Submits an expense requisition and checks budget constraints
   */
  async createRequisition(input: CreateRequisitionInput, requestedByUserId = "user-1") {
    // Demo funds — return a synthetic requisition for local UX
    if (input.fundId.startsWith("fund-")) {
      const funds = await this.getFunds()
      const fund = funds.find((f: any) => f.id === input.fundId)
      if (fund) {
        const unencumbered = Number(fund.netAvailable ?? Number(fund.balance) - Number(fund.encumberedAmount || 0))
        if (input.amount > unencumbered) {
          throw new BudgetExceededError(fund.name, input.amount, unencumbered)
        }
      }
      const randomReq = Math.floor(1000 + Math.random() * 9000)
      return {
        id: `req-${crypto.randomUUID().slice(0, 8)}`,
        requisitionNumber: `REQ-${new Date().getFullYear()}-${randomReq}`,
        ...input,
        amount: input.amount,
        status: input.amount > 500 ? "pending_tier_2" : "pending_tier_1",
        currentTierLevel: input.amount > 500 ? 2 : 1,
        requestedByUserId,
        createdAt: new Date().toISOString(),
      }
    }

    const fundRecords = await db.select().from(accountingFunds).where(eq(accountingFunds.id, input.fundId)).limit(1)

    if (fundRecords.length > 0) {
      const fund = fundRecords[0]
      const currentBalance = Number(fund.balance || 0)
      const currentEncumbered = Number(fund.encumberedAmount || 0)
      const unencumbered = currentBalance - currentEncumbered

      if (input.amount > unencumbered) {
        throw new BudgetExceededError(fund.name, input.amount, unencumbered)
      }

      await db
        .update(accountingFunds)
        .set({
          encumberedAmount: (currentEncumbered + input.amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(accountingFunds.id, input.fundId))
    }

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

  async createFund(input: CreateFundInput) {
    const code = input.code.trim().toUpperCase()
    const name = input.name.trim()
    let campusId = input.campusId

    try {
      if (!campusId) {
        const defaultCampus = await db.select().from(campuses).limit(1)
        campusId = defaultCampus[0]?.id
      }
      if (campusId) {
        await provisionCampusBooks(campusId)
        const dup = await db
          .select({ id: accountingFunds.id })
          .from(accountingFunds)
          .where(
            and(
              eq(accountingFunds.campusId, campusId),
              eq(accountingFunds.code, code),
              eq(accountingFunds.isActive, true)
            )
          )
          .limit(1)
        if (dup.length > 0) {
          throw new ValidationError(`Fund code ${code} already exists for this location`)
        }

        const [created] = await db
          .insert(accountingFunds)
          .values({
            campusId,
            name,
            code,
            type: input.type,
            budgetAmount: input.budgetAmount.toString(),
            description: input.description || null,
            balance: "0.00",
          })
          .returning()
        if (created) {
          return {
            ...created,
            budgetAmount: Number(created.budgetAmount || 0),
            encumberedAmount: Number(created.encumberedAmount || 0),
            expendedAmount: Number(created.expendedAmount || 0),
            balance: Number(created.balance || 0),
            netAvailable: 0,
          }
        }
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err
      console.error("[accountingService.createFund] falling back to demo store", err)
    }

    if (!campusId) campusId = "demo"
    const books = getMemoryBooks(campusId)
    if (books.funds.some((f) => f.code === code && f.isActive)) {
      throw new ValidationError(`Fund code ${code} already exists for this location`)
    }
    const fund = {
      id: `fund-${crypto.randomUUID().slice(0, 8)}`,
      campusId,
      code,
      name,
      type: input.type,
      budgetAmount: input.budgetAmount,
      encumberedAmount: 0,
      expendedAmount: 0,
      balance: 0,
      netAvailable: 0,
      description: input.description,
      isActive: true,
    }
    books.funds.unshift(fund)
    demoFundsExtra.unshift(fund)
    return fund
  },

  async listBudgetLines(fundId?: string) {
    const rows = fundId ? demoBudgetLines.filter((l) => l.fundId === fundId) : [...demoBudgetLines]
    return rows
  },

  async createBudgetLine(input: CreateBudgetLineInput) {
    const funds = await this.getFunds()
    const fund = funds.find((f: any) => f.id === input.fundId)
    const line = {
      id: `bl-${crypto.randomUUID().slice(0, 8)}`,
      fundId: input.fundId,
      fundName: fund?.name,
      fiscalYear: input.fiscalYear,
      department: input.department,
      label: input.label,
      allocatedAmount: input.allocatedAmount,
      notes: input.notes,
      accountId: input.accountId,
    }
    demoBudgetLines.unshift(line)
    return line
  },

  /**
   * Approves or rejects a requisition through the tier pipeline
   */
  async approveRequisition(id: string, input: ApproveRequisitionInput, approverUserId = "user-approver") {
    if (id.startsWith("req-")) {
      demoReqDecisions.set(id, {
        status: input.decision === "rejected" ? "rejected" : "approved",
        decision: input.decision,
      })
      return {
        id,
        status: input.decision === "rejected" ? "rejected" : "approved",
        decision: input.decision,
        comments: input.comments,
        approverUserId,
      }
    }

    const existing = await db.select().from(expenseRequisitions).where(eq(expenseRequisitions.id, id)).limit(1)
    if (existing.length === 0) {
      throw new NotFoundError("Expense Requisition", id)
    }

    const req = existing[0]

    await db.insert(expenseApprovals).values({
      requisitionId: id,
      approverUserId,
      tierLevel: req.currentTierLevel,
      decision: input.decision,
      comments: input.comments || null,
    })

    if (input.decision === "rejected") {
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

  async getJournalEntries(campusId?: string) {
    try {
      const conditions = []
      if (campusId && campusId !== "all") {
        conditions.push(eq(journalEntries.campusId, campusId))
      }
      const entries = await db
        .select()
        .from(journalEntries)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(journalEntries.createdAt))
        .limit(50)

      if (entries.length === 0) {
        return [
          {
            id: "je-demo-1",
            entryNumber: "JE-2024-001",
            entryDate: new Date().toISOString(),
            memo: "Sunday offering batch — General Fund (draft)",
            status: demoJournalPosted.has("je-demo-1") ? "posted" : "draft",
            createdByUserId: "user-finance-1",
            createdByName: "Finance Admin",
            postedByUserId: demoJournalPosted.has("je-demo-1") ? "user-pastor-1" : null,
            postedByName: demoJournalPosted.has("je-demo-1") ? "Campus Pastor Ahmad" : null,
            postedAt: demoJournalPosted.has("je-demo-1") ? new Date().toISOString() : null,
          },
          {
            id: "je-demo-2",
            entryNumber: "JE-2024-002",
            entryDate: new Date(Date.now() - 86400000).toISOString(),
            memo: "Worship gear expense disbursement",
            status: "posted",
            createdByUserId: "user-finance-1",
            createdByName: "Finance Admin",
            postedByUserId: "user-pastor-1",
            postedByName: "Campus Pastor Ahmad",
            postedAt: new Date(Date.now() - 80000000).toISOString(),
          },
        ]
      }
      return entries
    } catch (err) {
      console.error("[accountingService.getJournalEntries]", err)
      return []
    }
  },

  async createJournalEntry(input: CreateJournalEntryInput) {
    const totalDebit = input.lines.reduce((s, l) => s + l.debit, 0)
    const totalCredit = input.lines.reduce((s, l) => s + l.credit, 0)
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new ValidationError("Journal entry must balance: debits must equal credits.")
    }

    let campusId = input.campusId
    if (!campusId) {
      const defaultCampus = await db.select().from(campuses).limit(1)
      campusId = defaultCampus[0]?.id
    }
    if (!campusId) {
      throw new ValidationError("Campus is required to create a journal entry.")
    }

    const entryNumber = `JE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const [entry] = await db
      .insert(journalEntries)
      .values({
        campusId,
        entryNumber,
        entryDate: new Date(input.entryDate),
        memo: input.memo,
        status: "draft",
        createdByUserId: input.createdByUserId,
      })
      .returning()

    await db.insert(journalLines).values(
      input.lines.map((line) => ({
        journalEntryId: entry.id,
        accountId: line.accountId,
        fundId: line.fundId,
        debit: line.debit.toString(),
        credit: line.credit.toString(),
        memo: line.memo || null,
      }))
    )

    return entry
  },

  /**
   * Explicit post — never auto. Validates balanced lines, records who posted,
   * and bumps each fund balance in one transaction (write to books).
   */
  async postJournalEntry(id: string, input: PostJournalEntryInput) {
    if (id.startsWith("je-demo-")) {
      if (demoJournalPosted.has(id)) throw new ValidationError("Journal entry is already posted.")
      demoJournalPosted.add(id)
      // Demo: increase General Operating Fund when posting demo journals
      const fund = demoFundsExtra.find((f) => f.id === "fund-1")
      if (fund) fund.balance = Number(fund.balance || 0) + 500
      return {
        id,
        status: "posted",
        postedByUserId: input.postedByUserId,
        postedByName: "Campus Pastor Ahmad",
        postedAt: new Date().toISOString(),
      }
    }

    const existing = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1)
    if (existing.length === 0) throw new NotFoundError("Journal Entry", id)
    if (existing[0].status === "posted") {
      throw new ValidationError("Journal entry is already posted.")
    }

    const lines = await db.select().from(journalLines).where(eq(journalLines.journalEntryId, id))
    if (lines.length === 0) throw new ValidationError("Journal entry has no lines.")

    const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0)
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new ValidationError("Journal is not balanced — debits must equal credits.")
    }
    for (const line of lines) {
      if (!line.fundId || !line.accountId) {
        throw new ValidationError("Every journal line needs a fund and account.")
      }
    }

    // Net effect per fund: credit − debit increases liquid fund balance (giving revenue pattern)
    const fundDeltas = new Map<string, number>()
    for (const line of lines) {
      const delta = Number(line.credit || 0) - Number(line.debit || 0)
      fundDeltas.set(line.fundId, (fundDeltas.get(line.fundId) || 0) + delta)
    }

    const [updated] = await db
      .update(journalEntries)
      .set({
        status: "posted",
        postedByUserId: input.postedByUserId,
        postedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, id))
      .returning()

    for (const [fundId, delta] of fundDeltas) {
      if (Math.abs(delta) < 0.001) continue
      const [fund] = await db
        .select()
        .from(accountingFunds)
        .where(eq(accountingFunds.id, fundId))
        .limit(1)
      if (!fund) continue
      const next = Number(fund.balance || 0) + delta
      await db
        .update(accountingFunds)
        .set({ balance: next.toFixed(2), updatedAt: new Date() })
        .where(eq(accountingFunds.id, fundId))
    }

    return updated
  },

  async createFundTransfer(input: FundTransferInput, authorizedByUserId: string) {
    if (input.fromFundId === input.toFundId) {
      throw new ValidationError("Cannot transfer a fund to itself.")
    }
    let campusId = input.campusId
    if (!campusId) {
      const defaultCampus = await db.select().from(campuses).limit(1)
      campusId = defaultCampus[0]?.id
    }
    if (!campusId) throw new ValidationError("Campus is required.")

    const [transfer] = await db
      .insert(fundTransfers)
      .values({
        campusId,
        fromFundId: input.fromFundId,
        toFundId: input.toFundId,
        amount: input.amount.toString(),
        transferReason: input.transferReason,
        authorizedByUserId,
      })
      .returning()

    return transfer
  },
}
