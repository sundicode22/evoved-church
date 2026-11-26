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
  { id: "address", label: "Address" },
  { id: "city", label: "City" },
  { id: "state", label: "State" },
  { id: "zip", label: "ZIP" },
  { id: "contact", label: "Primary contact" },
]

function roleLabel(role?: string | null) {
  if (!role) return "—"
  return HOUSEHOLD_ROLE_LABELS[role as HouseholdRole] || role
}

function formatAddress(parts: {
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}) {
  return [parts.address, parts.city, parts.state, parts.zipCode].filter(Boolean).join(", ")
}

type HouseholdMember = {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  householdRole?: string | null
  personType?: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}

type HouseholdRow = {
  id: string
  name: string
  memberCount?: number
  members?: HouseholdMember[]
  city?: string | null
  state?: string | null
  address?: string | null
  zipCode?: string | null
}

export default function FamiliesPage() {
  const { data, isLoading } = useHouseholds()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const rows = (data ?? []) as HouseholdRow[]
  const filtered = rows.filter((hh) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const blob = [
      hh.name,
      hh.address,
      hh.city,
      hh.state,
      hh.zipCode,
      ...(hh.members || []).flatMap((m) => [
        m.firstName,
        m.lastName,
        m.email,
        m.phoneNumber,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return blob.includes(q)
  })
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

          <div className="w-full p-6 md:p-8">
            <TablePanel className="w-full min-w-0">
              <TableChrome
                search={
                  <TableSearch
                    value={searchQuery}
                    onChange={(v) => {
                      setSearchQuery(v)
                      setPage(1)
                    }}
                    placeholder="Search households, people, address…"
                  />
                }
                trailing={
                  <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                }
              />
              <div className="w-full overflow-x-auto rounded-lg border border-zinc-200/80 bg-background">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {isVisible("name") && (
                        <TableHead className="min-w-[180px] pl-4">Household</TableHead>
                      )}
                      {isVisible("members") && (
                        <TableHead className="min-w-[220px]">Members</TableHead>
                      )}
                      {isVisible("roles") && (
                        <TableHead className="min-w-[140px]">Roles</TableHead>
                      )}
                      {isVisible("address") && (
                        <TableHead className="min-w-[200px]">Address</TableHead>
                      )}
                      {isVisible("city") && <TableHead className="min-w-[120px]">City</TableHead>}
                      {isVisible("state") && (
                        <TableHead className="min-w-[80px]">State</TableHead>
                      )}
                      {isVisible("zip") && <TableHead className="min-w-[90px]">ZIP</TableHead>}
                      {isVisible("contact") && (
                        <TableHead className="min-w-[200px]">Primary contact</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {!isLoading && pageRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-12 text-center text-sm text-zinc-500"
                        >
                          No households yet. Link members to a household from the Members drawer.
                        </TableCell>
                      </TableRow>
                    )}
                    {pageRows.map((hh) => {
                      const head =
                        hh.members?.find(
                          (m) =>
                            m.householdRole === "head" ||
                            m.householdRole === "father" ||
                            m.householdRole === "mother"
                        ) || hh.members?.[0]
                      return (
                        <TableRow key={hh.id}>
                          {isVisible("name") && (
                            <TableCell className="pl-4 font-medium text-zinc-900">
                              {hh.name}
                              <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                                {hh.memberCount ?? hh.members?.length ?? 0} people
                              </span>
                            </TableCell>
                          )}
                          {isVisible("members") && (
                            <TableCell className="text-zinc-600">
                              {hh.members?.length ? (
                                <ul className="space-y-0.5 text-sm">
                                  {hh.members.map((m) => (
                                    <li key={m.id}>
                                      {m.firstName} {m.lastName}
                                      <span className="text-zinc-400">
                                        {" "}
                                        · {roleLabel(m.householdRole)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-zinc-400">—</span>
                              )}
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
                          {isVisible("address") && (
                            <TableCell className="text-zinc-600">
                              {hh.address ||
                                head?.address ||
                                formatAddress({
                                  city: hh.city,
                                  state: hh.state,
                                  zipCode: hh.zipCode,
                                }) ||
                                "—"}
                            </TableCell>
                          )}
                          {isVisible("city") && (
                            <TableCell className="text-zinc-600">
                              {hh.city || head?.city || "—"}
                            </TableCell>
                          )}
                          {isVisible("state") && (
                            <TableCell className="text-zinc-600">
                              {hh.state || head?.state || "—"}
                            </TableCell>
                          )}
                          {isVisible("zip") && (
                            <TableCell className="text-zinc-600">
                              {hh.zipCode || head?.zipCode || "—"}
                            </TableCell>
                          )}
                          {isVisible("contact") && (
                            <TableCell className="text-zinc-600">
                              {head ? (
                                <div>
                                  <p className="font-medium text-zinc-800">
                                    {head.firstName} {head.lastName}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {head.email || head.phoneNumber || "—"}
                                  </p>
                                  {head.email && head.phoneNumber ? (
                                    <p className="text-xs text-zinc-500">{head.phoneNumber}</p>
                                  ) : null}
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
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
