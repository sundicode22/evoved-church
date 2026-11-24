"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  CreateBatchInput,
  CreateContributionInput,
  CreatePledgeInput,
  GivingBatch,
  GivingContribution,
  GivingListResult,
  GivingPledge,
  UpdateBatchInput,
  UpdatePledgeInput,
} from "../schemas"

export const GIVING_KEYS = {
  all: ["giving"] as const,
  contributions: () => [...GIVING_KEYS.all, "contributions"] as const,
  batches: () => [...GIVING_KEYS.all, "batches"] as const,
  pledges: () => [...GIVING_KEYS.all, "pledges"] as const,
}

export function useContributions() {
  return useQuery({
    queryKey: GIVING_KEYS.contributions(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GivingListResult>>("/giving/contributions")
      return res.data.data
    },
  })
}

export function useCreateContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateContributionInput) => {
      const res = await apiClient.post<ApiResponse<GivingContribution>>(
        "/giving/contributions",
        input
      )
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Contribution recorded")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function usePostContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      postedByUserId,
    }: {
      id: string
      postedByUserId?: string
    }) => {
      const res = await apiClient.post<ApiResponse<GivingContribution>>(
        `/giving/contributions/${id}/post`,
        { postedByUserId: postedByUserId || "demo-user" }
      )
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Posted to books")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useBatches() {
  return useQuery({
    queryKey: GIVING_KEYS.batches(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GivingBatch[]>>("/giving/batches")
      return res.data.data
    },
  })
}

export function useCreateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBatchInput) => {
      const res = await apiClient.post<ApiResponse<GivingBatch>>("/giving/batches", input)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Batch created")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.batches() })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateBatch(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateBatchInput) => {
      const res = await apiClient.patch<ApiResponse<GivingBatch>>(`/giving/batches/${id}`, input)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Batch updated")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.batches() })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/giving/batches/${id}`)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Batch deleted")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.batches() })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function usePledges() {
  return useQuery({
    queryKey: GIVING_KEYS.pledges(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GivingPledge[]>>("/giving/pledges")
      return res.data.data
    },
  })
}

export function useCreatePledge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreatePledgeInput) => {
      const res = await apiClient.post<ApiResponse<GivingPledge>>("/giving/pledges", input)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Pledge created")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.pledges() })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdatePledge(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdatePledgeInput) => {
      const res = await apiClient.patch<ApiResponse<GivingPledge>>(
        `/giving/pledges/${id}`,
        input
      )
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Pledge updated")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.pledges() })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeletePledge() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/giving/pledges/${id}`)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Pledge deleted")
      qc.invalidateQueries({ queryKey: GIVING_KEYS.pledges() })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
