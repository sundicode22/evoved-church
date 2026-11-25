import { z } from "zod"

export const portalBlockTypeSchema = z.enum([
  "hero",
  "scripture",
  "stories",
  "events",
  "groups",
  "announcements",
  "newsletter",
  "give_cta",
  "custom_text",
])

export type PortalBlockType = z.infer<typeof portalBlockTypeSchema>

export const portalBlockSchema = z.object({
  id: z.string().min(1),
  type: portalBlockTypeSchema,
  enabled: z.boolean().default(true),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  /** Scripture */
  reference: z.string().optional(),
  translation: z.string().optional(),
  verseText: z.string().optional(),
})

export const portalThemeSchema = z.object({
  headline: z.string().min(2).default("Welcome"),
  tagline: z.string().default("Stories, gatherings, and groups in one place."),
  accent: z.enum(["brand", "emerald"]).default("brand"),
  showNav: z.boolean().default(true),
})

export const portalSettingsSchema = z.object({
  campusId: z.string().optional(),
  slug: z.string().min(2),
  publicDirectory: z.boolean().default(false),
  publicGiving: z.boolean().default(true),
  publicEvents: z.boolean().default(true),
  publicGroups: z.boolean().default(true),
  stripeConnected: z.boolean().default(false),
})

export const updatePortalLayoutSchema = z.object({
  blocks: z.array(portalBlockSchema).min(1),
})

export const updatePortalThemeSchema = portalThemeSchema.partial()

export const updatePortalFlagsSchema = z.object({
  publicDirectory: z.boolean().optional(),
  publicGiving: z.boolean().optional(),
  publicEvents: z.boolean().optional(),
  publicGroups: z.boolean().optional(),
  givingUrl: z.string().optional(),
})

export const updatePortalBlockSchema = portalBlockSchema.partial().extend({
  id: z.string().min(1),
})

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1).optional().or(z.literal("")),
})

export const createNewsletterIssueSchema = z.object({
  subject: z.string().min(3, "Subject is required"),
  previewText: z.string().optional(),
  bodyHtml: z.string().min(10, "Write a short message"),
})

export type PortalSettingsInput = z.infer<typeof portalSettingsSchema>
export type PortalBlock = z.infer<typeof portalBlockSchema>
export type PortalTheme = z.infer<typeof portalThemeSchema>
export type UpdatePortalLayoutInput = z.infer<typeof updatePortalLayoutSchema>
export type UpdatePortalThemeInput = z.infer<typeof updatePortalThemeSchema>
export type UpdatePortalFlagsInput = z.infer<typeof updatePortalFlagsSchema>
export type UpdatePortalBlockInput = z.infer<typeof updatePortalBlockSchema>
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>
export type CreateNewsletterIssueInput = z.infer<typeof createNewsletterIssueSchema>

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
  theme: PortalTheme
  blocks: PortalBlock[]
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

export type NewsletterSubscriber = {
  id: string
  email: string
  name: string
  status: "pending" | "subscribed" | "unsubscribed"
  createdAt: string
}

export type NewsletterIssue = {
  id: string
  subject: string
  previewText: string
  bodyHtml: string
  status: "draft" | "sent"
  sentAt: string | null
  recipientCount: number
  createdAt: string
}

export type PortalPublicView = {
  settings: PortalSettings
  events: PortalEvent[]
  groups: PortalGroup[]
  announcements: PortalAnnouncement[]
  posts: PortalBlogCard[]
}

export const BLOCK_TYPE_LABELS: Record<PortalBlockType, string> = {
  hero: "Hero",
  scripture: "Scripture",
  stories: "Stories / Blog",
  events: "Events",
  groups: "Groups",
  announcements: "Announcements",
  newsletter: "Newsletter subscribe",
  give_cta: "Give CTA",
  custom_text: "Custom text",
}

export const SCRIPTURE_PRESETS = [
  {
    reference: "John 3:16",
    translation: "ESV",
    verseText:
      "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
  },
  {
    reference: "Psalm 23:1",
    translation: "ESV",
    verseText: "The Lord is my shepherd; I shall not want.",
  },
  {
    reference: "Philippians 4:13",
    translation: "ESV",
    verseText: "I can do all things through him who strengthens me.",
  },
  {
    reference: "Matthew 28:19",
    translation: "ESV",
    verseText:
      "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
  },
] as const
