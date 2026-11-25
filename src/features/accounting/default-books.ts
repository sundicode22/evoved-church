import { db } from "@/lib/db"
import { accountingFunds, chartOfAccounts } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"

export type AccountCategory = "asset" | "liability" | "net_assets" | "revenue" | "expense"

export type CoaTemplateRow = {
  accountNumber: string
  accountName: string
  category: AccountCategory
  description?: string
}

/** Default chart opened for every new location’s books. */
export const DEFAULT_COA_TEMPLATE: CoaTemplateRow[] = [
  {
    accountNumber: "1010",
    accountName: "Operating Checking Account",
    category: "asset",
    description: "Primary operating cash",
  },
  {
    accountNumber: "1020",
    accountName: "Building Fund Savings",
    category: "asset",
  },
  {
    accountNumber: "2010",
    accountName: "Accounts Payable",
    category: "liability",
  },
  {
    accountNumber: "3010",
    accountName: "Unrestricted Net Assets",
    category: "net_assets",
  },
  {
    accountNumber: "3020",
    accountName: "Restricted Net Assets",
    category: "net_assets",
  },
  {
    accountNumber: "4010",
    accountName: "General Tithes & Offerings",
    category: "revenue",
  },
  {
    accountNumber: "4020",
    accountName: "Designated Gifts",
    category: "revenue",
  },
  {
    accountNumber: "5010",
    accountName: "Pastoral & Staff Payroll",
    category: "expense",
  },
  {
    accountNumber: "5020",
    accountName: "Facilities & Utilities",
    category: "expense",
  },
  {
    accountNumber: "5030",
    accountName: "Ministry Programs",
    category: "expense",
  },
]

export type MemoryFund = {
  id: string
  campusId: string
  code: string
  name: string
  type: "unrestricted" | "temporarily_restricted" | "permanently_restricted"
  budgetAmount: number
  encumberedAmount: number
  expendedAmount: number
  balance: number
  netAvailable: number
  description?: string | null
  isActive: boolean
}

export type MemoryAccount = {
  id: string
  campusId: string
  accountNumber: string
  accountName: string
  category: AccountCategory
  description?: string | null
  openingBalance: number
  balance: number
  isActive: boolean
}

/** Per-location in-memory books when DB is unavailable. */
export const memoryBooksByCampus = new Map<
  string,
  { funds: MemoryFund[]; accounts: MemoryAccount[] }
>()

function emptyBooks() {
  return { funds: [] as MemoryFund[], accounts: [] as MemoryAccount[] }
}

export function getMemoryBooks(campusId: string) {
  let books = memoryBooksByCampus.get(campusId)
  if (!books) {
    books = emptyBooks()
    memoryBooksByCampus.set(campusId, books)
  }
  return books
}

function seedMemoryBooks(campusId: string) {
  const books = getMemoryBooks(campusId)
  if (books.funds.length === 0) {
    books.funds.push({
      id: `fund-${campusId.slice(0, 8)}-gen`,
      campusId,
      code: "GEN",
      name: "General Fund",
      type: "unrestricted",
      budgetAmount: 0,
      encumberedAmount: 0,
      expendedAmount: 0,
      balance: 0,
      netAvailable: 0,
      description: "Default unrestricted operating fund for this location",
      isActive: true,
    })
  }
  if (books.accounts.length === 0) {
    for (const row of DEFAULT_COA_TEMPLATE) {
      books.accounts.push({
        id: `acct-${campusId.slice(0, 8)}-${row.accountNumber}`,
        campusId,
        accountNumber: row.accountNumber,
        accountName: row.accountName,
        category: row.category,
        description: row.description || null,
        openingBalance: 0,
        balance: 0,
        isActive: true,
      })
    }
  }
  return books
}

/**
 * Ensures each location has its own General Fund + starter chart of accounts.
 * Idempotent — safe to call on create and on first books read.
 */
export async function provisionCampusBooks(campusId: string) {
  if (!campusId || campusId === "all") {
    return seedMemoryBooks(campusId || "demo")
  }

  try {
    const existingFunds = await db
      .select({ id: accountingFunds.id, code: accountingFunds.code })
      .from(accountingFunds)
      .where(and(eq(accountingFunds.campusId, campusId), eq(accountingFunds.isActive, true)))

    let generalFundId = existingFunds.find((f) => f.code === "GEN")?.id

    if (!generalFundId) {
      const [fund] = await db
        .insert(accountingFunds)
        .values({
          campusId,
          name: "General Fund",
          code: "GEN",
          type: "unrestricted",
          budgetAmount: "0.00",
          balance: "0.00",
          description: "Default unrestricted operating fund for this location",
        })
        .returning({ id: accountingFunds.id })
      generalFundId = fund?.id
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chartOfAccounts)
      .where(and(eq(chartOfAccounts.campusId, campusId), eq(chartOfAccounts.isActive, true)))

    if ((count || 0) === 0) {
      await db.insert(chartOfAccounts).values(
        DEFAULT_COA_TEMPLATE.map((row) => ({
          campusId,
          fundId: generalFundId || null,
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          category: row.category,
          description: row.description || null,
          openingBalance: "0.00",
        }))
      )
    }

    return { campusId, generalFundId, source: "db" as const }
  } catch (err) {
    console.error("[provisionCampusBooks]", err)
    return seedMemoryBooks(campusId)
  }
}
