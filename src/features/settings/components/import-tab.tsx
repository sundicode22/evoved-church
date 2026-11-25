"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { SelectFormField } from "@/components/form-fields"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileAttachment, type AttachmentFile } from "@/components/file-attachment"
import { ConfirmAction } from "@/components/confirm-action"
import { Can } from "@/components/auth/can"
import { StatusPill, TablePanel } from "@/components/table-panel"
import { apiClient, ApiResponse } from "@/lib/axios"
import type { ImportReport } from "@/features/import/service"
import {
  GIVING_CSV_HEADERS,
  MEMBER_CSV_HEADERS,
} from "@/features/import/schemas"
import { Download, HeartHandshake, Upload, Users } from "lucide-react"

type ImportKind = "members" | "giving"

const importFormSchema = z.object({
  kind: z.enum(["members", "giving"]),
  files: z
    .array(z.custom<AttachmentFile>())
    .min(1, "Upload a CSV first")
    .max(1, "Attach a single CSV file"),
})

type ImportFormValues = z.infer<typeof importFormSchema>

const IMPORT_TYPES: {
  id: ImportKind
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  headers: readonly string[]
}[] = [
  {
    id: "members",
    title: "Members / households",
    description: "People, contact details, and household roles from your previous ChMS.",
    icon: Users,
    headers: MEMBER_CSV_HEADERS,
  },
  {
    id: "giving",
    title: "Giving",
    description: "Contributions with fund codes, amounts, dates, and payment method.",
    icon: HeartHandshake,
    headers: GIVING_CSV_HEADERS,
  },
]

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? ""
    })
    return row
  })
}

