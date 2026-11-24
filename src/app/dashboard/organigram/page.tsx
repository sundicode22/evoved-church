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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { useBranchStore } from "@/store/use-branch-store"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon,
  HelpCircleIcon,
  PlusSignIcon,
  HierarchySquare02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

interface OrgNode {
  id: string
  title: string
  name: string
  department: string | null
  parentId: string | null
  spanOfCare: number
  orderIndex: number
}

interface OrgTreeResponse {
  campusId: string
  nodes: OrgNode[]
}

const ROOT_DROP_ID = "__root__"

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

function NodeCard({
  node,
  isRoot,
  blocked,
  overlay = false,
}: {
  node: OrgNode
  isRoot: boolean
  blocked: boolean
  overlay?: boolean
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
        "w-64 touch-none select-none rounded-2xl border bg-white p-4 text-left shadow-xs transition-all dark:bg-zinc-900",
        overlay ? "cursor-grabbing shadow-xl rotate-1" : "cursor-grab active:cursor-grabbing",
        drag.isDragging ? "opacity-40" : "",
        drop.isOver && !blocked
          ? "border-emerald-500 ring-4 ring-emerald-100"
          : isRoot
            ? "border-emerald-400 hover:shadow-md"
            : "border-zinc-200/80 hover:border-emerald-300 hover:shadow-md dark:border-zinc-800",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {node.department && (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold uppercase tracking-wider text-emerald-700"
            >
              {node.department}
            </Badge>
          )}
          <h3 className="mt-2 text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-100">
            {node.title}
          </h3>
          {showName && (
            <p className="mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {node.name}
            </p>
          )}
        </div>
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isRoot ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {initials(showName ? node.name : node.title)}
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.8} className="size-3.5 text-zinc-400" />
          Span of care
        </span>
        <span className="font-bold text-zinc-800 dark:text-zinc-200">
          {node.spanOfCare.toLocaleString()}
        </span>
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
}: {
  node: OrgNode
  children: OrgNode[]
  childrenMap: Map<string | null, OrgNode[]>
  forbidden: Set<string>
  depth: number
}) {
  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} isRoot={depth === 0} blocked={forbidden.has(node.id)} />

      {children.length > 0 && (
        <>
          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex items-start justify-center">
            {children.map((child, idx) => (
              <div key={child.id} className="relative flex flex-col items-center px-3 pt-6">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-6">
                  {children.length > 1 && idx > 0 && (
                    <span className="absolute left-0 top-0 h-px w-1/2 bg-zinc-300 dark:bg-zinc-700" />
                  )}
                  {children.length > 1 && idx < children.length - 1 && (
                    <span className="absolute right-0 top-0 h-px w-1/2 bg-zinc-300 dark:bg-zinc-700" />
                  )}
                  <span className="absolute left-1/2 top-0 h-6 w-px bg-zinc-300 dark:bg-zinc-700" />
                </span>
                <TreeBranch
                  node={child}
                  children={childrenMap.get(child.id) ?? []}
                  childrenMap={childrenMap}
                  forbidden={forbidden}
                  depth={depth + 1}
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
      className={`mb-6 w-full max-w-md rounded-xl border-2 border-dashed px-4 py-3 text-center text-xs font-medium transition-colors ${
        isOver
          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
          : "border-zinc-300 bg-white text-zinc-500"
      }`}
    >
      Drop here to make this a top-level role
    </div>
  )
}

export default function OrganigramPage() {
  const { activeCampus, activeCampusId } = useBranchStore()
  const [nodes, setNodes] = React.useState<OrgNode[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeNode, setActiveNode] = React.useState<OrgNode | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    apiClient
      .get<ApiResponse<OrgTreeResponse>>("/organigram/tree", {
        params: { campusId: activeCampusId },
      })
      .then((res) => {
        if (!cancelled) setNodes(res.data.data.nodes)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCampusId])

  const childrenMap = React.useMemo(() => buildChildrenMap(nodes), [nodes])
  const roots = childrenMap.get(null) ?? []
  const totalSpan = roots.reduce((sum, n) => sum + n.spanOfCare, 0)

  // Nodes that can't receive the dragged node (itself and its own reports).
  const forbidden = React.useMemo(() => {
    if (!activeNode) return new Set<string>()
    const set = collectDescendants(activeNode.id, childrenMap)
    set.add(activeNode.id)
    return set
  }, [activeNode, childrenMap])

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
    if (newParentId && (newParentId === dragged.id || collectDescendants(dragged.id, childrenMap).has(newParentId))) {
      toast.error("A role can't report to itself or to one of its own reports.")
      return
    }

    const previous = nodes
    const targetName = newParentId ? nodes.find((n) => n.id === newParentId)?.title : "top level"
    setNodes((prev) =>
      prev.map((n) => (n.id === dragged.id ? { ...n, parentId: newParentId, orderIndex: 999 } : n))
    )

    try {
      await apiClient.patch(`/organigram/nodes/${dragged.id}`, { parentId: newParentId })
      toast.success(`${dragged.title} now reports to ${targetName}`)
    } catch (err) {
      setNodes(previous)
      toast.error(err instanceof Error ? err.message : "Couldn't update the reporting line.")
    }
  }

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
      <SidebarInset className="min-h-screen bg-[#fbfcfb] dark:bg-zinc-950">
        <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                <HugeiconsIcon icon={HierarchySquare02Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                <span>Leadership Organigram</span>
              </h1>
              <p className="mt-0.5 text-xs text-zinc-400">
                Reporting lines across your ministry, with the number of people each role cares for.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-4" />
              </button>
              <button className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>
              <Button className="h-9 gap-1.5 rounded-lg bg-[#22c55e] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#16a34a]">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                <span>Add Role</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div>
              <span>
                Viewing: <strong className="text-zinc-800 dark:text-zinc-200">{activeCampus.name}</strong>
              </span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>
                Roles: <strong className="text-zinc-800 dark:text-zinc-200">{nodes.length}</strong>
              </span>
              <span className="mx-2 text-zinc-300">·</span>
              <span>
                Span of care:{" "}
                <strong className="font-bold text-emerald-700 dark:text-emerald-400">
                  {totalSpan.toLocaleString()} people
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">
              Drag a role onto another to change who it reports to
            </span>
          </div>
        </div>

        <div className="overflow-auto p-8">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading organigram…</p>
          ) : error ? (
            <div className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Couldn&apos;t load the organigram: {error}
            </div>
          ) : roots.length === 0 ? (
            <p className="text-sm text-zinc-500">No roles have been added yet.</p>
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
                    />
                  ))}
                </div>
              </div>
              <DragOverlay>
                {activeNode ? <NodeCard node={activeNode} isRoot={false} blocked overlay /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
