"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { VisitorStage, UpdateLeadStageInput } from "../schemas"

export const VISITOR_KEYS = {
  all: ["visitor-leads"] as const,
  pipeline: (campusId?: string) => [...VISITOR_KEYS.all, "pipeline", campusId || "all"] as const,
  detail: (id: string) => [...VISITOR_KEYS.all, "detail", id] as const,
}

/**
 * Isolated hook to fetch Kanban pipeline leads
 */
export function useVisitorLeads(campusId?: string) {
  return useQuery({
    queryKey: VISITOR_KEYS.pipeline(campusId),
    queryFn: async () => {
      const res = await fetch(`/api/pipeline/deals${campusId ? `?campusId=${campusId}` : ""}`)
      if (!res.ok) {
        throw new Error("Failed to load visitor leads pipeline.")
      }
      const json = await res.json()
      return json.data || json
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Isolated hook to fetch single lead details for the Slide-over drawer
 */
export function useLeadDetail(leadId: string | null) {
  return useQuery({
    queryKey: VISITOR_KEYS.detail(leadId || ""),
    queryFn: async () => {
      if (!leadId) return null
      const res = await fetch(`/api/pipeline/deals/${leadId}`)
      if (!res.ok) {
        throw new Error(`Failed to load deal ${leadId}.`)
      }
      const json = await res.json()
      return json.data || json
    },
    enabled: Boolean(leadId),
    staleTime: 60 * 1000,
  })
}

/**
 * Isolated hook for moving a lead between stages with optimistic updates
 */
export function useUpdateLeadStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, stage, reason }: { id: string; stage: VisitorStage; reason?: string }) => {
      const res = await fetch(`/api/pipeline/deals/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, reason } as UpdateLeadStageInput),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || "Failed to update stage.")
      }
      return res.json()
    },
    onMutate: async ({ id, stage }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: VISITOR_KEYS.all })
      const previousData = queryClient.getQueryData(VISITOR_KEYS.pipeline())
      toast.info(`Moving deal to ${stage.replace("_", " ").toUpperCase()}...`)
      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(VISITOR_KEYS.pipeline(), context.previousData)
      }
      toast.error(err.message || "Could not move deal stage.")
    },
    onSuccess: (data, variables) => {
      toast.success(`Deal moved to ${variables.stage.replace("_", " ").toUpperCase()}`)
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
    },
  })
}
