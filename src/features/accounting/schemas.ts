import { z } from "zod"

export const fundTypeSchema = z.enum(["unrestricted", "temporarily_restricted", "permanently_restricted"])

export const createFundSchema = z.object({
  name: z.string().min(3, "Fund name is required"),
  code: z.string().min(2, "Fund code is required"), // e.g. "BLDG-01", "MISS-02"
  type: fundTypeSchema.default("unrestricted"),
  budgetAmount: z.number().nonnegative("Budget cannot be negative").default(0),
  description: z.string().optional(),
  campusId: z.string().min(1).optional(),
})

export const createBudgetLineSchema = z.object({
  fundId: z.string().min(1, "Fund is required"),
  accountId: z.string().optional(),
  fiscalYear: z.number().int().min(2000).max(2100),
  department: z.string().optional(),
  label: z.string().min(2, "Line label is required"),
  allocatedAmount: z.number().nonnegative("Allocated amount cannot be negative"),
  notes: z.string().optional(),
  campusId: z.string().optional(),
})

export const createRequisitionSchema = z.object({
  fundId: z.string().min(1, "Fund is required"),
  accountId: z.string().min(1, "Chart of account is required"),
  vendorName: z.string().min(2, "Vendor name is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().min(5, "A descriptive purpose is required"),
  receiptUrl: z.string().url("Valid receipt URL required").optional().or(z.literal("")),
  campusId: z.string().optional(),
})

export const approveRequisitionSchema = z.object({
  decision: z.enum(["approved", "rejected", "requested_revision"]),
  comments: z.string().optional(),
})

export const fundTransferSchema = z.object({
  fromFundId: z.string().uuid("Source fund is required"),
  toFundId: z.string().uuid("Destination fund is required"),
  amount: z.number().positive("Transfer amount must be positive"),
  transferReason: z.string().min(5, "Transfer reason is required"),
  campusId: z.string().uuid().optional(),
})

export const journalLineSchema = z.object({
  accountId: z.string().uuid(),
  fundId: z.string().uuid(),
  debit: z.number().nonnegative().default(0),
  credit: z.number().nonnegative().default(0),
  memo: z.string().optional(),
})

export const createJournalEntrySchema = z.object({
  entryDate: z.string().datetime().or(z.string().min(8)),
  memo: z.string().min(3, "Memo is required"),
  campusId: z.string().uuid().optional(),
  lines: z.array(journalLineSchema).min(2, "At least two journal lines required"),
  createdByUserId: z.string().min(1, "Creator user id is required"),
})

export const postJournalEntrySchema = z.object({
  postedByUserId: z.string().min(1, "Poster user id is required"),
})

export type CreateFundInput = z.infer<typeof createFundSchema>
export type CreateBudgetLineInput = z.infer<typeof createBudgetLineSchema>
export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>
export type ApproveRequisitionInput = z.infer<typeof approveRequisitionSchema>
export type FundTransferInput = z.infer<typeof fundTransferSchema>
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>
export type PostJournalEntryInput = z.infer<typeof postJournalEntrySchema>
