"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ListTodo, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  SharedKanbanBoard,
  type KanbanColumnData,
} from "@/components/kanban/shared-kanban-board"
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
  useCreateProjectCard,
  useProjects,
  useUpdateProjectStage,
} from "@/features/projects/hooks/use-projects"
import type { ProjectStage } from "@/features/projects/schemas"

const COLUMNS: ColumnOption[] = [
  { id: "title", label: "Task" },
  { id: "project", label: "Project" },
  { id: "stage", label: "Stage" },
  { id: "priority", label: "Priority" },
  { id: "assignee", label: "Assignee" },
  { id: "due", label: "Due" },
  { id: "updated", label: "Updated" },
]

const PRIORITY_TONE = {
  high: "danger",
  normal: "success",
  low: "neutral",
} as const

const PRIORITY_STYLES = {
  high: "border-rose-200 bg-rose-50 text-rose-700",
  normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  low: "border-zinc-200 bg-zinc-50 text-zinc-600",
} as const

export default function ProjectsPage() {
  const { data, isLoading } = useProjects()
  const updateStage = useUpdateProjectStage()
  const createCard = useCreateProjectCard()
  const [view, setView] = React.useState<"table" | "board">("table")
  const [search, setSearch] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [projectName, setProjectName] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const query = search.trim().toLowerCase()
  const flatCards = React.useMemo(() => {
    const cards = (data?.columns ?? []).flatMap((col) =>
      col.cards.map((c) => ({ ...c, stageLabel: col.title }))
    )
    if (!query) return cards
    return cards.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.projectName.toLowerCase().includes(query)
    )
  }, [data, query])

  const pageRows = flatCards.slice((page - 1) * pageSize, page * pageSize)

  const columns = React.useMemo<KanbanColumnData[]>(
    () =>
      (data?.columns ?? []).map((col) => ({
        id: col.id,
        title: col.title,
        cards: col.cards
          .filter(
            (c) =>
              !query ||
              c.title.toLowerCase().includes(query) ||
              c.projectName.toLowerCase().includes(query)
          )
          .map((c) => ({
            id: c.id,
            title: c.title,
            label: c.projectName,
            since: c.stageChangedAt,
            dueLabel: c.dueLabel,
            assignee: c.assigneeName,
            badges: [{ text: c.priority, className: PRIORITY_STYLES[c.priority] }],
          })),
      })),
    [data, query]
  )

  const total = data?.totalCards ?? 0
  const doneCount = data?.columns.find((c) => c.id === "done")?.cards.length ?? 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    createCard.mutate(
      { title, projectName: projectName || "General" },
      {
        onSuccess: () => {
          setOpen(false)
          setTitle("")
          setProjectName("")
        },
      }
    )
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="projects.read">
          <PageHeader
            title="Projects"
            description={`Open ${total - doneCount} · Done ${doneCount}. List first; board is optional.`}
            icon={<ListTodo className="size-5 text-[var(--brand)]" strokeWidth={1.75} />}
            actions={<ViewToggle value={view} onChange={setView} />}
          />

          <div className="p-6 md:p-8">
            {view === "board" ? (
              <TablePanel className="overflow-x-auto rounded-lg border bg-background p-4">
                <SharedKanbanBoard
                  columns={columns}
                  isLoading={isLoading}
                  onMove={(id, stage) =>
                    updateStage.mutate({ id, stage: stage as ProjectStage })
                  }
                />
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
                      placeholder="Search projects…"
                    />
                  }
                  trailing={
                    <>
                      <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                      <Can permission="projects.write">
                        <TableAddButton onClick={() => setOpen(true)}>
                          <Plus className="size-3.5" strokeWidth={1.75} />
                          Add Task
                        </TableAddButton>
                      </Can>
                    </>
                  }
                />
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {isVisible("title") && <TableHead className="pl-4">Task</TableHead>}
                      {isVisible("project") && <TableHead>Project</TableHead>}
                      {isVisible("stage") && <TableHead>Stage</TableHead>}
                      {isVisible("priority") && <TableHead>Priority</TableHead>}
                      {isVisible("assignee") && <TableHead>Assignee</TableHead>}
                      {isVisible("due") && <TableHead>Due</TableHead>}
                      {isVisible("updated") && <TableHead>Updated</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-sm text-zinc-500">
                          Loading…
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && flatCards.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-sm text-zinc-500">
                          No project tasks yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {pageRows.map((card) => (
                      <TableRow key={card.id}>
                        {isVisible("title") && (
                          <TableCell className="pl-4 font-medium text-zinc-900">
                            {card.title}
                          </TableCell>
                        )}
                        {isVisible("project") && (
                          <TableCell>
                            <StatusPill tone="success">{card.projectName}</StatusPill>
                          </TableCell>
                        )}
                        {isVisible("stage") && (
                          <TableCell className="text-zinc-600">{card.stageLabel}</TableCell>
                        )}
                        {isVisible("priority") && (
                          <TableCell>
                            <StatusPill tone={PRIORITY_TONE[card.priority]}>
                              {card.priority}
                            </StatusPill>
                          </TableCell>
                        )}
                        {isVisible("assignee") && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="flex size-6 items-center justify-center rounded-full bg-sky-500 text-[10px] font-medium text-white">
                                {(card.assigneeName || "?").slice(0, 2)}
                              </span>
                              <span className="text-sm text-zinc-600">
                                {card.assigneeName || "Unassigned"}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {isVisible("due") && (
                          <TableCell className="text-zinc-500">{card.dueLabel || "—"}</TableCell>
                        )}
                        {isVisible("updated") && (
                          <TableCell className="text-zinc-500">
                            {card.stageChangedAt
                              ? formatDistanceToNow(new Date(card.stageChangedAt), {
                                  addSuffix: true,
                                })
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
                  total={flatCards.length}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s)
                    setPage(1)
                  }}
                />
              </TablePanel>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">Add project task</SheetTitle>
                  <SheetDescription>New tasks start in Backlog.</SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Project</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Easter Outreach"
                      className="h-9 text-sm"
                    />
                  </div>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" className="h-9" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCard.isPending || title.trim().length < 2}
                    className="h-9 bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
                  >
                    Add task
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
