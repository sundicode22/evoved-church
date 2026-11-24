import { z } from "zod"

export const GIVING_METHODS = ["card", "ach_bank", "cash_envelope", "check", "crypto"] as const
export const GIVING_FREQUENCIES = ["one_time", "recurring"] as const
export const GIVING_CHANNELS = ["in_person", "online"] as const
export const GIVING_STATUSES = ["draft", "recorded", "posted_to_ledger"] as const
export const BATCH_STATUSES = ["open", "archived"] as const
export const PLEDGE_FREQUENCIES = ["weekly", "monthly", "yearly", "one_time"] as const
export const PLEDGE_STATUSES = ["active", "completed", "cancelled"] as const

export const givingMethodSchema = z.enum(GIVING_METHODS)
export const givingFrequencySchema = z.enum(GIVING_FREQUENCIES)
export const givingChannelSchema = z.enum(GIVING_CHANNELS)
export const givingStatusSchema = z.enum(GIVING_STATUSES)
export const batchStatusSchema = z.enum(BATCH_STATUSES)
export const pledgeFrequencySchema = z.enum(PLEDGE_FREQUENCIES)
export const pledgeStatusSchema = z.enum(PLEDGE_STATUSES)

export const createContributionSchema = z.object({
  campusId: z.string().min(1).optional(),
  memberId: z.string().optional().nullable(),
  fundId: z.string().min(1, "Fund is required"),
  batchId: z.string().optional().nullable(),
  pledgeId: z.string().optional().nullable(),
  amount: z.number().positive("Amount must be greater than zero"),
  method: givingMethodSchema.default("cash_envelope"),
  frequency: givingFrequencySchema.default("one_time"),
  channel: givingChannelSchema.default("in_person"),
  donorDisplayName: z.string().min(1, "Donor name is required"),
  notes: z.string().optional().nullable(),
  transactionReference: z.string().optional().nullable(),
  isTaxDeductible: z.boolean().default(true),
  contributionDate: z.string().min(8, "Contribution date is required"),
})

export const createBatchSchema = z.object({
  campusId: z.string().min(1).optional(),
  name: z.string().min(2, "Batch name is required"),
  batchDate: z.string().min(8, "Batch date is required"),
  notes: z.string().optional().nullable(),
  status: batchStatusSchema.default("open"),
})

export const updateBatchSchema = createBatchSchema.partial()

export const createPledgeSchema = z.object({
  campusId: z.string().min(1).optional(),
  memberId: z.string().min(1, "Member is required"),
  fundId: z.string().min(1, "Fund is required"),
  amountTotal: z.number().positive("Pledge amount must be greater than zero"),
  frequency: pledgeFrequencySchema.default("monthly"),
  startDate: z.string().min(8, "Start date is required"),
  endDate: z.string().optional().nullable(),
  status: pledgeStatusSchema.default("active"),
  memberDisplayName: z.string().optional(),
  fundName: z.string().optional(),
})

export const updatePledgeSchema = createPledgeSchema.partial()

export const postContributionSchema = z.object({
  postedByUserId: z.string().min(1, "Poster user id is required"),
})

export type GivingMethod = (typeof GIVING_METHODS)[number]
export type GivingFrequency = (typeof GIVING_FREQUENCIES)[number]
export type GivingChannel = (typeof GIVING_CHANNELS)[number]
export type GivingStatus = (typeof GIVING_STATUSES)[number]
export type BatchStatus = (typeof BATCH_STATUSES)[number]
export type PledgeFrequency = (typeof PLEDGE_FREQUENCIES)[number]
export type PledgeStatus = (typeof PLEDGE_STATUSES)[number]

export type CreateContributionInput = z.input<typeof createContributionSchema>
export type CreateBatchInput = z.input<typeof createBatchSchema>
export type UpdateBatchInput = z.input<typeof updateBatchSchema>
export type CreatePledgeInput = z.input<typeof createPledgeSchema>
export type UpdatePledgeInput = z.input<typeof updatePledgeSchema>
export type PostContributionInput = z.input<typeof postContributionSchema>

export interface GivingContribution {
  id: string
  campusId: string
  memberId: string | null
  fundId: string
  fundName: string
  batchId: string | null
  pledgeId: string | null
  amount: number
  method: GivingMethod
  frequency: GivingFrequency
  channel: GivingChannel
  status: GivingStatus
  journalEntryId: string | null
  donorDisplayName: string
  notes: string | null
  transactionReference: string | null
  isTaxDeductible: boolean
  contributionDate: string
  createdAt: string
}

export interface GivingSummary {
  total: number
  inPerson: number
  online: number
  recurring: number
}

export interface GivingListResult {
  contributions: GivingContribution[]
  summary: GivingSummary
}

export interface GivingBatch {
  id: string
  campusId: string
  name: string
  batchDate: string
  status: BatchStatus
  notes: string | null
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
  uniqueContributors: number
  totalAmount: number
}

export interface GivingPledge {
  id: string
  campusId: string
  memberId: string
  memberDisplayName: string
  fundId: string
  fundName: string
  amountTotal: number
  amountGiven: number
  frequency: PledgeFrequency
  startDate: string
  endDate: string | null
  status: PledgeStatus
  createdAt: string
  updatedAt: string
}

export const METHOD_LABELS: Record<GivingMethod, string> = {
  card: "Card",
  ach_bank: "ACH / Bank",
  cash_envelope: "Cash envelope",
  check: "Check",
  crypto: "Crypto",
}

export const STATUS_LABELS: Record<GivingStatus, string> = {
  draft: "Draft",
  recorded: "Recorded",
  posted_to_ledger: "Posted to books",
}
