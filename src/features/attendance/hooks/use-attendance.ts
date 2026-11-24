"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import { SundayCheckinInput, ChildKioskCheckinInput } from "../schemas"
import { VISITOR_KEYS } from "@/features/visitors/hooks/use-visitor-leads"

export const ATTENDANCE_KEYS = {
  all: ["attendance"] as const,
  qrCode: (campusSlug?: string) => [...ATTENDANCE_KEYS.all, "qr-code", campusSlug || "main-campus"] as const,
}

/**
 * Isolated hook to generate connection card QR code via Axios
 */
export function useAttendanceQRCode(campusSlug?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.qrCode(campusSlug),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ targetUrl: string; qrDataUrl: string }>>(
        "/attendance/qr-code",
        {
          params: { campusSlug: campusSlug || "main-campus" },
        }
      )
      return response.data.data || response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Isolated mutation hook for Sunday service check-in via Axios
 * Automatically invalidates visitor pipeline cache when a first-timer checks in!
 */
export function useSundayCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SundayCheckinInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/attendance/check-ins", input)
      return response.data
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: (data, variables) => {
      if (variables.isFirstTimer) {
        toast.success(`Welcome to Grace City Church, ${variables.fullName}! Added to Welcome Pipeline.`)
        queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
      } else {
        toast.success(`Welcome back, ${variables.fullName}! Checked in successfully.`)
      }
    },
  })
}

/**
 * Isolated mutation hook for Child Check-in with security pickup code via Axios
 */
export function useChildCheckin() {
  return useMutation({
    mutationFn: async (input: ChildKioskCheckinInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/attendance/child-check-ins", input)
      return response.data
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: (data: any) => {
      toast.success(`Child checked in! Security Pickup Code: ${data?.data?.securityPickupCode || "7K2X"}`)
    },
  })
}
