import { db } from "@/lib/db"
import { organigramNodes } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import type { CreateOrgNodeInput, OrgNode, UpdateOrgNodeInput } from "./schemas"

/** Mutable in-memory tree — survives create/update/delete when DB is unavailable. */
let memoryNodes: OrgNode[] = []

function recomputeSpans(nodes: OrgNode[]): OrgNode[] {
  const children = new Map<string | null, string[]>()
  for (const n of nodes) {
    const key = n.parentId
    if (!children.has(key)) children.set(key, [])
    children.get(key)!.push(n.id)
  }
  function count(id: string): number {
    const kids = children.get(id) || []
    return kids.reduce((sum, kid) => sum + 1 + count(kid), 0)
  }
  return nodes.map((n) => {
    const auto = count(n.id)
    // Parents: descendant count. Leaves: keep manual span of care.
    return { ...n, spanOfCare: auto > 0 ? auto : n.spanOfCare }
  })
}

function wouldCreateCycle(nodes: OrgNode[], nodeId: string, newParentId: string | null) {
  if (!newParentId) return false
  if (newParentId === nodeId) return true
  const byId = new Map(nodes.map((n) => [n.id, n]))
  let cursor: string | null = newParentId
  const seen = new Set<string>()
  while (cursor) {
    if (cursor === nodeId) return true
    if (seen.has(cursor)) return true
    seen.add(cursor)
    cursor = byId.get(cursor)?.parentId ?? null
  }
  return false
}

function mapDbRow(r: typeof organigramNodes.$inferSelect): OrgNode {
  return {
    id: r.id,
    title: r.title,
    department: r.department,
    name: r.title,
    parentId: r.parentId,
    spanOfCare: r.spanOfCareCount,
    orderIndex: r.orderIndex,
    campusId: r.campusId || undefined,
  }
}

export const organigramService = {
  async getTree(campusId: string) {
    try {
      const rows = await db.select().from(organigramNodes)
      if (rows.length > 0) {
        const nodes = recomputeSpans(rows.map(mapDbRow))
        return { campusId, nodes }
      }
    } catch {
      /* use memory */
    }
    return { campusId, nodes: recomputeSpans([...memoryNodes]) }
  },

  async createNode(input: CreateOrgNodeInput) {
    if (input.parentId) {
      const exists = memoryNodes.some((n) => n.id === input.parentId)
      if (!exists) {
        try {
          const rows = await db
            .select()
            .from(organigramNodes)
            .where(eq(organigramNodes.id, input.parentId))
            .limit(1)
          if (rows.length === 0) throw new ValidationError("Parent role was not found")
        } catch (e) {
          if (e instanceof ValidationError) throw e
          if (!memoryNodes.some((n) => n.id === input.parentId)) {
            throw new ValidationError("Parent role was not found")
          }
        }
      }
    }

    const siblings = memoryNodes.filter((n) => n.parentId === (input.parentId ?? null))
    const orderIndex = input.orderIndex ?? siblings.length

    const node: OrgNode = {
      id: `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title.trim(),
      name: input.name.trim(),
      department: input.department.trim() || "Other",
      parentId: input.parentId ?? null,
      spanOfCare: input.spanOfCare ?? 0,
      orderIndex,
      campusId: input.campusId,
    }

    try {
      const [created] = await db
        .insert(organigramNodes)
        .values({
          campusId: input.campusId && input.campusId !== "all" ? input.campusId : null,
          title: `${node.title}${node.name ? ` — ${node.name}` : ""}`,
          department: node.department || "Other",
          parentId: node.parentId,
          orderIndex: node.orderIndex,
          spanOfCareCount: node.spanOfCare,
        })
        .returning()
      if (created) {
        const mapped = {
          ...mapDbRow(created),
          title: node.title,
          name: node.name,
          department: node.department,
        }
        memoryNodes = recomputeSpans([...memoryNodes, mapped])
        return mapped
      }
    } catch (e) {
      console.error("[organigramService.createNode]", e)
    }

    memoryNodes = recomputeSpans([...memoryNodes, node])
    return node
  },

  async updateNode(id: string, input: UpdateOrgNodeInput) {
    const idx = memoryNodes.findIndex((n) => n.id === id)
    let current = idx >= 0 ? memoryNodes[idx] : null

    if (!current) {
      try {
        const rows = await db.select().from(organigramNodes).where(eq(organigramNodes.id, id)).limit(1)
        if (rows[0]) current = mapDbRow(rows[0])
      } catch {
        /* ignore */
      }
    }
    if (!current) throw new NotFoundError("Role", id)

    if (input.parentId !== undefined) {
      if (wouldCreateCycle(memoryNodes.length ? memoryNodes : [current], id, input.parentId)) {
        throw new ValidationError("A role can't report to itself or one of its own reports.")
      }
    }

    const next: OrgNode = {
      ...current,
      title: input.title?.trim() ?? current.title,
      name: input.name?.trim() ?? current.name,
      department: input.department?.trim() ?? current.department,
      parentId: input.parentId !== undefined ? input.parentId : current.parentId,
      spanOfCare: input.spanOfCare ?? current.spanOfCare,
      orderIndex: input.orderIndex ?? current.orderIndex,
    }

    try {
      await db
        .update(organigramNodes)
        .set({
          title: `${next.title}${next.name ? ` — ${next.name}` : ""}`,
          department: next.department || "Other",
          parentId: next.parentId,
          orderIndex: next.orderIndex,
          spanOfCareCount: next.spanOfCare,
          updatedAt: new Date(),
        })
        .where(eq(organigramNodes.id, id))
    } catch (e) {
      console.error("[organigramService.updateNode]", e)
    }

    if (idx >= 0) {
      const copy = [...memoryNodes]
      copy[idx] = next
      memoryNodes = recomputeSpans(copy)
    } else {
      memoryNodes = recomputeSpans([...memoryNodes, next])
    }
    return next
  },

  async updateParent(nodeId: string, parentId: string | null, orderIndex?: number) {
    return this.updateNode(nodeId, { parentId, orderIndex })
  },

  async deleteNode(id: string) {
    const target = memoryNodes.find((n) => n.id === id)
    if (!target) {
      try {
        const rows = await db.select().from(organigramNodes).where(eq(organigramNodes.id, id)).limit(1)
        if (rows.length === 0) throw new NotFoundError("Role", id)
      } catch (e) {
        if (e instanceof NotFoundError) throw e
        if (!memoryNodes.some((n) => n.id === id)) throw new NotFoundError("Role", id)
      }
    }

    const parentId = target?.parentId ?? null

    // Promote direct reports to the deleted role's parent.
    memoryNodes = memoryNodes
      .filter((n) => n.id !== id)
      .map((n) => (n.parentId === id ? { ...n, parentId } : n))

    memoryNodes = recomputeSpans(memoryNodes)

    try {
      const children = await db
        .select()
        .from(organigramNodes)
        .where(eq(organigramNodes.parentId, id))
      for (const child of children) {
        await db
          .update(organigramNodes)
          .set({ parentId, updatedAt: new Date() })
          .where(eq(organigramNodes.id, child.id))
      }
      await db.delete(organigramNodes).where(eq(organigramNodes.id, id))
    } catch (e) {
      console.error("[organigramService.deleteNode]", e)
    }

    return { success: true, id }
  },
}
