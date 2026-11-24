"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  ChurchForm,
  ChurchFormSubmission,
  CreateFormInput,
  SubmitFormInput,
} from "../schemas"

export const FORM_KEYS = {
  all: ["forms"] as const,
  list: () => [...FORM_KEYS.all, "list"] as const,
  slug: (slug: string) => [...FORM_KEYS.all, "slug", slug] as const,
}

export function useForms() {
  return useQuery({
    queryKey: FORM_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchForm[]>>("/forms")
      return res.data.data || []
    },
  })
}

export function usePublicForm(slug: string) {
  return useQuery({
    queryKey: FORM_KEYS.slug(slug),
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchForm>>(`/forms/by-slug/${slug}`)
      return res.data.data!
    },
  })
}

export function useCreateForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateFormInput) => {
      const res = await apiClient.post<ApiResponse<ChurchForm>>("/forms", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Form created")
      qc.invalidateQueries({ queryKey: FORM_KEYS.all })
    },
  })
}

export function usePublishForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiResponse<ChurchForm>>(`/forms/${id}/publish`)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Form published")
      qc.invalidateQueries({ queryKey: FORM_KEYS.all })
    },
  })
}

export function useSubmitForm(slug: string) {
  return useMutation({
    mutationFn: async (input: SubmitFormInput) => {
      const res = await apiClient.post<ApiResponse<ChurchFormSubmission>>(
        `/forms/by-slug/${slug}/submit`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => toast.success("Submitted — thank you!"),
  })
}
