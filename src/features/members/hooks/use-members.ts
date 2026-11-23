"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CreateCategoryInput } from "../schemas"

export const MEMBER_KEYS = {
  all: ["members"] as const,
  list: (filter?: { personType?: string; campusId?: string }) =>
    [...MEMBER_KEYS.all, "list", filter?.personType || "all", filter?.campusId || "all"] as const,
  categories: () => [...MEMBER_KEYS.all, "categories"] as const,
}

/**
 * Isolated hook to fetch church members/people
 */
export function useMembers(filter?: { personType?: string; campusId?: string }) {
  return useQuery({
    queryKey: MEMBER_KEYS.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter?.personType) params.set("personType", filter.personType)
      if (filter?.campusId) params.set("campusId", filter.campusId)

      const res = await fetch(`/api/people?${params.toString()}`)
      if (!res.ok) {
        throw new Error("Failed to load members.")
      }
      const json = await res.json()
      return json.data || json
    },
    staleTime: 60 * 1000,
  })
}

/**
 * Isolated hook to fetch dynamic user categories
 */
export function useUserCategories() {
  return useQuery({
    queryKey: MEMBER_KEYS.categories(),
    queryFn: async () => {
      const res = await fetch("/api/people/categories")
      if (!res.ok) {
        throw new Error("Failed to load user categories.")
      }
      const json = await res.json()
      return json.data || json
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Isolated mutation hook to create a dynamic user category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const res = await fetch("/api/people/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || "Failed to create category.")
      }
      return res.json()
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
