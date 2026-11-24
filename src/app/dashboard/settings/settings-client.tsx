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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PermissionKey } from "@/features/auth/permissions-catalog"

type SectionId =
  | "church_details"
  | "locations"
  | "defaults"
  | "integrations"
  | "extra_fields"
  | "roles"
  | "import"

/** Only ship tabs that are implemented — no placeholder chrome. */
const SECTIONS: { id: SectionId; label: string; permission?: PermissionKey }[] = [
  { id: "church_details", label: "Church details" },
  { id: "locations", label: "Locations" },
  { id: "defaults", label: "Defaults" },
  { id: "integrations", label: "Integrations" },
  { id: "extra_fields", label: "Extra fields" },
  { id: "roles", label: "Users and roles", permission: "settings.roles" },
  { id: "import", label: "Import CSV", permission: "import.write" },
]

const TAB_ALIASES: Record<string, SectionId> = {
  nomenclature: "defaults",
  custom_fields: "extra_fields",
  integrations: "integrations",
  roles: "roles",
  locations: "locations",
  import: "import",
  church_details: "church_details",
}

export function SettingsClient() {
  const { can } = useAbility()
  const search = useSearchParams()
  const rawTab = search.get("tab")
  const sections = SECTIONS.filter((section) => !section.permission || can(section.permission))
  const fromQuery = rawTab
    ? TAB_ALIASES[rawTab] || (sections.some((s) => s.id === rawTab) ? (rawTab as SectionId) : null)
    : null
  const initial =
    fromQuery && sections.some((s) => s.id === fromQuery)
      ? fromQuery
      : sections[0]?.id || "church_details"
  const [section, setSection] = React.useState<SectionId>(initial)

  React.useEffect(() => {
    if (fromQuery && sections.some((s) => s.id === fromQuery)) setSection(fromQuery)
  }, [fromQuery, sections])

  const active = sections.some((item) => item.id === section)
    ? section
    : sections[0]?.id || "church_details"

  return (
    <RequireAbility permission="settings.read">
      <Tabs
        value={active}
        onValueChange={(v) => setSection(v as SectionId)}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="border-b bg-white px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-zinc-700" strokeWidth={1.75} />
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Church Settings</h1>
          </div>
          <TabsList
            variant="line"
            className="mt-4 h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-zinc-200 bg-transparent p-0"
          >
            {sections.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="rounded-none border-0 px-3 py-2.5 text-sm data-active:bg-transparent data-active:text-[var(--brand-ink)] data-active:shadow-none data-active:after:bg-[var(--brand)]"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-w-0 flex-1 bg-[#fbfcfb] p-4 md:p-6">
          <TabsContent value="church_details" className="mt-0">
            <ChurchDetailsTab canEdit={can("settings.write")} />
          </TabsContent>
          <TabsContent value="locations" className="mt-0">
            <LocationsTab canEdit={can("settings.write")} />
          </TabsContent>
          <TabsContent value="defaults" className="mt-0">
            <NomenclatureTab canEdit={can("settings.write")} />
          </TabsContent>
          <TabsContent value="integrations" className="mt-0">
            <IntegrationsTab canEdit={can("settings.write")} />
          </TabsContent>
          <TabsContent value="extra_fields" className="mt-0">
            <CustomFieldsTab canEdit={can("settings.write")} />
          </TabsContent>
          <TabsContent value="roles" className="mt-0">
            <RolesPermissionsTab />
          </TabsContent>
          <TabsContent value="import" className="mt-0">
            <ImportTab canEdit={can("import.write") || can("settings.write")} />
          </TabsContent>
        </div>
      </Tabs>
    </RequireAbility>
  )
}
