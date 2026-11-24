"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import { useAbility } from "@/features/auth/ability-context"

export interface RoleRecord {
  id: string
  name: string
  slug: string
  description?: string | null
  isAdmin: boolean
  isSystem?: boolean
  permissionKeys: string[]
}

export interface PermissionRecord {
  key: string
  label: string
  groupName: string
}

export const RBAC_KEYS = {
  roles: ["settings", "roles"] as const,
  permissions: ["settings", "permissions"] as const,
}

export function useRoles() {
  return useQuery({
    queryKey: RBAC_KEYS.roles,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<RoleRecord[]>>("/settings/roles")
      return res.data.data
    },
  })
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: RBAC_KEYS.permissions,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PermissionRecord[]>>("/settings/permissions")
      return res.data.data
    },
    staleTime: 5 * 60_000,
  })
}

export function useSaveRolePermissions() {
  const qc = useQueryClient()
  const { refresh } = useAbility()
  return useMutation({
    mutationFn: async ({ roleId, permissionKeys }: { roleId: string; permissionKeys: string[] }) => {
      const res = await apiClient.put<ApiResponse<unknown>>(`/settings/roles/${roleId}/permissions`, {
        permissionKeys,
      })
      return res.data.data
    },
    onMutate: async ({ roleId, permissionKeys }) => {
      await qc.cancelQueries({ queryKey: RBAC_KEYS.roles })
      const previous = qc.getQueryData<RoleRecord[]>(RBAC_KEYS.roles)
      qc.setQueryData<RoleRecord[]>(RBAC_KEYS.roles, (old) =>
        old?.map((r) => (r.id === roleId ? { ...r, permissionKeys } : r))
      )
      return { previous }
    },
    onError: (err: Error, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(RBAC_KEYS.roles, ctx.previous)
      toast.error(err.message)
    },
    onSuccess: () => {
      toast.success("Permissions updated")
      refresh()
    },
    onSettled: () => qc.invalidateQueries({ queryKey: RBAC_KEYS.roles }),
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; permissionKeys?: string[] }) => {
      const res = await apiClient.post<ApiResponse<RoleRecord>>("/settings/roles", {
        permissionKeys: [],
        ...input,
      })
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Role created")
      qc.invalidateQueries({ queryKey: RBAC_KEYS.roles })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
