"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type { CreateFollowUpInput, FollowUp, UpdateFollowUpInput } from "../schemas"

export const FOLLOW_UP_KEYS = {
  all: ["follow-ups"] as const,
  list: () => [...FOLLOW_UP_KEYS.all, "list"] as const,
}

export function useFollowUps() {
  return useQuery({
    queryKey: FOLLOW_UP_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<FollowUp[]>>("/follow-ups")
      return res.data.data || []
    },
  })
}

export function useCreateFollowUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateFollowUpInput) => {
      const res = await apiClient.post<ApiResponse<FollowUp>>("/follow-ups", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Follow-up created")
      qc.invalidateQueries({ queryKey: FOLLOW_UP_KEYS.all })
    },
  })
}

export function useUpdateFollowUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateFollowUpInput }) => {
      const res = await apiClient.patch<ApiResponse<FollowUp>>(`/follow-ups/${id}`, input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Follow-up updated")
      qc.invalidateQueries({ queryKey: FOLLOW_UP_KEYS.all })
    },
  })
}
