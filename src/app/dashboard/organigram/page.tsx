"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmAction } from "@/components/confirm-action"
import { Can, RequireAbility } from "@/components/auth/can"
import { PageHeader } from "@/components/page-header"
import { TableAddButton } from "@/components/table-panel"
import { useAbility } from "@/features/auth/ability-context"
import { useBranchStore } from "@/store/use-branch-store"
import {
  DEPARTMENTS,
  type OrgNode,
} from "@/features/organigram/schemas"
import {
  useCreateOrgNode,
  useDeleteOrgNode,
  useOrganigramTree,
  useReparentOrgNode,
  useUpdateOrgNode,
} from "@/features/organigram/hooks/use-organigram"
import { MoreHorizontal, Network, Pencil, Plus, Trash2, Users } from "lucide-react"

const ROOT_DROP_ID = "__root__"
const NO_PARENT = "__none__"

function initials(name: string) {
  return name
    .replace(/^(Pastor|Rev\.|Deaconess|Dr\.)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
}

function buildChildrenMap(nodes: OrgNode[]) {
  const map = new Map<string | null, OrgNode[]>()
  for (const n of nodes) {
    const list = map.get(n.parentId) ?? []
    list.push(n)
    map.set(n.parentId, list)
  }
  for (const list of map.values()) list.sort((a, b) => a.orderIndex - b.orderIndex)
  return map
}

function collectDescendants(id: string, children: Map<string | null, OrgNode[]>) {
  const out = new Set<string>()
  const stack = [id]
  while (stack.length) {
    const current = stack.pop()!
    for (const child of children.get(current) ?? []) {
      if (!out.has(child.id)) {
        out.add(child.id)
        stack.push(child.id)
      }
    }
  }
  return out
}

type FormState = {
  title: string
  name: string
  department: string
  parentId: string | null
  spanOfCare: string
}

const emptyForm = (): FormState => ({
  title: "",
  name: "",
  department: "Pastoral Care",
  parentId: null,
  spanOfCare: "0",
})

function NodeCard({
  node,
  isRoot,
  blocked,
  overlay = false,
  canWrite,
  onEdit,
  onDelete,
}: {
  node: OrgNode
  isRoot: boolean
  blocked: boolean
  overlay?: boolean
  canWrite?: boolean
  onEdit?: (node: OrgNode) => void
  onDelete?: (node: OrgNode) => void
}) {
  const drag = useDraggable({ id: node.id, data: { node }, disabled: overlay })
  const drop = useDroppable({ id: node.id, disabled: overlay || blocked })

  const setRefs = (el: HTMLDivElement | null) => {
    drag.setNodeRef(el)
    drop.setNodeRef(el)
  }

  const showName = node.name && node.name !== node.title

  return (
    <div
      ref={overlay ? undefined : setRefs}
      {...(overlay ? {} : drag.listeners)}
      {...(overlay ? {} : drag.attributes)}
      className={[
        "w-64 touch-none select-none rounded-xl bg-white p-4 text-left shadow-sm transition-all",
        overlay ? "cursor-grabbing shadow-xl rotate-1" : "cursor-grab active:cursor-grabbing",
        drag.isDragging ? "opacity-40" : "",
        drop.isOver && !blocked ? "ring-4 ring-emerald-100 shadow-md" : "hover:shadow-md",
        isRoot ? "ring-1 ring-emerald-200" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {node.department && (
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-[10px] font-medium tracking-wider text-emerald-700 uppercase shadow-none"
            >
              {node.department}
            </Badge>
          )}
          <h3 className="mt-2 text-sm font-medium leading-snug text-zinc-900">{node.title}</h3>
          {showName && (
            <p className="mt-0.5 text-xs font-medium text-emerald-700">{node.name}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div
            className={`flex size-9 items-center justify-center rounded-full text-xs font-medium shadow-sm ${
              isRoot ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {initials(showName ? node.name : node.title)}
          </div>
          {!overlay && canWrite && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-zinc-400 hover:text-zinc-700"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                }
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-40 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => onEdit?.(node)}>
                    <Pencil className="size-3.5" />
                    Edit role
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete?.(node)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete role
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between pt-3 text-xs text-zinc-500 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)]">
        <span className="flex items-center gap-1.5">
          <Users strokeWidth={1.8} className="size-3.5 text-zinc-400" />
          Span of care
        </span>
        <span className="font-medium text-zinc-800">{node.spanOfCare.toLocaleString()}</span>
      </div>
    </div>
  )
}

function TreeBranch({
  node,
  children,
  childrenMap,
  forbidden,
  depth,
  canWrite,
  onEdit,
  onDelete,
}: {
  node: OrgNode
  children: OrgNode[]
  childrenMap: Map<string | null, OrgNode[]>
  forbidden: Set<string>
  depth: number
  canWrite: boolean
  onEdit: (node: OrgNode) => void
  onDelete: (node: OrgNode) => void
}) {
  return (
    <div className="flex flex-col items-center">
      <NodeCard
        node={node}
        isRoot={depth === 0}
        blocked={forbidden.has(node.id)}
        canWrite={canWrite}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {children.length > 0 && (
        <>
          <div className="h-6 w-px bg-zinc-300" />
          <div className="flex items-start justify-center">
            {children.map((child, idx) => (
              <div key={child.id} className="relative flex flex-col items-center px-3 pt-6">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-6">
                  {children.length > 1 && idx > 0 && (
                    <span className="absolute top-0 left-0 h-px w-1/2 bg-zinc-300" />
                  )}
                  {children.length > 1 && idx < children.length - 1 && (
                    <span className="absolute top-0 right-0 h-px w-1/2 bg-zinc-300" />
                  )}
                  <span className="absolute top-0 left-1/2 h-6 w-px bg-zinc-300" />
                </span>
                <TreeBranch
                  node={child}
                  children={childrenMap.get(child.id) ?? []}
                  childrenMap={childrenMap}
                  forbidden={forbidden}
                  depth={depth + 1}
                  canWrite={canWrite}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RootDropZone({ visible }: { visible: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ID })
  if (!visible) return null
  return (
    <div
      ref={setNodeRef}
      className={`mb-6 w-full max-w-md rounded-xl px-4 py-3 text-center text-xs font-medium shadow-xs transition-colors ${
        isOver
          ? "bg-emerald-50 text-emerald-800 shadow-md"
          : "bg-white text-zinc-500"
      }`}
    >
      Drop here to make this a top-level role
    </div>
  )
}

export default function OrganigramPage() {
  const { activeCampus } = useBranchStore()
  const { can } = useAbility()
  const canWrite = can("organigram.write")
  const { data, isLoading, error, refetch } = useOrganigramTree()
  const createNode = useCreateOrgNode()
  const updateNode = useUpdateOrgNode()
  const deleteNode = useDeleteOrgNode()
  const reparent = useReparentOrgNode()

  const [nodes, setNodes] = React.useState<OrgNode[]>([])
  const [activeNode, setActiveNode] = React.useState<OrgNode | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<OrgNode | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = React.useState<OrgNode | null>(null)

  React.useEffect(() => {
    if (data?.nodes) setNodes(data.nodes)
  }, [data])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const childrenMap = React.useMemo(() => buildChildrenMap(nodes), [nodes])
  const roots = childrenMap.get(null) ?? []
  const totalSpan = roots.reduce((sum, n) => sum + n.spanOfCare, 0)

  const forbidden = React.useMemo(() => {
    if (!activeNode) return new Set<string>()
    const set = collectDescendants(activeNode.id, childrenMap)
    set.add(activeNode.id)
    return set
  }, [activeNode, childrenMap])

  const parentOptions = React.useMemo(() => {
    if (!editing) return nodes
    const blocked = collectDescendants(editing.id, childrenMap)
    blocked.add(editing.id)
    return nodes.filter((n) => !blocked.has(n.id))
  }, [nodes, editing, childrenMap])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setSheetOpen(true)
  }

  function openEdit(node: OrgNode) {
    setEditing(node)
    setForm({
      title: node.title,
      name: node.name,
      department: node.department || "Other",
      parentId: node.parentId,
      spanOfCare: String(node.spanOfCare ?? 0),
    })
    setSheetOpen(true)
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    const span = Number(form.spanOfCare) || 0
    try {
      if (editing) {
        await updateNode.mutateAsync({
          id: editing.id,
          title: form.title.trim(),
          name: form.name.trim(),
          department: form.department,
          parentId: form.parentId,
          spanOfCare: span,
        })
        toast.success("Role updated")
      } else {
        await createNode.mutateAsync({
          title: form.title.trim(),
          name: form.name.trim(),
          department: form.department,
          parentId: form.parentId,
          spanOfCare: span,
        })
        toast.success("Role added")
      }
      setSheetOpen(false)
      setEditing(null)
      setForm(emptyForm())
      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save role")
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteNode.mutateAsync(deleteTarget.id)
      toast.success(`${deleteTarget.title} removed`)
      setDeleteTarget(null)
      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete role")
    }
  }

  function onDragStart(event: DragStartEvent) {
    setActiveNode((event.active.data.current?.node as OrgNode) ?? null)
  }

  async function onDragEnd(event: DragEndEvent) {
    const dragged = activeNode
    setActiveNode(null)
    const { over } = event
    if (!over || !dragged) return

    const newParentId = over.id === ROOT_DROP_ID ? null : String(over.id)
    if (newParentId === dragged.parentId) return
    if (
      newParentId &&
      (newParentId === dragged.id ||
        collectDescendants(dragged.id, childrenMap).has(newParentId))
    ) {
      toast.error("A role can't report to itself or to one of its own reports.")
      return
    }

    const previous = nodes
    const targetName = newParentId
      ? nodes.find((n) => n.id === newParentId)?.title
      : "top level"
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragged.id ? { ...n, parentId: newParentId, orderIndex: 999 } : n
      )
    )

    try {
      await reparent.mutateAsync({ id: dragged.id, parentId: newParentId })
      toast.success(`${dragged.title} now reports to ${targetName}`)
      await refetch()
    } catch (err) {
      setNodes(previous)
      toast.error(err instanceof Error ? err.message : "Couldn't update the reporting line.")
    }
  }

  const saving = createNode.isPending || updateNode.isPending

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
        <RequireAbility permission="organigram.read">
          <PageHeader
            title="Organigram"
            description="Reporting lines across your ministry."
            icon={<Network className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="organigram.write">
                <TableAddButton onClick={openCreate}>
                  <Plus className="size-4" strokeWidth={1.75} />
                  Add Role
                </TableAddButton>
              </Can>
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
              <span>
                Viewing: <span className="text-zinc-800">{activeCampus.name}</span>
                <span className="mx-2 text-zinc-300">·</span>
                Roles: <span className="text-zinc-800">{nodes.length}</span>
                <span className="mx-2 text-zinc-300">·</span>
                Span of care:{" "}
                <span className="font-medium text-emerald-700">
                  {totalSpan.toLocaleString()} people
                </span>
              </span>
              <span className="text-[11px] text-zinc-400">
                Drag a role onto another to change who it reports to
              </span>
            </div>
          </PageHeader>

          <div className="overflow-auto p-8">
            {isLoading ? (
              <p className="text-sm text-zinc-500">Loading organigram…</p>
            ) : error ? (
              <div className="max-w-md rounded-xl bg-rose-50 p-4 text-sm text-rose-700 shadow-xs">
                Couldn&apos;t load the organigram:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </div>
            ) : roots.length === 0 ? (
              <div className="flex max-w-md flex-col gap-3 rounded-xl bg-[#f6f8f6] p-6 shadow-xs">
                <p className="text-sm text-zinc-600">No roles have been added yet.</p>
                <Can permission="organigram.write">
                  <Button className="w-fit"
                    onClick={openCreate}
                  >
                    <Plus className="size-4" />
                    Add first role
                  </Button>
                </Can>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragCancel={() => setActiveNode(null)}
              >
                <div className="flex min-w-max flex-col items-center">
                  <RootDropZone visible={!!activeNode && activeNode.parentId !== null} />
                  <div className="flex items-start gap-8">
                    {roots.map((root) => (
                      <TreeBranch
                        key={root.id}
                        node={root}
                        children={childrenMap.get(root.id) ?? []}
                        childrenMap={childrenMap}
                        forbidden={forbidden}
                        depth={0}
                        canWrite={canWrite}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                </div>
                <DragOverlay>
                  {activeNode ? (
                    <NodeCard node={activeNode} isRoot={false} blocked overlay />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form onSubmit={submitForm} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">
                    {editing ? "Edit role" : "Add role"}
                  </SheetTitle>
                  <SheetDescription>
                    {editing
                      ? "Update title, person, department, or reporting line."
                      : "Create a role and optionally nest it under another leader."}
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel>Role title</FieldLabel>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Campus Pastor"
                        className="h-10"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Person name</FieldLabel>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Jane Cooper"
                        className="h-10"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Department</FieldLabel>
                      <Select
                        value={form.department}
                        onValueChange={(v) =>
                          v && setForm((f) => ({ ...f, department: v }))
                        }
                      >
                        <SelectTrigger className="h-10 w-full shadow-xs">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Reports to</FieldLabel>
                      <Select
                        value={form.parentId ?? NO_PARENT}
                        onValueChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            parentId: !v || v === NO_PARENT ? null : v,
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 w-full shadow-xs">
                          <SelectValue placeholder="Top-level role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_PARENT}>Top-level (no manager)</SelectItem>
                          {parentOptions.map((n) => (
                            <SelectItem key={n.id} value={n.id}>
                              {n.title}
                              {n.name && n.name !== n.title ? ` — ${n.name}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Span of care</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        value={form.spanOfCare}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, spanOfCare: e.target.value }))
                        }
                        className="h-10"
                      />
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : editing ? "Save changes" : "Add role"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete role?"
            description={
              deleteTarget ? (
                <>
                  Remove <strong>{deleteTarget.title}</strong>
                  {deleteTarget.name ? ` (${deleteTarget.name})` : ""}. Direct reports will move
                  up to this role&apos;s manager.
                </>
              ) : null
            }
            confirmLabel="Delete"
            variant="destructive"
            loading={deleteNode.isPending}
            onConfirm={confirmDelete}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
