import type { CampaignStatus } from "./schemas"

export const CHANNEL_ITEMS = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Email + SMS", value: "both" },
]

export const AUDIENCE_ITEMS = [
  { label: "All members", value: "all_members" },
  { label: "Visitors", value: "visitors" },
  { label: "Group leaders", value: "group_leaders" },
  { label: "Custom list", value: "custom" },
]

export const STATUS_TONE: Record<
  CampaignStatus,
  "neutral" | "success" | "warning" | "info"
> = {
  draft: "neutral",
  scheduled: "warning",
  sending: "info",
  sent: "success",
}
