import { db } from "@/lib/db"
import { campuses, churchFormFields, churchForms, churchFormSubmissions } from "@/lib/db/schema"
import { and, asc, desc, eq, sql } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  VISITOR_INTAKE_FIELDS,
  VISITOR_INTAKE_SLUG,
  createFormSchema,
  formFieldSchema,
  formPurposeSchema,
  submitFormSchema,
  type ChurchForm,
  type ChurchFormField,
  type ChurchFormSubmission,
  type CreateFormInput,
  type FormFieldInput,
  type FormPurpose,
  type PublicChurchProfile,
  type PublicFormPayload,
  type SubmitFormInput,
} from "./schemas"
import { settingsService } from "@/features/settings/service"
import { visitorService } from "@/features/visitors/service"

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
}

function mapField(row: typeof churchFormFields.$inferSelect): ChurchFormField {
  return {
    id: row.id,
    formId: row.formId,
    label: row.label,
    fieldType: row.fieldType,
    required: row.required,
    options: row.options || [],
    orderIndex: row.orderIndex,
  }
}

async function loadForm(id: string): Promise<ChurchForm> {
  const [form] = await db.select().from(churchForms).where(eq(churchForms.id, id)).limit(1)
  if (!form) throw new NotFoundError("Form", id)
  const fields = await db
    .select()
    .from(churchFormFields)
    .where(eq(churchFormFields.formId, id))
    .orderBy(asc(churchFormFields.orderIndex))
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(churchFormSubmissions)
    .where(eq(churchFormSubmissions.formId, id))
  const purposeParsed = formPurposeSchema.safeParse(form.purpose || "general")
  return {
    id: form.id,
    campusId: form.campusId,
    title: form.title,
    slug: form.slug,
    description: form.description || "",
    purpose: (purposeParsed.success ? purposeParsed.data : "general") as FormPurpose,
    status: form.status as ChurchForm["status"],
    fields: fields.map(mapField),
    submissionCount: count || 0,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
  }
}

function answerText(
  answers: Record<string, unknown>,
  fieldId: string
): string {
  const raw = answers[fieldId]
  if (raw == null) return ""
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean).join(", ")
  return String(raw).trim()
}

function mapVisitorAnswers(
  form: ChurchForm,
  answers: Record<string, unknown>
): {
  contactName: string
  contactEmail: string
  contactPhone: string
  location: string
  source: string
  title: string
  notes: string
} {
  let contactName = ""
  let contactEmail = ""
  let contactPhone = ""
  let location = ""
  let source = ""
  let notes = ""
  let title = ""

  for (const field of form.fields) {
    const value = answerText(answers, field.id)
    if (!value) continue
    const label = field.label.toLowerCase()
    if (field.fieldType === "email" || label.includes("email")) {
      contactEmail = value
      continue
    }
    if (field.fieldType === "phone" || label.includes("phone")) {
      contactPhone = value
      continue
    }
    if (label.includes("source") || label.includes("how did you")) {
      source = value
      continue
    }
    if (label.includes("location") || label.includes("campus")) {
      location = value
      continue
    }
    if (label === "title" || label.includes("family")) {
      title = value
      continue
    }
    if (
      field.fieldType === "long_text" ||
      label.includes("help") ||
      label.includes("pray") ||
      label.includes("note") ||
      label.includes("message")
    ) {
      notes = notes ? `${notes}\n${value}` : value
      continue
    }
    if (
      !contactName &&
      (label.includes("name") || field.fieldType === "short_text")
    ) {
      contactName = value
    }
  }

  if (!contactName) {
    const first = form.fields.find((f) => answerText(answers, f.id))
    contactName = first ? answerText(answers, first.id) : "Guest"
  }

  return {
    contactName,
    contactEmail,
    contactPhone,
    location,
    source: source || "Visitor form",
    title: title || `Guest — ${contactName}`,
    notes,
  }
}

