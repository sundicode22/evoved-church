import { NotFoundError } from "@/lib/errors"
import { announcementsService } from "@/features/announcements/service"
import type {
  PortalEvent,
  PortalGroup,
  PortalPublicView,
  PortalSettings,
} from "./schemas"

const now = () => new Date().toISOString()
const daysFromNow = (d: number, hour = 10) => {
  const dt = new Date()
  dt.setDate(dt.getDate() + d)
  dt.setHours(hour, 0, 0, 0)
  return dt.toISOString()
}

const portals: PortalSettings[] = [
  {
    id: "portal-1",
    campusId: "campus-demo-main",
    churchName: "Grace City Church",
    slug: "grace-city",
    publicDirectory: false,
    publicGiving: true,
    publicEvents: true,
    publicGroups: true,
    stripeConnected: false,
    givingUrl: "/give/grace-city",
    updatedAt: now(),
  },
  {
    id: "portal-main",
    campusId: "campus-demo-main",
    churchName: "Grace City Church",
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

const events: PortalEvent[] = [
  {
    id: "pe-1",
    title: "Sunday Morning Worship",
    startsAt: daysFromNow(7 - new Date().getDay(), 10),
    locationLabel: "Main Sanctuary",
  },
  {
    id: "pe-2",
    title: "Community Food Pantry",
    startsAt: daysFromNow(3, 9),
    locationLabel: "Fellowship Hall",
  },
]

const groups: PortalGroup[] = [
  {
    id: "pg-1",
    name: "Young Adults",
    meetingDay: "Thursdays 7pm",
    description: "Bible study and fellowship for ages 18–35.",
  },
  {
    id: "pg-2",
    name: "Women's Circle",
    meetingDay: "Tuesdays 10am",
    description: "Prayer and encouragement for women.",
  },
]

export const portalService = {
  async getBySlug(slug: string): Promise<PortalPublicView> {
    const settings = portals.find((p) => p.slug === slug)
    if (!settings) throw new NotFoundError("Portal", slug)

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

    return {
      settings: { ...settings },
      events: settings.publicEvents ? [...events] : [],
      groups: settings.publicGroups ? [...groups] : [],
      announcements,
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
