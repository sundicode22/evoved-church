import { NotFoundError, ValidationError } from "@/lib/errors"
import { announcementsService } from "@/features/announcements/service"
import { blogService } from "@/features/blog/service"
import { settingsService } from "@/features/settings/service"
import { emailService } from "@/features/communications/resend"
import { createDefaultPortalBlocks, DEFAULT_PORTAL_THEME } from "./default-layout"
import type {
  CreateNewsletterIssueInput,
  NewsletterIssue,
  NewsletterSubscribeInput,
  NewsletterSubscriber,
  PortalBlock,
  PortalEvent,
  PortalGroup,
  PortalPublicView,
  PortalSettings,
  UpdatePortalBlockInput,
  UpdatePortalFlagsInput,
  UpdatePortalLayoutInput,
  UpdatePortalThemeInput,
} from "./schemas"

const now = () => new Date().toISOString()

function ensurePortal(settings: PortalSettings): PortalSettings {
  if (!settings.theme) settings.theme = { ...DEFAULT_PORTAL_THEME }
  if (!settings.blocks?.length) settings.blocks = createDefaultPortalBlocks()
  return settings
}

const portals: PortalSettings[] = [
  ensurePortal({
    id: "portal-main",
    campusId: "",
    churchName: "Grace City Church",
    slug: "main",
    publicDirectory: false,
    publicGiving: true,
    publicEvents: true,
    publicGroups: true,
    stripeConnected: false,
    givingUrl: "/give/main",
    theme: { ...DEFAULT_PORTAL_THEME },
    blocks: createDefaultPortalBlocks(),
    updatedAt: now(),
  }),
]

const events: PortalEvent[] = [
  {
    id: "evt-1",
    title: "Sunday Worship",
    startsAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    locationLabel: "Main Sanctuary",
  },
  {
    id: "evt-2",
    title: "Midweek Prayer",
    startsAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    locationLabel: "Prayer Chapel",
  },
]

const groups: PortalGroup[] = [
  {
    id: "grp-1",
    name: "Young Adults",
    meetingDay: "Thursdays",
    description: "Community, Scripture, and dinner downtown.",
  },
  {
    id: "grp-2",
    name: "Women’s Bible Study",
    meetingDay: "Tuesdays",
    description: "Verse-by-verse study with childcare.",
  },
]

let subscribers: NewsletterSubscriber[] = []
let issues: NewsletterIssue[] = []

function findPortal(slug: string) {
  const settings = portals.find((p) => p.slug === slug)
  if (!settings) throw new NotFoundError("Portal", slug)
  return ensurePortal(settings)
}

