"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, ApiResponse } from "@/lib/axios"
import type {
  AddMembershipInput,
  CreateGroupInput,
  GroupMembership,
  MinistryGroup,
  UpdateGroupInput,
} from "../schemas"

export const GROUP_KEYS = {
  all: ["groups"] as const,
  list: () => [...GROUP_KEYS.all, "list"] as const,
  detail: (id: string) => [...GROUP_KEYS.all, "detail", id] as const,
  memberships: (groupId?: string) =>
    [...GROUP_KEYS.all, "memberships", groupId || "all"] as const,
}

export function useGroups() {
  return useQuery({
    queryKey: GROUP_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MinistryGroup[]>>("/groups")
      return res.data.data
    },
  })
}

export function useGroup(id?: string) {
  return useQuery({
    queryKey: GROUP_KEYS.detail(id || ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MinistryGroup>>(`/groups/${id}`)
      return res.data.data
    },
  })
}

export function useGroupMemberships(groupId?: string) {
  return useQuery({
    queryKey: GROUP_KEYS.memberships(groupId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<GroupMembership[]>>("/groups/memberships", {
        params: groupId ? { groupId } : undefined,
      })
      return res.data.data
    },
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateGroupInput) => {
      const res = await apiClient.post<ApiResponse<MinistryGroup>>("/groups", input)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Group created")
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateGroup(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateGroupInput) => {
      const res = await apiClient.patch<ApiResponse<MinistryGroup>>(`/groups/${id}`, input)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Group updated")
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/groups/${id}`)
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Group deleted")
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useAddMembership(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: AddMembershipInput) => {
      const res = await apiClient.post<ApiResponse<GroupMembership>>(
        `/groups/${groupId}/memberships`,
        input
      )
      return res.data.data
    },
    onSuccess: () => {
      toast.success("Member added to group")
      qc.invalidateQueries({ queryKey: GROUP_KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
