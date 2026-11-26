"use client"

import * as React from "react"
import { useAbility } from "@/features/auth/ability-context"
import type { PermissionKey } from "@/features/auth/permissions-catalog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import { Lock } from "lucide-react"

type CanProps = {
  permission?: PermissionKey | string
  permissions?: (PermissionKey | string)[]
  requireAll?: boolean
  fallback?: React.ReactNode
  passThrough?: boolean
  children: React.ReactNode
}

export function Can({
  permission,
  permissions,
  requireAll,
  fallback = null,
  passThrough,
  children,
}: CanProps) {
  const { can, canAny } = useAbility()
  const keys = permissions || (permission ? [permission] : [])
  const allowed =
    keys.length === 0
      ? true
      : requireAll
        ? keys.every((k) => can(k))
        : canAny(keys)

  if (allowed) return <>{children}</>

  if (passThrough) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex opacity-50 pointer-events-none cursor-not-allowed" />}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>You don’t have permission for this action.</TooltipContent>
      </Tooltip>
    )
  }

  return <>{fallback}</>
}

export function Cannot(props: Omit<CanProps, "fallback"> & { children: React.ReactNode }) {
  const { can, canAny } = useAbility()
  const keys = props.permissions || (props.permission ? [props.permission] : [])
  const allowed =
    keys.length === 0 ? true : props.requireAll ? keys.every((k) => can(k)) : canAny(keys)
  if (allowed) return null
  return <>{props.children}</>
}

export function RequireAbility({
  permission,
  permissions,
  children,
}: {
  permission?: PermissionKey | string
  permissions?: (PermissionKey | string)[]
  children: React.ReactNode
}) {
  const { canAny, isLoading } = useAbility()
  const keys = permissions || (permission ? [permission] : [])
  const allowed = keys.length === 0 ? true : canAny(keys)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 bg-background p-12 text-sm text-muted-foreground">
        <Spinner className="size-4 text-brand" />
        Checking access…
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background p-12">
        <Empty className="max-w-md border border-dashed border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock className="size-4" />
            </EmptyMedia>
            <EmptyTitle>You don’t have access</EmptyTitle>
            <EmptyDescription>
              This area requires additional permissions. Ask a church admin to update your role in
              Settings → Roles & Permissions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return <>{children}</>
}
