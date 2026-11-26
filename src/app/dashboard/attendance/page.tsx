"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ExternalLink, Info, QrCode, Users } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { ServiceDaySheet } from "@/components/attendance/service-day-sheet"
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
  const [serviceDayOpen, setServiceDayOpen] = React.useState(false)

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="attendance.read">
          <PageHeader
            title="Attendance"
            description="Service sessions and guest check-in links."
            icon={<Users className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Button type="button" size="sm" variant="primary" onClick={() => setServiceDayOpen(true)}>
                <QrCode className="size-3.5" />
                QR &amp; service day
              </Button>
            }
          />

          <div className="space-y-6 p-6 md:p-8">
            <Alert className="items-start gap-x-3 border-border bg-card px-4 py-3.5 text-sm shadow-xs has-[>svg]:grid-cols-[auto_1fr] *:[svg]:size-4">
              <Info className="text-brand" strokeWidth={1.75} />
              <AlertTitle className="text-sm font-medium text-foreground">
                Track guests by service day
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Display a large scannable QR for first-time guests, then open a visitor list for
                that Sunday (or any service day) so the welcome team can follow arrivals in one
                place.
              </AlertDescription>
              <div className="col-span-full mt-3 flex flex-wrap gap-2 sm:col-start-2">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => setServiceDayOpen(true)}
                >
                  <QrCode className="size-3.5" />
                  Share QR &amp; open list
                </Button>
              </div>
            </Alert>

            <ServiceDaySheet open={serviceDayOpen} onOpenChange={setServiceDayOpen} />

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
                    Open a visitor list for a service day to start tracking check-ins.
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
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/dashboard/visitors?day=${format(parseISO(s.sessionDate), "yyyy-MM-dd")}`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                                className: "h-7 gap-1 text-xs",
                              })}
                            >
                              Visitors
                            </Link>
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
                              Check-in
                              <ExternalLink className="size-3" />
                            </Link>
                          </div>
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
