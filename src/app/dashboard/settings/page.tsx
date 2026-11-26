"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SettingsClient, SettingsMenu } from "./settings-client"

export default function SettingsPage() {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <PageHeader title="Settings" />
        <div className="flex min-h-0 flex-1">
          <React.Suspense fallback={null}>
            <SettingsMenu />
          </React.Suspense>
          <React.Suspense
            fallback={<div className="flex-1 p-6 text-sm text-muted-foreground">Loading settings…</div>}
          >
            <SettingsClient />
          </React.Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
