"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Building2,
  ListPlus,
  MapPin,
  Plug,
  Shield,
  SlidersHorizontal,
  Upload,
} from "lucide-react"
import { RequireAbility } from "@/components/auth/can"
import { useAbility } from "@/features/auth/ability-context"
import { ChurchDetailsTab } from "@/features/settings/components/church-details-tab"
import { RolesPermissionsTab } from "@/features/settings/components/roles-permissions-tab"
import { IntegrationsTab } from "@/features/settings/components/integrations-tab"
import { ImportTab } from "@/features/settings/components/import-tab"
import { CustomFieldsTab } from "@/features/settings/components/custom-fields-tab"
import { LocationsTab } from "@/features/settings/components/locations-tab"
import { NomenclatureTab } from "@/features/settings/components/nomenclature-tab"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { PermissionKey } from "@/features/auth/permissions-catalog"

type SectionId =
  | "church_details"
  | "locations"
  | "defaults"
  | "integrations"
  | "extra_fields"
  | "roles"
  | "import"

const SECTIONS: {
  id: SectionId
  label: string
  icon: React.ComponentType<{ className?: string }>
  permission?: PermissionKey
}[] = [
  { id: "church_details", label: "Church details", icon: Building2 },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "defaults", label: "Defaults", icon: SlidersHorizontal },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "extra_fields", label: "Extra fields", icon: ListPlus },
  { id: "roles", label: "Users and roles", icon: Shield, permission: "settings.roles" },
  { id: "import", label: "Import CSV", icon: Upload, permission: "import.write" },
]

const TAB_ALIASES: Record<string, SectionId> = {
  nomenclature: "defaults",
  custom_fields: "extra_fields",
  integrations: "integrations",
  roles: "roles",
  locations: "locations",
  import: "import",
  church_details: "church_details",
  extra_fields: "extra_fields",
  defaults: "defaults",
}

function useSettingsSections() {
  const { can } = useAbility()
  const search = useSearchParams()
  const sections = SECTIONS.filter((section) => !section.permission || can(section.permission))
  const rawTab = search.get("tab")
  const fromQuery = rawTab
    ? TAB_ALIASES[rawTab] || (sections.some((s) => s.id === rawTab) ? (rawTab as SectionId) : null)
    : null
  const active =
    fromQuery && sections.some((s) => s.id === fromQuery)
      ? fromQuery
      : sections[0]?.id || "church_details"
  return { can, sections, active }
}

export function SettingsMenu() {
  const { sections, active } = useSettingsSections()

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 h-svh w-60 shrink-0 border-r bg-sidebar"
    >
      <SidebarHeader className="px-4 py-4">
        <p className="text-sm font-medium text-zinc-900">Settings</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {sections.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    render={<Link href={`/dashboard/settings?tab=${item.id}`} />}
                    isActive={active === item.id}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export function SettingsClient() {
  const { can, active, sections } = useSettingsSections()
  const current = sections.find((item) => item.id === active)

  return (
    <RequireAbility permission="settings.read">
      <div className="min-w-0 flex-1 bg-white p-4 md:p-6">
        <h1 className="text-2xl text-zinc-950">{current?.label ?? "Settings"}</h1>
        <div className="mt-6">
          {active === "church_details" ? <ChurchDetailsTab canEdit={can("settings.write")} /> : null}
          {active === "locations" ? <LocationsTab canEdit={can("settings.write")} /> : null}
          {active === "defaults" ? <NomenclatureTab canEdit={can("settings.write")} /> : null}
          {active === "integrations" ? <IntegrationsTab canEdit={can("settings.write")} /> : null}
          {active === "extra_fields" ? <CustomFieldsTab canEdit={can("settings.write")} /> : null}
          {active === "roles" ? <RolesPermissionsTab /> : null}
          {active === "import" ? <ImportTab canEdit={can("import.write") || can("settings.write")} /> : null}
        </div>
      </div>
    </RequireAbility>
  )
}
