"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient, ApiResponse } from "@/lib/axios"
import type { PortalPublicView, PortalSettings } from "../schemas"

export const PORTAL_KEYS = {
  all: ["portal"] as const,
  slug: (slug: string) => [...PORTAL_KEYS.all, "slug", slug] as const,
  list: () => [...PORTAL_KEYS.all, "list"] as const,
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
