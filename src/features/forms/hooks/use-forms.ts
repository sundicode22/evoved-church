"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  ChurchForm,
  ChurchFormSubmission,
  CreateFormInput,
  FormFieldInput,
  PublicFormPayload,
  SubmitFormInput,
  UpdateFormInput,
} from "../schemas"

export const FORM_KEYS = {
  all: ["forms"] as const,
  list: () => [...FORM_KEYS.all, "list"] as const,
  detail: (id: string) => [...FORM_KEYS.all, "detail", id] as const,
  slug: (slug: string) => [...FORM_KEYS.all, "slug", slug] as const,
  submissions: (id: string) => [...FORM_KEYS.all, "submissions", id] as const,
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

export function useVisitorIntakeForm(enabled = true) {
  return useQuery({
    queryKey: [...FORM_KEYS.all, "visitor-intake"] as const,
    enabled,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchForm>>("/forms/visitor-intake")
      return res.data.data!
    },
  })
}

export function useFormDetail(id: string | null) {
  return useQuery({
    queryKey: FORM_KEYS.detail(id || ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchForm>>(`/forms/${id}`)
      return res.data.data!
    },
  })
}

export function usePublicForm(slug: string) {
  return useQuery({
    queryKey: FORM_KEYS.slug(slug),
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PublicFormPayload>>(
        `/forms/by-slug/${slug}`
      )
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
      toast.success("Draft form created")
      qc.invalidateQueries({ queryKey: FORM_KEYS.all })
    },
  })
}

export function useUpdateForm(formId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateFormInput) => {
      const res = await apiClient.patch<ApiResponse<ChurchForm>>(`/forms/${formId}`, input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => {
      toast.success("Form details saved")
      if (formId) qc.setQueryData(FORM_KEYS.detail(formId), data)
      qc.invalidateQueries({ queryKey: FORM_KEYS.all })
    },
  })
}

export function useAddFormField(formId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: FormFieldInput) => {
      const res = await apiClient.post<ApiResponse<ChurchForm>>(`/forms/${formId}/fields`, input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Field added")
      qc.invalidateQueries({ queryKey: FORM_KEYS.all })
    },
  })
}

export function useRemoveFormField(formId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fieldId: string) => {
      const res = await apiClient.delete<ApiResponse<ChurchForm>>(
        `/forms/${formId}/fields/${fieldId}`
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Field removed")
      qc.invalidateQueries({ queryKey: FORM_KEYS.all })
    },
  })
}

export function useReorderFormFields(formId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orderedFieldIds: string[]) => {
      const res = await apiClient.post<ApiResponse<ChurchForm>>(
        `/forms/${formId}/fields/reorder`,
        { orderedFieldIds }
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => {
      if (formId) qc.setQueryData(FORM_KEYS.detail(formId), data)
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
      toast.success("Form published — public link is live")
      qc.invalidateQueries({ queryKey: FORM_KEYS.all })
    },
  })
}

export function useUnpublishForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiResponse<ChurchForm>>(`/forms/${id}/unpublish`)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Form unpublished — editing unlocked")
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

export function useFormSubmissions(formId: string | null) {
  return useQuery({
    queryKey: FORM_KEYS.submissions(formId || ""),
    enabled: Boolean(formId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchFormSubmission[]>>(
        `/forms/${formId}/submissions`
      )
      return res.data.data || []
    },
  })
}
