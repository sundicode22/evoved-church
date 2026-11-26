import { db } from "@/lib/db"
import { accountingFunds, campuses, chartOfAccounts } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"

export type AccountCategory = "asset" | "liability" | "net_assets" | "revenue" | "expense"

export type CoaTemplateRow = {
  accountNumber: string
  accountName: string
  category: AccountCategory
  description?: string
}

export type FundTemplateRow = {
  code: string
  name: string
  type: "unrestricted" | "temporarily_restricted" | "permanently_restricted"
  description: string
}

/**
 * Standard church books — OHADA-inspired class structure adapted for ministry:
 * 1xxx Assets · 2xxx Liabilities · 3xxx Net assets · 4xxx Revenue · 5xxx Expenses
 * Seeded for every location on create (and on first books read if empty).
 */
export const DEFAULT_COA_TEMPLATE: CoaTemplateRow[] = [
  // —— Class 1 · Assets (cash & receivables) ——
  {
    accountNumber: "1010",
    accountName: "Operating Checking Account",
    category: "asset",
    description: "Primary operating cash (OHADA Cl. 5 — banques)",
  },
  {
    accountNumber: "1020",
    accountName: "Petty Cash",
    category: "asset",
    description: "On-hand cash for small expenses",
  },
  {
    accountNumber: "1030",
    accountName: "Building Fund Savings",
    category: "asset",
    description: "Cash reserved for building / capital projects",
  },
  {
    accountNumber: "1040",
    accountName: "Missions Fund Savings",
    category: "asset",
    description: "Cash reserved for missions & outreach",
  },
  {
    accountNumber: "1110",
    accountName: "Undeposited Offerings",
    category: "asset",
    description: "Tithes & offerings not yet banked",
  },
  {
    accountNumber: "1210",
    accountName: "Accounts Receivable — Pledges",
    category: "asset",
    description: "Outstanding pledges receivable",
  },
  {
    accountNumber: "1510",
    accountName: "Furniture & Equipment",
    category: "asset",
    description: "Furniture, AV, computers (OHADA Cl. 2)",
  },
  {
    accountNumber: "1520",
    accountName: "Buildings & Land",
    category: "asset",
    description: "Church property and improvements",
  },
  {
    accountNumber: "1590",
    accountName: "Accumulated Depreciation",
    category: "asset",
    description: "Contra-asset for buildings & equipment",
  },

  // —— Class 2 · Liabilities ——
  {
    accountNumber: "2010",
    accountName: "Accounts Payable",
    category: "liability",
    description: "Vendor invoices payable (OHADA Cl. 4)",
  },
  {
    accountNumber: "2020",
    accountName: "Accrued Payroll",
    category: "liability",
    description: "Salaries and wages owed",
  },
  {
    accountNumber: "2030",
    accountName: "Payroll Taxes Payable",
    category: "liability",
    description: "Withheld taxes / social contributions",
  },
  {
    accountNumber: "2110",
    accountName: "Deferred Designated Gifts",
    category: "liability",
    description: "Restricted gifts not yet released",
  },
  {
    accountNumber: "2210",
    accountName: "Notes Payable — Mortgage",
    category: "liability",
    description: "Long-term facility debt",
  },

  // —— Class 3 · Net assets ——
  {
    accountNumber: "3010",
    accountName: "Unrestricted Net Assets",
    category: "net_assets",
    description: "General operating equity (OHADA Cl. 1)",
  },
  {
    accountNumber: "3020",
    accountName: "Temporarily Restricted Net Assets",
    category: "net_assets",
    description: "Donor-restricted for purpose or time",
  },
  {
    accountNumber: "3030",
    accountName: "Permanently Restricted Net Assets",
    category: "net_assets",
    description: "Endowment / permanent restrictions",
  },

  // —— Class 4 · Revenue ——
  {
    accountNumber: "4010",
    accountName: "General Tithes & Offerings",
    category: "revenue",
    description: "Undesignated Sunday & online giving (OHADA Cl. 7)",
  },
  {
    accountNumber: "4020",
    accountName: "Designated Gifts",
    category: "revenue",
    description: "Donor-designated contributions",
  },
  {
    accountNumber: "4030",
    accountName: "Building Campaign Income",
    category: "revenue",
    description: "Gifts toward facility / capital projects",
  },
  {
    accountNumber: "4040",
    accountName: "Missions Income",
    category: "revenue",
    description: "Gifts for missions & outreach",
  },
  {
    accountNumber: "4050",
    accountName: "Special Offerings",
    category: "revenue",
    description: "Holiday, thanksgiving, and special appeals",
  },
  {
    accountNumber: "4110",
    accountName: "Facility Rental Income",
    category: "revenue",
    description: "Room / hall rental income",
  },
  {
    accountNumber: "4120",
    accountName: "Other Income",
    category: "revenue",
    description: "Interest, sales, miscellaneous income",
  },

  // —— Class 5 · Expenses ——
  {
    accountNumber: "5010",
    accountName: "Pastoral & Staff Payroll",
    category: "expense",
    description: "Salaries, housing, benefits (OHADA Cl. 6)",
  },
  {
    accountNumber: "5020",
    accountName: "Payroll Taxes & Benefits",
    category: "expense",
    description: "Employer taxes and staff benefits",
  },
  {
    accountNumber: "5110",
    accountName: "Facilities & Utilities",
    category: "expense",
    description: "Rent, power, water, maintenance",
  },
  {
    accountNumber: "5120",
    accountName: "Insurance",
    category: "expense",
    description: "Property, liability, and other insurance",
  },
  {
    accountNumber: "5210",
    accountName: "Worship & Creative Ministry",
    category: "expense",
    description: "Music, production, and worship costs",
  },
  {
    accountNumber: "5220",
    accountName: "Children & Youth Ministry",
    category: "expense",
    description: "Kids, youth, and family programs",
  },
  {
    accountNumber: "5230",
    accountName: "Small Groups & Discipleship",
    category: "expense",
    description: "Groups, classes, and care ministry",
  },
  {
    accountNumber: "5240",
    accountName: "Outreach & Missions",
    category: "expense",
    description: "Local outreach and missions support",
  },
  {
    accountNumber: "5310",
    accountName: "Office & Administration",
    category: "expense",
    description: "Supplies, software, postage, bank fees",
  },
  {
    accountNumber: "5320",
    accountName: "Communications & Marketing",
    category: "expense",
    description: "Print, ads, website, SMS/email tools",
  },
  {
    accountNumber: "5410",
    accountName: "Depreciation Expense",
    category: "expense",
    description: "Depreciation of buildings & equipment",
  },
]

