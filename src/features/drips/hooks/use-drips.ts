"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  CreateSequenceInput,
  CreateStepInput,
  DripSequence,
  DripStep,
} from "../schemas"

export const DRIP_KEYS = {
  all: ["drips"] as const,
  list: () => [...DRIP_KEYS.all, "list"] as const,
  detail: (id: string) => [...DRIP_KEYS.all, "detail", id] as const,
}

export function useDripSequences() {
  return useQuery({
    queryKey: DRIP_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<DripSequence[]>>("/drips")
      return res.data.data || []
    },
  })
}

export function useCreateDripSequence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateSequenceInput) => {
      const res = await apiClient.post<ApiResponse<DripSequence>>("/drips", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Sequence created")
      qc.invalidateQueries({ queryKey: DRIP_KEYS.all })
    },
  })
}

export function useAddDripStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateStepInput) => {
      const res = await apiClient.post<ApiResponse<DripStep>>(
        `/drips/${input.sequenceId}/steps`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Step added")
      qc.invalidateQueries({ queryKey: DRIP_KEYS.all })
    },
  })
}
