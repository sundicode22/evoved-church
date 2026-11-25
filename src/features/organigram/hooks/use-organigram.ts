"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { useBranchStore } from "@/store/use-branch-store"
import type {
  CreateOrgNodeInput,
  OrgNode,
  UpdateOrgNodeInput,
} from "../schemas"

export const ORGANIGRAM_KEYS = {
  all: ["organigram"] as const,
  tree: (campusId?: string) => [...ORGANIGRAM_KEYS.all, "tree", campusId || "all"] as const,
}

export function useOrganigramTree() {
  const campusId = useBranchStore((s) => s.activeCampusId)
  return useQuery({
    queryKey: ORGANIGRAM_KEYS.tree(campusId),
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ campusId: string; nodes: OrgNode[] }>
      >("/organigram/tree", { params: { campusId } })
      return response.data.data
    },
  })
}

export function useCreateOrgNode() {
  const queryClient = useQueryClient()
  const campusId = useBranchStore((s) => s.activeCampusId)
  return useMutation({
    mutationFn: async (input: CreateOrgNodeInput) => {
      const response = await apiClient.post<ApiResponse<OrgNode>>("/organigram/nodes", {
        ...input,
        campusId: input.campusId || campusId,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIGRAM_KEYS.all })
    },
  })
}

export function useUpdateOrgNode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateOrgNodeInput & { id: string }) => {
      const response = await apiClient.patch<ApiResponse<OrgNode>>(
        `/organigram/nodes/${id}`,
        input
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIGRAM_KEYS.all })
    },
  })
}

export function useDeleteOrgNode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ success: boolean; id: string }>>(
        `/organigram/nodes/${id}`
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIGRAM_KEYS.all })
    },
  })
}

export function useReparentOrgNode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      parentId,
      orderIndex,
    }: {
      id: string
      parentId: string | null
      orderIndex?: number
    }) => {
      const response = await apiClient.patch<ApiResponse<OrgNode>>(
        `/organigram/nodes/${id}`,
        { parentId, orderIndex }
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORGANIGRAM_KEYS.all })
    },
  })
}