/** Standard funds opened with every location’s books. */
export const DEFAULT_FUND_TEMPLATE: FundTemplateRow[] = [
  {
    code: "GEN",
    name: "General Fund",
    type: "unrestricted",
    description: "Default unrestricted operating fund for this location",
  },
  {
    code: "BLD",
    name: "Building Fund",
    type: "temporarily_restricted",
    description: "Facility and capital project gifts",
  },
  {
    code: "MIS",
    name: "Missions Fund",
    type: "temporarily_restricted",
    description: "Missions and outreach gifts",
  },
  {
    code: "DES",
    name: "Designated Fund",
    type: "temporarily_restricted",
    description: "Other donor-designated purposes",
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
    for (const fund of DEFAULT_FUND_TEMPLATE) {
      books.funds.push({
        id: `fund-${campusId.slice(0, 8)}-${fund.code.toLowerCase()}`,
        campusId,
        code: fund.code,
        name: fund.name,
        type: fund.type,
        budgetAmount: 0,
        encumberedAmount: 0,
        expendedAmount: 0,
        balance: 0,
        netAvailable: 0,
        description: fund.description,
        isActive: true,
      })
    }
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
 * Ensures each location has standard funds + OHADA-style church chart of accounts.
 * Idempotent — safe on create and on first books read.
 * Missing standard accounts are added without overwriting custom ones.
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

    const fundIdsByCode = new Map(existingFunds.map((f) => [f.code, f.id]))

    for (const fund of DEFAULT_FUND_TEMPLATE) {
      if (fundIdsByCode.has(fund.code)) continue
      const [created] = await db
        .insert(accountingFunds)
        .values({
          campusId,
          name: fund.name,
          code: fund.code,
          type: fund.type,
          budgetAmount: "0.00",
          balance: "0.00",
          description: fund.description,
        })
        .returning({ id: accountingFunds.id, code: accountingFunds.code })
      if (created) fundIdsByCode.set(created.code, created.id)
    }

    const generalFundId = fundIdsByCode.get("GEN") || null

    const existingAccounts = await db
      .select({ accountNumber: chartOfAccounts.accountNumber })
      .from(chartOfAccounts)
      .where(and(eq(chartOfAccounts.campusId, campusId), eq(chartOfAccounts.isActive, true)))

    const have = new Set(existingAccounts.map((a) => a.accountNumber))
    const missing = DEFAULT_COA_TEMPLATE.filter((row) => !have.has(row.accountNumber))

    if (missing.length > 0) {
      await db.insert(chartOfAccounts).values(
        missing.map((row) => ({
          campusId,
          fundId: generalFundId,
          accountNumber: row.accountNumber,
          accountName: row.accountName,
          category: row.category,
          description: row.description || null,
          openingBalance: "0.00",
        }))
      )
    }

    return { campusId, generalFundId, source: "db" as const, added: missing.length }
  } catch (err) {
    console.error("[provisionCampusBooks]", err)
    return seedMemoryBooks(campusId)
  }
}

/** Backfill standard books for every active location (safe / idempotent). */
export async function provisionAllCampusBooks() {
  try {
    const rows = await db
      .select({ id: campuses.id })
      .from(campuses)
      .where(eq(campuses.isActive, true))
    for (const row of rows) {
      await provisionCampusBooks(row.id)
    }
    return { count: rows.length }
  } catch (err) {
    console.error("[provisionAllCampusBooks]", err)
    return { count: 0 }
  }
}
