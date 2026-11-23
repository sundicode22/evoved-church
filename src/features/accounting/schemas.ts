import { z } from "zod"

export const fundTypeSchema = z.enum(["unrestricted", "temporarily_restricted", "permanently_restricted"])

export const createFundSchema = z.object({
  name: z.string().min(3, "Fund name is required"),
  code: z.string().min(2, "Fund code is required"), // e.g. "BLDG-01", "MISS-02"
  type: fundTypeSchema.default("unrestricted"),
  budgetAmount: z.number().nonnegative("Budget cannot be negative").default(0),
  description: z.string().optional(),
  campusId: z.string().uuid("Valid campus ID required").optional(),
})

export const createRequisitionSchema = z.object({
  fundId: z.string().uuid("Fund is required"),
  accountId: z.string().uuid("Chart of account is required"),
  vendorName: z.string().min(2, "Vendor name is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().min(5, "A descriptive purpose is required"),
  receiptUrl: z.string().url("Valid receipt URL required").optional().or(z.literal("")),
  campusId: z.string().uuid().optional(),
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

export type CreateFundInput = z.infer<typeof createFundSchema>
export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>
export type ApproveRequisitionInput = z.infer<typeof approveRequisitionSchema>
export type FundTransferInput = z.infer<typeof fundTransferSchema>
