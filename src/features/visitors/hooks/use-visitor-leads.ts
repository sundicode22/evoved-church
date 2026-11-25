"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient, ApiResponse } from "@/lib/axios"
import {
  AssignLeadInput,
  CreateLeadInput,
  UpdateLeadStageInput,
  VisitorCommentInput,
  VisitorOutreachInput,
} from "../schemas"
import { useBranchStore } from "@/store/use-branch-store"

export const VISITOR_KEYS = {
  all: ["visitors"] as const,
  board: (campusId?: string, search?: string) =>
    [...VISITOR_KEYS.all, "board", campusId || "all", search || ""] as const,
  list: (page: number, campusId?: string) =>
    [...VISITOR_KEYS.all, "list", page, campusId || "all"] as const,
  detail: (id: string) => [...VISITOR_KEYS.all, "detail", id] as const,
}

export function useVisitorBoard(search?: string) {
  const campusId = useBranchStore((s) => s.activeCampusId)
  return useQuery({
    queryKey: VISITOR_KEYS.board(campusId, search),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>("/visitors/board", {
        params: { campusId, search },
      })
      return response.data.data
    },
  })
}

export function useVisitorLeads(page = 1, pageSize = 10, stage?: string, search?: string) {
  const campusId = useBranchStore((s) => s.activeCampusId)
  return useQuery({
    queryKey: [...VISITOR_KEYS.list(page, campusId), stage, search],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/visitors", {
        params: { page, pageSize, campusId, stage, search },
      })
      return response.data
    },
  })
}

export function useVisitorDetail(leadId?: string | null) {
  return useQuery({
    queryKey: VISITOR_KEYS.detail(leadId || ""),
    enabled: Boolean(leadId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(`/visitors/${leadId}`)
      return response.data.data
    },
  })
}

export function useUpdateLeadStage() {
  const queryClient = useQueryClient()
  const campusId = useBranchStore((s) => s.activeCampusId)

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateLeadStageInput & { id: string }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`/visitors/${id}/stage`, input)
      return response.data.data
    },
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: VISITOR_KEYS.all })
      const key = VISITOR_KEYS.board(campusId)
      const previous = queryClient.getQueryData(key)
      queryClient.setQueryData(key, (old: any) => {
        if (!old?.stages) return old
        const stages = old.stages.map((col: any) => ({
          ...col,
          leads: col.leads.filter((l: any) => l.id !== id),
          leadCount: col.leads.filter((l: any) => l.id !== id).length,
        }))
        const moved = old.stages.flatMap((c: any) => c.leads).find((l: any) => l.id === id)
        if (moved) {
          const target = stages.find((c: any) => c.id === stage)
          if (target) {
            target.leads = [{ ...moved, stage }, ...target.leads]
            target.leadCount = target.leads.length
          }
        }
        return { ...old, stages }
      })
      return { previous, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && ctx.key) queryClient.setQueryData(ctx.key, ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
    },
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/visitors", input)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
    },
  })
}

export function useAssignLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: AssignLeadInput & { id: string }) => {
      const response = await apiClient.patch<ApiResponse<any>>(`/visitors/${id}/assign`, input)
      return response.data.data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.detail(vars.id) })
    },
  })
}

export function useVisitorComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: VisitorCommentInput & { id: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`/visitors/${id}/comments`, input)
      return response.data.data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.detail(vars.id) })
    },
  })
}

export function useVisitorOutreach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: VisitorOutreachInput & { id: string }) => {
      const response = await apiClient.post<ApiResponse<any>>(`/visitors/${id}/outreach`, input)
      return response.data.data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
      queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.detail(vars.id) })
    },
  })
}
