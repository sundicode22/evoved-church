"use client"

import * as React from "react"
import { Download, Plus, ShieldCheck } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMembers } from "@/features/members/hooks/use-members"
import { MemberDrawer } from "@/components/members/member-drawer"
import { RequireAbility } from "@/components/auth/can"
import { HOUSEHOLD_ROLE_LABELS, type HouseholdRole } from "@/features/members/schemas"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  TableTabs,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { RowActionsMenu } from "@/components/row-actions-menu"

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Name" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "household", label: "Household role" },
  { id: "ministries", label: "Ministries" },
  { id: "safety", label: "Child safety" },
]

const TABS = [
  { id: "all", label: "All People" },
  { id: "covenant_member", label: "Covenant" },
  { id: "staff_minister", label: "Pastors & Elders" },
  { id: "leader", label: "Leaders" },
  { id: "prospect", label: "Guests" },
]

export default function MembersPage() {
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)
  const { data: membersResponse, isLoading } = useMembers({
    personType: activeTab === "all" ? undefined : activeTab,
    search: searchQuery,
  })

  const members = membersResponse?.data || []
  const pageRows = members.slice((page - 1) * pageSize, page * pageSize)

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
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="members.read">
          <PageHeader
            title="Members"
            description="Church members, household roles, and safety clearances."
          />

          <div className="space-y-4 p-6 md:p-8">
            {members.some(
              (p: any) =>
                p.backgroundCheckStatus === "expired" ||
                (p.backgroundCheckExpiresAt &&
                  new Date(p.backgroundCheckExpiresAt) <
                    new Date(Date.now() + 30 * 86400000))
            ) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="font-medium">Background check alert:</span> One or more members
                have expired or soon-to-expire child-safety clearances.
              </div>
            )}

            <TablePanel>
              <TableChrome
                tabs={
                  <TableTabs
                    tabs={TABS.map((t) => ({
                      ...t,
                      count: t.id === "all" ? members.length : undefined,
                    }))}
                    value={activeTab}
                    onChange={(id) => {
                      setActiveTab(id)
                      setPage(1)
                    }}
                  />
                }
                search={
                  <TableSearch
                    value={searchQuery}
                    onChange={(v) => {
                      setSearchQuery(v)
                      setPage(1)
                    }}
                    placeholder="Search people…"
                  />
                }
                trailing={
                  <>
                    <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg border-zinc-200 text-xs font-normal shadow-xs"
                    >
                      <Download className="size-3.5" strokeWidth={1.75} />
                      Export
                    </Button>
                    <TableAddButton>
                      <Plus className="size-3.5" strokeWidth={1.75} />
                      Add Person
                    </TableAddButton>
                  </>
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {isVisible("name") && <TableHead className="pl-4">Name</TableHead>}
                    {isVisible("lifecycle") && <TableHead>Lifecycle</TableHead>}
                    {isVisible("household") && <TableHead>Household role</TableHead>}
                    {isVisible("ministries") && <TableHead>Ministries</TableHead>}
                    {isVisible("safety") && <TableHead>Child safety</TableHead>}
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                        Loading…
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                        No members found.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map((person: any) => (
                    <TableRow
                      key={person.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(person.id)}
                    >
                      {isVisible("name") && (
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-800">
                              {person.firstName.charAt(0)}
                              {person.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900">
                                {person.firstName} {person.lastName}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {person.recordedTitle || "Main Location"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {isVisible("lifecycle") && (
                        <TableCell>
                          <StatusPill tone="success">
                            {String(person.personType).replaceAll("_", " ")}
                          </StatusPill>
                        </TableCell>
                      )}
                      {isVisible("household") && (
                        <TableCell>
                          {person.householdRole ? (
                            <Badge
                              variant="outline"
                              className="px-1.5 font-normal text-zinc-600"
                            >
                              {HOUSEHOLD_ROLE_LABELS[person.householdRole as HouseholdRole] ||
                                person.householdRole}
                            </Badge>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </TableCell>
                      )}
                      {isVisible("ministries") && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {person.ministryRoles?.length ? (
                              person.ministryRoles.map((role: string) => (
                                <span
                                  key={role}
                                  className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] text-zinc-600"
                                >
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-400">None</span>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {isVisible("safety") && (
                        <TableCell>
                          {person.backgroundCheckStatus === "cleared" ? (
                            <StatusPill tone="success">
                              <ShieldCheck className="size-3 text-emerald-600" />
                              Cleared
                            </StatusPill>
                          ) : person.backgroundCheckStatus === "expired" ? (
                            <StatusPill tone="warning">Expired</StatusPill>
                          ) : (
                            <span className="text-zinc-400">Not required</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <RowActionsMenu
                          groups={[
                            {
                              items: [
                                {
                                  label: "Open",
                                  onClick: () => setSelectedId(person.id),
                                },
                              ],
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={members.length}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </TablePanel>
          </div>
        </RequireAbility>

        <MemberDrawer
          memberId={selectedId}
          open={Boolean(selectedId)}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
