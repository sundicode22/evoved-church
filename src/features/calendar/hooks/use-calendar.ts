"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  CalendarOccurrence,
  ChurchProgram,
  CreateOccurrenceInput,
  CreateProgramInput,
} from "../schemas"

export const CALENDAR_KEYS = {
  all: ["calendar"] as const,
  programs: () => [...CALENDAR_KEYS.all, "programs"] as const,
  occurrences: (from?: string, to?: string) =>
    [...CALENDAR_KEYS.all, "occurrences", from || "", to || ""] as const,
}

export function usePrograms() {
  return useQuery({
    queryKey: CALENDAR_KEYS.programs(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ChurchProgram[]>>("/calendar/programs")
      return res.data.data || []
    },
  })
}

export function useOccurrences(from?: string, to?: string) {
  return useQuery({
    queryKey: CALENDAR_KEYS.occurrences(from, to),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CalendarOccurrence[]>>(
        "/calendar/occurrences",
        { params: { from, to } }
      )
      return res.data.data || []
    },
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateProgramInput) => {
      const res = await apiClient.post<ApiResponse<ChurchProgram>>("/calendar/programs", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Program created")
      qc.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
    },
  })
}

export function useCreateOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateOccurrenceInput) => {
      const res = await apiClient.post<ApiResponse<CalendarOccurrence>>(
        "/calendar/occurrences",
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Event scheduled")
      qc.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
    },
  })
}

export function useDeleteOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/calendar/occurrences/${id}`)
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Event removed")
      qc.invalidateQueries({ queryKey: CALENDAR_KEYS.all })
    },
  })
}
