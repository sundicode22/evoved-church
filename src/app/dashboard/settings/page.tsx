"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { RequireAbility } from "@/components/auth/can"
import { useAbility } from "@/features/auth/ability-context"
import { NomenclatureTab } from "@/features/settings/components/nomenclature-tab"
import { RolesPermissionsTab } from "@/features/settings/components/roles-permissions-tab"
import { IntegrationsTab } from "@/features/settings/components/integrations-tab"
import { ImportTab } from "@/features/settings/components/import-tab"
import { cn } from "@/lib/utils"
import type { PermissionKey } from "@/features/auth/permissions-catalog"

type SectionId = "nomenclature" | "roles" | "integrations" | "import"

const SECTIONS: { id: SectionId; label: string; permission?: PermissionKey }[] = [
  { id: "nomenclature", label: "Nomenclature" },
  { id: "roles", label: "Roles & permissions", permission: "settings.roles" },
  { id: "integrations", label: "Integrations" },
  { id: "import", label: "Import CSV", permission: "import.write" },
]

export default function SettingsPage() {
  const { can } = useAbility()
  const sections = SECTIONS.filter((section) => !section.permission || can(section.permission))
  const [section, setSection] = React.useState<SectionId>("nomenclature")
  const active = sections.some((item) => item.id === section) ? section : sections[0]?.id

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="settings.read">
          <PageHeader title="Settings" />
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <aside className="w-full shrink-0 border-b bg-white text-foreground md:w-56 md:border-r md:border-b-0">
              <div className="px-4 py-3 text-xs font-medium text-sidebar-foreground/70">
                Configure
              </div>
              <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:pb-4">
                {sections.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={cn(
                      "rounded-md px-3 py-2 text-left text-sm whitespace-nowrap transition-colors",
                      active === item.id
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>
            <div className="min-w-0 flex-1 bg-white p-4 md:p-6 dark:bg-zinc-950">
              {active === "nomenclature" ? (
                <NomenclatureTab canEdit={can("settings.write")} />
              ) : null}
              {active === "roles" ? <RolesPermissionsTab /> : null}
              {active === "integrations" ? (
                <IntegrationsTab canEdit={can("settings.write")} />
              ) : null}
              {active === "import" ? (
                <ImportTab canEdit={can("import.write") || can("settings.write")} />
              ) : null}
            </div>
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
