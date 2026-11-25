"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  CreateNewsletterIssueInput,
  NewsletterIssue,
  NewsletterSubscribeInput,
  NewsletterSubscriber,
  PortalBlock,
  PortalBlockType,
  PortalPublicView,
  PortalSettings,
  UpdatePortalFlagsInput,
  UpdatePortalThemeInput,
} from "../schemas"

export const PORTAL_KEYS = {
  all: ["portal"] as const,
  slug: (slug: string) => [...PORTAL_KEYS.all, "slug", slug] as const,
  list: () => [...PORTAL_KEYS.all, "list"] as const,
  subscribers: () => [...PORTAL_KEYS.all, "subscribers"] as const,
  issues: () => [...PORTAL_KEYS.all, "issues"] as const,
}

export function usePortal(slug: string) {
  return useQuery({
    queryKey: PORTAL_KEYS.slug(slug),
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PortalPublicView>>(`/portal/${slug}`)
      return res.data.data!
    },
  })
}

export function usePortals() {
  return useQuery({
    queryKey: PORTAL_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PortalSettings[]>>("/portal")
      return res.data.data || []
    },
  })
}

export function useUpdatePortalLayout(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (blocks: PortalBlock[]) => {
      const res = await apiClient.patch<ApiResponse<PortalSettings>>(`/portal/${slug}/layout`, {
        blocks,
      })
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Layout saved")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.all })
    },
  })
}

export function useUpdatePortalTheme(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdatePortalThemeInput) => {
      const res = await apiClient.patch<ApiResponse<PortalSettings>>(
        `/portal/${slug}/theme`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Theme saved")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.all })
    },
  })
}

export function useUpdatePortalFlags(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdatePortalFlagsInput) => {
      const res = await apiClient.patch<ApiResponse<PortalSettings>>(
        `/portal/${slug}/flags`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Portal settings saved")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.all })
    },
  })
}

export function useUpdatePortalBlock(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<PortalBlock> & { id: string }) => {
      const res = await apiClient.patch<ApiResponse<PortalSettings>>(
        `/portal/${slug}/blocks/${input.id}`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Section updated")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.all })
    },
  })
}

export function useAddPortalBlock(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (type: PortalBlockType) => {
      const res = await apiClient.post<ApiResponse<PortalSettings>>(`/portal/${slug}/blocks`, {
        type,
      })
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Section added")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.all })
    },
  })
}

export function useRemovePortalBlock(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (blockId: string) => {
      const res = await apiClient.delete<ApiResponse<PortalSettings>>(
        `/portal/${slug}/blocks/${blockId}`
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Section removed")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.all })
    },
  })
}

export function useSubscribeNewsletter(slug: string) {
  return useMutation({
    mutationFn: async (input: NewsletterSubscribeInput) => {
      const res = await apiClient.post<ApiResponse<NewsletterSubscriber>>(
        `/portal/${slug}/newsletter/subscribe`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => toast.success("You’re subscribed"),
  })
}

export function useNewsletterSubscribers() {
  return useQuery({
    queryKey: PORTAL_KEYS.subscribers(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NewsletterSubscriber[]>>(
        "/portal/newsletter/subscribers"
      )
      return res.data.data || []
    },
  })
}

export function useDeleteSubscriber() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/portal/newsletter/subscribers/${id}`)
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Subscriber removed")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.subscribers() })
    },
  })
}

export function useNewsletterIssues() {
  return useQuery({
    queryKey: PORTAL_KEYS.issues(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NewsletterIssue[]>>("/portal/newsletter/issues")
      return res.data.data || []
    },
  })
}

export function useCreateNewsletterIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateNewsletterIssueInput) => {
      const res = await apiClient.post<ApiResponse<NewsletterIssue>>(
        "/portal/newsletter/issues",
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Issue created")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.issues() })
    },
  })
}

export function useUpdateNewsletterIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<CreateNewsletterIssueInput> & { id: string }) => {
      const res = await apiClient.patch<ApiResponse<NewsletterIssue>>(
        `/portal/newsletter/issues/${id}`,
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Issue updated")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.issues() })
    },
  })
}

export function useDeleteNewsletterIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/portal/newsletter/issues/${id}`)
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Issue deleted")
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.issues() })
    },
  })
}

export function useSendNewsletterIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiResponse<NewsletterIssue>>(
        `/portal/newsletter/issues/${id}/send`
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (data) => {
      toast.success(`Sent to ${data.recipientCount} subscriber${data.recipientCount === 1 ? "" : "s"}`)
      qc.invalidateQueries({ queryKey: PORTAL_KEYS.issues() })
    },
  })
}
