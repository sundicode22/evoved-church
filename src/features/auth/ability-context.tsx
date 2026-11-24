"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient, ApiResponse } from "@/lib/axios"
import {
  AbilitySnapshot,
  can,
  canAny,
  createDemoAdminAbility,
  createEmptyAbility,
} from "./abilities"
import type { PermissionKey } from "./permissions-catalog"
import { useSession } from "@/features/auth/auth-client"

type AbilityContextValue = {
  ability: AbilitySnapshot
  isLoading: boolean
  can: (permission: PermissionKey | string) => boolean
  canAny: (permissions: (PermissionKey | string)[]) => boolean
  refresh: () => void
}

const AbilityContext = React.createContext<AbilityContextValue | null>(null)

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession()
  const userId = session?.user?.id

  const query = useQuery({
    queryKey: ["abilities", userId || "anon"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ApiResponse<AbilitySnapshot>>("/settings/abilities")
        return res.data.data
      } catch {
        // Local/demo: grant admin so UI remains usable without seeded RBAC
        return createDemoAdminAbility(userId || "demo-admin")
      }
    },
    staleTime: 60_000,
  })

  const ability = query.data || createEmptyAbility()

  const value = React.useMemo<AbilityContextValue>(
    () => ({
      ability,
      isLoading: sessionPending || query.isLoading,
      can: (permission) => can(ability, permission),
      canAny: (permissions) => canAny(ability, permissions),
      refresh: () => {
        void query.refetch()
      },
    }),
    [ability, sessionPending, query]
  )

  return <AbilityContext.Provider value={value}>{children}</AbilityContext.Provider>
}

export function useAbility() {
  const ctx = React.useContext(AbilityContext)
  if (!ctx) {
    // Safe fallback outside provider (e.g. public pages)
    const ability = createDemoAdminAbility()
    return {
      ability,
      isLoading: false,
      can: (p: PermissionKey | string) => can(ability, p),
      canAny: (ps: (PermissionKey | string)[]) => canAny(ability, ps),
      refresh: () => undefined,
    }
  }
  return ctx
}
