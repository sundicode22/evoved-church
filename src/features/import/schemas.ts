import { z } from "zod"

export const importModeSchema = z.enum(["dry_run", "apply"])

export const memberCsvRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  householdName: z.string().optional(),
  householdRole: z.string().optional(),
})

export const givingCsvRowSchema = z.object({
  email: z.string().optional(),
  memberName: z.string().optional(),
  amount: z.coerce.number().positive(),
  fundCode: z.string().optional(),
  contributionDate: z.string().min(8),
  method: z.string().optional(),
  reference: z.string().optional(),
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
