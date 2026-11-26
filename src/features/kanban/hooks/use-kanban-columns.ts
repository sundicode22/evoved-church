"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  CreateKanbanColumnInput,
  KanbanBoardType,
  KanbanColumn,
  ReorderKanbanColumnsInput,
  UpdateKanbanColumnInput,
} from "../schemas"

export const KANBAN_KEYS = {
  all: ["kanban"] as const,
  columns: (boardType: KanbanBoardType) =>
    [...KANBAN_KEYS.all, "columns", boardType] as const,
}

export function useKanbanColumns(boardType: KanbanBoardType) {
  return useQuery({
    queryKey: KANBAN_KEYS.columns(boardType),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<KanbanColumn[]>>(
        `/kanban/columns/${boardType}`
      )
      return res.data.data || []
    },
  })
}

export function useCreateKanbanColumn(boardType: KanbanBoardType) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<CreateKanbanColumnInput, "boardType">) => {
      const res = await apiClient.post<ApiResponse<KanbanColumn>>("/kanban/columns", {
        ...input,
        boardType,
      })
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Column added")
      qc.invalidateQueries({ queryKey: KANBAN_KEYS.columns(boardType) })
      qc.invalidateQueries({ queryKey: [boardType === "visitors" ? "visitors" : "projects"] })
    },
  })
}

export function useUpdateKanbanColumn(boardType: KanbanBoardType) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateKanbanColumnInput & { id: string }) => {
      const res = await apiClient.patch<ApiResponse<KanbanColumn>>(
        `/kanban/columns/${id}`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Column updated")
      qc.invalidateQueries({ queryKey: KANBAN_KEYS.columns(boardType) })
      qc.invalidateQueries({ queryKey: [boardType === "visitors" ? "visitors" : "projects"] })
    },
  })
}

export function useReorderKanbanColumns(boardType: KanbanBoardType) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orderedKeys: string[]) => {
      const body: ReorderKanbanColumnsInput = { boardType, orderedKeys }
      const res = await apiClient.post<ApiResponse<KanbanColumn[]>>(
        "/kanban/columns/reorder",
        body
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KANBAN_KEYS.columns(boardType) })
      qc.invalidateQueries({ queryKey: [boardType === "visitors" ? "visitors" : "projects"] })
    },
  })
}

export function useDeleteKanbanColumn(boardType: KanbanBoardType) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, moveTo }: { id: string; moveTo?: string }) => {
      const res = await apiClient.delete<ApiResponse<{ ok: true }>>(
        `/kanban/columns/${id}`,
        { params: moveTo ? { moveTo } : undefined }
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Column removed")
      qc.invalidateQueries({ queryKey: KANBAN_KEYS.columns(boardType) })
      qc.invalidateQueries({ queryKey: [boardType === "visitors" ? "visitors" : "projects"] })
    },
  })
}
