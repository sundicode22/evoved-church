"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { downloadCsv, downloadDoc, downloadPdfDocument } from "@/lib/export-file"
import type { ReportDefinition, ReportPayload } from "@/features/reports/export-service"
import type { AuditLogRow } from "@/features/audit/service"

export function useReportCatalog() {
  return useQuery({
    queryKey: ["reports", "catalog"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ReportDefinition[]>>("/reports/catalog")
      return res.data.data || []
    },
  })
}

export function useAuditLogs(limit = 100) {
  return useQuery({
    queryKey: ["reports", "audit", limit],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AuditLogRow[]>>("/reports/audit", {
        params: { limit },
      })
      return res.data.data || []
    },
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({
      reportId,
      format,
    }: {
      reportId: string
      format: "csv" | "pdf" | "doc"
    }) => {
      const res = await apiClient.get<ApiResponse<ReportPayload>>(`/reports/export/${reportId}`)
      const payload = res.data.data
      if (!payload) throw new Error("Empty report")
      const stamp = payload.generatedAt.slice(0, 10)
      const base = `${payload.id}-${stamp}`
      if (format === "csv") {
        downloadCsv(`${base}.csv`, payload.headers, payload.rows)
      } else if (format === "doc") {
        downloadDoc(`${base}.doc`, payload.title, payload.headers, payload.rows)
      } else {
        downloadPdfDocument(payload.title, payload.headers, payload.rows)
      }
      return payload
    },
  })
}
