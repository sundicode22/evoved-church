"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { useBranchStore, type Campus } from "@/store/use-branch-store"

export const CAMPUS_KEYS = {
  all: ["campuses"] as const,
  list: () => [...CAMPUS_KEYS.all, "list"] as const,
}

function normalize(row: any): Campus {
  return {
    id: String(row.id),
    name: row.name || "",
    slug: row.slug || "",
    type: row.type || "main",
    city: row.city || "",
    isMainCampus: Boolean(row.isMainCampus),
  }
}

/** Loads locations from `/api/campuses` and syncs the branch store. */
export function useCampuses() {
  const setAvailableCampuses = useBranchStore((s) => s.setAvailableCampuses)
  const query = useQuery({
    queryKey: CAMPUS_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any[]>>("/campuses")
      return (res.data.data || []).map(normalize)
    },
  })

  React.useEffect(() => {
    if (query.data) setAvailableCampuses(query.data)
  }, [query.data, setAvailableCampuses])

  return query
}
