"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse, PaginationParams } from "@/lib/axios"
import { CreateCategoryInput, CreateMemberInput } from "../schemas"

export const MEMBER_KEYS = {
  all: ["members"] as const,
  list: (params?: PaginationParams & { personType?: string }) =>
    [
      ...MEMBER_KEYS.all,
      "list",
      params?.page || 1,
      params?.pageSize || 10,
      params?.personType || "all",
      params?.campusId || "all",
      params?.search || "",
    ] as const,
  categories: () => [...MEMBER_KEYS.all, "categories"] as const,
  households: () => [...MEMBER_KEYS.all, "households"] as const,
}

/**
 * Isolated hook to fetch paginated church members/people via Axios
 */
export function useMembers(params?: PaginationParams & { personType?: string }) {
  return useQuery({
    queryKey: MEMBER_KEYS.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/members", {
        params,
      })
      return response.data
    },
    staleTime: 60 * 1000,
  })
}

export function useHouseholds() {
  return useQuery({
    queryKey: MEMBER_KEYS.households(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/members/households")
      return response.data.data || []
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Isolated hook to fetch dynamic user categories via Axios
 */
export function useUserCategories() {
  return useQuery({
    queryKey: MEMBER_KEYS.categories(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/members/categories")
      return response.data.data || response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMemberInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/members", input)
      return response.data.data
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: (_data, variables) => {
      toast.success(`${variables.firstName} ${variables.lastName} added`)
      queryClient.invalidateQueries({ queryKey: MEMBER_KEYS.all })
    },
  })
}

/**
 * Isolated mutation hook to create a dynamic user category via Axios
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const response = await apiClient.post<ApiResponse<any>>("/members/categories", input)
      return response.data
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
    onSuccess: (data, variables) => {
      toast.success(`Category '${variables.name}' created successfully!`)
      queryClient.invalidateQueries({ queryKey: MEMBER_KEYS.categories() })
    },
  })
}
