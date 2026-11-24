import { db } from "@/lib/db"
import { organigramNodes } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const DEMO_TREE = {
  campusId: "all",
  nodes: [
    {
      id: "node-1",
      title: "Senior Pastor",
      department: "Executive Leadership",
      name: "Pastor David Johnson",
      parentId: null as string | null,
      spanOfCare: 1420,
      orderIndex: 0,
    },
    {
      id: "node-2",
      title: "Executive Pastor (Operations)",
      department: "Executive Leadership",
      name: "Rev. Marcus Vance",
      parentId: "node-1",
      spanOfCare: 680,
      orderIndex: 0,
    },
    {
      id: "node-3",
      title: "Campus Pastor (Main)",
      department: "Pastoral Care",
      name: "Ahmad Fawaid",
      parentId: "node-2",
      spanOfCare: 450,
      orderIndex: 0,
    },
    {
      id: "node-4",
      title: "Worship & Creative Arts Director",
      department: "Creative Arts",
      name: "Sarah Miller",
      parentId: "node-3",
      spanOfCare: 45,
      orderIndex: 0,
    },
    {
      id: "node-5",
      title: "Life Group Coordinator",
      department: "Discipleship",
      name: "Kathryn Murphy",
      parentId: "node-3",
      spanOfCare: 180,
      orderIndex: 1,
    },
  ],
}

/** Recalculate span-of-care as subtree descendant count (demo-friendly). */
function recomputeSpans(nodes: typeof DEMO_TREE.nodes) {
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
  return nodes.map((n) => ({ ...n, spanOfCare: count(n.id) || n.spanOfCare }))
}

export const organigramService = {
  async getTree(campusId: string) {
    try {
      const rows = await db.select().from(organigramNodes)
      if (rows.length === 0) {
        return { ...DEMO_TREE, campusId, nodes: recomputeSpans(DEMO_TREE.nodes) }
      }
      return {
        campusId,
        nodes: rows.map((r) => ({
          id: r.id,
          title: r.title,
          department: r.department,
          name: r.title,
          parentId: r.parentId,
          spanOfCare: r.spanOfCareCount,
          orderIndex: r.orderIndex,
        })),
      }
    } catch {
      return { ...DEMO_TREE, campusId, nodes: recomputeSpans(DEMO_TREE.nodes) }
    }
  },

  async updateParent(nodeId: string, parentId: string | null, orderIndex?: number) {
    try {
      const [updated] = await db
        .update(organigramNodes)
        .set({
          parentId,
          orderIndex: orderIndex ?? 0,
          updatedAt: new Date(),
        })
        .where(eq(organigramNodes.id, nodeId))
        .returning()
      if (updated) return updated
    } catch {
      /* demo path */
    }
    const nodes = DEMO_TREE.nodes.map((n) =>
      n.id === nodeId ? { ...n, parentId, orderIndex: orderIndex ?? n.orderIndex } : n
    )
    return { id: nodeId, parentId, nodes: recomputeSpans(nodes) }
  },
}
