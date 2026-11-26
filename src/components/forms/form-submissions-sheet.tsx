"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Inbox } from "lucide-react"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TablePanel, StatusPill } from "@/components/table-panel"
import { useFormDetail, useFormSubmissions } from "@/features/forms/hooks/use-forms"

type FormSubmissionsSheetProps = {
  formId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditForm?: (formId: string) => void
}

function answerText(value: unknown): string {
  if (value == null) return "—"
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(", ") || "—"
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return "—"
    }
  }
  const s = String(value).trim()
  return s || "—"
}

export function FormSubmissionsSheet({
  formId,
  open,
  onOpenChange,
  onEditForm,
}: FormSubmissionsSheetProps) {
  const { data: form, isLoading: formLoading } = useFormDetail(open ? formId : null)
  const { data: submissions = [], isLoading: subsLoading } = useFormSubmissions(
    open ? formId : null
  )

  const fields = React.useMemo(
    () =>
      (form?.fields ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [form?.fields]
  )

  const previewFields = fields.slice(0, 4)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset size="lg" className="bg-background p-0">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Inbox className="size-4 text-brand" strokeWidth={1.75} />
            Submissions
          </SheetTitle>
          <SheetDescription>
            {form
              ? `${form.title} · ${submissions.length} ${
                  submissions.length === 1 ? "response" : "responses"
                }`
              : "Responses people sent through the public form link."}
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="gap-4">
          {formLoading || (subsLoading && !submissions.length) ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !form ? (
            <p className="text-sm text-muted-foreground">Form not found.</p>
          ) : submissions.length === 0 ? (
            <Empty className="rounded-lg border border-border py-12">
              <EmptyHeader>
                <EmptyTitle>No submissions yet</EmptyTitle>
                <EmptyDescription>
                  Share <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/f/{form.slug}</code>{" "}
                  or the guest QR. Responses will show up here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <TablePanel selectable={false} reorderable={false}>
              <Table selectable={false} reorderable={false} className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Submitted</TableHead>
                    {previewFields.map((f) => (
                      <TableHead key={f.id}>{f.label}</TableHead>
                    ))}
                    {fields.length > previewFields.length ? (
                      <TableHead>More</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const extras = fields
                      .slice(previewFields.length)
                      .map((f) => {
                        const v = answerText(sub.answers[f.id])
                        return v === "—" ? null : `${f.label}: ${v}`
                      })
                      .filter(Boolean)
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="pl-4 align-top text-xs text-muted-foreground whitespace-nowrap">
                          {format(parseISO(sub.submittedAt), "MMM d, yyyy · h:mm a")}
                        </TableCell>
                        {previewFields.map((f) => (
                          <TableCell
                            key={f.id}
                            className="max-w-[14rem] truncate align-top text-sm text-foreground"
                            title={answerText(sub.answers[f.id])}
                          >
                            {answerText(sub.answers[f.id])}
                          </TableCell>
                        ))}
                        {fields.length > previewFields.length ? (
                          <TableCell className="max-w-[16rem] align-top text-xs text-muted-foreground">
                            {extras.length ? extras.join(" · ") : "—"}
                          </TableCell>
                        ) : null}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TablePanel>
          )}

          {form ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <StatusPill tone={form.status === "published" ? "success" : "neutral"}>
                {form.status}
              </StatusPill>
              <span>{form.fields.length} fields</span>
              {subsLoading ? (
                <span className="inline-flex items-center gap-1">
                  <Spinner className="size-3" /> Refreshing…
                </span>
              ) : null}
            </div>
          ) : null}
        </SheetBody>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {formId && onEditForm ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onOpenChange(false)
                onEditForm(formId)
              }}
            >
              Edit form
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
