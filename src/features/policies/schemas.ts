import { z } from "zod"

export const POLICY_MODULES = [
  { value: "accounting", label: "Fund Accounting & Expenses" },
  { value: "giving", label: "Giving & Stewardship" },
  { value: "visitors", label: "Visitors & Follow-up" },
  { value: "members", label: "Members & Households" },
  { value: "safety", label: "Child Safety & Background Checks" },
  { value: "documents", label: "Documents & Vault" },
  { value: "campaigns", label: "Campaigns & Communications" },
  { value: "privacy", label: "Privacy & Data Retention" },
  { value: "general", label: "General Church Policy" },
] as const

export type PolicyModule = (typeof POLICY_MODULES)[number]["value"]

export const policyStatusSchema = z.enum(["draft", "published", "archived"])

export const createPolicySchema = z.object({
  title: z.string().min(3, "Title is required"),
  module: z.enum([
    "accounting",
    "giving",
    "visitors",
    "members",
    "safety",
    "documents",
    "campaigns",
    "privacy",
    "general",
  ]),
  summary: z.string().max(280).optional(),
  bodyHtml: z.string().min(1, "Policy body is required"),
  involvedRoles: z.array(z.string()).optional(),
  status: policyStatusSchema.default("draft"),
})

export const updatePolicySchema = createPolicySchema.partial()

export type CreatePolicyInput = z.infer<typeof createPolicySchema>
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>

export type ChurchPolicy = {
  id: string
  title: string
  module: PolicyModule
  summary: string
  bodyHtml: string
  involvedRoles: string[]
  status: "draft" | "published" | "archived"
  version: number
  updatedByName?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}
