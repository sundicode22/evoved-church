"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, ApiResponse } from "@/lib/axios"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { UpdateNomenclatureInput } from "@/features/settings/schemas"
import { toast } from "sonner"
import * as React from "react"

export const SETTINGS_KEYS = {
  nomenclature: (tenantId = "default") => ["settings", "nomenclature", tenantId] as const,
}

export function useNomenclatureQuery(tenantId = "default") {
  const updateLocal = useNomenclatureStore((s) => s.updateNomenclature)
  const query = useQuery({
    queryKey: SETTINGS_KEYS.nomenclature(tenantId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any>>("/settings/nomenclature", {
        params: { tenantId },
      })
      return res.data.data
    },
  })

  React.useEffect(() => {
    if (query.data) {
      updateLocal(query.data)
    }
  }, [query.data, updateLocal])

  return query
}

export function useUpdateNomenclature(tenantId = "default") {
  const queryClient = useQueryClient()
  const updateLocal = useNomenclatureStore((s) => s.updateNomenclature)

  return useMutation({
    mutationFn: async (input: UpdateNomenclatureInput) => {
      const res = await apiClient.patch<ApiResponse<any>>("/settings/nomenclature", input, {
        params: { tenantId },
      })
      return res.data.data
    },
    onSuccess: (data) => {
      updateLocal(data)
      toast.success("Church settings saved")
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.nomenclature(tenantId) })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
