"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient, type ApiResponse } from "@/lib/axios"
import type { ReportsOverview } from "../service"
import { useBranchStore } from "@/store/use-branch-store"

export const REPORTS_KEYS = {
  all: ["reports"] as const,
  overview: (campusId?: string) => [...REPORTS_KEYS.all, "overview", campusId] as const,
}

export function useReportsOverview() {
  const campusId = useBranchStore((s) => s.activeCampusId)
  return useQuery({
    queryKey: REPORTS_KEYS.overview(campusId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ReportsOverview>>("/reports/overview", {
        params: { campusId },
      })
      return res.data.data
    },
    staleTime: 30_000,
  })
}
