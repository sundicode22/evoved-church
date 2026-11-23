"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CreateRequisitionInput, ApproveRequisitionInput } from "../schemas"

export const ACCOUNTING_KEYS = {
  all: ["accounting"] as const,
  funds: (campusId?: string) => [...ACCOUNTING_KEYS.all, "funds", campusId || "all"] as const,
  requisitions: (campusId?: string) => [...ACCOUNTING_KEYS.all, "requisitions", campusId || "all"] as const,
}

/**
 * Isolated hook to fetch church funds with budget encumbrance
 */
export function useFunds(campusId?: string) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.funds(campusId),
    queryFn: async () => {
      const res = await fetch(`/api/accounting/funds${campusId ? `?campusId=${campusId}` : ""}`)
      if (!res.ok) {
        throw new Error("Failed to load church funds.")
      }
      const json = await res.json()
      return json.data || json
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Isolated hook to fetch expense requisitions
 */
export function useRequisitions(campusId?: string) {
  return useQuery({
    queryKey: ACCOUNTING_KEYS.requisitions(campusId),
    queryFn: async () => {
      const res = await fetch(`/api/accounting/requisitions${campusId ? `?campusId=${campusId}` : ""}`)
      if (!res.ok) {
        throw new Error("Failed to load expense requisitions.")
      }
      const json = await res.json()
      return json.data || json
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Isolated mutation hook to submit a new expense requisition with automatic budget check
 */
export function useCreateRequisition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRequisitionInput) => {
      const res = await fetch("/api/accounting/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || "Failed to submit expense requisition.")
      }
      return res.json()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: (data) => {
      toast.success("Expense requisition submitted successfully!")
      queryClient.invalidateQueries({ queryKey: ACCOUNTING_KEYS.all })
    },
  })
}

/**
 * Isolated mutation hook to approve or reject a requisition
 */
export function useApproveRequisition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ApproveRequisitionInput }) => {
      const res = await fetch(`/api/accounting/requisitions/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || "Approval action failed.")
      }
      return res.json()
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
