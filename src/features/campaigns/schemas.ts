import { z } from "zod"

export const CAMPAIGN_CHANNELS = ["email", "sms", "both"] as const
export const CAMPAIGN_STATUSES = ["draft", "scheduled", "sending", "sent"] as const

export const campaignChannelSchema = z.enum(CAMPAIGN_CHANNELS)

export const audienceFilterSchema = z
  .object({
    segment: z.enum(["all_members", "visitors", "group_leaders", "custom"]).default("all_members"),
    campusId: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough()

export const createCampaignSchema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  channel: campaignChannelSchema.default("email"),
  subject: z.string().optional().default(""),
  emailBody: z.string().optional().default(""),
  smsBody: z.string().max(480, "SMS body is too long").optional().default(""),
  audienceFilter: audienceFilterSchema.optional().default({ segment: "all_members" }),
  scheduleAt: z.string().datetime().nullable().optional(),
})

export const updateCampaignSchema = createCampaignSchema.partial()

export type CampaignChannel = (typeof CAMPAIGN_CHANNELS)[number]
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]
export type CreateCampaignInput = z.input<typeof createCampaignSchema>
export type UpdateCampaignInput = z.input<typeof updateCampaignSchema>

export interface CampaignSendLog {
  id: string
  campaignId: string
  recipientName: string
  recipientEmail?: string
  recipientPhone?: string
  channel: "email" | "sms"
  status: "queued" | "sent" | "failed"
  providerId?: string
  errorMessage?: string
  sentAt?: string
}

export interface Campaign {
  id: string
  name: string
  channel: CampaignChannel
  status: CampaignStatus
  subject: string
  emailBody: string
  smsBody: string
  audienceFilter: Record<string, unknown>
  scheduleAt: string | null
  sentAt: string | null
  createdByUserId?: string
  createdAt: string
  updatedAt: string
  stats: { total: number; sent: number; failed: number }
}

export type CampaignDetail = Campaign & { sends: CampaignSendLog[] }
