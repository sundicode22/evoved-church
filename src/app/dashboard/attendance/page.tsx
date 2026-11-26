"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ExternalLink, Users } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { buttonVariants } from "@/components/ui/button"
import { StatusPill } from "@/components/table-panel"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RequireAbility } from "@/components/auth/can"
import { TablePanel } from "@/components/table-panel"
import { GuestConnectionCard } from "@/components/attendance/guest-connection-card"
import {
  useAttendanceQRCode,
  useAttendanceSessions,
} from "@/features/attendance/hooks/use-attendance"
import { useBranchStore } from "@/store/use-branch-store"

export default function AttendancePage() {
  const activeCampus = useBranchStore((s) => s.activeCampus)
  const campusSlug = activeCampus.slug || "main-campus"
  const { data: sessions, isLoading } = useAttendanceSessions()
  const { data: qr } = useAttendanceQRCode(campusSlug)

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <RequireAbility permission="attendance.read">
          <PageHeader
            title="Attendance"
            description="Service sessions and guest check-in links."
            icon={<Users className="size-5 text-brand" strokeWidth={1.75} />}
          />

          <div className="space-y-6 p-6 md:p-8">
            {qr?.qrDataUrl && qr?.targetUrl ? (
              <GuestConnectionCard
                qrDataUrl={qr.qrDataUrl}
                targetUrl={qr.targetUrl}
                campusName={activeCampus.name || "Main campus"}
                className="max-w-3xl"
              />
            ) : null}

            {!isLoading && (sessions?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-border py-16">
                <EmptyHeader>
                  <EmptyTitle>No sessions</EmptyTitle>
                  <EmptyDescription>
                    Attendance sessions will appear here for staff check-in ops.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <TablePanel selectable={false} reorderable={false}>
                <Table selectable={false} reorderable={false}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>When</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Headcount</TableHead>
                      <TableHead>Check-in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {(sessions ?? []).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{s.sessionName}</p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(parseISO(s.sessionDate), "EEE, MMM d · h:mm a")}
                        </TableCell>
                        <TableCell>
                          <StatusPill className="capitalize">{s.sessionType}</StatusPill>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.headcountAdults} adults
                          {s.headcountChildren > 0
                            ? ` · ${s.headcountChildren} kids`
                            : ""}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={s.checkinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "h-7 gap-1 text-xs",
                            })}
                          >
                            Open link
                            <ExternalLink className="size-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TablePanel>
            )}
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
