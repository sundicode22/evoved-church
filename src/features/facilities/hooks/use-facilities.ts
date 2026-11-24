"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  CreateResourceInput,
  CreateRoomInput,
  Resource,
  Room,
} from "../schemas"

export const FACILITIES_KEYS = {
  all: ["facilities"] as const,
  rooms: () => [...FACILITIES_KEYS.all, "rooms"] as const,
  resources: () => [...FACILITIES_KEYS.all, "resources"] as const,
}

export function useRooms() {
  return useQuery({
    queryKey: FACILITIES_KEYS.rooms(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Room[]>>("/facilities/rooms")
      return res.data.data || []
    },
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      const res = await apiClient.post<ApiResponse<Room>>("/facilities/rooms", input)
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Room created")
      qc.invalidateQueries({ queryKey: FACILITIES_KEYS.rooms() })
    },
  })
}

export function useResources() {
  return useQuery({
    queryKey: FACILITIES_KEYS.resources(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Resource[]>>("/facilities/resources")
      return res.data.data || []
    },
  })
}

export function useCreateResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateResourceInput) => {
      const res = await apiClient.post<ApiResponse<Resource>>(
        "/facilities/resources",
        input
      )
      return res.data.data!
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Resource created")
      qc.invalidateQueries({ queryKey: FACILITIES_KEYS.resources() })
    },
  })
}
