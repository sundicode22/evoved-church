"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Copy, ExternalLink, Plus, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import {
  DateFormField,
  SelectFormField,
  TextFormField,
  TextareaFormField,
  TimeFormField,
} from "@/components/form-fields"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FieldGroup } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KanbanBoard } from "@/components/visitors/kanban-board"
import { RequireAbility, Can } from "@/components/auth/can"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  ViewToggle,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { TableExportButton } from "@/components/table-export-button"
import {
  useCreateLead,
  useVisitorBoard,
  useVisitorLeads,
} from "@/features/visitors/hooks/use-visitor-leads"
import { VISITOR_STAGE_LABELS, type VisitorStage } from "@/features/visitors/schemas"
import { useVisitorIntakeForm } from "@/features/forms/hooks/use-forms"
import type { ChurchFormField } from "@/features/forms/schemas"
import { cn } from "@/lib/utils"

const COLUMNS: ColumnOption[] = [
  { id: "contact", label: "Contact" },
  { id: "stage", label: "Stage" },
  { id: "source", label: "Source" },
  { id: "location", label: "Location" },
  { id: "assignee", label: "Assignee" },
  { id: "updated", label: "Updated" },
]

type AnswerValues = Record<string, string>

function stageTone(stage: string): "neutral" | "success" | "warning" | "info" {
  if (stage === "active_partner") return "success"
  if (stage === "first_visit") return "info"
  if (stage === "welcome_call" || stage === "pastoral_visit") return "warning"
  return "neutral"
}

function assigneeLabel(row: { assignedToName?: unknown; assignee?: unknown }) {
  if (typeof row.assignedToName === "string" && row.assignedToName) return row.assignedToName
  if (typeof row.assignee === "string" && row.assignee) return row.assignee
  if (row.assignee && typeof row.assignee === "object" && "name" in row.assignee) {
    const name = (row.assignee as { name?: unknown }).name
    return typeof name === "string" ? name : ""
  }
  return ""
}

function buildAnswersSchema(fields: ChurchFormField[]) {
  const shape: Record<string, z.ZodType<string>> = {}
  for (const field of fields) {
    let base: z.ZodType<string> = z.string()
    if (field.fieldType === "email") {
      base = z.string().refine(
        (v) => !v.trim() || z.string().email().safeParse(v.trim()).success,
        "Enter a valid email"
      )
    }
    shape[field.id] = field.required
      ? base.refine((v) => v.trim().length > 0, "Required")
      : base
  }
  return z.object(shape)
}

function mapAnswersToLead(
  fields: ChurchFormField[],
  answers: AnswerValues
): {
  contactName: string
  contactEmail: string
  contactPhone: string
  location?: string
  source: string
  title: string
} {
  let contactName = ""
  let contactEmail = ""
  let contactPhone = ""
  let location = ""
  let source = ""
  let notes = ""

  for (const field of fields) {
    const value = (answers[field.id] || "").trim()
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
    if (label.includes("source")) {
      source = value
      continue
    }
    if (label.includes("location") || label.includes("campus")) {
      location = value
      continue
    }
    if (
      field.fieldType === "long_text" ||
      label.includes("help") ||
      label.includes("note")
    ) {
      notes = value
      continue
    }
    if (!contactName && (label.includes("name") || field.fieldType === "short_text")) {
      contactName = value
    }
  }

  if (!contactName) contactName = "Guest"
  return {
    contactName,
    contactEmail,
    contactPhone,
    location: location || undefined,
    source: source || "Staff entry",
    title: notes ? `Guest — ${contactName} — ${notes.slice(0, 60)}` : `Guest — ${contactName}`,
  }
}

function publicUrl(slug: string) {
  if (typeof window === "undefined") return `/f/${slug}`
  return `${window.location.origin}/f/${slug}`
}

