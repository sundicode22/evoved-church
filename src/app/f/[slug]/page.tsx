"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  DateFormField,
  SelectFormField,
  TextFormField,
  TextareaFormField,
  TimeFormField,
} from "@/components/form-fields"
import { usePublicForm, useSubmitForm } from "@/features/forms/hooks/use-forms"
import type {
  ChurchFormField,
  PublicChurchProfile,
  PublicFormPayload,
} from "@/features/forms/schemas"

type AnswerValues = Record<string, string>

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
    case "phone":
      return "tel"
    default:
      return "text"
  }
}

function formatAddress(church: PublicChurchProfile) {
  return [
    church.churchAddress,
    [church.churchCity, church.churchState].filter(Boolean).join(", "),
    church.churchZip,
  ]
    .filter(Boolean)
    .join(" · ")
}

function ChurchBrandHeader({ church }: { church: PublicChurchProfile }) {
  const address = formatAddress(church)
  return (
    <header className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
          {church.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={church.logoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-brand">
              {(church.churchName || "C").charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-zinc-950">
            {church.churchName || "Our Church"}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            We&apos;re glad you&apos;re reaching out. Your response goes to our{" "}
            {church.pastorTermSingular.toLowerCase()} care team.
          </p>
        </div>
      </div>

      {(church.churchPhone || church.churchEmail || address) && (
        <ul className="grid gap-2 rounded-xl border border-zinc-200/80 bg-white px-4 py-3 text-sm shadow-xs sm:grid-cols-1">
          {church.churchPhone ? (
            <li className="flex items-center gap-2.5 text-zinc-700">
              <Phone className="size-3.5 shrink-0 text-brand" />
              <a href={`tel:${church.churchPhone}`} className="hover:underline">
                {church.churchPhone}
              </a>
            </li>
          ) : null}
          {church.churchEmail ? (
            <li className="flex items-center gap-2.5 text-zinc-700">
              <Mail className="size-3.5 shrink-0 text-brand" />
              <a href={`mailto:${church.churchEmail}`} className="hover:underline">
                {church.churchEmail}
              </a>
            </li>
          ) : null}
          {address ? (
            <li className="flex items-start gap-2.5 text-zinc-700">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand" />
              <span>{address}</span>
            </li>
          ) : null}
        </ul>
      )}
    </header>
  )
}

function PublicFormBody({
  payload,
  pending,
  onSubmit,
}: {
  payload: PublicFormPayload
  pending: boolean
  onSubmit: (answers: AnswerValues) => void
}) {
  const schema = React.useMemo(
    () => buildAnswersSchema(payload.fields),
    [payload.fields]
  )
  const defaultValues = React.useMemo(
    () => Object.fromEntries(payload.fields.map((f) => [f.id, ""])) as AnswerValues,
    [payload.fields]
  )
  const form = useForm<AnswerValues>({
    resolver: zodResolver(schema) as Resolver<AnswerValues>,
    defaultValues,
  })

  return (
    <div className="space-y-5">
      <ChurchBrandHeader church={payload.church} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
          className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs sm:p-7"
        >
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              {payload.title}
            </h1>
            {payload.description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                {payload.description}
              </p>
            ) : null}
          </div>

          {payload.fields.map((field) => {
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
            if (field.fieldType === "date") {
              return (
                <DateFormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  label={label}
                />
              )
            }
            if (field.fieldType === "time") {
              return (
                <TimeFormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  label={label}
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

          <Button type="submit" disabled={pending} variant="primary" className="h-10 w-full">
            {pending ? (
              <>
                <Spinner className="size-3.5" />
                Submitting…
              </>
            ) : (
              "Submit"
            )}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-zinc-400">
            Your information is used only by {payload.church.churchName || "this church"} for
            pastoral care and follow-up. We won&apos;t sell or share it.
          </p>
        </form>
      </Form>

      <footer className="space-y-1 px-1 pb-4 text-center text-xs text-zinc-400">
        <p>
          Need help now?{" "}
          {payload.church.churchPhone ? (
            <a
              href={`tel:${payload.church.churchPhone}`}
              className="font-medium text-brand hover:underline"
            >
              Call {payload.church.churchPhone}
            </a>
          ) : payload.church.churchEmail ? (
            <a
              href={`mailto:${payload.church.churchEmail}`}
              className="font-medium text-brand hover:underline"
            >
              Email {payload.church.churchEmail}
            </a>
          ) : (
            <span>Reach out through this form and we&apos;ll respond soon.</span>
          )}
        </p>
        <p>Powered by Evolve</p>
      </footer>
    </div>
  )
}

function PublicFormPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: form, isLoading, error } = usePublicForm(slug)
  const submit = useSubmitForm(slug)
  const [done, setDone] = React.useState(false)

  function onSubmit(answers: AnswerValues) {
    submit.mutate({ answers }, { onSuccess: () => setDone(true) })
  }

  return (
    <div className="relative min-h-screen bg-[#fbfcfb]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(100,149,237,0.12),_transparent_60%)]"
      />
      <div className="relative mx-auto max-w-lg px-4 py-10 sm:py-14">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-xs">
            This form is unavailable or not published.
          </div>
        )}
        {form && !done && (
          <PublicFormBody
            payload={form}
            pending={submit.isPending}
            onSubmit={onSubmit}
          />
        )}
        {done && form && (
          <div className="space-y-5">
            <ChurchBrandHeader church={form.church} />
            <div className="rounded-2xl border border-zinc-200/80 bg-white px-6 py-10 text-center shadow-xs">
              <h2 className="text-xl font-semibold text-zinc-950">Thank you</h2>
              <p className="mt-2 text-sm text-zinc-600">
                {form.church.churchName || "Our church"} received your response. Someone from
                our team will follow up if needed.
              </p>
              {form.church.churchPhone ? (
                <p className="mt-4 text-sm text-zinc-500">
                  Urgent? Call{" "}
                  <a
                    href={`tel:${form.church.churchPhone}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {form.church.churchPhone}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PublicFormRoute() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfcfb]">
          <div className="mx-auto max-w-lg space-y-4 px-4 py-14">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      }
    >
      <PublicFormPage />
    </React.Suspense>
  )
}
