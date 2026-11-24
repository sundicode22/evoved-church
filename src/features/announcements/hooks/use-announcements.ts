"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  Announcement,
  CreateAnnouncementInput,
} from "../schemas"

export const ANNOUNCEMENT_KEYS = {
  all: ["announcements"] as const,
  list: () => [...ANNOUNCEMENT_KEYS.all, "list"] as const,
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Announcement[]>>("/announcements")
      return res.data.data || []
    },
  })
}

export function useCreateAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateAnnouncementInput) => {
      const res = await apiClient.post<ApiResponse<Announcement>>("/announcements", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Announcement saved")
      qc.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all })
    },
  })
}

export function usePublishAnnouncement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post<ApiResponse<Announcement>>(
        `/announcements/${id}/publish`
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Announcement posted")
      qc.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all })
    },
  })
}