export const formsService = {
  async list(): Promise<ChurchForm[]> {
    const forms = await db.select().from(churchForms).orderBy(desc(churchForms.updatedAt))
    const result: ChurchForm[] = []
    for (const f of forms) {
      result.push(await loadForm(f.id))
    }
    return result
  },

  async getById(id: string): Promise<ChurchForm> {
    return loadForm(id)
  },

  async getChurchProfile(): Promise<PublicChurchProfile> {
    const nom = await settingsService.getNomenclature("default")
    return {
      churchName: nom.churchName || "Our Church",
      churchEmail: nom.churchEmail || "",
      churchPhone: nom.churchPhone || "",
      churchAddress: nom.churchAddress || "",
      churchCity: nom.churchCity || "",
      churchState: nom.churchState || "",
      churchZip: nom.churchZip || "",
      logoUrl: nom.logoUrl || "",
      pastorTermSingular: nom.pastorTermSingular || "Pastor",
    }
  },

  async getPublishedBySlug(slug: string): Promise<ChurchForm> {
    const [form] = await db.select().from(churchForms).where(eq(churchForms.slug, slug)).limit(1)
    if (!form) throw new NotFoundError("Form", slug)
    const full = await loadForm(form.id)
    if (full.status !== "published") {
      throw new ValidationError("This form is not accepting submissions")
    }
    return full
  },

  async getBySlug(slug: string): Promise<PublicFormPayload> {
    const full = await this.getPublishedBySlug(slug)
    const church = await this.getChurchProfile()
    return { ...full, church }
  },

  async create(input: CreateFormInput): Promise<ChurchForm> {
    const parsed = createFormSchema.parse(input)
    const purpose = parsed.purpose ?? "general"
    const slug =
      parsed.slug ||
      (purpose === "visitor_intake" ? VISITOR_INTAKE_SLUG : slugify(parsed.title))
    const existing = await db.select().from(churchForms).where(eq(churchForms.slug, slug)).limit(1)
    if (existing[0]) throw new ValidationError("Slug already in use")

    let campusId = parsed.campusId || null
    if (!campusId) {
      const [c] = await db.select({ id: campuses.id }).from(campuses).limit(1)
      campusId = c?.id || null
    }

    const [form] = await db
      .insert(churchForms)
      .values({
        campusId,
        title: parsed.title,
        slug,
        description: parsed.description || "",
        purpose,
        status: "draft",
      })
      .returning()

    const fieldInputs = parsed.fields?.length
      ? parsed.fields
      : purpose === "visitor_intake"
        ? VISITOR_INTAKE_FIELDS
        : [
            { label: "Name", fieldType: "short_text" as const, required: true },
            { label: "Email", fieldType: "email" as const, required: true },
          ]

    for (let i = 0; i < fieldInputs.length; i++) {
      const f = fieldInputs[i]
      await db.insert(churchFormFields).values({
        formId: form.id,
        label: f.label,
        fieldType: f.fieldType ?? "short_text",
        required: f.required ?? false,
        options: f.options ?? [],
        orderIndex: f.orderIndex ?? i,
      })
    }

    return loadForm(form.id)
  },

  /** Get or create the published visitor intake form used by Visitors + welcome QR. */
  async ensureVisitorIntakeForm(): Promise<ChurchForm> {
    const byPurpose = await db
      .select()
      .from(churchForms)
      .where(eq(churchForms.purpose, "visitor_intake"))
      .limit(1)
    if (byPurpose[0]) {
      const full = await loadForm(byPurpose[0].id)
      if (full.status !== "published") return this.publish(full.id)
      return full
    }

    const bySlug = await db
      .select()
      .from(churchForms)
      .where(eq(churchForms.slug, VISITOR_INTAKE_SLUG))
      .limit(1)
    if (bySlug[0]) {
      await db
        .update(churchForms)
        .set({ purpose: "visitor_intake", updatedAt: new Date() })
        .where(eq(churchForms.id, bySlug[0].id))
      const full = await loadForm(bySlug[0].id)
      if (full.status !== "published") return this.publish(full.id)
      return full
    }

    const created = await this.create({
      title: "Visitor Connect",
      slug: VISITOR_INTAKE_SLUG,
      description: "Share your details so our welcome team can follow up.",
      purpose: "visitor_intake",
      status: "draft",
      fields: VISITOR_INTAKE_FIELDS,
    })
    return this.publish(created.id)
  },

  async addField(formId: string, input: FormFieldInput): Promise<ChurchForm> {
    const form = await loadForm(formId)
    if (form.status === "published") {
      throw new ValidationError(
        "This form is open for submissions. Unpublish it before adding or changing fields."
      )
    }
    const parsed = formFieldSchema.parse(input)
    const nextIndex =
      form.fields.reduce((m, f) => Math.max(m, f.orderIndex), -1) + 1
    await db.insert(churchFormFields).values({
      formId,
      label: parsed.label,
      fieldType: parsed.fieldType ?? "short_text",
      required: parsed.required ?? false,
      options: parsed.options ?? [],
      orderIndex: parsed.orderIndex ?? nextIndex,
    })
    await db
      .update(churchForms)
      .set({ updatedAt: new Date() })
      .where(eq(churchForms.id, formId))
    return loadForm(formId)
  },

  async removeField(formId: string, fieldId: string): Promise<ChurchForm> {
    const form = await loadForm(formId)
    if (form.status === "published") {
      throw new ValidationError(
        "This form is open for submissions. Unpublish it before changing fields."
      )
    }
    await db
      .delete(churchFormFields)
      .where(and(eq(churchFormFields.id, fieldId), eq(churchFormFields.formId, formId)))
    await db
      .update(churchForms)
      .set({ updatedAt: new Date() })
      .where(eq(churchForms.id, formId))
    return loadForm(formId)
  },

  async submit(slug: string, input: SubmitFormInput): Promise<ChurchFormSubmission> {
    const form = await this.getPublishedBySlug(slug)
    const parsed = submitFormSchema.parse(input)
    const [sub] = await db
      .insert(churchFormSubmissions)
      .values({
        formId: form.id,
        answers: parsed.answers as Record<string, unknown>,
      })
      .returning()

    if (form.purpose === "visitor_intake") {
      try {
        const mapped = mapVisitorAnswers(form, parsed.answers as Record<string, unknown>)
        await visitorService.createLead({
          contactName: mapped.contactName,
          title: mapped.notes
            ? `${mapped.title} — ${mapped.notes.slice(0, 80)}`
            : mapped.title,
          contactEmail: mapped.contactEmail || "",
          contactPhone: mapped.contactPhone || "",
          location: mapped.location || undefined,
          source: mapped.source,
          value: 0,
          tags: ["form"],
          ...(form.campusId ? { campusId: form.campusId } : {}),
        })
      } catch (e) {
        console.error("[formsService.submit] visitor lead bridge failed", e)
      }
    }

    return {
      id: sub.id,
      formId: sub.formId,
      answers: (sub.answers as Record<string, unknown>) || {},
      submittedAt: sub.submittedAt.toISOString(),
    }
  },

  async publish(id: string): Promise<ChurchForm> {
    const form = await loadForm(id)
    if (form.fields.length === 0) {
      throw new ValidationError("Add at least one field before publishing")
    }
    await db
      .update(churchForms)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(churchForms.id, id))
    return loadForm(id)
  },

  async unpublish(id: string): Promise<ChurchForm> {
    await loadForm(id)
    await db
      .update(churchForms)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(churchForms.id, id))
    return loadForm(id)
  },

  async listSubmissions(formId: string): Promise<ChurchFormSubmission[]> {
    await loadForm(formId)
    const rows = await db
      .select()
      .from(churchFormSubmissions)
      .where(eq(churchFormSubmissions.formId, formId))
      .orderBy(desc(churchFormSubmissions.submittedAt))
      .limit(200)
    return rows.map((s) => ({
      id: s.id,
      formId: s.formId,
      answers: (s.answers as Record<string, unknown>) || {},
      submittedAt: s.submittedAt.toISOString(),
    }))
  },
}
