"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type { SaasPlan, SelectPlanInput, TenantSubscription } from "../schemas"

export const BILLING_KEYS = {
  all: ["billing"] as const,
  plans: () => [...BILLING_KEYS.all, "plans"] as const,
  subscription: () => [...BILLING_KEYS.all, "subscription"] as const,
}

export function useSaasPlans() {
  return useQuery({
    queryKey: BILLING_KEYS.plans(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<SaasPlan[]>>("/billing/plans")
      return res.data.data || []
    },
  })
}

export function useTenantSubscription() {
  return useQuery({
    queryKey: BILLING_KEYS.subscription(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<TenantSubscription>>("/billing/subscription")
      return res.data.data!
    },
  })
}

export function useSelectPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: SelectPlanInput) => {
      const res = await apiClient.post<ApiResponse<TenantSubscription>>(
        "/billing/subscription",
        input
      )
      return res.data.data!
    },
    onSuccess: (data) => {
      toast.success(`Switched to ${data.plan.name}`)
      qc.invalidateQueries({ queryKey: BILLING_KEYS.subscription() })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