export default function VisitorsPage() {
  const [view, setView] = React.useState<"table" | "board">("table")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)
  const createLead = useCreateLead()
  const { data: listRes, isLoading, refetch } = useVisitorLeads(1, 50, undefined, search)
  const board = useVisitorBoard(search)
  const { data: intakeForm, isLoading: intakeLoading } = useVisitorIntakeForm(true)

  const fields = React.useMemo(
    () =>
      (intakeForm?.fields ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [intakeForm]
  )

  const schema = React.useMemo(() => buildAnswersSchema(fields), [fields])
  const defaultValues = React.useMemo(
    () => Object.fromEntries(fields.map((f) => [f.id, ""])) as AnswerValues,
    [fields]
  )

  const form = useForm<AnswerValues>({
    resolver: zodResolver(schema) as Resolver<AnswerValues>,
    defaultValues,
  })

  React.useEffect(() => {
    if (sheetOpen) form.reset(defaultValues)
  }, [sheetOpen, defaultValues, form])

  const rows = React.useMemo(() => {
    if (listRes?.data?.length) return listRes.data
    const stages = board.data?.stages ?? []
    return stages.flatMap((col: { leads?: unknown[] }) => col.leads ?? [])
  }, [listRes, board.data])

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  const exportPayload = React.useMemo(
    () => ({
      filename: "visitors",
      title: "Visitors",
      headers: ["Contact", "Email/Phone", "Stage", "Source", "Location", "Assignee"],
      rows: (rows as Record<string, unknown>[]).map((row) => [
        String(row.contactName || row.title || ""),
        String(row.contactEmail || row.contactPhone || ""),
        String(row.stage || "").replaceAll("_", " "),
        String(row.source || ""),
        String(row.location || ""),
        assigneeLabel(row as { assignedToName?: unknown; assignee?: unknown }),
      ]),
    }),
    [rows]
  )

  const cards = React.useMemo(() => {
    const list = rows as { stage?: string }[]
    const total = list.length
    const firstVisit = list.filter((r) => r.stage === "first_visit").length
    const inFollowUp = list.filter(
      (r) => r.stage === "welcome_call" || r.stage === "pastoral_visit"
    ).length
    const activePartners = list.filter((r) => r.stage === "active_partner").length
    return [
      { label: "Total visitors", value: total },
      { label: "First visit", value: firstVisit },
      { label: "In follow-up", value: inFollowUp },
      { label: "Active partners", value: activePartners },
    ]
  }, [rows])

  function openCreate() {
    form.reset(defaultValues)
    setSheetOpen(true)
  }

  const submit = form.handleSubmit(async (values) => {
    if (!fields.length) {
      toast.error("Visitor form has no fields yet — open Forms to build it.")
      return
    }
    const mapped = mapAnswersToLead(fields, values)
    try {
      await createLead.mutateAsync({
        ...mapped,
        value: 0,
        tags: ["form"],
      })
      setSheetOpen(false)
      form.reset(defaultValues)
      await refetch()
      await board.refetch()
    } catch {
      /* toast in hook */
    }
  })

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="visitors.read">
          <PageHeader
            title="Visitors"
            description="Follow up with guests. Intake fields come from the Forms builder."
            icon={<UserPlus className="size-5 text-brand" strokeWidth={1.75} />}
            actions={<ViewToggle value={view} onChange={setView} />}
          />

          <div className="space-y-4 p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((c) => (
                <div
                  key={c.label}
                  className="flex min-h-[112px] flex-col justify-between rounded-xl border border-border bg-card px-5 py-5 shadow-xs"
                >
                  <p className="text-sm font-normal text-zinc-500">{c.label}</p>
                  <p className="text-3xl font-medium tracking-tight text-foreground">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {intakeForm ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-zinc-600 shadow-xs">
                <span className="font-medium text-foreground">{intakeForm.title}</span>
                <StatusPill tone={intakeForm.status === "published" ? "success" : "neutral"}>
                  {intakeForm.status}
                </StatusPill>
                <code className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                  /f/{intakeForm.slug}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(publicUrl(intakeForm.slug))
                    toast.success("Public link copied")
                  }}
                >
                  <Copy className="size-3.5" />
                  Copy link
                </Button>
                {intakeForm.status === "published" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/f/${intakeForm.slug}`, "_blank")}
                  >
                    <ExternalLink className="size-3.5" />
                    Open
                  </Button>
                ) : null}
                <Link
                  href="/dashboard/forms"
                  className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-sm shadow-xs hover:bg-input/50"
                >
                  Edit in form builder
                </Link>
              </div>
            ) : intakeLoading ? (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-zinc-500 shadow-xs">
                Loading visitor form…
              </div>
            ) : null}

            {view === "board" ? (
              <TablePanel selectable={false} reorderable={false}>
                <div className="mb-3 flex justify-end">
                  <Can permission="visitors.write">
                    <TableAddButton onClick={openCreate}>
                      <Plus className="size-3.5" strokeWidth={1.75} />
                      Add Visitor
                    </TableAddButton>
                  </Can>
                </div>
                <KanbanBoard embedded />
              </TablePanel>
            ) : (
              <TablePanel>
                <TableChrome
                  search={
                    <TableSearch
                      value={search}
                      onChange={(v) => {
                        setSearch(v)
                        setPage(1)
                      }}
                      placeholder="Search visitors…"
                    />
                  }
                  trailing={
                    <>
                      <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                      <TableExportButton payload={exportPayload} />
                      <Can permission="visitors.write">
                        <TableAddButton onClick={openCreate}>
                          <Plus className="size-3.5" strokeWidth={1.75} />
                          Add Visitor
                        </TableAddButton>
                      </Can>
                    </>
                  }
                />
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {isVisible("contact") && <TableHead>Contact</TableHead>}
                      {isVisible("stage") && <TableHead>Stage</TableHead>}
                      {isVisible("source") && <TableHead>Source</TableHead>}
                      {isVisible("location") && <TableHead>Location</TableHead>}
                      {isVisible("assignee") && <TableHead>Assignee</TableHead>}
                      {isVisible("updated") && <TableHead>Updated</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && board.isLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                          Loading…
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                          No visitors yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {pageRows.map((row: Record<string, unknown>) => (
                      <TableRow key={String(row.id)}>
                        {isVisible("contact") && (
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {String(row.contactName || row.title || "—")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {String(row.contactEmail || row.contactPhone || row.title || "")}
                            </div>
                          </TableCell>
                        )}
                        {isVisible("stage") && (
                          <TableCell>
                            <StatusPill tone={stageTone(String(row.stage || ""))}>
                              {VISITOR_STAGE_LABELS[row.stage as VisitorStage] ||
                                String(row.stage || "")}
                            </StatusPill>
                          </TableCell>
                        )}
                        {isVisible("source") && (
                          <TableCell className="text-zinc-600">
                            {String(row.source || "—")}
                          </TableCell>
                        )}
                        {isVisible("location") && (
                          <TableCell className="text-zinc-600">
                            {String(row.location || "—")}
                          </TableCell>
                        )}
                        {isVisible("assignee") && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "flex size-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-medium text-white"
                                )}
                              >
                                {(assigneeLabel(row) || "?").slice(0, 1)}
                              </span>
                              <span className="text-sm text-zinc-600">
                                {assigneeLabel(row) || "Unassigned"}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {isVisible("updated") && (
                          <TableCell className="text-zinc-500">
                            {row.updatedAt || row.stageChangedAt || row.createdAt
                              ? formatDistanceToNow(
                                  new Date(
                                    String(
                                      row.updatedAt || row.stageChangedAt || row.createdAt
                                    )
                                  ),
                                  { addSuffix: true }
                                )
                              : "—"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  page={page}
                  pageSize={pageSize}
                  total={rows.length}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s)
                    setPage(1)
                  }}
                />
              </TablePanel>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">Add visitor</SheetTitle>
                  <SheetDescription>
                    Fields come from{" "}
                    <strong className="font-medium text-zinc-800">
                      {intakeForm?.title || "Visitor Connect"}
                    </strong>{" "}
                    in the form builder. Edit them under Forms.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  {intakeLoading ? (
                    <p className="text-sm text-zinc-500">Loading form fields…</p>
                  ) : fields.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No fields yet.{" "}
                      <Link href="/dashboard/forms" className="text-brand hover:underline">
                        Open the form builder
                      </Link>{" "}
                      to add them.
                    </p>
                  ) : (
                    <Form {...form}>
                      <FieldGroup className="gap-4">
                        {fields.map((field) => {
                          const label = `${field.label}${field.required ? " *" : ""}`
                          if (field.fieldType === "long_text") {
                            return (
                              <TextareaFormField
                                key={field.id}
                                control={form.control}
                                name={field.id}
                                label={label}
                                rows={3}
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
                                options={(field.options || []).map((o) => ({
                                  value: o,
                                  label: o,
                                }))}
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
                              type={
                                field.fieldType === "email"
                                  ? "email"
                                  : field.fieldType === "phone"
                                    ? "tel"
                                    : field.fieldType === "number"
                                      ? "number"
                                      : "text"
                              }
                            />
                          )
                        })}
                      </FieldGroup>
                    </Form>
                  )}
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createLead.isPending || fields.length === 0}
                  >
                    {createLead.isPending ? "Saving…" : "Add visitor"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
