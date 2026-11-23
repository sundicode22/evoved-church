"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  Settings05Icon,
  CheckmarkCircle02Icon,
  Building01Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"

export default function SettingsPage() {
  const { nomenclature, updateNomenclature, resetToDefaults } = useNomenclatureStore()
  const [formState, setFormState] = React.useState(nomenclature)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateNomenclature(formState)
    toast.success("Church nomenclature & dynamic terms updated successfully!")
  }

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
      <SidebarInset className="bg-[#fbfcfb] dark:bg-zinc-950 min-h-screen">
        
        {/* TOP HEADER */}
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Church Settings & Dynamic Nomenclature</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customize ecclesiastical terminology, denominations, currency symbols, and custom field taxonomy.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SETTINGS FORM */}
        <div className="p-8 max-w-3xl">
          <form onSubmit={handleSave} className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
            
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Ecclesiastical Nomenclature Dictionary
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Adapt the platform to your denomination or tradition. Changing these values immediately updates all table headers, labels, and reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Church / Organization Name</Label>
                <Input
                  value={formState.churchName}
                  onChange={(e) => setFormState({ ...formState, churchName: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Currency Code</Label>
                <Input
                  value={formState.currencyCode}
                  onChange={(e) => setFormState({ ...formState, currencyCode: e.target.value })}
                  className="h-9 text-xs uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Member Term (Singular)</Label>
                <Input
                  value={formState.memberTermSingular}
                  onChange={(e) => setFormState({ ...formState, memberTermSingular: e.target.value })}
                  placeholder="e.g. Member, Partner, Parishioner"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Member Term (Plural)</Label>
                <Input
                  value={formState.memberTermPlural}
                  onChange={(e) => setFormState({ ...formState, memberTermPlural: e.target.value })}
                  placeholder="e.g. Members, Partners, Parishioners"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Small Group Term</Label>
                <Input
                  value={formState.groupTermSingular}
                  onChange={(e) => setFormState({ ...formState, groupTermSingular: e.target.value })}
                  placeholder="e.g. Small Group, Life Group, Cell"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Campus / Branch Term</Label>
                <Input
                  value={formState.campusTermSingular}
                  onChange={(e) => setFormState({ ...formState, campusTermSingular: e.target.value })}
                  placeholder="e.g. Campus, Branch, Parish, Assembly"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Pastoral Title</Label>
                <Input
                  value={formState.pastorTermSingular}
                  onChange={(e) => setFormState({ ...formState, pastorTermSingular: e.target.value })}
                  placeholder="e.g. Pastor, Minister, Priest, Elder"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Giving & Tithe Term</Label>
                <Input
                  value={formState.givingTerm}
                  onChange={(e) => setFormState({ ...formState, givingTerm: e.target.value })}
                  placeholder="e.g. Tithes & Offerings, Stewardship"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetToDefaults()
                  setFormState(nomenclature)
                  toast.info("Reset to default evangelical/standard terms.")
                }}
                className="h-9 text-xs text-zinc-500"
              >
                Reset to Defaults
              </Button>

              <Button type="submit" className="h-9 px-5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold gap-1.5 shadow-xs">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2.5} className="size-3.5" />
                <span>Save Nomenclature</span>
              </Button>
            </div>

          </form>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
