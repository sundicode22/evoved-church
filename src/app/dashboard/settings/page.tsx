"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SettingsClient } from "./settings-client"

export default function SettingsPage() {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <React.Suspense fallback={<div className="p-6 text-sm text-zinc-500">Loading settings…</div>}>
          <SettingsClient />
        </React.Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
