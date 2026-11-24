"use client"

import * as React from "react"
import { Download, Plus, Search, UserCircle } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { RowActionsMenu } from "@/components/row-actions-menu"

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Group" },
  { id: "category", label: "Category" },
  { id: "leader", label: "Leader" },
  { id: "schedule", label: "Schedule" },
  { id: "location", label: "Location" },
  { id: "capacity", label: "Capacity" },
]

const smallGroups = [
  {
    id: "grp-1",
    name: "Downtown Young Professionals",
    category: "Young Adults",
    leader: "Kathryn Murphy",
    day: "Wednesday",
    time: "7:00 PM",
    location: "255 Columbus Cir",
    membersCount: 14,
    capacity: 15,
  },
  {
    id: "grp-2",
    name: "North Campus Marriage & Family",
    category: "Couples & Families",
    leader: "Marcus & Rachel Vance",
    day: "Thursday",
    time: "6:30 PM",
    location: "1740 Madison Ave",
    membersCount: 18,
    capacity: 20,
  },
  {
    id: "grp-3",
    name: "Iron Sharpens Iron",
    category: "Men",
    leader: "Brian Robbin",
    day: "Saturday",
    time: "7:30 AM",
    location: "Sanctuary Cafe",
    membersCount: 22,
    capacity: 25,
  },
  {
    id: "grp-4",
    name: "Women of Grace",
    category: "Women",
    leader: "Sarah Miller",
    day: "Tuesday",
    time: "10:00 AM",
    location: "Prayer Chapel",
    membersCount: 16,
    capacity: 20,
  },
]

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const filtered = smallGroups.filter(
    (g) =>
      !searchQuery.trim() ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.leader.toLowerCase().includes(searchQuery.toLowerCase())
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
        <PageHeader
          title="Groups"
          description="Small groups and cell ministry."
          icon={<UserCircle className="size-5 text-[#16a34a]" strokeWidth={1.75} />}
          actions={
            <>
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
                Add Group
              </TableAddButton>
            </>
          }
        >
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search groups…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="h-8 rounded-lg border-zinc-200 bg-zinc-50 pl-8 text-xs shadow-xs"
            />
          </div>
        </PageHeader>

        <div className="p-6 md:p-8">
          <TablePanel>
            <TableChrome
              trailing={
                <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
              }
            />
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {isVisible("name") && <TableHead className="pl-4">Group</TableHead>}
                  {isVisible("category") && <TableHead>Category</TableHead>}
                  {isVisible("leader") && <TableHead>Leader</TableHead>}
                  {isVisible("schedule") && <TableHead>Schedule</TableHead>}
                  {isVisible("location") && <TableHead>Location</TableHead>}
                  {isVisible("capacity") && <TableHead>Capacity</TableHead>}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((group) => (
                  <TableRow key={group.id}>
                    {isVisible("name") && (
                      <TableCell className="pl-4 font-medium text-zinc-900">
                        {group.name}
                      </TableCell>
                    )}
                    {isVisible("category") && (
                      <TableCell>
                        <StatusPill>{group.category}</StatusPill>
                      </TableCell>
                    )}
                    {isVisible("leader") && (
                      <TableCell className="text-zinc-600">{group.leader}</TableCell>
                    )}
                    {isVisible("schedule") && (
                      <TableCell className="text-zinc-600">
                        {group.day} · {group.time}
                      </TableCell>
                    )}
                    {isVisible("location") && (
                      <TableCell className="text-zinc-500">{group.location}</TableCell>
                    )}
                    {isVisible("capacity") && (
                      <TableCell className="tabular-nums text-zinc-600">
                        {group.membersCount}/{group.capacity}
                      </TableCell>
                    )}
                    <TableCell className="pr-3 text-right">
                      <RowActionsMenu
                        groups={[{ items: [{ label: "Open", onClick: () => {} }] }]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
