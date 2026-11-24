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

export type UpdateNomenclatureInput = z.infer<typeof updateNomenclatureSchema>
export type CreateCustomFieldInput = z.infer<typeof createCustomFieldSchema>
