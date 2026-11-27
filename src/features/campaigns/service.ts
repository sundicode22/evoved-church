import { isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { members, visitorLeads } from "@/lib/db/schema"
import { NotFoundError, ValidationError } from "@/lib/errors"
import { emailService } from "@/features/communications/resend"
import { smsService } from "@/features/communications/sms"
import {
  createCampaignSchema,
  updateCampaignSchema,
  type Campaign,
  type CampaignDetail,
  type CampaignSendLog,
} from "./schemas"
import type { z } from "zod"

type CreateInput = z.output<typeof createCampaignSchema>
type UpdateInput = z.output<typeof updateCampaignSchema>

type StoredCampaign = Omit<Campaign, "stats">

const store: StoredCampaign[] = []
const sendLogs: CampaignSendLog[] = []

type AudienceRecipient = { name: string; email: string; phone: string }

async function loadRecipients(segment?: string): Promise<AudienceRecipient[]> {
  try {
    if (segment === "visitors") {
      const rows = await db
        .select({
          name: visitorLeads.contactName,
          email: visitorLeads.contactEmail,
          phone: visitorLeads.contactPhone,
        })
        .from(visitorLeads)
        .limit(1000)
      return rows
        .map((r) => ({ name: r.name, email: r.email || "", phone: r.phone || "" }))
        .filter((r) => r.email || r.phone)
    }

    const rows = await db
      .select({
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
        phone: members.phoneNumber,
      })
      .from(members)
      .where(isNull(members.deletedAt))
      .limit(1000)
    return rows
      .map((r) => ({
        name: `${r.firstName} ${r.lastName}`.trim(),
        email: r.email || "",
        phone: r.phone || "",
      }))
      .filter((r) => r.email || r.phone)
  } catch (err) {
    console.error("[campaignService.loadRecipients]", err)
    return []
  }
}

function withStats(c: StoredCampaign): Campaign {
  const logs = sendLogs.filter((l) => l.campaignId === c.id)
  return {
    ...c,
    stats: {
      total: logs.length,
      sent: logs.filter((l) => l.status === "sent").length,
      failed: logs.filter((l) => l.status === "failed").length,
    },
  }
}

function find(id: string) {
  const c = store.find((x) => x.id === id)
  if (!c) throw new NotFoundError("Campaign", id)
  return c
}

/** Campaign email — Resend only (never SMS). */
async function sendCampaignEmail(to: string, subject: string, html: string): Promise<string> {
  try {
    const res = await emailService.sendRawCampaign({ to, subject, html })
    return res.id
  } catch (err) {
    if (!process.env.RESEND_API_KEY) {
      const id = `email-demo-${Date.now().toString(36)}`
      console.info(`[email:resend-demo] to=${to} id=${id} subject="${subject}"`)
      return id
    }
    throw err
  }
}

export const campaignService = {
  async list(): Promise<Campaign[]> {
    return [...store]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(withStats)
  },

  async getById(id: string): Promise<CampaignDetail> {
    const c = find(id)
    return { ...withStats(c), sends: sendLogs.filter((l) => l.campaignId === id) }
  },

  async create(input: CreateInput, userId?: string): Promise<Campaign> {
    const now = new Date().toISOString()
    const c: StoredCampaign = {
      id: `cmp-${crypto.randomUUID()}`,
      name: input.name,
      channel: input.channel,
      status: input.scheduleAt ? "scheduled" : "draft",
      subject: input.subject ?? "",
      emailBody: input.emailBody ?? "",
      smsBody: input.smsBody ?? "",
      audienceFilter: input.audienceFilter ?? { segment: "all_members" },
      scheduleAt: input.scheduleAt ?? null,
      sentAt: null,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    }
    store.unshift(c)
    return withStats(c)
  },

  async update(id: string, input: UpdateInput): Promise<Campaign> {
    const c = find(id)
    if (c.status === "sent" || c.status === "sending") {
      throw new ValidationError("Sent campaigns can no longer be edited")
    }
    Object.assign(c, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.channel !== undefined && { channel: input.channel }),
      ...(input.subject !== undefined && { subject: input.subject }),
      ...(input.emailBody !== undefined && { emailBody: input.emailBody }),
      ...(input.smsBody !== undefined && { smsBody: input.smsBody }),
      ...(input.audienceFilter !== undefined && { audienceFilter: input.audienceFilter }),
      ...(input.scheduleAt !== undefined && { scheduleAt: input.scheduleAt }),
      updatedAt: new Date().toISOString(),
    })
    if (input.scheduleAt !== undefined) c.status = input.scheduleAt ? "scheduled" : "draft"
    return withStats(c)
  },

  async send(id: string): Promise<CampaignDetail> {
    const c = find(id)
    if (c.status === "sent") throw new ValidationError("Campaign was already sent")
    if (c.channel !== "sms" && !c.subject) throw new ValidationError("Email subject is required")
    if (c.channel !== "sms" && !c.emailBody) throw new ValidationError("Email body is required")
    if (c.channel !== "email" && !c.smsBody) throw new ValidationError("SMS body is required")

    const segment = (c.audienceFilter as { segment?: string } | null)?.segment
    const recipients = (await loadRecipients(segment)).filter((r) => {
      if (c.channel === "email") return Boolean(r.email)
      if (c.channel === "sms") return Boolean(r.phone)
      return Boolean(r.email || r.phone)
    })
    if (recipients.length === 0) {
      throw new ValidationError("No people with an email or phone match this audience.")
    }

    c.status = "sending"
    const channels: ("email" | "sms")[] =
      c.channel === "both" ? ["email", "sms"] : [c.channel as "email" | "sms"]

    for (const r of recipients) {
      for (const channel of channels) {
        if (channel === "email" && !r.email) continue
        if (channel === "sms" && !r.phone) continue
        const log: CampaignSendLog = {
          id: `send-${crypto.randomUUID()}`,
          campaignId: id,
          recipientName: r.name,
          recipientEmail: channel === "email" ? r.email : undefined,
          recipientPhone: channel === "sms" ? r.phone : undefined,
          channel,
          status: "queued",
        }
        try {
          log.providerId =
            channel === "email"
              ? await sendCampaignEmail(
                  r.email,
                  c.subject,
                  `<div>${c.emailBody.replace(/\n/g, "<br/>")}</div>`
                )
              : (await smsService.send(r.phone, c.smsBody)).providerId
          log.status = "sent"
          log.sentAt = new Date().toISOString()
        } catch (err) {
          log.status = "failed"
          log.errorMessage = err instanceof Error ? err.message : "Unknown error"
        }
        sendLogs.push(log)
      }
    }

    c.status = "sent"
    c.sentAt = new Date().toISOString()
    c.updatedAt = c.sentAt
    return this.getById(id)
  },
}
