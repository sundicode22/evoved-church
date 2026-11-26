import { db } from "@/lib/db"
import { auditLogs, journalEntries, users } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

export type AuditLogInput = {
  campusId?: string | null
  actorUserId?: string | null
  actorName?: string | null
  action: string
  entityType: string
  entityId?: string | null
  summary: string
  metadata?: Record<string, unknown>
}

export type AuditLogRow = {
  id: string
  campusId: string | null
  actorUserId: string | null
  actorName: string | null
  action: string
  entityType: string
  entityId: string | null
  summary: string
  metadata: Record<string, unknown>
  createdAt: string
}

/** Best-effort write — never blocks the primary action. */
export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    let actorName = input.actorName || null
    if (!actorName && input.actorUserId) {
      const [u] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, input.actorUserId))
        .limit(1)
      actorName = u?.name || null
    }
    await db.insert(auditLogs).values({
      campusId: input.campusId || null,
      actorUserId: input.actorUserId || null,
      actorName,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || null,
      summary: input.summary,
      metadata: input.metadata || {},
    })
  } catch (err) {
    console.error("[audit.write]", err)
  }
}

export const auditService = {
  async list(limit = 100): Promise<AuditLogRow[]> {
    try {
      const rows = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(Math.min(500, Math.max(1, limit)))

      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          campusId: r.campusId,
          actorUserId: r.actorUserId,
          actorName: r.actorName,
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          summary: r.summary,
          metadata: (r.metadata as Record<string, unknown>) || {},
          createdAt: r.createdAt.toISOString(),
        }))
      }
    } catch (err) {
      console.error("[audit.list]", err)
    }

    // Fallback: surface posted ledger entries as audit rows until dedicated logs exist
    try {
      const journals = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.status, "posted"))
        .orderBy(desc(journalEntries.postedAt))
        .limit(limit)

      return journals.map((j) => ({
        id: j.id,
        campusId: j.campusId,
        actorUserId: j.postedByUserId,
        actorName: null,
        action: "ledger.post",
        entityType: "journal_entry",
        entityId: j.id,
        summary: `Posted journal ${j.entryNumber}${j.memo ? ` — ${j.memo}` : ""}`,
        metadata: { entryNumber: j.entryNumber, status: j.status },
        createdAt: (j.postedAt || j.createdAt).toISOString(),
      }))
    } catch {
      return []
    }
  },
}
