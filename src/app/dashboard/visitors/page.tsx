"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { Plus, UserPlus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { TextFormField, SelectFormField } from "@/components/form-fields"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FieldGroup } from "@/components/ui/field"
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
  useCreateLead,
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

const SOURCES = [
  "Sunday Service QR",
  "Website",
  "Friend invite",
  "Walk-in",
  "Event",
  "Other",
]

const addVisitorFormSchema = z.object({
  contactName: z.string().trim().min(2, "Name must be at least 2 characters"),
  title: z.string().optional(),
  contactEmail: z.string().trim().email("Valid email required").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  location: z.string().optional(),
  source: z.string().min(1, "Source is required"),
})

type AddVisitorFormValues = z.infer<typeof addVisitorFormSchema>

const ADD_VISITOR_DEFAULTS: AddVisitorFormValues = {
  contactName: "",
  title: "",
  contactEmail: "",
  contactPhone: "",
  location: "",
  source: SOURCES[0],
}

const SOURCE_OPTIONS = SOURCES.map((s) => ({ value: s, label: s }))

function stageTone(stage: string): "neutral" | "success" | "warning" | "info" {
  if (stage === "active_partner") return "success"
  if (stage === "first_visit") return "info"
  if (stage === "welcome_call" || stage === "pastoral_visit") return "warning"
  return "neutral"
}

function assigneeLabel(row: { assignedToName?: unknown; assignee?: unknown }) {
  if (typeof row.assignedToName === "string" && row.assignedToName) return row.assignedToName
  if (typeof row.assignee === "string" && row.assignee) return row.assignee
  if (row.assignee && typeof row.assignee === "object" && "name" in row.assignee) {
    const name = (row.assignee as { name?: unknown }).name
    return typeof name === "string" ? name : ""
  }
  return ""
}

export default function VisitorsPage() {
  const [view, setView] = React.useState<"table" | "board">("table")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const form = useForm<AddVisitorFormValues>({
    resolver: zodResolver(addVisitorFormSchema),
    defaultValues: ADD_VISITOR_DEFAULTS,
  })

  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)
  const createLead = useCreateLead()
  const { data: listRes, isLoading, refetch } = useVisitorLeads(1, 50, undefined, search)
  const board = useVisitorBoard(search)

  const rows = React.useMemo(() => {
    if (listRes?.data?.length) return listRes.data
    const stages = board.data?.stages ?? []
    return stages.flatMap((col: { leads?: unknown[] }) => col.leads ?? [])
  }, [listRes, board.data])

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  function openCreate() {
    form.reset(ADD_VISITOR_DEFAULTS)
    setSheetOpen(true)
  }

  const submit = form.handleSubmit(async (values) => {
    const name = values.contactName.trim()
    try {
      await createLead.mutateAsync({
        contactName: name,
        title: values.title?.trim() || `Guest — ${name}`,
        contactEmail: values.contactEmail?.trim() || "",
        contactPhone: values.contactPhone?.trim() || "",
        location: values.location?.trim() || undefined,
        source: values.source,
        value: 0,
        tags: [],
      })
      setSheetOpen(false)
      form.reset(ADD_VISITOR_DEFAULTS)
      await refetch()
      await board.refetch()
    } catch {
      /* toast in hook */
    }
  })

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
            icon={<UserPlus className="size-5 text-brand" strokeWidth={1.75} />}
            actions={<ViewToggle value={view} onChange={setView} />}
          />

          <div className="p-6 md:p-8">
            {view === "board" ? (
              <TablePanel className="rounded-2xl border-0 bg-[#fbfcfb] p-4 shadow-sm">
                <div className="mb-3 flex justify-end">
                  <Can permission="visitors.write">
                    <TableAddButton onClick={openCreate}>
                      <Plus className="size-3.5" strokeWidth={1.75} />
                      Add Visitor
                    </TableAddButton>
                  </Can>
                </div>
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
                        <TableAddButton onClick={openCreate}>
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
                                {(assigneeLabel(row) || "?").slice(0, 1)}
                              </span>
                              <span className="text-sm text-zinc-600">
                                {assigneeLabel(row) || "Unassigned"}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {isVisible("updated") && (
                          <TableCell className="text-zinc-500">
                            {row.updatedAt || row.stageChangedAt || row.createdAt
                              ? formatDistanceToNow(
                                  new Date(row.updatedAt || row.stageChangedAt || row.createdAt),
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

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">Add visitor</SheetTitle>
                  <SheetDescription>
                    Start a guest in First Visit. You can assign follow-up from the board.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <Form {...form}>
                    <FieldGroup className="gap-4">
                      <TextFormField
                        control={form.control}
                        name="contactName"
                        label="Name"
                        autoFocus
                      />
                      <TextFormField
                        control={form.control}
                        name="title"
                        label="Title (optional)"
                        placeholder="e.g. First-Time Family — Cooper"
                      />
                      <TextFormField
                        control={form.control}
                        name="contactEmail"
                        label="Email"
                        type="email"
                        placeholder="optional"
                      />
                      <TextFormField
                        control={form.control}
                        name="contactPhone"
                        label="Phone"
                        placeholder="optional"
                      />
                      <TextFormField
                        control={form.control}
                        name="location"
                        label="Location"
                        placeholder="Main Sanctuary"
                      />
                      <SelectFormField
                        control={form.control}
                        name="source"
                        label="Source"
                        options={SOURCE_OPTIONS}
                      />
                    </FieldGroup>
                  </Form>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={createLead.isPending}>
                    {createLead.isPending ? "Saving…" : "Add visitor"}
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
