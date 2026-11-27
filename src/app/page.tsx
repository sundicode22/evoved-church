import type { Metadata } from "next"
import { LandingPage } from "@/components/marketing/landing-page"

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://evolvechms.org").replace(/\/$/, "")

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Evolve Church — Multi-location church management software",
    template: "%s · Evolve Church",
  },
  description:
    "Evolve ChMS unifies people, visitor CRM, giving & fund accounting, calendar, and campaigns for multi-location churches. Start free—book a demo anytime.",
  keywords: [
    "church management software",
    "ChMS",
    "multi-location church",
    "church membership software",
    "church giving software",
    "visitor follow-up",
    "church calendar",
    "church campaigns",
    "fund accounting church",
    "Evolve Church",
  ],
  authors: [{ name: "Evolve Church" }],
  creator: "Evolve Church",
  publisher: "Evolve Church",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Evolve Church",
    title: "Evolve — Church management for multi-location teams",
    description:
      "People, visitors, giving, calendar, and campaigns in one calm workspace. Start free or book a demo.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Evolve Church Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evolve — Multi-location church management",
    description:
      "People, visitors, giving, calendar, and campaigns in one workspace. Start free or book a demo.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Evolve Church",
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
      description:
        "Premium church management system for multi-location teams—people, giving, calendar, and campaigns.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        url: `${siteUrl}/demo`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Evolve Church",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Evolve ChMS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "All-in-one church management: members & households, visitor CRM, fund accounting, calendar, email and SMS campaigns, dynamic RBAC.",
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "0",
          priceCurrency: "USD",
          description: "1 location · 3 seats",
        },
        {
          "@type": "Offer",
          name: "Growth",
          price: "49",
          priceCurrency: "USD",
          description: "3 locations · 15 seats",
        },
        {
          "@type": "Offer",
          name: "Campus",
          price: "129",
          priceCurrency: "USD",
          description: "50 locations · 50 seats",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need a card to start?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Starter is free. Create an account, finish church and location setup, then open the workspace.",
          },
        },
        {
          "@type": "Question",
          name: "Can we run more than one location?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Growth and Campus plans raise location and seat limits. Every location keeps its own books and people.",
          },
        },
        {
          "@type": "Question",
          name: "How do demos and interest requests work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Open Book a demo. We send your note to Evolve owners over Resend and confirm to your inbox.",
          },
        },
      ],
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  )
}
