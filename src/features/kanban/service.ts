import { db } from "@/lib/db"
import { kanbanColumns, projectCards, visitorLeads } from "@/lib/db/schema"
import { and, asc, eq, sql } from "drizzle-orm"
import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  DEFAULT_PROJECT_COLUMNS,
  DEFAULT_VISITOR_COLUMNS,
  createKanbanColumnSchema,
  reorderKanbanColumnsSchema,
  updateKanbanColumnSchema,
  type CreateKanbanColumnInput,
  type KanbanBoardType,
  type KanbanColumn,
  type ReorderKanbanColumnsInput,
  type UpdateKanbanColumnInput,
} from "./schemas"

function slugifyKey(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80)
}

function mapRow(row: typeof kanbanColumns.$inferSelect): KanbanColumn {
  return {
    id: row.id,
    boardType: row.boardType as KanbanBoardType,
    key: row.key,
    label: row.label,
    orderIndex: row.orderIndex,
    color: row.color,
    isDefault: row.isDefault,
  }
}

/** In-memory fallback when DB is unavailable. */
const memory = new Map<KanbanBoardType, KanbanColumn[]>()

function seedMemory(boardType: KanbanBoardType): KanbanColumn[] {
  const defaults =
    boardType === "visitors" ? DEFAULT_VISITOR_COLUMNS : DEFAULT_PROJECT_COLUMNS
  const cols = defaults.map((d, i) => ({
    id: `mem-${boardType}-${d.key}`,
    boardType,
    key: d.key,
    label: d.label,
    orderIndex: i,
    color: null as string | null,
    isDefault: true,
  }))
  memory.set(boardType, cols)
  return cols
}

