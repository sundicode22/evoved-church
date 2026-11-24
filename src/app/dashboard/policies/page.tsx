"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmAction } from "@/components/confirm-action"
import { RichTextEditor } from "@/components/rich-text-editor"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { StatusPill, TablePagination, TablePanel } from "@/components/table-panel"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  usePolicies,
  useCreatePolicy,
  useUpdatePolicy,
  usePublishPolicy,
  useDeletePolicy,
} from "@/features/policies/hooks/use-policies"
import { POLICY_MODULES, type ChurchPolicy, type PolicyModule } from "@/features/policies/schemas"
import { PageHeader } from "@/components/page-header"
import { FileCheck, Plus } from "lucide-react"

const INVOLVED_ROLE_OPTIONS = [
  "Pastor",
  "Executive Pastor",
  "Campus Pastor",
  "Finance Director",
  "Treasurer",
  "Connections Lead",
  "Children's Ministry",
  "Volunteer",
  "Staff",
  "Administrator",
]

export default function PoliciesPage() {
  const [moduleFilter, setModuleFilter] = React.useState<string>("all")
  const { data, isLoading } = usePolicies(moduleFilter === "all" ? undefined : moduleFilter)
  const create = useCreatePolicy()
  const publish = usePublishPolicy()
  const remove = useDeletePolicy()

  const [editorOpen, setEditorOpen] = React.useState(false)
  const [preview, setPreview] = React.useState<ChurchPolicy | null>(null)
  const [editing, setEditing] = React.useState<ChurchPolicy | null>(null)
  const [confirmPublish, setConfirmPublish] = React.useState<ChurchPolicy | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<ChurchPolicy | null>(null)

  const [title, setTitle] = React.useState("")
  const [module, setModule] = React.useState<PolicyModule>("general")
  const [summary, setSummary] = React.useState("")
  const [bodyHtml, setBodyHtml] = React.useState("<p></p>")
  const [involvedRoles, setInvolvedRoles] = React.useState<string[]>([])
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const update = useUpdatePolicy(editing?.id || "")

  function openCreate() {
    setEditing(null)
    setTitle("")
    setModule("general")
    setSummary("")
    setBodyHtml("<p></p>")
    setInvolvedRoles([])
    setEditorOpen(true)
  }

  function openEdit(p: ChurchPolicy) {
    setEditing(p)
    setTitle(p.title)
    setModule(p.module)
    setSummary(p.summary || "")
    setBodyHtml(p.bodyHtml || "<p></p>")
    setInvolvedRoles(p.involvedRoles ?? [])
    setEditorOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      update.mutate(
        { title, module, summary, bodyHtml, involvedRoles },
        { onSuccess: () => setEditorOpen(false) }
      )
    } else {
      create.mutate(
        { title, module, summary, bodyHtml, involvedRoles, status: "draft" },
        { onSuccess: () => setEditorOpen(false) }
      )
    }
  }

  const moduleItems = [
    { value: "all", label: "All modules" },
    ...POLICY_MODULES.map((m) => ({ value: m.value, label: m.label })),
  ]

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white dark:bg-zinc-950">
        <RequireAbility permission="policies.read">
          <PageHeader
            title="Policies"
            description="Module-scoped policies for your teams."
            icon={<FileCheck className="size-5 text-[#16a34a]" strokeWidth={1.75} />}
            actions={
              <Can permission="policies.write">
                <Button
                  onClick={openCreate}
                  className="h-8 gap-1.5 bg-[#22c55e] text-xs font-normal text-white hover:bg-[#16a34a]"
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  New policy
                </Button>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            <TablePanel>
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <Select
                  value={moduleFilter}
                  items={moduleItems}
                  onValueChange={(v) => {
                    if (!v) return
                    setModuleFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleItems.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Policy</TableHead>
                    <TableHead>Applies to</TableHead>
                    <TableHead>Roles involved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8">
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && (data?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No policies yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {(data ?? [])
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((p) => {
                      const moduleLabel =
                        POLICY_MODULES.find((m) => m.value === p.module)?.label || p.module
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="pl-4">
                            <p className="text-foreground">{p.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.summary || "No summary"} · v{p.version}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal text-muted-foreground">
                              {moduleLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex max-w-xs flex-wrap gap-1">
                              {(p.involvedRoles ?? []).length === 0 ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                p.involvedRoles.map((role) => (
                                  <Badge
                                    key={role}
                                    variant="outline"
                                    className="font-normal text-muted-foreground"
                                  >
                                    {role}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusPill
                              tone={
                                p.status === "published"
                                  ? "success"
                                  : p.status === "archived"
                                    ? "warning"
                                    : "neutral"
                              }
                            >
                              {p.status}
                            </StatusPill>
                          </TableCell>
                          <TableCell className="pr-3 text-right">
                            <RowActionsMenu
                              label="Policy"
                              groups={[
                                {
                                  items: [
                                    { label: "Preview", onClick: () => setPreview(p) },
                                    { label: "Edit", onClick: () => openEdit(p) },
                                  ],
                                },
                                {
                                  items: [
                                    ...(p.status !== "published"
                                      ? [{ label: "Publish", onClick: () => setConfirmPublish(p) }]
                                      : []),
                                    {
                                      label: "Delete",
                                      destructive: true,
                                      onClick: () => setConfirmDelete(p),
                                    },
                                  ],
                                },
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={data?.length ?? 0}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setPage(1)
                }}
              />
            </TablePanel>
          </div>

          {/* Create / edit — inset Sheet + TipTap */}
          <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
            <SheetContent side="right" inset size="xl" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>{editing ? "Edit policy" : "New policy"}</SheetTitle>
                  <SheetDescription>
                    Bind the policy to a module and write the body with the rich editor.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium">Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Module</Label>
                      <Select
                        value={module}
                        items={POLICY_MODULES.map((m) => ({ value: m.value, label: m.label }))}
                        onValueChange={(v) => v && setModule(v as PolicyModule)}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POLICY_MODULES.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-medium">Roles involved</Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {INVOLVED_ROLE_OPTIONS.map((role) => (
                          <label key={role} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={involvedRoles.includes(role)}
                              onCheckedChange={(on) =>
                                setInvolvedRoles((prev) =>
                                  on ? [...prev, role] : prev.filter((item) => item !== role)
                                )
                              }
                            />
                            {role}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium">Summary</Label>
                      <Textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="min-h-16 text-xs"
                        maxLength={280}
                        placeholder="One or two sentences for the policy card"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium">Body</Label>
                      <RichTextEditor value={bodyHtml} onChange={setBodyHtml} minHeight="280px" />
                    </div>
                  </div>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      title.trim().length < 3 ||
                      create.isPending ||
                      update.isPending
                    }
                    className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  >
                    {editing ? "Save changes" : "Create draft"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          {/* Preview modal */}
          <Dialog open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)}>
            <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{preview?.title}</DialogTitle>
                <DialogDescription>
                  {POLICY_MODULES.find((m) => m.value === preview?.module)?.label} ·{" "}
                  {preview?.status}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[55vh] pr-3">
                <div
                  className="prose prose-sm max-w-none text-zinc-800"
                  dangerouslySetInnerHTML={{ __html: preview?.bodyHtml || "" }}
                />
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Close
                </Button>
                {preview && (
                  <Can permission="policies.write">
                    <Button
                      onClick={() => {
                        openEdit(preview)
                        setPreview(null)
                      }}
                    >
                      Edit
                    </Button>
                  </Can>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <ConfirmAction
            open={Boolean(confirmPublish)}
            onOpenChange={(o) => !o && setConfirmPublish(null)}
            title="Publish this policy?"
            description="Published policies are visible to staff with policy read access and become the active guidance for that module."
            confirmLabel="Publish"
            onConfirm={async () => {
              if (confirmPublish) await publish.mutateAsync(confirmPublish.id)
            }}
          />

          <ConfirmAction
            open={Boolean(confirmDelete)}
            onOpenChange={(o) => !o && setConfirmDelete(null)}
            title="Delete this policy?"
            description="This cannot be undone. Prefer archiving if you may need the wording later."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={async () => {
              if (confirmDelete) await remove.mutateAsync(confirmDelete.id)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
