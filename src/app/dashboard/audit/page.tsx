"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RequireAbility } from "@/components/auth/can"
import { AuditLogPanel } from "@/features/reports/components/report-catalog"

export default function AuditLogPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="reports.read">
          <PageHeader />
          <div className="w-full p-6 md:p-8">
            <AuditLogPanel />
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
