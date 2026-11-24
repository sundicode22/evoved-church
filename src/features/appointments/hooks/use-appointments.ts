"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  AppointmentBooking,
  AppointmentSchedule,
  AppointmentSummary,
  CreateScheduleInput,
} from "../schemas"

export const APPOINTMENT_KEYS = {
  all: ["appointments"] as const,
  summary: () => [...APPOINTMENT_KEYS.all, "summary"] as const,
  schedules: () => [...APPOINTMENT_KEYS.all, "schedules"] as const,
  bookings: () => [...APPOINTMENT_KEYS.all, "bookings"] as const,
}

export function useAppointmentSummary() {
  return useQuery({
    queryKey: APPOINTMENT_KEYS.summary(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AppointmentSummary>>(
        "/appointments/summary"
      )
      return res.data.data!
    },
  })
}

export function useAppointmentSchedules() {
  return useQuery({
    queryKey: APPOINTMENT_KEYS.schedules(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AppointmentSchedule[]>>(
        "/appointments/schedules"
      )
      return res.data.data || []
    },
  })
}

export function useAppointmentBookings() {
  return useQuery({
    queryKey: APPOINTMENT_KEYS.bookings(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AppointmentBooking[]>>(
        "/appointments/bookings"
      )
      return res.data.data || []
    },
  })
}

export function useCreateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateScheduleInput) => {
      const res = await apiClient.post<ApiResponse<AppointmentSchedule>>(
        "/appointments/schedules",
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Schedule created")
      qc.invalidateQueries({ queryKey: APPOINTMENT_KEYS.all })
    },
  })
}
