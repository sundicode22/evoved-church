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
import { Separator } from "@/components/ui/separator"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ConfirmAction } from "@/components/confirm-action"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  usePolicies,
  useCreatePolicy,
  useUpdatePolicy,
  usePublishPolicy,
  useDeletePolicy,
} from "@/features/policies/hooks/use-policies"
import { POLICY_MODULES, type ChurchPolicy, type PolicyModule } from "@/features/policies/schemas"
import { HugeiconsIcon } from "@hugeicons/react"
import { FileValidationIcon, PlusSignIcon } from "@hugeicons/core-free-icons"

const STATUS_STYLE: Record<string, string> = {
  draft: "border-zinc-200 bg-zinc-50 text-zinc-600",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-amber-200 bg-amber-50 text-amber-700",
}

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

  const update = useUpdatePolicy(editing?.id || "")

  function openCreate() {
    setEditing(null)
    setTitle("")
    setModule("general")
    setSummary("")
    setBodyHtml("<p></p>")
    setEditorOpen(true)
  }

  function openEdit(p: ChurchPolicy) {
    setEditing(p)
    setTitle(p.title)
    setModule(p.module)
    setSummary(p.summary || "")
    setBodyHtml(p.bodyHtml || "<p></p>")
    setEditorOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      update.mutate(
        { title, module, summary, bodyHtml },
        { onSuccess: () => setEditorOpen(false) }
      )
    } else {
      create.mutate(
        { title, module, summary, bodyHtml, status: "draft" },
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
      <SidebarInset className="min-h-screen bg-[#fbfcfb] dark:bg-zinc-950">
        <RequireAbility permission="policies.read">
          <div className="border-b border-zinc-200/80 bg-white px-8 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900">
                  <HugeiconsIcon
                    icon={FileValidationIcon}
                    strokeWidth={2}
                    className="size-6 text-emerald-600"
                  />
                  Church Policies
                </h1>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Module-scoped policies for accounting, safety, visitors, and more — authored in a rich
                  editor.
                </p>
              </div>
              <Can permission="policies.write">
                <Button
                  onClick={openCreate}
                  className="h-9 gap-1.5 rounded-lg bg-[#22c55e] px-4 text-xs font-normal text-white hover:bg-[#16a34a]"
                >
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                  New policy
                </Button>
              </Can>
            </div>
          </div>

          <div className="space-y-6 p-8">
            <div className="flex items-center gap-3">
              <Label className="text-xs font-semibold text-zinc-500">Module</Label>
              <Select
                value={moduleFilter}
                items={moduleItems}
                onValueChange={(v) => v && setModuleFilter(v)}
              >
                <SelectTrigger className="h-9 w-72">
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

            <div className="grid gap-4 lg:grid-cols-2">
              {isLoading &&
                [0, 1, 2].map((i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}

              {!isLoading && (data?.length ?? 0) === 0 && (
                <Empty className="col-span-full border border-dashed border-zinc-200 py-12">
                  <EmptyHeader>
                    <EmptyTitle>No policies yet</EmptyTitle>
                    <EmptyDescription>
                      Create the first policy for a module your teams need to follow.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

              {data?.map((p) => {
                const moduleLabel =
                  POLICY_MODULES.find((m) => m.value === p.module)?.label || p.module
                return (
                  <article
                    key={p.id}
                    className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[p.status]}`}>
                            {p.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {moduleLabel}
                          </Badge>
                          <span className="text-[10px] text-zinc-400">v{p.version}</span>
                        </div>
                        <h2 className="text-sm font-semibold text-zinc-900">{p.title}</h2>
                        <p className="line-clamp-2 text-xs text-zinc-500">
                          {p.summary || "No summary"}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setPreview(p)}
                      >
                        Preview
                      </Button>
                      <Can permission="policies.write">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </Button>
                      </Can>
                      {p.status !== "published" && (
                        <Can permission="policies.publish">
                          <Button
                            size="sm"
                            className="h-8 bg-[#16a34a] text-xs text-white hover:bg-[#15803d]"
                            onClick={() => setConfirmPublish(p)}
                          >
                            Publish
                          </Button>
                        </Can>
                      )}
                      <Can permission="policies.write">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-rose-600"
                          onClick={() => setConfirmDelete(p)}
                        >
                          Delete
                        </Button>
                      </Can>
                    </div>
                  </article>
                )
              })}
            </div>
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
                      <Label className="text-xs font-semibold">Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Module</Label>
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
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold">Summary</Label>
                      <Textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="min-h-16 text-xs"
                        maxLength={280}
                        placeholder="One or two sentences for the policy card"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold">Body</Label>
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
