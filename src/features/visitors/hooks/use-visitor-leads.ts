"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse, PaginationParams } from "@/lib/axios"
import { VisitorStage, UpdateLeadStageInput, CreateLeadInput } from "../schemas"

export const VISITOR_KEYS = {
  all: ["visitor-leads"] as const,
  pipeline: (campusId?: string, search?: string) =>
    [...VISITOR_KEYS.all, "pipeline", campusId || "all", search || ""] as const,
  list: (params?: PaginationParams) =>
    [...VISITOR_KEYS.all, "list", params?.page || 1, params?.pageSize || 10, params?.campusId || "all", params?.search || ""] as const,
  detail: (id: string) => [...VISITOR_KEYS.all, "detail", id] as const,
}

/**
 * Isolated hook to fetch Kanban pipeline leads via Axios with branch scoping
 */
export function useVisitorLeads(campusId?: string, search?: string) {
  return useQuery({
    queryKey: VISITOR_KEYS.pipeline(campusId, search),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>("/pipeline/deals", {
        params: { campusId, search },
      })
      return response.data.data || response.data
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Isolated hook to fetch paginated visitor list via Axios
 */
export function usePaginatedVisitors(params: PaginationParams = { page: 1, pageSize: 10 }) {
  return useQuery({
    queryKey: VISITOR_KEYS.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/pipeline/deals/list", {
        params,
      })
      return response.data
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Isolated hook to fetch single lead details for the Slide-over drawer via Axios
 */
export function useLeadDetail(leadId: string | null) {
  return useQuery({
    queryKey: VISITOR_KEYS.detail(leadId || ""),
    queryFn: async () => {
      if (!leadId) return null
      const response = await apiClient.get<ApiResponse<any>>(`/pipeline/deals/${leadId}`)
      return response.data.data || response.data
    },
    enabled: Boolean(leadId),
    staleTime: 60 * 1000,
  })
}

/**
 * Isolated hook for moving a lead between stages with optimistic updates via Axios
 */
export function useUpdateLeadStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, stage, reason }: { id: string; stage: VisitorStage; reason?: string }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`/pipeline/deals/${id}/stage`, {
        stage,
        reason,
      } as UpdateLeadStageInput)
      return response.data
    },
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: VISITOR_KEYS.all })
      const previousData = queryClient.getQueryData(VISITOR_KEYS.pipeline())
      toast.info(`Moving deal to ${stage.replace("_", " ").toUpperCase()}...`)
      return { previousData }
    },
    onError: (err: Error, variables, context) => {
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

/**
 * Isolated hook to create a new lead via Axios
 */
export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/pipeline/deals", input)
      return response.data
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create visitor lead.")
    },
    onSuccess: () => {
      toast.success("Visitor lead created successfully!")
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
    },
  })
}
