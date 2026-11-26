"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ExternalLink, QrCode, Users } from "lucide-react"
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
import {
  useAttendanceQRCode,
  useAttendanceSessions,
} from "@/features/attendance/hooks/use-attendance"

export default function AttendancePage() {
  const { data: sessions, isLoading } = useAttendanceSessions()
  const { data: qr } = useAttendanceQRCode("main-campus")

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
            actions={
              qr?.targetUrl ? (
                <Link
                  href={qr.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className: "h-8 gap-1.5 text-xs font-normal",
                  })}
                >
                  <QrCode className="size-3.5" strokeWidth={1.75} />
                  Connection card
                  <ExternalLink className="size-3" />
                </Link>
              ) : null
            }
          />

          <div className="space-y-6 p-6 md:p-8">
            {qr?.qrDataUrl && (
              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/50 p-4 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.qrDataUrl}
                  alt="Check-in QR"
                  className="size-24 rounded-md border border-border bg-white p-1"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Guest connection card</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Print or display this QR for first-time guests.
                  </p>
                  <p className="mt-2 break-all text-[11px] text-emerald-700 dark:text-emerald-400">
                    {qr.targetUrl}
                  </p>
                </div>
              </div>
            )}

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