export const portalService = {
  async getBySlug(slug: string): Promise<PortalPublicView> {
    const settings = findPortal(slug)

    try {
      const nom = await settingsService.getNomenclature("default")
      if (nom?.churchName) settings.churchName = String(nom.churchName)
    } catch {
      /* keep */
    }

    let announcements: PortalPublicView["announcements"] = []
    try {
      const posted = await announcementsService.listPosted()
      announcements = posted.slice(0, 8).map((a) => ({
        id: a.id,
        title: a.title,
        bodyHtml: a.bodyHtml,
        postedAt: a.postedAt,
      }))
    } catch {
      announcements = []
    }

    let posts: PortalPublicView["posts"] = []
    try {
      const published = await blogService.listPublished()
      posts = published.slice(0, 9).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        coverImageUrl: p.coverImageUrl,
        authorName: p.authorName,
        publishedAt: p.publishedAt,
      }))
    } catch {
      posts = []
    }

    return {
      settings: structuredClone(settings),
      events: settings.publicEvents ? [...events] : [],
      groups: settings.publicGroups ? [...groups] : [],
      announcements,
      posts,
    }
  },

  async list(): Promise<PortalSettings[]> {
    return portals.map((p) => structuredClone(ensurePortal(p)))
  },

  async updateLayout(slug: string, input: UpdatePortalLayoutInput): Promise<PortalSettings> {
    const settings = findPortal(slug)
    settings.blocks = input.blocks.map((b) => ({ ...b }))
    settings.updatedAt = now()
    return structuredClone(settings)
  },

  async updateTheme(slug: string, input: UpdatePortalThemeInput): Promise<PortalSettings> {
    const settings = findPortal(slug)
    settings.theme = { ...settings.theme, ...input }
    const hero = settings.blocks.find((b) => b.type === "hero")
    if (hero) {
      if (input.headline) hero.title = input.headline
      if (input.tagline) hero.subtitle = input.tagline
    }
    settings.updatedAt = now()
    return structuredClone(settings)
  },

  async updateFlags(slug: string, input: UpdatePortalFlagsInput): Promise<PortalSettings> {
    const settings = findPortal(slug)
    if (input.publicDirectory !== undefined) settings.publicDirectory = input.publicDirectory
    if (input.publicGiving !== undefined) settings.publicGiving = input.publicGiving
    if (input.publicEvents !== undefined) settings.publicEvents = input.publicEvents
    if (input.publicGroups !== undefined) settings.publicGroups = input.publicGroups
    if (input.givingUrl !== undefined) settings.givingUrl = input.givingUrl
    settings.updatedAt = now()
    return structuredClone(settings)
  },

  async updateBlock(slug: string, input: UpdatePortalBlockInput): Promise<PortalSettings> {
    const settings = findPortal(slug)
    const idx = settings.blocks.findIndex((b) => b.id === input.id)
    if (idx < 0) throw new NotFoundError("Portal block", input.id)
    settings.blocks[idx] = { ...settings.blocks[idx], ...input }
    settings.updatedAt = now()
    return structuredClone(settings)
  },

  async addBlock(
    slug: string,
    type: PortalBlock["type"]
  ): Promise<PortalSettings> {
    const settings = findPortal(slug)
    const id = `block-${Date.now().toString(36)}`
    const base: PortalBlock = {
      id,
      type,
      enabled: true,
      title: type === "custom_text" ? "New section" : undefined,
      body: type === "custom_text" ? "Add your message here." : undefined,
    }
    if (type === "scripture") {
      base.title = "Scripture"
      base.reference = "John 3:16"
      base.translation = "ESV"
      base.verseText =
        "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
    }
    if (type === "newsletter") {
      base.title = "Stay in the loop"
      base.subtitle = "Get stories and Sunday updates in your inbox."
      base.ctaLabel = "Subscribe"
    }
    settings.blocks.push(base)
    settings.updatedAt = now()
    return structuredClone(settings)
  },

  async removeBlock(slug: string, blockId: string): Promise<PortalSettings> {
    const settings = findPortal(slug)
    const next = settings.blocks.filter((b) => b.id !== blockId)
    if (next.length === settings.blocks.length) throw new NotFoundError("Portal block", blockId)
    if (next.length === 0) throw new ValidationError("Keep at least one section on the portal")
    settings.blocks = next
    settings.updatedAt = now()
    return structuredClone(settings)
  },

  async activateOnlineGiving(slug: string): Promise<PortalSettings> {
    const settings = findPortal(slug)
    settings.stripeConnected = true
    settings.publicGiving = true
    settings.updatedAt = now()
    return structuredClone(settings)
  },

  async listSubscribers(): Promise<NewsletterSubscriber[]> {
    return [...subscribers]
  },

  async subscribeNewsletter(
    slug: string,
    input: NewsletterSubscribeInput
  ): Promise<NewsletterSubscriber> {
    findPortal(slug)
    const email = input.email.trim().toLowerCase()
    const existing = subscribers.find((s) => s.email === email)
    if (existing) {
      existing.status = "subscribed"
      existing.name = input.name?.trim() || existing.name
      return { ...existing }
    }
    const row: NewsletterSubscriber = {
      id: `sub-${Date.now().toString(36)}`,
      email,
      name: input.name?.trim() || "",
      status: "subscribed",
      createdAt: now(),
    }
    subscribers = [row, ...subscribers]
    return { ...row }
  },

  async unsubscribe(subscriberId: string): Promise<NewsletterSubscriber> {
    const row = subscribers.find((s) => s.id === subscriberId)
    if (!row) throw new NotFoundError("Subscriber", subscriberId)
    row.status = "unsubscribed"
    return { ...row }
  },

  async deleteSubscriber(subscriberId: string): Promise<{ ok: true }> {
    const before = subscribers.length
    subscribers = subscribers.filter((s) => s.id !== subscriberId)
    if (subscribers.length === before) throw new NotFoundError("Subscriber", subscriberId)
    return { ok: true }
  },

  async listIssues(): Promise<NewsletterIssue[]> {
    return [...issues]
  },

  async createIssue(input: CreateNewsletterIssueInput): Promise<NewsletterIssue> {
    const row: NewsletterIssue = {
      id: `issue-${Date.now().toString(36)}`,
      subject: input.subject.trim(),
      previewText: input.previewText?.trim() || "",
      bodyHtml: input.bodyHtml,
      status: "draft",
      sentAt: null,
      recipientCount: 0,
      createdAt: now(),
    }
    issues = [row, ...issues]
    return { ...row }
  },

  async updateIssue(
    id: string,
    input: Partial<CreateNewsletterIssueInput>
  ): Promise<NewsletterIssue> {
    const row = issues.find((i) => i.id === id)
    if (!row) throw new NotFoundError("Newsletter issue", id)
    if (row.status === "sent") throw new ValidationError("Sent issues cannot be edited")
    if (input.subject !== undefined) row.subject = input.subject.trim()
    if (input.previewText !== undefined) row.previewText = input.previewText.trim()
    if (input.bodyHtml !== undefined) row.bodyHtml = input.bodyHtml
    return { ...row }
  },

  async deleteIssue(id: string): Promise<{ ok: true }> {
    const before = issues.length
    issues = issues.filter((i) => i.id !== id)
    if (issues.length === before) throw new NotFoundError("Newsletter issue", id)
    return { ok: true }
  },

  async sendIssue(id: string): Promise<NewsletterIssue> {
    const row = issues.find((i) => i.id === id)
    if (!row) throw new NotFoundError("Newsletter issue", id)
    const audience = subscribers.filter((s) => s.status === "subscribed")
    if (audience.length === 0) {
      throw new ValidationError("No subscribers yet. Share the portal subscribe form first.")
    }

    for (const sub of audience) {
      await emailService
        .sendRawCampaign({
          to: sub.email,
          subject: row.subject,
          html: row.bodyHtml,
        })
        .catch(() => null)
    }

    row.status = "sent"
    row.sentAt = now()
    row.recipientCount = audience.length
    return { ...row }
  },
}
