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
import type { PermissionKey } from "@/features/auth/permissions-catalog"
import { cn } from "cn"

type SectionId =
  | "church_details"
  | "locations"
  | "defaults"
  | "integrations"
  | "extra_fields"
  | "roles"
  | "import"

type SettingsSection = {
  id: SectionId
  label: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  permission?: PermissionKey
}

const SECTION_GROUPS: { label: string; items: SettingsSection[] }[] = [
  {
    label: "Organization",
    items: [
      {
        id: "church_details",
        label: "Church details",
        description: "Name, logo, and contact profile.",
        icon: Building2,
      },
      {
        id: "locations",
        label: "Locations",
        description: "Campuses and books of accounts.",
        icon: MapPin,
      },
      {
        id: "defaults",
        label: "Defaults",
        description: "Terminology and product wording.",
        icon: SlidersHorizontal,
      },
    ],
  },
  {
    label: "Access",
    items: [
      {
        id: "roles",
        label: "Users and roles",
        description: "Click a role to edit its permission matrix.",
        icon: Shield,
        permission: "settings.roles",
      },
      {
        id: "integrations",
        label: "Integrations",
        description: "Email, SMS, and connected services.",
        icon: Plug,
      },
    ],
  },
  {
    label: "Data",
    items: [
      {
        id: "extra_fields",
        label: "Extra fields",
        description: "Custom attributes for people and records.",
        icon: ListPlus,
      },
      {
        id: "import",
        label: "Import CSV",
        description: "Bring members and giving history in.",
        icon: Upload,
        permission: "import.write",
      },
    ],
  },
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
  const groups = SECTION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((section) => !section.permission || can(section.permission)),
  })).filter((group) => group.items.length > 0)
  const sections = groups.flatMap((group) => group.items)
  const rawTab = search.get("tab")
  const fromQuery = rawTab
    ? TAB_ALIASES[rawTab] || (sections.some((s) => s.id === rawTab) ? (rawTab as SectionId) : null)
    : null
  const active =
    fromQuery && sections.some((s) => s.id === fromQuery)
      ? fromQuery
      : sections[0]?.id || "church_details"
  return { can, groups, sections, active }
}

export function SettingsMenu() {
  const { groups, active } = useSettingsSections()

  return (
    <aside className="sticky top-12 hidden h-[calc(100svh-3rem)] w-60 shrink-0 overflow-y-auto border-r border-zinc-200/80 bg-[#fbfcfb] md:block">
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Settings</p>
      </div>
      <nav className="space-y-5 px-2 pb-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/settings?tab=${item.id}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-brand-soft font-medium text-brand-ink"
                          : "text-zinc-600 hover:bg-white hover:text-zinc-900"
                      )}
                    >
                      <Icon
                        className={cn("size-4 shrink-0", isActive ? "text-brand" : "text-zinc-400")}
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function MobileSettingsTabs({
  sections,
  active,
}: {
  sections: SettingsSection[]
  active: SectionId
}) {
  return (
    <div className="border-b border-zinc-200/80 bg-white px-4 py-3 md:hidden">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {sections.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={`/dashboard/settings?tab=${item.id}`}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "border-brand/30 bg-brand-soft font-medium text-brand-ink"
                  : "border-zinc-200 bg-white text-zinc-600"
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function SettingsClient() {
  const { can, active, sections } = useSettingsSections()
  const current = sections.find((item) => item.id === active)

  return (
    <RequireAbility permission="settings.read">
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <MobileSettingsTabs sections={sections} active={active} />
        <div className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-6">
          <div className="mb-6 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              {current?.label ?? "Settings"}
            </h1>
            {current?.description ? (
              <p className="mt-1.5 text-sm text-zinc-500">{current.description}</p>
            ) : null}
          </div>
          <div className="w-full max-w-5xl text-left">
            {active === "church_details" ? (
              <ChurchDetailsTab canEdit={can("settings.write")} />
            ) : null}
            {active === "locations" ? <LocationsTab canEdit={can("settings.write")} /> : null}
            {active === "defaults" ? <NomenclatureTab canEdit={can("settings.write")} /> : null}
            {active === "integrations" ? (
              <IntegrationsTab canEdit={can("settings.write")} />
            ) : null}
            {active === "extra_fields" ? (
              <CustomFieldsTab canEdit={can("settings.write")} />
            ) : null}
            {active === "roles" ? <RolesPermissionsTab /> : null}
            {active === "import" ? (
              <ImportTab canEdit={can("import.write") || can("settings.write")} />
            ) : null}
          </div>
        </div>
      </div>
    </RequireAbility>
  )
}
