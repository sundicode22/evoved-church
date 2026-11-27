"use client"

import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { downloadCsv, downloadPdfDocument } from "@/lib/export-file"

export type TableExportPayload = {
  /** File/title base name, e.g. "forms" or "Members" */
  filename: string
  title: string
  headers: string[]
  rows: (string | number)[][]
}

/**
 * Shared table export control — Excel (CSV) or PDF.
 * Use in TableChrome trailing or TableToolbar.
 */
export function TableExportButton({
  payload,
  disabled,
}: {
  payload: TableExportPayload | null | undefined
  disabled?: boolean
}) {
  const ready = Boolean(payload && payload.headers.length > 0)
  const stamp = new Date().toISOString().slice(0, 10)

  function exportExcel() {
    if (!payload) return
    downloadCsv(`${payload.filename}-${stamp}.csv`, payload.headers, payload.rows)
  }

  function exportPdf() {
    if (!payload) return
    downloadPdfDocument(payload.title, payload.headers, payload.rows)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || !ready}
            className="border-border shadow-xs"
          />
        }
      >
        <Download className="size-3.5" strokeWidth={1.75} />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 rounded-lg shadow-xs">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Download as</DropdownMenuLabel>
          <DropdownMenuItem onClick={exportExcel} disabled={!ready}>
            <FileSpreadsheet className="size-3.5 text-zinc-500" />
            Excel (.csv)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportPdf} disabled={!ready}>
            <FileText className="size-3.5 text-zinc-500" />
            PDF
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
