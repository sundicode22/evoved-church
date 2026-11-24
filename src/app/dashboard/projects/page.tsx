"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
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
import { Can, RequireAbility } from "@/components/auth/can"
import {
  SharedKanbanBoard,
  type KanbanColumnData,
} from "@/components/kanban/shared-kanban-board"
import {
  useCreateProjectCard,
  useProjects,
  useUpdateProjectStage,
} from "@/features/projects/hooks/use-projects"
import type { ProjectStage } from "@/features/projects/schemas"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, SearchIcon, Task01Icon } from "@hugeicons/core-free-icons"

const PRIORITY_STYLES = {
  high: "border-rose-200 bg-rose-50 text-rose-700",
  normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  low: "border-zinc-200 bg-zinc-50 text-zinc-600",
} as const

export default function ProjectsPage() {
  const { data, isLoading } = useProjects()
  const updateStage = useUpdateProjectStage()
  const createCard = useCreateProjectCard()
  const [search, setSearch] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [projectName, setProjectName] = React.useState("")

  const query = search.trim().toLowerCase()
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
      <SidebarInset className="min-h-screen bg-[#fbfcfb] dark:bg-zinc-950">
        <RequireAbility permission="projects.read">
          <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  <HugeiconsIcon icon={Task01Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                  <span>Projects</span>
                </h1>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Event logistics, facility upkeep, and follow-ups. Drag cards between columns as work progresses.
                </p>
              </div>
              <Can permission="projects.write">
                <Button
                  onClick={() => setOpen(true)}
                  className="h-9 gap-1.5 rounded-lg bg-[#22c55e] px-4 text-xs font-normal text-white shadow-xs hover:bg-[#16a34a]"
                >
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                  <span>Add Card</span>
                </Button>
              </Can>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <div>
                <span>
                  Open: <strong className="text-zinc-800">{total - doneCount} cards</strong>
                </span>
                <span className="mx-2 text-zinc-300">·</span>
                <span>
                  Done: <strong className="font-semibold text-emerald-700">{doneCount} cards</strong>
                </span>
              </div>
              <div className="relative w-56">
                <HugeiconsIcon
                  icon={SearchIcon}
                  strokeWidth={2}
                  className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400"
                />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 rounded-lg border-zinc-200 bg-zinc-50 pl-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto p-6">
            <SharedKanbanBoard
              columns={columns}
              isLoading={isLoading}
              onMove={(id, stage) => updateStage.mutate({ id, stage: stage as ProjectStage })}
            />
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Add project card</SheetTitle>
                  <SheetDescription>New cards start in the Backlog column.</SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Project</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Easter Outreach"
                      className="h-9 text-xs"
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
                    className="h-9 bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  >
                    Add card
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
