"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Can, RequireAbility } from "@/components/auth/can"
import { useAbility } from "@/features/auth/ability-context"
import { NomenclatureTab } from "@/features/settings/components/nomenclature-tab"
import { RolesPermissionsTab } from "@/features/settings/components/roles-permissions-tab"
import { IntegrationsTab } from "@/features/settings/components/integrations-tab"
import { ImportTab } from "@/features/settings/components/import-tab"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings05Icon } from "@hugeicons/core-free-icons"

export default function SettingsPage() {
  const { can } = useAbility()

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-[#fbfcfb] dark:bg-zinc-950">
        <RequireAbility permission="settings.read">
          <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} className="size-6 text-emerald-600" />
              <span>Settings & Access Control</span>
            </h1>
            <p className="mt-0.5 text-xs text-zinc-400">
              Customize terminology, manage who can do what, and connect your messaging and media providers.
            </p>
          </div>

          <div className="p-8">
            <Tabs defaultValue="nomenclature">
              <TabsList>
                <TabsTrigger value="nomenclature">Nomenclature</TabsTrigger>
                <Can permission="settings.roles">
                  <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                </Can>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <Can permission="import.write">
                  <TabsTrigger value="import">Import CSV</TabsTrigger>
                </Can>
              </TabsList>

              <TabsContent value="nomenclature" className="pt-4">
                <NomenclatureTab canEdit={can("settings.write")} />
              </TabsContent>
              <Can permission="settings.roles">
                <TabsContent value="roles" className="pt-4">
                  <RolesPermissionsTab />
                </TabsContent>
              </Can>
              <TabsContent value="integrations" className="pt-4">
                <IntegrationsTab canEdit={can("settings.write")} />
              </TabsContent>
              <Can permission="import.write">
                <TabsContent value="import" className="pt-4">
                  <ImportTab canEdit={can("import.write") || can("settings.write")} />
                </TabsContent>
              </Can>
            </Tabs>
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
