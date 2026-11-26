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

export const genderSchema = z.enum(["male", "female", "unspecified"]).optional()
export const maritalStatusSchema = z
  .enum(["single", "married", "widowed", "divorced", "separated"])
  .optional()

export const createMemberSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  preferredName: z.string().optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  personType: personTypeEnumSchema.default("covenant_member"),
  recordedTitle: z.string().optional(),
  gender: genderSchema,
  maritalStatus: maritalStatusSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  occupation: z.string().optional(),
  notes: z.string().optional(),
  membershipDate: z.string().optional(),
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

export const householdRoleSchema = z.enum([
  "father",
  "mother",
  "spouse",
  "son",
  "daughter",
  "guardian",
  "head",
  "other",
])

export const updatePersonTypeSchema = z.object({
  personType: personTypeEnumSchema,
  changedByUserId: z.string().min(1, "Actor user id is required"),
  reason: z.string().optional(),
})

export const attachHouseholdSchema = z.object({
  householdId: z.string().uuid().optional(),
  householdName: z.string().min(2).optional(),
  householdRole: householdRoleSchema,
  campusId: z.string().uuid().optional(),
})

export const createHouseholdSchema = z.object({
  name: z.string().trim().min(2, "Household name is required"),
  campusId: z.string().uuid().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdatePersonTypeInput = z.infer<typeof updatePersonTypeSchema>
export type AttachHouseholdInput = z.infer<typeof attachHouseholdSchema>
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>
export type HouseholdRole = z.infer<typeof householdRoleSchema>
export type PersonType = z.infer<typeof personTypeEnumSchema>

export const HOUSEHOLD_ROLE_LABELS: Record<HouseholdRole, string> = {
  father: "Father",
  mother: "Mother",
  spouse: "Spouse",
  son: "Son",
  daughter: "Daughter",
  guardian: "Guardian",
  head: "Head of Household",
  other: "Other",
}

export const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  unspecified: "Unspecified",
}

export const MARITAL_STATUS_LABELS: Record<string, string> = {
  single: "Single",
  married: "Married",
  widowed: "Widowed",
  divorced: "Divorced",
  separated: "Separated",
}
