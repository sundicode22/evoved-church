import { z } from "zod"

export const personTypeEnumSchema = z.enum([
  "visitor",
  "prospect",
  "regular_attender",
  "covenant_member",
  "volunteer",
  "leader",
  "staff_minister",
  "donor_only",
  "inactive_alumni",
])

export const createMemberSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  personType: personTypeEnumSchema.default("covenant_member"),
  recordedTitle: z.string().optional(), // "Reverend", "Elder", "Deacon", "Dr."
  ministryRoles: z.array(z.string()).default([]),
  campusId: z.string().uuid("Campus ID required").optional(),
  categoryId: z.string().uuid().optional(),
  birthDate: z.string().optional(),
  salvationDate: z.string().optional(),
  baptismDate: z.string().optional(),
  baptismOfficiant: z.string().optional(),
  ordinationDate: z.string().optional(),
  ordinationCredentials: z.string().optional(),
  backgroundCheckStatus: z.enum(["none", "pending", "cleared", "expired"]).default("none"),
})

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  badgeColor: z.string().default("emerald"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type PersonType = z.infer<typeof personTypeEnumSchema>
