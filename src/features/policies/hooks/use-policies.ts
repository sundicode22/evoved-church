"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type { ChurchPolicy, CreatePolicyInput, UpdatePolicyInput } from "../schemas"

export const POLICY_KEYS = {
  all: ["policies"] as const,
  list: (module?: string) => [...POLICY_KEYS.all, "list", module || "all"] as const,
  detail: (id: string) => [...POLICY_KEYS.all, "detail", id] as const,
}

export function usePolicies(module?: string) {
  return useQuery({
    queryKey: POLICY_KEYS.list(module),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchPolicy[]>>("/policies", {
        params: module ? { module } : undefined,
      })
      return res.data.data || []
    },
  })
}

export function usePolicy(id: string | null) {
  return useQuery({
    queryKey: POLICY_KEYS.detail(id || ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchPolicy>>(`/policies/${id}`)
      return res.data.data
    },
  })
}

export function useCreatePolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreatePolicyInput) => {
      const res = await apiClient.post<ApiResponse<ChurchPolicy>>("/policies", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Policy created")
      qc.invalidateQueries({ queryKey: POLICY_KEYS.all })
    },
  })
}

export function useUpdatePolicy(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdatePolicyInput) => {
      const res = await apiClient.patch<ApiResponse<ChurchPolicy>>(`/policies/${id}`, input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Policy saved")
      qc.invalidateQueries({ queryKey: POLICY_KEYS.all })
    },
  })
}

export function usePublishPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiResponse<ChurchPolicy>>(`/policies/${id}/publish`)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Policy published")
      qc.invalidateQueries({ queryKey: POLICY_KEYS.all })
    },
  })
}

export function useDeletePolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/policies/${id}`)
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Policy deleted")
      qc.invalidateQueries({ queryKey: POLICY_KEYS.all })
    },
  })
}