function downloadTemplate(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildBody(kind: ImportKind, mode: "dry_run" | "apply", rows: Record<string, string>[]) {
  if (kind === "members") {
    return {
      mode,
      rows: rows.map((r) => ({
        firstName: r.firstName || r.first_name || "",
        lastName: r.lastName || r.last_name || "",
        email: r.email || "",
        phone: r.phone || "",
        householdName: r.householdName || r.household_name || "",
        householdRole: r.householdRole || r.household_role || "",
      })),
    }
  }
  return {
    mode,
    rows: rows.map((r) => ({
      email: r.email || "",
      memberName: r.memberName || r.member_name || "",
      amount: Number(r.amount),
      fundCode: r.fundCode || r.fund_code || "",
      contributionDate: r.contributionDate || r.contribution_date || "",
      method: r.method || "other",
      reference: r.reference || "",
    })),
  }
}

export function ImportTab({ canEdit }: { canEdit: boolean }) {
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: { kind: "members", files: [] },
  })
  const kind = useWatch({ control: form.control, name: "kind" })
  const files = useWatch({ control: form.control, name: "files" })
  const [parsedRows, setRows] = React.useState<Record<string, string>[]>([])
  const [rawReport, setReport] = React.useState<ImportReport | null>(null)
  const [confirmApply, setConfirmApply] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const active = IMPORT_TYPES.find((t) => t.id === kind)!

  const hasFile = Boolean(files[0]?.file)
  const rows = hasFile ? parsedRows : []
  const report = hasFile ? rawReport : null

  React.useEffect(() => {
    const file = files[0]?.file
    if (!file) return
    let cancelled = false
    void file.text().then((text) => {
      if (cancelled) return
      setRows(parseCsv(text))
      setReport(null)
    })
    return () => {
      cancelled = true
    }
  }, [files])

  // Switching import type invalidates any attached file.
  const lastKind = React.useRef(kind)
  React.useEffect(() => {
    if (lastKind.current === kind) return
    lastKind.current = kind
    form.setValue("files", [])
  }, [kind, form])

  function openImport(next: ImportKind) {
    form.reset({ kind: next, files: [] })
    setRows([])
    setReport(null)
    setSheetOpen(true)
  }

  async function dryRun() {
    if (rows.length === 0) {
      toast.error("CSV has no data rows")
      return
    }
    setBusy(true)
    try {
      const path = kind === "members" ? "/import/members" : "/import/giving"
      const res = await apiClient.post<ApiResponse<ImportReport>>(
        path,
        buildBody(kind, "dry_run", rows)
      )
      setReport(res.data.data!)
      toast.success(
        `Dry run: ${res.data.data!.valid}/${res.data.data!.total} valid` +
          (res.data.data!.errors.length ? `, ${res.data.data!.errors.length} errors` : "")
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed")
    } finally {
      setBusy(false)
    }
  }

  async function applyImport() {
    if (rows.length === 0) return
    setBusy(true)
    try {
      const path = kind === "members" ? "/import/members" : "/import/giving"
      const res = await apiClient.post<ApiResponse<ImportReport>>(
        path,
        buildBody(kind, "apply", rows)
      )
      setReport(res.data.data!)
      toast.success(`Imported ${res.data.data!.imported} rows`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed")
    } finally {
      setBusy(false)
    }
  }

  async function fetchTemplate() {
    const path =
      kind === "members" ? "/import/templates/members" : "/import/templates/giving"
    const res = await apiClient.get<ApiResponse<{ csv: string }>>(path)
    downloadTemplate(
      kind === "members" ? "evolve-members-template.csv" : "evolve-giving-template.csv",
      res.data.data!.csv
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">Import CSV</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Migrate from Planning Center, Breeze, Rock, or spreadsheets. Download a template, upload
          your file, dry-run, then apply.
        </p>
      </div>

      <TablePanel className="rounded-xl border-0 bg-white p-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Import type</TableHead>
              <TableHead>Columns</TableHead>
              <TableHead className="w-36 text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {IMPORT_TYPES.map((item) => {
              const Icon = item.icon
              return (
                <TableRow key={item.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink shadow-xs">
                        <Icon className="size-4" strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                        <p className="mt-0.5 max-w-md text-xs text-zinc-500">{item.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusPill tone="info">{item.headers.length} fields</StatusPill>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Can permission="import.write">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 shadow-xs"
                        disabled={!canEdit}
                        onClick={() => openImport(item.id)}
                      >
                        <Upload className="size-4" />
                        Import
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TablePanel>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" inset size="sm" className="p-0 sm:max-w-lg">
          <Form {...form}>
          <form
            className="flex h-full flex-col"
            noValidate
            onSubmit={form.handleSubmit(() => dryRun())}
          >
            <SheetHeader className="pr-12">
              <SheetTitle className="font-medium">Import {active.title}</SheetTitle>
              <SheetDescription>
                Download the template if needed, attach your CSV, dry-run for validation, then
                apply.
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-5">
              <FieldGroup className="gap-4">
                <SelectFormField
                  control={form.control}
                  name="kind"
                  label="Import type"
                  disabled={!canEdit || busy}
                  options={IMPORT_TYPES.map((t) => ({ value: t.id, label: t.title }))}
                />

                <Field>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <FieldLabel>Template</FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 shadow-xs"
                      onClick={fetchTemplate}
                    >
                      <Download className="size-4" />
                      Download template
                    </Button>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                    Expected columns:{" "}
                    <span className="font-medium text-zinc-600">{active.headers.join(", ")}</span>
                  </p>
                </Field>

                <FormField
                  control={form.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileAttachment
                          value={field.value}
                          onChange={field.onChange}
                          multiple={false}
                          maxFiles={1}
                          accept=".csv,text/csv"
                          label="CSV file"
                          hint="UTF-8 CSV · max 5,000 rows"
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldGroup>

              {rows.length > 0 && (
                <div className="overflow-hidden rounded-xl bg-[#f8faf9] shadow-xs">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-xs text-zinc-500">Preview · {rows.length} rows</p>
                    <Badge variant="secondary" className="text-[10px] shadow-none">
                      First 5 shown
                    </Badge>
                  </div>
                  <div className="overflow-x-auto bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(rows[0])
                            .slice(0, 6)
                            .map((h) => (
                              <TableHead key={h}>{h}</TableHead>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.slice(0, 5).map((r, i) => (
                          <TableRow key={i}>
                            {Object.keys(rows[0])
                              .slice(0, 6)
                              .map((h) => (
                                <TableCell key={h} className="text-xs">
                                  {r[h]}
                                </TableCell>
                              ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {report && (
                <div className="space-y-2 rounded-xl bg-brand-soft p-4 text-xs text-brand-ink shadow-xs">
                  <p>
                    Mode: <strong>{report.mode}</strong> · Valid {report.valid}/{report.total}
                    {report.imported > 0 && (
                      <>
                        {" "}
                        · Imported <strong>{report.imported}</strong>
                      </>
                    )}
                  </p>
                  {report.errors.length > 0 && (
                    <ul className="list-disc space-y-1 pl-4 text-rose-600">
                      {report.errors.slice(0, 8).map((e) => (
                        <li key={`${e.row}-${e.message}`}>
                          Row {e.row}: {e.message}
                        </li>
                      ))}
                      {report.errors.length > 8 && (
                        <li>…and {report.errors.length - 8} more</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </SheetBody>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                disabled={!canEdit || busy || rows.length === 0}
              >
                {busy ? "Working…" : "Dry run"}
              </Button>
              <Button
                type="button"
                disabled={!canEdit || busy || rows.length === 0 || !report}
                onClick={() => setConfirmApply(true)}
              >
                Apply import
              </Button>
            </SheetFooter>
          </form>
          </Form>
        </SheetContent>
      </Sheet>

      <ConfirmAction
        open={confirmApply}
        onOpenChange={setConfirmApply}
        title="Apply CSV import?"
        description={`This will import valid ${kind} rows. Rows with errors are skipped and listed in the report.`}
        confirmLabel="Apply"
        loading={busy}
        onConfirm={applyImport}
      />
    </div>
  )
}
