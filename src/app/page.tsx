import type { Metadata } from "next"
import { LandingPage } from "@/components/marketing/landing-page"

export const metadata: Metadata = {
  title: "Evolve Church — Church management for multi-location teams",
  description:
    "People, visitors, giving, calendar, and campaigns in one workspace. Start free—no card needed.",
}

export default function HomePage() {
  return <LandingPage />
}
