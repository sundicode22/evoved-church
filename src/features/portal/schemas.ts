import { z } from "zod"

export const portalSettingsSchema = z.object({
  campusId: z.string().optional(),
  slug: z.string().min(2),
  publicDirectory: z.boolean().default(false),
  publicGiving: z.boolean().default(true),
  publicEvents: z.boolean().default(true),
  publicGroups: z.boolean().default(true),
  stripeConnected: z.boolean().default(false),
})

export type PortalSettingsInput = z.infer<typeof portalSettingsSchema>

export type PortalSettings = {
  id: string
  campusId: string
  churchName: string
  slug: string
  publicDirectory: boolean
  publicGiving: boolean
  publicEvents: boolean
  publicGroups: boolean
  stripeConnected: boolean
  givingUrl: string
  updatedAt: string
}

export type PortalEvent = {
  id: string
  title: string
  startsAt: string
  locationLabel: string
}

export type PortalGroup = {
  id: string
  name: string
  meetingDay: string
  description: string
}

export type PortalAnnouncement = {
  id: string
  title: string
  bodyHtml: string
  postedAt: string | null
}

export type PortalBlogCard = {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string | null
  authorName: string
  publishedAt: string | null
}

export type PortalPublicView = {
  settings: PortalSettings
  events: PortalEvent[]
  groups: PortalGroup[]
  announcements: PortalAnnouncement[]
  posts: PortalBlogCard[]
}
