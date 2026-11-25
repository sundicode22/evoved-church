import { z } from "zod"

export const updateNomenclatureSchema = z.object({
  churchName: z.string().min(2).optional(),
  churchEmail: z.string().email().optional().or(z.literal("")),
  churchPhone: z.string().optional(),
  churchAddress: z.string().optional(),
  churchCity: z.string().optional(),
  churchState: z.string().optional(),
  churchZip: z.string().optional(),
  logoUrl: z.string().optional(),
  memberTermSingular: z.string().min(1).optional(),
  memberTermPlural: z.string().min(1).optional(),
  visitorTermSingular: z.string().min(1).optional(),
  visitorTermPlural: z.string().min(1).optional(),
  groupTermSingular: z.string().min(1).optional(),
  groupTermPlural: z.string().min(1).optional(),
  campusTermSingular: z.string().min(1).optional(),
  campusTermPlural: z.string().min(1).optional(),
  pastorTermSingular: z.string().min(1).optional(),
  givingTerm: z.string().min(1).optional(),
  currencyCode: z.string().min(3).max(10).optional(),
})

export const createCustomFieldSchema = z.object({
  entityType: z.enum(["member", "visitor", "group", "donation"]),
  fieldKey: z.string().min(2).regex(/^[a-z0-9_]+$/),
  fieldLabel: z.string().min(2),
  fieldType: z.enum(["text", "number", "date", "boolean", "select", "multi_select"]),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
  isConfidential: z.boolean().default(false),
})

/** Church details sheet (name, email, logo). */
export const churchDetailsFormSchema = z.object({
  churchName: z.string().trim().min(2, "Church name is required"),
  churchEmail: z.string().trim().email("Enter a valid email").or(z.literal("")),
  logoUrl: z.string().trim(),
})

/** Church contact sheet. */
export const churchContactFormSchema = z.object({
  churchPhone: z.string().trim(),
  churchAddress: z.string().trim(),
  churchCity: z.string().trim(),
  churchState: z.string().trim(),
  churchZip: z.string().trim(),
})

/** Nomenclature dictionary form. */
export const nomenclatureFormSchema = z.object({
  churchName: z.string().trim().min(2, "Church name is required"),
  currencyCode: z.string().trim().min(3, "Use a 3-letter currency code").max(10).toUpperCase(),
  memberTermSingular: z.string().trim().min(1, "Required"),
  memberTermPlural: z.string().trim().min(1, "Required"),
  groupTermSingular: z.string().trim().min(1, "Required"),
  campusTermSingular: z.string().trim().min(1, "Required"),
  pastorTermSingular: z.string().trim().min(1, "Required"),
  givingTerm: z.string().trim().min(1, "Required"),
})

/** Integration credential sheets (demo — stored locally). */
export const stripeIntegrationSchema = z.object({
  publishableKey: z.string().trim().min(1, "Publishable key is required"),
  secretKey: z.string().trim().min(1, "Secret key is required"),
})

export const resendIntegrationSchema = z.object({
  apiKey: z.string().trim().min(1, "API key is required"),
  fromEmail: z.string().trim().email("Enter a valid email"),
})

export const twilioIntegrationSchema = z.object({
  accountSid: z.string().trim().min(1, "Account SID is required"),
  authToken: z.string().trim().min(1, "Auth token is required"),
  fromNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "Use international format, e.g. +15551234567"),
})

export type UpdateNomenclatureInput = z.infer<typeof updateNomenclatureSchema>
export type CreateCustomFieldInput = z.infer<typeof createCustomFieldSchema>
export type ChurchDetailsFormValues = z.infer<typeof churchDetailsFormSchema>
export type ChurchContactFormValues = z.infer<typeof churchContactFormSchema>
export type NomenclatureFormValues = z.infer<typeof nomenclatureFormSchema>
