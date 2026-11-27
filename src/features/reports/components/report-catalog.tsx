"use client"

import * as React from "react"
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusPill, TablePanel } from "@/components/table-panel"
import {
  useAuditLogs,
  useDownloadReport,
  useReportCatalog,
} from "@/features/reports/hooks/use-report-exports"

const CATEGORY_TONE: Record<string, "info" | "success" | "neutral" | "warning"> = {
  People: "info",
  Finances: "success",
  Ministry: "neutral",
  Compliance: "warning",
}

export function ReportCatalogPanel() {
  const { data: catalog = [], isLoading } = useReportCatalog()
  const download = useDownloadReport()
  const [busyId, setBusyId] = React.useState<string | null>(null)

  async function run(reportId: string, format: "csv" | "pdf" | "doc") {
    setBusyId(`${reportId}:${format}`)
    try {
      await download.mutateAsync({ reportId, format })
      toast.success(
        format === "pdf" ? "Print dialog opened — choose Save as PDF" : "Download started"
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not export report")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <TablePanel className="w-full text-left">
      <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Report</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 pl-4 text-sm text-zinc-500">
                  Loading reports…
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              catalog.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{report.title}</p>
                    <p className="mt-0.5 max-w-xl text-xs text-zinc-500">{report.description}</p>
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={CATEGORY_TONE[report.category] || "neutral"}>
                      {report.category}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId !== null}
                        onClick={() => void run(report.id, "csv")}
                      >
                        {busyId === `${report.id}:csv` ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <FileSpreadsheet className="size-3.5" />
                        )}
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId !== null}
                        onClick={() => void run(report.id, "pdf")}
                      >
                        {busyId === `${report.id}:pdf` ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <Printer className="size-3.5" />
                        )}
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busyId !== null}
                        onClick={() => void run(report.id, "doc")}
                      >
                        {busyId === `${report.id}:doc` ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <FileText className="size-3.5" />
                        )}
                        Doc
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
    </TablePanel>
  )
}

export function AuditLogPanel() {
  const { data: rows = [], isLoading, refetch, isFetching } = useAuditLogs(150)
  const download = useDownloadReport()

  return (
    <TablePanel className="w-full text-left">
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? <Spinner className="size-3.5" /> : null}
          Refresh
        </Button>
        <Button
          size="sm"
          variant="primary"
          disabled={download.isPending}
          onClick={() =>
            void download.mutateAsync({ reportId: "audit", format: "csv" }).then(
              () => toast.success("Audit log CSV downloaded"),
              (e: Error) => toast.error(e.message)
            )
          }
        >
          {download.isPending ? <Spinner className="size-3.5" /> : <Download className="size-3.5" />}
          Export CSV
        </Button>
      </div>
      <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>When</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-sm text-zinc-500">
                  Loading audit trail…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-sm text-zinc-500">
                  No audit events yet. Posting a journal, posting giving, or adding a member will
                  appear here.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-xs text-zinc-500">
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                    {row.action}
                  </code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.actorName || row.actorUserId || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.entityType}
                  {row.entityId ? (
                    <span className="mt-0.5 block font-mono text-[10px] text-zinc-400">
                      {row.entityId.slice(0, 8)}…
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-md text-sm text-foreground">{row.summary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </TablePanel>
  )
}
