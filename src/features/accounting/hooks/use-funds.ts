"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse, PaginationParams } from "@/lib/axios"
import {
  CreateRequisitionInput,
  ApproveRequisitionInput,
  CreateJournalEntryInput,
  PostJournalEntryInput,
  CreateFundInput,
  CreateBudgetLineInput,
} from "../schemas"

export const ACCOUNTING_KEYS = {
  all: ["accounting"] as const,
  funds: (campusId?: string) => [...ACCOUNTING_KEYS.all, "funds", campusId || "all"] as const,
  budgetLines: (fundId?: string) => [...ACCOUNTING_KEYS.all, "budget-lines", fundId || "all"] as const,
  requisitions: (params?: PaginationParams) =>
    [
      ...ACCOUNTING_KEYS.all,
      "requisitions",
      params?.page || 1,
      params?.pageSize || 10,
      params?.campusId || "all",
    ] as const,
  journal: (campusId?: string) => [...ACCOUNTING_KEYS.all, "journal", campusId || "all"] as const,
  coa: (campusId?: string) => [...ACCOUNTING_KEYS.all, "coa", campusId || "all"] as const,
}

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

export function useChartOfAccounts(campusId?: string) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.coa(campusId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/accounting/chart-of-accounts", {
        params: { campusId },
      })
      return response.data.data || response.data
    },
  })
}

export function useRequisitions(params: PaginationParams = { page: 1, pageSize: 10 }) {
  return useQuery({
    queryKey: [
      ...ACCOUNTING_KEYS.requisitions(params),
      params.search || "",
      params.status || "",
    ],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/accounting/requisitions", {
        params,
      })
      return response.data as ApiResponse<any[]> & {
        pagination?: import("@/lib/axios").PaginationMeta
      }
    },
    staleTime: 30 * 1000,
  })
}

export function useJournalEntries(campusId?: string) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.journal(campusId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/accounting/journal-entries", {
        params: { campusId },
      })
      return response.data.data || response.data
    },
  })
}

export function useBudgetLines(fundId?: string) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.budgetLines(fundId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/accounting/budget-lines", {
        params: { fundId },
      })
      return response.data.data || []
    },
  })
}

export function useCreateFund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateFundInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/accounting/funds", input)
      return response.data.data
    },
    onError: (err: Error) => toast.error(err.message),
    onSuccess: () => {
      toast.success("Fund created")
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.all })
    },
  })
}

export function useCreateBudgetLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBudgetLineInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/accounting/budget-lines", input)
      return response.data.data
    },
    onError: (err: Error) => toast.error(err.message),
    onSuccess: () => {
      toast.success("Budget line added")
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.all })
    },
  })
}

export function useCreateRequisition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRequisitionInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/accounting/requisitions", input)
      return response.data
    },
    onError: (err: Error) => toast.error(err.message),
    onSuccess: () => {
      toast.success("Expense requisition submitted successfully!")
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.all })
    },
  })
}

export function useApproveRequisition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ApproveRequisitionInput }) => {
      const response = await apiClient.post<ApiResponse<any>>(
        `/accounting/requisitions/${id}/approvals`,
        input
      )
      return response.data
    },
    onError: (err: Error) => toast.error(err.message),
    onSuccess: (_data, variables) => {
      toast.success(`Requisition ${variables.input.decision} successfully!`)
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.all })
    },
  })
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateJournalEntryInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/accounting/journal-entries", input)
      return response.data
    },
    onError: (err: Error) => toast.error(err.message),
    onSuccess: () => {
      toast.success("Draft journal entry created. Posting requires an explicit finance action.")
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.journal() })
    },
  })
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PostJournalEntryInput }) => {
      const response = await apiClient.post<ApiResponse<any>>(
        `/accounting/journal-entries/${id}/post`,
        input
      )
      return response.data
    },
    onError: (err: Error) => toast.error(err.message),
    onSuccess: () => {
      toast.success("Journal entry posted to the ledger.")
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.journal() })
    },
  })
}
