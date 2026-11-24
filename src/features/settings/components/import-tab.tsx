"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileAttachment, type AttachmentFile } from "@/components/file-attachment"
import { ConfirmAction } from "@/components/confirm-action"
import { Can } from "@/components/auth/can"
import { apiClient, ApiResponse } from "@/lib/axios"
import type { ImportReport } from "@/features/import/service"
import {
  GIVING_CSV_HEADERS,
  MEMBER_CSV_HEADERS,
} from "@/features/import/schemas"
import { Info } from "lucide-react"

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

export function ImportTab({ canEdit }: { canEdit: boolean }) {
  const [kind, setKind] = React.useState<"members" | "giving">("members")
  const [files, setFiles] = React.useState<AttachmentFile[]>([])
  const [rows, setRows] = React.useState<Record<string, string>[]>([])
  const [report, setReport] = React.useState<ImportReport | null>(null)
  const [confirmApply, setConfirmApply] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    const file = files[0]?.file
    if (!file) {
      setRows([])
      setReport(null)
      return
    }
    void file.text().then((text) => {
      const parsed = parseCsv(text)
      setRows(parsed)
      setReport(null)
    })
  }, [files])

  async function dryRun() {
    if (rows.length === 0) {
      toast.error("Upload a CSV first")
      return
    }
    setBusy(true)
    try {
      const path = kind === "members" ? "/import/members" : "/import/giving"
      const body =
        kind === "members"
          ? {
              mode: "dry_run" as const,
              rows: rows.map((r) => ({
                firstName: r.firstName || r.first_name || "",
                lastName: r.lastName || r.last_name || "",
                email: r.email || "",
                phone: r.phone || "",
                householdName: r.householdName || r.household_name || "",
                householdRole: r.householdRole || r.household_role || "",
              })),
            }
          : {
              mode: "dry_run" as const,
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
      const res = await apiClient.post<ApiResponse<ImportReport>>(path, body)
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
      const body =
        kind === "members"
          ? {
              mode: "apply" as const,
              rows: rows.map((r) => ({
                firstName: r.firstName || r.first_name || "",
                lastName: r.lastName || r.last_name || "",
                email: r.email || "",
                phone: r.phone || "",
                householdName: r.householdName || r.household_name || "",
                householdRole: r.householdRole || r.household_role || "",
              })),
            }
          : {
              mode: "apply" as const,
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
      const res = await apiClient.post<ApiResponse<ImportReport>>(path, body)
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

  const headers = kind === "members" ? MEMBER_CSV_HEADERS : GIVING_CSV_HEADERS

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Leaving another ChMS</AlertTitle>
        <AlertDescription className="text-xs">
          Export members and giving as CSV from your old tool (Planning Center, Breeze, Rock,
          spreadsheets, etc.), download our template for column names, map as needed, dry-run,
          then apply. Vendor APIs can come later — CSV is the fastest transition path.
        </AlertDescription>
      </Alert>

      <Tabs
        value={kind}
        onValueChange={(v) => {
          if (v) {
            setKind(v as "members" | "giving")
            setFiles([])
            setRows([])
            setReport(null)
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="members">Members / households</TabsTrigger>
          <TabsTrigger value="giving">Giving</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4 pt-4" />
        <TabsContent value="giving" className="space-y-4 pt-4" />
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={fetchTemplate}>
          Download template
        </Button>
        <Badge variant="outline" className="text-[10px]">
          Columns: {headers.join(", ")}
        </Badge>
      </div>

      <FileAttachment
        value={files}
        onChange={setFiles}
        multiple={false}
        maxFiles={1}
        accept=".csv,text/csv"
        label="CSV file"
        hint="UTF-8 CSV · max 5,000 rows"
        disabled={!canEdit}
      />

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-200/80">
          <div className="border-b border-zinc-100 bg-[#f8faf9] px-3 py-2 text-xs text-zinc-500">
            Preview · {rows.length} rows
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(rows[0])
                  .slice(0, 6)
                  .map((h) => (
                    <TableHead key={h}>
                      {h}
                    </TableHead>
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
      )}

      <Can permission="import.write">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canEdit || busy || rows.length === 0}
            onClick={dryRun}
          >
            Dry run
          </Button>
          <Button
            type="button"
            disabled={!canEdit || busy || rows.length === 0 || !report}
            className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
            onClick={() => setConfirmApply(true)}
          >
            Apply import
          </Button>
        </div>
      </Can>

      {report && (
        <div className="space-y-2 rounded-xl border border-zinc-200/80 bg-white p-4 text-xs">
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
              {report.errors.slice(0, 10).map((e) => (
                <li key={`${e.row}-${e.message}`}>
                  Row {e.row}: {e.message}
                </li>
              ))}
              {report.errors.length > 10 && (
                <li>…and {report.errors.length - 10} more</li>
              )}
            </ul>
          )}
        </div>
      )}

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
