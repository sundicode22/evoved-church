"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, ApiResponse } from "@/lib/axios"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { UpdateNomenclatureInput } from "@/features/settings/schemas"
import { useTenantId } from "@/features/billing/use-tenant-id"
import { toast } from "sonner"
import * as React from "react"

export const SETTINGS_KEYS = {
  nomenclature: (tenantId = "default") => ["settings", "nomenclature", tenantId] as const,
}

export function useNomenclatureQuery(tenantId?: string) {
  const sessionTenant = useTenantId()
  const resolved = tenantId || sessionTenant
  const updateLocal = useNomenclatureStore((s) => s.updateNomenclature)
  const query = useQuery({
    queryKey: SETTINGS_KEYS.nomenclature(resolved),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any>>("/settings/nomenclature", {
        params: { tenantId: resolved },
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

export function useUpdateNomenclature(tenantId?: string) {
  const sessionTenant = useTenantId()
  const resolved = tenantId || sessionTenant
  const queryClient = useQueryClient()
  const updateLocal = useNomenclatureStore((s) => s.updateNomenclature)

  return useMutation({
    mutationFn: async (input: UpdateNomenclatureInput) => {
      const res = await apiClient.patch<ApiResponse<any>>("/settings/nomenclature", input, {
        params: { tenantId: resolved },
      })
      return res.data.data
    },
    onSuccess: (data) => {
      updateLocal(data)
      toast.success("Church settings saved")
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.nomenclature(resolved) })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
