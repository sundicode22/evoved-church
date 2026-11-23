"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse, PaginationParams } from "@/lib/axios"
import { CreateRequisitionInput, ApproveRequisitionInput } from "../schemas"

export const ACCOUNTING_KEYS = {
  all: ["accounting"] as const,
  funds: (campusId?: string) => [...ACCOUNTING_KEYS.all, "funds", campusId || "all"] as const,
  requisitions: (params?: PaginationParams) =>
    [...ACCOUNTING_KEYS.all, "requisitions", params?.page || 1, params?.pageSize || 10, params?.campusId || "all"] as const,
}

/**
 * Isolated hook to fetch church funds with budget encumbrance via Axios
 */
export function useFunds(campusId?: string) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.funds(campusId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/accounting/funds", {
        params: { campusId },
      })
      return response.data.data || response.data
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Isolated hook to fetch paginated expense requisitions via Axios
 */
export function useRequisitions(params: PaginationParams = { page: 1, pageSize: 10 }) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.requisitions(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/accounting/requisitions", {
        params,
      })
      return response.data
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Isolated mutation hook to submit a new expense requisition with automatic budget check via Axios
 */
export function useCreateRequisition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRequisitionInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/accounting/requisitions", input)
      return response.data
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: () => {
      toast.success("Expense requisition submitted successfully!")
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.all })
    },
  })
}

/**
 * Isolated mutation hook to approve or reject a requisition via Axios
 */
export function useApproveRequisition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ApproveRequisitionInput }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`/accounting/requisitions/${id}/approve`, input)
      return response.data
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: (data, variables) => {
      toast.success(`Requisition ${variables.input.decision} successfully!`)
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.all })
    },
  })
}
