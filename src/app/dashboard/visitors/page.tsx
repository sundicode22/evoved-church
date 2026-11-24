"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { Plus, UserPlus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KanbanBoard } from "@/components/visitors/kanban-board"
import { RequireAbility, Can } from "@/components/auth/can"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  ViewToggle,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import {
  useVisitorBoard,
  useVisitorLeads,
} from "@/features/visitors/hooks/use-visitor-leads"
import { VISITOR_STAGE_LABELS, type VisitorStage } from "@/features/visitors/schemas"
import { cn } from "@/lib/utils"

const COLUMNS: ColumnOption[] = [
  { id: "contact", label: "Contact" },
  { id: "stage", label: "Stage" },
  { id: "source", label: "Source" },
  { id: "location", label: "Location" },
  { id: "assignee", label: "Assignee" },
  { id: "updated", label: "Updated" },
]

function stageTone(stage: string): "neutral" | "success" | "warning" | "info" {
  if (stage === "active_partner") return "success"
  if (stage === "first_visit") return "info"
  if (stage === "welcome_call" || stage === "pastoral_visit") return "warning"
  return "neutral"
}

export default function VisitorsPage() {
  const [view, setView] = React.useState<"table" | "board">("table")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)
  const { data: listRes, isLoading } = useVisitorLeads(1, 50, undefined, search)
  const board = useVisitorBoard(search)

  const rows = React.useMemo(() => {
    if (listRes?.data?.length) return listRes.data
    const stages = board.data?.stages ?? []
    return stages.flatMap((col: { leads?: unknown[] }) => col.leads ?? [])
  }, [listRes, board.data])

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

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
        <RequireAbility permission="visitors.read">
          <PageHeader
            title="Visitors"
            description="Follow up with guests. Use List by default; Board is optional."
            icon={<UserPlus className="size-5 text-[var(--brand)]" strokeWidth={1.75} />}
            actions={<ViewToggle value={view} onChange={setView} />}
          />

          <div className="p-6 md:p-8">
            {view === "board" ? (
              <TablePanel className="rounded-lg border bg-background p-4">
                <KanbanBoard embedded />
              </TablePanel>
            ) : (
              <TablePanel>
                <TableChrome
                  search={
                    <TableSearch
                      value={search}
                      onChange={(v) => {
                        setSearch(v)
                        setPage(1)
                      }}
                      placeholder="Search visitors…"
                    />
                  }
                  trailing={
                    <>
                      <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                      <Can permission="visitors.write">
                        <TableAddButton>
                          <Plus className="size-3.5" strokeWidth={1.75} />
                          Add Visitor
                        </TableAddButton>
                      </Can>
                    </>
                  }
                />
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {isVisible("contact") && <TableHead className="pl-4">Contact</TableHead>}
                      {isVisible("stage") && <TableHead>Stage</TableHead>}
                      {isVisible("source") && <TableHead>Source</TableHead>}
                      {isVisible("location") && <TableHead>Location</TableHead>}
                      {isVisible("assignee") && <TableHead>Assignee</TableHead>}
                      {isVisible("updated") && <TableHead>Updated</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && board.isLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                          Loading…
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                          No visitors yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {pageRows.map((row: any) => (
                      <TableRow key={row.id}>
                        {isVisible("contact") && (
                          <TableCell className="pl-4">
                            <div className="font-medium text-zinc-900">
                              {row.contactName || row.title || "—"}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {row.contactEmail || row.contactPhone || row.title}
                            </div>
                          </TableCell>
                        )}
                        {isVisible("stage") && (
                          <TableCell>
                            <StatusPill tone={stageTone(row.stage)}>
                              {VISITOR_STAGE_LABELS[row.stage as VisitorStage] || row.stage}
                            </StatusPill>
                          </TableCell>
                        )}
                        {isVisible("source") && (
                          <TableCell className="text-zinc-600">{row.source || "—"}</TableCell>
                        )}
                        {isVisible("location") && (
                          <TableCell className="text-zinc-600">{row.location || "—"}</TableCell>
                        )}
                        {isVisible("assignee") && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "flex size-6 items-center justify-center rounded-full text-[10px] font-medium text-white bg-emerald-500"
                                )}
                              >
                                {(row.assignedToName || row.assignee || "?").slice(0, 1)}
                              </span>
                              <span className="text-sm text-zinc-600">
                                {row.assignedToName || row.assignee || "Unassigned"}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {isVisible("updated") && (
                          <TableCell className="text-zinc-500">
                            {row.updatedAt || row.stageChangedAt
                              ? formatDistanceToNow(
                                  new Date(row.updatedAt || row.stageChangedAt),
                                  { addSuffix: true }
                                )
                              : "—"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  page={page}
                  pageSize={pageSize}
                  total={rows.length}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s)
                    setPage(1)
                  }}
                />
              </TablePanel>
            )}
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
