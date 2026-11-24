"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, type ApiResponse } from "@/lib/axios"
import type { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from "../schemas"

export const BLOG_KEYS = {
  all: ["blog"] as const,
  list: () => [...BLOG_KEYS.all, "list"] as const,
  published: () => [...BLOG_KEYS.all, "published"] as const,
  publishedSlug: (slug: string) => [...BLOG_KEYS.all, "published", slug] as const,
}

export function useBlogPosts() {
  return useQuery({
    queryKey: BLOG_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BlogPost[]>>("/blog")
      return res.data.data || []
    },
  })
}

export function usePublishedBlogPosts() {
  return useQuery({
    queryKey: BLOG_KEYS.published(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BlogPost[]>>("/blog/published")
      return res.data.data || []
    },
  })
}

export function usePublishedBlogPost(slug: string) {
  return useQuery({
    queryKey: BLOG_KEYS.publishedSlug(slug),
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BlogPost>>(`/blog/published/${slug}`)
      return res.data.data!
    },
  })
}

export function useCreateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBlogPostInput) => {
      const res = await apiClient.post<ApiResponse<BlogPost>>("/blog", input)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.all })
      toast.success("Post saved")
    },
    onError: (err: Error) => toast.error(err.message || "Could not save post"),
  })
}

export function useUpdateBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateBlogPostInput & { id: string }) => {
      const res = await apiClient.patch<ApiResponse<BlogPost>>(`/blog/${id}`, input)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.all })
      toast.success("Post updated")
    },
    onError: (err: Error) => toast.error(err.message || "Could not update post"),
  })
}

export function usePublishBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiResponse<BlogPost>>(`/blog/${id}/publish`)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.all })
      toast.success("Published to member portal")
    },
    onError: (err: Error) => toast.error(err.message || "Could not publish"),
  })
}

export function useDeleteBlogPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/blog/${id}`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BLOG_KEYS.all })
      toast.success("Post deleted")
    },
    onError: (err: Error) => toast.error(err.message || "Could not delete"),
  })
}
