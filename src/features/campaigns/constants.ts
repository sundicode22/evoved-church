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

export const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "border-zinc-200 bg-zinc-50 text-zinc-600",
  scheduled: "border-amber-200 bg-amber-50 text-amber-700",
  sending: "border-sky-200 bg-sky-50 text-sky-700",
  sent: "border-emerald-200 bg-emerald-50 text-emerald-700",
}
