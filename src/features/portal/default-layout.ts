import type { PortalBlock, PortalTheme } from "./schemas"
import { SCRIPTURE_PRESETS } from "./schemas"

export const DEFAULT_PORTAL_THEME: PortalTheme = {
  headline: "Welcome home",
  tagline: "Stories, gatherings, and groups — everything your church family needs in one place.",
  accent: "brand",
  showNav: true,
}

export function createDefaultPortalBlocks(): PortalBlock[] {
  const verse = SCRIPTURE_PRESETS[0]
  return [
    {
      id: "block-hero",
      type: "hero",
      enabled: true,
      title: DEFAULT_PORTAL_THEME.headline,
      subtitle: DEFAULT_PORTAL_THEME.tagline,
      ctaLabel: "Read stories",
      ctaHref: "#stories",
    },
    {
      id: "block-scripture",
      type: "scripture",
      enabled: true,
      title: "Word for this week",
      reference: verse.reference,
      translation: verse.translation,
      verseText: verse.verseText,
    },
    {
      id: "block-stories",
      type: "stories",
      enabled: true,
      title: "Church stories",
      subtitle: "Click any story to read the full post.",
    },
    {
      id: "block-events",
      type: "events",
      enabled: true,
      title: "Upcoming events",
    },
    {
      id: "block-groups",
      type: "groups",
      enabled: true,
      title: "Groups",
    },
    {
      id: "block-announcements",
      type: "announcements",
      enabled: true,
      title: "Announcements",
    },
    {
      id: "block-newsletter",
      type: "newsletter",
      enabled: true,
      title: "Stay in the loop",
      subtitle: "Get stories and Sunday updates in your inbox.",
      ctaLabel: "Subscribe",
    },
    {
      id: "block-give",
      type: "give_cta",
      enabled: true,
      title: "Partner in the mission",
      subtitle: "Give securely online to support ministry this week.",
      ctaLabel: "Give now",
    },
  ]
}