export const kanbanService = {
  async ensureDefaults(boardType: KanbanBoardType): Promise<KanbanColumn[]> {
    try {
      const existing = await db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.boardType, boardType))
        .orderBy(asc(kanbanColumns.orderIndex))
      if (existing.length > 0) return existing.map(mapRow)

      const defaults =
        boardType === "visitors" ? DEFAULT_VISITOR_COLUMNS : DEFAULT_PROJECT_COLUMNS
      for (let i = 0; i < defaults.length; i++) {
        const d = defaults[i]
        await db.insert(kanbanColumns).values({
          boardType,
          key: d.key,
          label: d.label,
          orderIndex: i,
          isDefault: true,
        })
      }
      const seeded = await db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.boardType, boardType))
        .orderBy(asc(kanbanColumns.orderIndex))
      return seeded.map(mapRow)
    } catch {
      return memory.get(boardType) || seedMemory(boardType)
    }
  },

  async list(boardType: KanbanBoardType): Promise<KanbanColumn[]> {
    return this.ensureDefaults(boardType)
  },

  async create(input: CreateKanbanColumnInput): Promise<KanbanColumn> {
    const parsed = createKanbanColumnSchema.parse(input)
    const cols = await this.ensureDefaults(parsed.boardType)
    const key = parsed.key || slugifyKey(parsed.label)
    if (!key) throw new ValidationError("Could not derive a column key from the label")
    if (cols.some((c) => c.key === key)) {
      throw new ValidationError("A column with this key already exists")
    }
    const orderIndex = cols.reduce((m, c) => Math.max(m, c.orderIndex), -1) + 1

    try {
      const [row] = await db
        .insert(kanbanColumns)
        .values({
          boardType: parsed.boardType,
          key,
          label: parsed.label,
          orderIndex,
          color: parsed.color || null,
          isDefault: false,
        })
        .returning()
      return mapRow(row)
    } catch {
      const next: KanbanColumn = {
        id: `mem-${parsed.boardType}-${key}-${Date.now()}`,
        boardType: parsed.boardType,
        key,
        label: parsed.label,
        orderIndex,
        color: parsed.color || null,
        isDefault: false,
      }
      memory.set(parsed.boardType, [...cols, next])
      return next
    }
  },

  async update(id: string, input: UpdateKanbanColumnInput): Promise<KanbanColumn> {
    const parsed = updateKanbanColumnSchema.parse(input)
    try {
      const [existing] = await db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.id, id))
        .limit(1)
      if (!existing) throw new NotFoundError("Kanban column", id)
      const [row] = await db
        .update(kanbanColumns)
        .set({
          ...(parsed.label != null ? { label: parsed.label } : {}),
          ...(parsed.color !== undefined ? { color: parsed.color } : {}),
          updatedAt: new Date(),
        })
        .where(eq(kanbanColumns.id, id))
        .returning()
      return mapRow(row)
    } catch (e) {
      if (e instanceof NotFoundError) throw e
      for (const [boardType, cols] of memory.entries()) {
        const idx = cols.findIndex((c) => c.id === id)
        if (idx >= 0) {
          const updated = {
            ...cols[idx],
            ...(parsed.label != null ? { label: parsed.label } : {}),
            ...(parsed.color !== undefined ? { color: parsed.color } : {}),
          }
          const next = cols.slice()
          next[idx] = updated
          memory.set(boardType, next)
          return updated
        }
      }
      throw new NotFoundError("Kanban column", id)
    }
  },

  async reorder(input: ReorderKanbanColumnsInput): Promise<KanbanColumn[]> {
    const parsed = reorderKanbanColumnsSchema.parse(input)
    const cols = await this.ensureDefaults(parsed.boardType)
    const byKey = new Map(cols.map((c) => [c.key, c]))
    for (const key of parsed.orderedKeys) {
      if (!byKey.has(key)) throw new ValidationError(`Unknown column key: ${key}`)
    }

    try {
      for (let i = 0; i < parsed.orderedKeys.length; i++) {
        await db
          .update(kanbanColumns)
          .set({ orderIndex: i, updatedAt: new Date() })
          .where(
            and(
              eq(kanbanColumns.boardType, parsed.boardType),
              eq(kanbanColumns.key, parsed.orderedKeys[i])
            )
          )
      }
      return this.list(parsed.boardType)
    } catch {
      const reordered = parsed.orderedKeys.map((key, i) => ({
        ...byKey.get(key)!,
        orderIndex: i,
      }))
      memory.set(parsed.boardType, reordered)
      return reordered
    }
  },

  async remove(id: string, moveCardsToKey?: string): Promise<{ ok: true }> {
    let boardType: KanbanBoardType
    let key: string
    try {
      const [existing] = await db
        .select()
        .from(kanbanColumns)
        .where(eq(kanbanColumns.id, id))
        .limit(1)
      if (!existing) throw new NotFoundError("Kanban column", id)
      boardType = existing.boardType as KanbanBoardType
      key = existing.key
    } catch (e) {
      if (e instanceof NotFoundError) throw e
      for (const [bt, cols] of memory.entries()) {
        const found = cols.find((c) => c.id === id)
        if (found) {
          boardType = bt
          key = found.key
          const remaining = cols.filter((c) => c.id !== id)
          if (remaining.length === 0) {
            throw new ValidationError("Keep at least one column on the board")
          }
          if (moveCardsToKey && !remaining.some((c) => c.key === moveCardsToKey)) {
            throw new ValidationError("Target column not found")
          }
          memory.set(bt, remaining.map((c, i) => ({ ...c, orderIndex: i })))
          return { ok: true }
        }
      }
      throw new NotFoundError("Kanban column", id)
    }

    const cols = await this.list(boardType)
    if (cols.length <= 1) {
      throw new ValidationError("Keep at least one column on the board")
    }
    const fallback =
      moveCardsToKey || cols.find((c) => c.key !== key)?.key || cols[0].key
    if (fallback === key) {
      throw new ValidationError("Choose another column to move cards into")
    }

    try {
      if (boardType === "visitors") {
        await db
          .update(visitorLeads)
          .set({ stage: fallback, updatedAt: new Date() })
          .where(eq(visitorLeads.stage, key))
      } else {
        await db
          .update(projectCards)
          .set({ stage: fallback, updatedAt: new Date() })
          .where(eq(projectCards.stage, key))
      }
      await db.delete(kanbanColumns).where(eq(kanbanColumns.id, id))
      // Reindex
      const left = await this.list(boardType)
      await this.reorder({
        boardType,
        orderedKeys: left.filter((c) => c.key !== key).map((c) => c.key),
      })
      return { ok: true }
    } catch (e) {
      if (e instanceof ValidationError || e instanceof NotFoundError) throw e
      const mem = memory.get(boardType) || []
      memory.set(
        boardType,
        mem.filter((c) => c.id !== id).map((c, i) => ({ ...c, orderIndex: i }))
      )
      return { ok: true }
    }
  },

  async cardCount(boardType: KanbanBoardType, key: string): Promise<number> {
    try {
      if (boardType === "visitors") {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(visitorLeads)
          .where(eq(visitorLeads.stage, key))
        return count || 0
      }
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projectCards)
        .where(eq(projectCards.stage, key))
      return count || 0
    } catch {
      return 0
    }
  },
}
