"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Settings } from "lucide-react"
import { RequireAbility } from "@/components/auth/can"
import { useAbility } from "@/features/auth/ability-context"
import { ChurchDetailsTab } from "@/features/settings/components/church-details-tab"
import { RolesPermissionsTab } from "@/features/settings/components/roles-permissions-tab"
import { IntegrationsTab } from "@/features/settings/components/integrations-tab"
import { ImportTab } from "@/features/settings/components/import-tab"
import { CustomFieldsTab } from "@/features/settings/components/custom-fields-tab"
import { LocationsTab } from "@/features/settings/components/locations-tab"
import { NomenclatureTab } from "@/features/settings/components/nomenclature-tab"
import { PlaceholderSettingsTab } from "@/features/settings/components/placeholder-settings-tab"
import { cn } from "@/lib/utils"
import type { PermissionKey } from "@/features/auth/permissions-catalog"

type SectionId =
  | "church_details"
  | "subscription"
  | "billing"
  | "integrations"
  | "extra_fields"
  | "defaults"
  | "custom_domain"
  | "roles"
  | "locations"
  | "import"

const SECTIONS: { id: SectionId; label: string; permission?: PermissionKey }[] = [
  { id: "church_details", label: "Church details" },
  { id: "subscription", label: "Subscription" },
  { id: "billing", label: "Billing" },
  { id: "integrations", label: "Integrations" },
  { id: "extra_fields", label: "Extra Fields" },
  { id: "defaults", label: "Defaults" },
  { id: "custom_domain", label: "Custom Domain" },
  { id: "locations", label: "Locations" },
  { id: "roles", label: "Users and Roles", permission: "settings.roles" },
  { id: "import", label: "Import CSV", permission: "import.write" },
]

const TAB_ALIASES: Record<string, SectionId> = {
  nomenclature: "defaults",
  custom_fields: "extra_fields",
  integrations: "integrations",
  roles: "roles",
  locations: "locations",
  import: "import",
}

export function SettingsClient() {
  const { can } = useAbility()
  const search = useSearchParams()
  const rawTab = search.get("tab")
  const sections = SECTIONS.filter((section) => !section.permission || can(section.permission))
  const fromQuery = rawTab
    ? TAB_ALIASES[rawTab] || (sections.some((s) => s.id === rawTab) ? (rawTab as SectionId) : null)
    : null
  const initial = fromQuery && sections.some((s) => s.id === fromQuery) ? fromQuery : "church_details"
  const [section, setSection] = React.useState<SectionId>(initial)
  const active = sections.some((item) => item.id === section) ? section : sections[0]?.id

  React.useEffect(() => {
    if (fromQuery && sections.some((s) => s.id === fromQuery)) setSection(fromQuery)
  }, [fromQuery, sections])

  return (
    <RequireAbility permission="settings.read">
      <div className="border-b bg-white px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <Settings className="size-5 text-zinc-700" />
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Church Settings</h1>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors",
                active === item.id
                  ? "bg-[#eaf5ea] font-medium text-[#1b5e20] ring-1 ring-[#16a34a]/30"
                  : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-w-0 flex-1 bg-[#fbfcfb] p-4 md:p-6">
        {active === "church_details" ? (
          <ChurchDetailsTab canEdit={can("settings.write")} />
        ) : null}
        {active === "subscription" ? (
          <PlaceholderSettingsTab
            title="Subscription"
            description="Plan and seat management will live here. Evolve is not shipping SaaS billing chrome in this release."
          />
        ) : null}
        {active === "billing" ? (
          <PlaceholderSettingsTab
            title="Billing"
            description="Invoices and payment methods will appear here when billing is enabled."
          />
        ) : null}
        {active === "integrations" ? (
          <IntegrationsTab canEdit={can("settings.write")} />
        ) : null}
        {active === "extra_fields" ? (
          <CustomFieldsTab canEdit={can("settings.write")} />
        ) : null}
        {active === "defaults" ? (
          <NomenclatureTab canEdit={can("settings.write")} />
        ) : null}
        {active === "custom_domain" ? (
          <PlaceholderSettingsTab
            title="Custom Domain"
            description="Point a custom domain at your member portal. Coming after portal studio."
          />
        ) : null}
        {active === "locations" ? <LocationsTab canEdit={can("settings.write")} /> : null}
        {active === "roles" ? <RolesPermissionsTab /> : null}
        {active === "import" ? (
          <ImportTab canEdit={can("import.write") || can("settings.write")} />
        ) : null}
      </div>
    </RequireAbility>
  )
}
