import { z } from "zod"

export const FORM_FIELD_TYPES = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "checkboxes", label: "Checkboxes" },
] as const

export const formFieldSchema = z.object({
  label: z.string().min(1),
  fieldType: z
    .enum([
      "short_text",
      "long_text",
      "multiple_choice",
      "checkboxes",
      "email",
      "phone",
      "number",
      "date",
      "time",
    ])
    .default("short_text"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  orderIndex: z.number().int().optional(),
})

export const createFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  campusId: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  fields: z.array(formFieldSchema).optional(),
})

export const submitFormSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
})

export type CreateFormInput = z.infer<typeof createFormSchema>
export type SubmitFormInput = z.infer<typeof submitFormSchema>
export type FormFieldInput = z.infer<typeof formFieldSchema>

export type ChurchFormField = {
  id: string
  formId: string
  label: string
  fieldType: FormFieldInput["fieldType"]
  required: boolean
  options: string[]
  orderIndex: number
}

export type ChurchForm = {
  id: string
  campusId: string | null
  title: string
  slug: string
  description: string
  status: "draft" | "published" | "archived"
  fields: ChurchFormField[]
  submissionCount: number
  createdAt: string
  updatedAt: string
}

export type ChurchFormSubmission = {
  id: string
  formId: string
  answers: Record<string, unknown>
  submittedAt: string
}
