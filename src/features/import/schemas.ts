import { z } from "zod"

export const importModeSchema = z.enum(["dry_run", "apply"])

/** Permissive parse — row-level errors collected in importService (dry-run friendly). */
export const memberCsvRowSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  householdName: z.string().optional().default(""),
  householdRole: z.string().optional().default(""),
})

export const givingCsvRowSchema = z.object({
  email: z.string().optional().default(""),
  memberName: z.string().optional().default(""),
  amount: z.coerce.number().optional().default(0),
  fundCode: z.string().optional().default(""),
  contributionDate: z.string().optional().default(""),
  method: z.string().optional().default(""),
  reference: z.string().optional().default(""),
})

export const importMembersBodySchema = z.object({
  mode: importModeSchema.default("dry_run"),
  rows: z.array(memberCsvRowSchema).min(1).max(5000),
})

export const importGivingBodySchema = z.object({
  mode: importModeSchema.default("dry_run"),
  rows: z.array(givingCsvRowSchema).min(1).max(5000),
})

export type ImportMembersBody = z.infer<typeof importMembersBodySchema>
export type ImportGivingBody = z.infer<typeof importGivingBodySchema>

export const MEMBER_CSV_HEADERS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "householdName",
  "householdRole",
] as const

export const GIVING_CSV_HEADERS = [
  "email",
  "memberName",
  "amount",
  "fundCode",
  "contributionDate",
  "method",
  "reference",
] as const
