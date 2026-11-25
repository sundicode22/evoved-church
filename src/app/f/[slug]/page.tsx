"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SelectFormField,
  TextFormField,
  TextareaFormField,
} from "@/components/form-fields"
import { usePublicForm, useSubmitForm } from "@/features/forms/hooks/use-forms"
import type { ChurchForm, ChurchFormField } from "@/features/forms/schemas"

type AnswerValues = Record<string, string>

/** Build a Zod schema from the form's configured fields (required + email checks). */
function buildAnswersSchema(fields: ChurchFormField[]) {
  const shape: Record<string, z.ZodType<string>> = {}
  for (const field of fields) {
    let base: z.ZodType<string> = z.string()
    if (field.fieldType === "email") {
      base = z.string().refine(
        (v) => !v.trim() || z.string().email().safeParse(v.trim()).success,
        "Enter a valid email address"
      )
    }
    shape[field.id] = field.required
      ? base.refine((v) => v.trim().length > 0, "This field is required")
      : base
  }
  return z.object(shape)
}

function inputType(fieldType: ChurchFormField["fieldType"]) {
  switch (fieldType) {
    case "email":
      return "email"
    case "number":
      return "number"
    case "date":
      return "date"
    case "phone":
      return "tel"
    default:
      return "text"
  }
}

function PublicFormBody({
  church,
  pending,
  onSubmit,
}: {
  church: ChurchForm
  pending: boolean
  onSubmit: (answers: AnswerValues) => void
}) {
  const schema = React.useMemo(() => buildAnswersSchema(church.fields), [church.fields])
  const defaultValues = React.useMemo(
    () => Object.fromEntries(church.fields.map((f) => [f.id, ""])) as AnswerValues,
    [church.fields]
  )
  const form = useForm<AnswerValues>({
    resolver: zodResolver(schema) as Resolver<AnswerValues>,
    defaultValues,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="mt-4 space-y-5 rounded-lg border border-zinc-200/80 bg-white p-6 shadow-xs"
      >
        <div>
          <h1 className="text-xl font-medium text-zinc-900">{church.title}</h1>
          {church.description && (
            <p className="mt-1 text-sm text-zinc-500">{church.description}</p>
          )}
        </div>
        {church.fields.map((field) => {
          const label = `${field.label}${field.required ? " *" : ""}`
          if (field.fieldType === "long_text") {
            return (
              <TextareaFormField
                key={field.id}
                control={form.control}
                name={field.id}
                label={label}
                rows={4}
              />
            )
          }
          if (field.fieldType === "multiple_choice") {
            return (
              <SelectFormField
                key={field.id}
                control={form.control}
                name={field.id}
                label={label}
                options={field.options.map((o) => ({ value: o, label: o }))}
              />
            )
          }
          return (
            <TextFormField
              key={field.id}
              control={form.control}
              name={field.id}
              label={label}
              type={inputType(field.fieldType)}
            />
          )
        })}
        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-accent-cta text-white hover:bg-accent-cta"
        >
          Submit
        </Button>
      </form>
    </Form>
  )
}

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: form, isLoading, error } = usePublicForm(slug)
  const submit = useSubmitForm(slug)
  const [done, setDone] = React.useState(false)

  function onSubmit(answers: AnswerValues) {
    submit.mutate({ answers }, { onSuccess: () => setDone(true) })
  }

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <div className="mx-auto max-w-lg px-4 py-12">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">
          Evolve ChMS
        </p>
        {isLoading && (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {error && (
          <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            This form is unavailable or not published.
          </div>
        )}
        {form && !done && (
          <PublicFormBody church={form} pending={submit.isPending} onSubmit={onSubmit} />
        )}
        {done && (
          <div className="mt-8 rounded-lg border border-emerald-200 bg-white p-8 text-center shadow-xs">
            <h2 className="text-lg font-medium text-zinc-900">Thank you</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Your response was received.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
