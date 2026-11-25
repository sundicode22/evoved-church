"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { SettingsClient, SettingsMenu } from "./settings-client"

function CloseMainSidebar() {
  const { setOpen } = useSidebar()
  React.useEffect(() => {
    setOpen(false)
    return () => setOpen(true)
  }, [setOpen])
  return null
}

export default function SettingsPage() {
  return (
    <SidebarProvider
      defaultOpen={false}
      style={{ "--sidebar-width": "16rem", "--header-height": "3rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" collapsible="offcanvas" />
      <CloseMainSidebar />
      <SidebarInset className="min-h-screen bg-white">
        <div className="flex min-h-screen bg-white">
          <React.Suspense fallback={null}>
            <SettingsMenu />
          </React.Suspense>
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-12 items-center gap-2 bg-white px-4">
              <SidebarTrigger className="-ml-1" />
            </header>
            <React.Suspense fallback={<div className="p-6 text-sm text-zinc-700">Loading settings…</div>}>
              <SettingsClient />
            </React.Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
