"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Notification01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuditLogs } from "@/features/reports/hooks/use-report-exports"
import { cn } from "@/lib/utils"

const SEEN_KEY = "evolve.notifications.seenAt"

export function NotificationsDropdown() {
  const { data: rows = [], isLoading } = useAuditLogs(20)
  const [seenAt, setSeenAt] = React.useState(0)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const raw = window.localStorage.getItem(SEEN_KEY)
    setSeenAt(raw ? Number(raw) || 0 : 0)
  }, [])

  const unread = rows.filter((r) => new Date(r.createdAt).getTime() > seenAt).length

  function markSeen() {
    const now = Date.now()
    setSeenAt(now)
    window.localStorage.setItem(SEEN_KEY, String(now))
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) markSeen()
      }}
    >
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 text-muted-foreground"
            aria-label="Notifications"
          />
        }
      >
        <HugeiconsIcon
          icon={Notification01Icon}
          size={16}
          color="currentColor"
          strokeWidth={1.75}
        />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
            <span>Notifications</span>
            <Link
              href="/dashboard/audit"
              className="text-xs font-normal text-brand hover:underline"
              onClick={() => setOpen(false)}
            >
              View audit log
            </Link>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No recent activity.
            </p>
          ) : (
            <DropdownMenuGroup>
              {rows.slice(0, 12).map((row) => {
                const isNew = new Date(row.createdAt).getTime() > seenAt
                return (
                  <DropdownMenuItem
                    key={row.id}
                    className={cn(
                      "flex cursor-default flex-col items-start gap-0.5 rounded-none px-3 py-2.5",
                      isNew && "bg-brand-soft/40"
                    )}
                    render={<Link href="/dashboard/audit" />}
                    onClick={() => setOpen(false)}
                  >
                    <span className="line-clamp-2 text-sm text-foreground">{row.summary}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.actorName || "System"} ·{" "}
                      {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
