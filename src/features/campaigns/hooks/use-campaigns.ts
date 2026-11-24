"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  Campaign,
  CampaignDetail,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../schemas"

export const CAMPAIGN_KEYS = {
  all: ["campaigns"] as const,
  list: () => [...CAMPAIGN_KEYS.all, "list"] as const,
  detail: (id: string) => [...CAMPAIGN_KEYS.all, "detail", id] as const,
}

export function useCampaigns() {
  return useQuery({
    queryKey: CAMPAIGN_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Campaign[]>>("/campaigns")
      return res.data.data
    },
  })
}

export function useCampaign(id?: string) {
  return useQuery({
    queryKey: CAMPAIGN_KEYS.detail(id || ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CampaignDetail>>(`/campaigns/${id}`)
      return res.data.data
    },
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      const res = await apiClient.post<ApiResponse<Campaign>>("/campaigns", input)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Campaign created")
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateCampaignInput) => {
      const res = await apiClient.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, input)
      return res.data.data
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: CAMPAIGN_KEYS.detail(id) })
      const previous = qc.getQueryData<CampaignDetail>(CAMPAIGN_KEYS.detail(id))
      if (previous) {
        qc.setQueryData(CAMPAIGN_KEYS.detail(id), { ...previous, ...input })
      }
      return { previous }
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(CAMPAIGN_KEYS.detail(id), ctx.previous)
      toast.error(err.message)
    },
    onSuccess: () => toast.success("Campaign saved"),
    onSettled: () => qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all }),
  })
}

export function useSendCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<ApiResponse<CampaignDetail>>(`/campaigns/${id}/send`)
      return res.data.data
    },
    onSuccess: (data) => {
      toast.success(`Campaign sent to ${data.stats.sent} recipient${data.stats.sent === 1 ? "" : "s"}`)
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
