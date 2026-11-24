import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createFormSchema,
  submitFormSchema,
  type ChurchForm,
  type ChurchFormField,
  type ChurchFormSubmission,
  type CreateFormInput,
  type SubmitFormInput,
} from "./schemas"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
}

const fieldsStore: ChurchFormField[] = [
  {
    id: "ff-1",
    formId: "form-1",
    label: "Full name",
    fieldType: "short_text",
    required: true,
    options: [],
    orderIndex: 0,
  },
  {
    id: "ff-2",
    formId: "form-1",
    label: "Email",
    fieldType: "email",
    required: true,
    options: [],
    orderIndex: 1,
  },
  {
    id: "ff-3",
    formId: "form-1",
    label: "How can we pray for you?",
    fieldType: "long_text",
    required: false,
    options: [],
    orderIndex: 2,
  },
  {
    id: "ff-4",
    formId: "form-2",
    label: "Name",
    fieldType: "short_text",
    required: true,
    options: [],
    orderIndex: 0,
  },
  {
    id: "ff-5",
    formId: "form-2",
    label: "Team interest",
    fieldType: "multiple_choice",
    required: true,
    options: ["Worship", "Kids", "Hospitality", "Tech"],
    orderIndex: 1,
  },
]

const forms: Omit<ChurchForm, "fields" | "submissionCount">[] = [
  {
    id: "form-1",
    campusId: DEMO_CAMPUS,
    title: "Prayer Request",
    slug: "prayer-request",
    description: "Share a prayer need with our pastoral care team.",
    status: "published",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "form-2",
    campusId: DEMO_CAMPUS,
    title: "Serve Interest",
    slug: "serve-interest",
    description: "Tell us where you'd like to serve.",
    status: "draft",
    createdAt: now(),
    updatedAt: now(),
  },
]

const submissions: ChurchFormSubmission[] = [
  {
    id: "sub-1",
    formId: "form-1",
    answers: { "ff-1": "Grace Thompson", "ff-2": "grace@example.org", "ff-3": "Healing" },
    submittedAt: now(),
  },
]

function withMeta(form: Omit<ChurchForm, "fields" | "submissionCount">): ChurchForm {
  return {
    ...form,
    fields: fieldsStore
      .filter((f) => f.formId === form.id)
      .sort((a, b) => a.orderIndex - b.orderIndex),
    submissionCount: submissions.filter((s) => s.formId === form.id).length,
  }
}

function findForm(id: string) {
  const f = forms.find((x) => x.id === id)
  if (!f) throw new NotFoundError("Form", id)
  return f
}

function findBySlug(slug: string) {
  const f = forms.find((x) => x.slug === slug)
  if (!f) throw new NotFoundError("Form", slug)
  return f
}

export const formsService = {
  async list(): Promise<ChurchForm[]> {
    return forms.map(withMeta).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  async getById(id: string): Promise<ChurchForm> {
    return withMeta(findForm(id))
  },

  async getBySlug(slug: string): Promise<ChurchForm> {
    const form = withMeta(findBySlug(slug))
    if (form.status !== "published") {
      throw new ValidationError("This form is not accepting submissions")
    }
    return form
  },

  async create(input: CreateFormInput): Promise<ChurchForm> {
    const parsed = createFormSchema.parse(input)
    const ts = now()
    const id = `form-${crypto.randomUUID()}`
    const slug = parsed.slug || slugify(parsed.title)
    if (forms.some((f) => f.slug === slug)) {
      throw new ValidationError("Slug already in use")
    }
    const form: Omit<ChurchForm, "fields" | "submissionCount"> = {
      id,
      campusId: parsed.campusId || DEMO_CAMPUS,
      title: parsed.title,
      slug,
      description: parsed.description ?? "",
      status: parsed.status ?? "draft",
      createdAt: ts,
      updatedAt: ts,
    }
    forms.unshift(form)
    const fieldInputs = parsed.fields?.length
      ? parsed.fields
      : [
          { label: "Name", fieldType: "short_text" as const, required: true },
          { label: "Email", fieldType: "email" as const, required: true },
        ]
    fieldInputs.forEach((f, i) => {
      fieldsStore.push({
        id: `ff-${crypto.randomUUID().slice(0, 8)}`,
        formId: id,
        label: f.label,
        fieldType: f.fieldType ?? "short_text",
        required: f.required ?? false,
        options: f.options ?? [],
        orderIndex: f.orderIndex ?? i,
      })
    })
    return withMeta(form)
  },

  async submit(slug: string, input: SubmitFormInput): Promise<ChurchFormSubmission> {
    const form = findBySlug(slug)
    if (form.status !== "published") {
      throw new ValidationError("This form is not accepting submissions")
    }
    const parsed = submitFormSchema.parse(input)
    const sub: ChurchFormSubmission = {
      id: `sub-${crypto.randomUUID()}`,
      formId: form.id,
      answers: parsed.answers,
      submittedAt: now(),
    }
    submissions.push(sub)
    form.updatedAt = now()
    return { ...sub }
  },

  async publish(id: string): Promise<ChurchForm> {
    const form = findForm(id)
    form.status = "published"
    form.updatedAt = now()
    return withMeta(form)
  },
}
