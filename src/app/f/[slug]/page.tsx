"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePublicForm, useSubmitForm } from "@/features/forms/hooks/use-forms"

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: form, isLoading, error } = usePublicForm(slug)
  const submit = useSubmitForm(slug)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [done, setDone] = React.useState(false)

  function setAnswer(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    for (const field of form.fields) {
      if (field.required && !String(answers[field.id] || "").trim()) {
        return
      }
    }
    submit.mutate(
      { answers },
      {
        onSuccess: () => {
          setDone(true)
          setAnswers({})
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <div className="mx-auto max-w-lg px-4 py-12">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--brand)]">
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
          <form
            onSubmit={onSubmit}
            className="mt-4 space-y-5 rounded-lg border border-zinc-200/80 bg-white p-6 shadow-xs"
          >
            <div>
              <h1 className="text-xl font-medium text-zinc-900">{form.title}</h1>
              {form.description && (
                <p className="mt-1 text-sm text-zinc-500">{form.description}</p>
              )}
            </div>
            {form.fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                {field.fieldType === "long_text" ? (
                  <Textarea
                    className="min-h-24"
                    value={answers[field.id] || ""}
                    onChange={(e) => setAnswer(field.id, e.target.value)}
                    required={field.required}
                  />
                ) : field.fieldType === "multiple_choice" ? (
                  <Select
                    value={answers[field.id] || ""}
                    items={field.options.map((o) => ({ value: o, label: o }))}
                    onValueChange={(v) => v && setAnswer(field.id, v)}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={
                      field.fieldType === "email"
                        ? "email"
                        : field.fieldType === "number"
                          ? "number"
                          : field.fieldType === "date"
                            ? "date"
                            : field.fieldType === "phone"
                              ? "tel"
                              : "text"
                    }
                    className="h-9"
                    value={answers[field.id] || ""}
                    onChange={(e) => setAnswer(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <Button
              type="submit"
              disabled={submit.isPending}
              className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
            >
              Submit
            </Button>
          </form>
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
