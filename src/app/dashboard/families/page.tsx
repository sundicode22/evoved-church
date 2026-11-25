"use client"

import * as React from "react"
import { Home } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RequireAbility } from "@/components/auth/can"
import {
  ColumnCustomize,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { useHouseholds } from "@/features/members/hooks/use-members"
import { HOUSEHOLD_ROLE_LABELS, type HouseholdRole } from "@/features/members/schemas"

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Household" },
  { id: "members", label: "Members" },
  { id: "roles", label: "Roles" },
  { id: "location", label: "Location" },
]

function roleLabel(role?: string | null) {
  if (!role) return "—"
  return HOUSEHOLD_ROLE_LABELS[role as HouseholdRole] || role
}

export default function FamiliesPage() {
  const { data, isLoading } = useHouseholds()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const rows = data ?? []
  const filtered = rows.filter(
    (hh: { name?: string; city?: string | null }) =>
      !searchQuery.trim() ||
      (hh.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hh.city || "").toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

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
            title="Families"
            description="Households linked to church members."
            icon={<Home className="size-5 text-brand" strokeWidth={1.75} />}
          />

          <div className="p-6 md:p-8">
            <TablePanel>
              <TableChrome
                search={
                  <TableSearch
                    value={searchQuery}
                    onChange={(v) => {
                      setSearchQuery(v)
                      setPage(1)
                    }}
                    placeholder="Search households…"
                  />
                }
                trailing={
                  <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {isVisible("name") && <TableHead className="pl-4">Household</TableHead>}
                    {isVisible("members") && <TableHead>Members</TableHead>}
                    {isVisible("roles") && <TableHead>Roles</TableHead>}
                    {isVisible("location") && <TableHead>Location</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    [0, 1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4} className="pl-4">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-sm text-zinc-500">
                        No households yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map(
                    (hh: {
                      id: string
                      name: string
                      memberCount?: number
                      members?: {
                        firstName: string
                        lastName: string
                        householdRole?: string | null
                      }[]
                      city?: string | null
                      state?: string | null
                      address?: string | null
                    }) => (
                      <TableRow key={hh.id}>
                        {isVisible("name") && (
                          <TableCell className="pl-4 font-medium text-zinc-900">
                            {hh.name}
                          </TableCell>
                        )}
                        {isVisible("members") && (
                          <TableCell className="text-zinc-600">
                            <span className="tabular-nums">{hh.memberCount ?? hh.members?.length ?? 0}</span>
                            {hh.members?.length ? (
                              <span className="mt-0.5 block text-xs text-zinc-500">
                                {hh.members
                                  .map((m) => `${m.firstName} ${m.lastName}`)
                                  .join(", ")}
                              </span>
                            ) : null}
                          </TableCell>
                        )}
                        {isVisible("roles") && (
                          <TableCell className="text-zinc-500">
                            {(hh.members || [])
                              .map((m) => roleLabel(m.householdRole))
                              .filter((r, i, arr) => arr.indexOf(r) === i)
                              .join(" · ") || "—"}
                          </TableCell>
                        )}
                        {isVisible("location") && (
                          <TableCell className="text-zinc-500">
                            {[hh.city, hh.state].filter(Boolean).join(", ") ||
                              hh.address ||
                              "—"}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </TablePanel>
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
