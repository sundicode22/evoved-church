"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  CreateProjectCardInput,
  ProjectBoard,
  ProjectCard,
  ProjectStage,
} from "../schemas"

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  board: () => [...PROJECT_KEYS.all, "board"] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.board(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ProjectBoard>>("/projects/board")
      return res.data.data
    },
  })
}

export function useUpdateProjectStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: ProjectStage }) => {
      const res = await apiClient.patch<ApiResponse<ProjectCard>>(`/projects/${id}/stage`, { stage })
      return res.data.data
    },
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: PROJECT_KEYS.board() })
      const previous = qc.getQueryData<ProjectBoard>(PROJECT_KEYS.board())
      qc.setQueryData<ProjectBoard>(PROJECT_KEYS.board(), (old) => {
        if (!old) return old
        const moving = old.columns.flatMap((c) => c.cards).find((c) => c.id === id)
        if (!moving) return old
        const updated = { ...moving, stage, stageChangedAt: new Date().toISOString() }
        return {
          ...old,
          columns: old.columns.map((col) => ({
            ...col,
            cards:
              col.id === stage
                ? [updated, ...col.cards.filter((c) => c.id !== id)]
                : col.cards.filter((c) => c.id !== id),
          })),
        }
      })
      return { previous }
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(PROJECT_KEYS.board(), ctx.previous)
      toast.error(err.message)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: PROJECT_KEYS.all }),
  })
}

export function useCreateProjectCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProjectCardInput) => {
      const res = await apiClient.post<ApiResponse<ProjectCard>>("/projects", input)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Card added")
      qc.invalidateQueries({ queryKey: PROJECT_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
