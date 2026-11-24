import { NotFoundError } from "@/lib/errors"
import { announcementsService } from "@/features/announcements/service"
import { blogService } from "@/features/blog/service"
import { settingsService } from "@/features/settings/service"
import type {
  PortalEvent,
  PortalGroup,
  PortalPublicView,
  PortalSettings,
} from "./schemas"

const now = () => new Date().toISOString()

const portals: PortalSettings[] = [
  {
    id: "portal-main",
    campusId: "",
    churchName: "",
    slug: "main",
    publicDirectory: false,
    publicGiving: true,
    publicEvents: true,
    publicGroups: true,
    stripeConnected: false,
    givingUrl: "/give/main",
    updatedAt: now(),
  },
]

const events: PortalEvent[] = []

const groups: PortalGroup[] = []

export const portalService = {
  async getBySlug(slug: string): Promise<PortalPublicView> {
    const settings = portals.find((p) => p.slug === slug)
    if (!settings) throw new NotFoundError("Portal", slug)

    try {
      const nom = await settingsService.getNomenclature("default")
      if (nom?.churchName) settings.churchName = String(nom.churchName)
    } catch {
      /* keep portal settings as-is */
    }

    let announcements: PortalPublicView["announcements"] = []
    try {
      const posted = await announcementsService.listPosted()
      announcements = posted.slice(0, 5).map((a) => ({
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
      posts = published.slice(0, 6).map((p) => ({
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
      settings: { ...settings },
      events: settings.publicEvents ? [...events] : [],
      groups: settings.publicGroups ? [...groups] : [],
      announcements,
      posts,
    }
  },

  async list(): Promise<PortalSettings[]> {
    return [...portals]
  },

  async activateOnlineGiving(slug: string): Promise<PortalSettings> {
    const settings = portals.find((p) => p.slug === slug)
    if (!settings) throw new NotFoundError("Portal", slug)
    settings.stripeConnected = true
    settings.publicGiving = true
    settings.updatedAt = now()
    return { ...settings }
  },
}
