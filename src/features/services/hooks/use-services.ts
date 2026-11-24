"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type { ChurchService, CreateServiceInput, UpdateServiceInput } from "../schemas"

export const SERVICE_KEYS = {
  all: ["services"] as const,
  list: (type?: string) => [...SERVICE_KEYS.all, "list", type || "all"] as const,
  detail: (id: string) => [...SERVICE_KEYS.all, "detail", id] as const,
}

export function useServices(type?: string) {
  return useQuery({
    queryKey: SERVICE_KEYS.list(type),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchService[]>>("/services", {
        params: type ? { type } : undefined,
      })
      return res.data.data || []
    },
  })
}

export function useService(id: string | null) {
  return useQuery({
    queryKey: SERVICE_KEYS.detail(id || ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchService>>(`/services/${id}`)
      return res.data.data!
    },
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateServiceInput) => {
      const res = await apiClient.post<ApiResponse<ChurchService>>("/services", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Service created")
      qc.invalidateQueries({ queryKey: SERVICE_KEYS.all })
    },
  })
}

export function useUpdateService(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateServiceInput) => {
      const res = await apiClient.patch<ApiResponse<ChurchService>>(`/services/${id}`, input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Service saved")
      qc.invalidateQueries({ queryKey: SERVICE_KEYS.all })
    },
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/services/${id}`)
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Service archived")
      qc.invalidateQueries({ queryKey: SERVICE_KEYS.all })
    },
  })
}
