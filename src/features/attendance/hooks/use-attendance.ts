"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { SundayCheckinInput, ChildKioskCheckinInput } from "../schemas"
import { VISITOR_KEYS } from "@/features/visitors/hooks/use-visitor-leads"

export const ATTENDANCE_KEYS = {
  all: ["attendance"] as const,
  qrCode: (campusSlug?: string) => [...ATTENDANCE_KEYS.all, "qr-code", campusSlug || "main-campus"] as const,
}

/**
 * Isolated hook to generate connection card QR code
 */
export function useAttendanceQRCode(campusSlug?: string) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.qrCode(campusSlug),
    queryFn: async () => {
      const res = await fetch(`/api/attendance/qr-code?campusSlug=${campusSlug || "main-campus"}`)
      if (!res.ok) {
        throw new Error("Failed to generate QR code.")
      }
      const json = await res.json()
      return json.data || json
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Isolated mutation hook for Sunday service check-in
 * Automatically invalidates visitor pipeline cache when a first-timer checks in!
 */
export function useSundayCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SundayCheckinInput) => {
      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || "Check-in failed.")
      }
      return res.json()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: (data, variables) => {
      if (variables.isFirstTimer) {
        toast.success(`Welcome to Grace City Church, ${variables.fullName}! Added to Welcome Pipeline.`)
        // Invalidate visitor pipeline so the new card appears immediately
        queryClient.invalidateQueries({ queryKey: VISITOR_KEYS.all })
      } else {
        toast.success(`Welcome back, ${variables.fullName}! Checked in successfully.`)
      }
    },
  })
}
