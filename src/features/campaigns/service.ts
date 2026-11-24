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

/** Demo recipients used when no member directory is wired to the audience filter. */
const DEMO_RECIPIENTS = [
  { name: "Grace Thompson", email: "grace@example.org", phone: "+15550100001" },
  { name: "Daniel Okafor", email: "daniel@example.org", phone: "+15550100002" },
  { name: "Maria Santos", email: "maria@example.org", phone: "+15550100003" },
  { name: "Samuel Lee", email: "samuel@example.org", phone: "+15550100004" },
  { name: "Ruth Williams", email: "ruth@example.org", phone: "+15550100005" },
]

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

const store: StoredCampaign[] = [
  {
    id: "cmp-demo-1",
    name: "Easter Sunday Invitation",
    channel: "both",
    status: "sent",
    subject: "You're invited: Easter Sunday Celebration",
    emailBody: "Join us this Easter Sunday for worship, family, and celebration. Services at 9am and 11am.",
    smsBody: "Join us this Easter Sunday at 9am or 11am! Bring a friend.",
    audienceFilter: { segment: "all_members" },
    scheduleAt: null,
    sentAt: daysAgo(12),
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12),
  },
  {
    id: "cmp-demo-2",
    name: "Volunteer Appreciation Night",
    channel: "email",
    status: "scheduled",
    subject: "Thank you, volunteers!",
    emailBody: "We'd love to celebrate you. Dinner is on us this Friday evening.",
    smsBody: "",
    audienceFilter: { segment: "group_leaders" },
    scheduleAt: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    sentAt: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  {
    id: "cmp-demo-3",
    name: "New Visitor Follow-up",
    channel: "sms",
    status: "draft",
    subject: "",
    emailBody: "",
    smsBody: "Thanks for visiting us! We'd love to see you again this Sunday.",
    audienceFilter: { segment: "visitors" },
    scheduleAt: null,
    sentAt: null,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
]

const sendLogs: CampaignSendLog[] = [
  ...DEMO_RECIPIENTS.map((r, i): CampaignSendLog => ({
    id: `send-demo-1-e${i}`,
    campaignId: "cmp-demo-1",
    recipientName: r.name,
    recipientEmail: r.email,
    channel: "email",
    status: "sent",
    providerId: `re_demo_${i}`,
    sentAt: daysAgo(12),
  })),
  ...DEMO_RECIPIENTS.map((r, i): CampaignSendLog => ({
    id: `send-demo-1-s${i}`,
    campaignId: "cmp-demo-1",
    recipientName: r.name,
    recipientPhone: r.phone,
    channel: "sms",
    status: i === 4 ? "failed" : "sent",
    providerId: i === 4 ? undefined : `sms-demo-seed-${i}`,
    errorMessage: i === 4 ? "Carrier rejected number" : undefined,
    sentAt: daysAgo(12),
  })),
]

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

    c.status = "sending"
    const channels: ("email" | "sms")[] =
      c.channel === "both" ? ["email", "sms"] : [c.channel as "email" | "sms"]

    for (const r of DEMO_RECIPIENTS) {
      for (const channel of channels) {
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
