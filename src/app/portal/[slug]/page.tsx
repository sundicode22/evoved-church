"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { HeartHandshake } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePortal } from "@/features/portal/hooks/use-portal"
import { PortalBlocks } from "@/features/portal/components/portal-blocks"

function MemberPortalPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading, error } = usePortal(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbfcfb]">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-sm text-zinc-600">Portal not found.</p>
      </div>
    )
  }

  const { settings, events, groups, announcements, posts } = data
  const showNav = settings.theme?.showNav !== false

  return (
    <div className="min-h-screen bg-[#fbfcfb] font-sans text-zinc-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.14em] text-brand uppercase">
              Member portal
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900">{settings.churchName}</p>
          </div>
          {showNav ? (
            <nav className="hidden items-center gap-5 text-sm text-zinc-600 md:flex">
              <a href="#stories" className="hover:text-zinc-900">
                Stories
              </a>
              {settings.publicEvents && (
                <a href="#events" className="hover:text-zinc-900">
                  Events
                </a>
              )}
              {settings.publicGroups && (
                <a href="#groups" className="hover:text-zinc-900">
                  Groups
                </a>
              )}
              <a href="#news" className="hover:text-zinc-900">
                News
              </a>
              <a href="#newsletter" className="hover:text-zinc-900">
                Newsletter
              </a>
            </nav>
          ) : (
            <span />
          )}
          {settings.publicGiving ? (
            <Link
              href={settings.givingUrl}
              className="inline-flex h-[39px] items-center gap-1.5 rounded-lg bg-accent-cta px-3.5 text-sm font-medium text-white shadow-xs hover:bg-accent-cta-hover"
            >
              <HeartHandshake className="size-4" strokeWidth={1.75} />
              Give
            </Link>
          ) : (
            <span />
          )}
        </div>
      </header>

      <main>
        <PortalBlocks
          slug={slug}
          settings={settings}
          posts={posts}
          events={events}
          groups={groups}
          announcements={announcements}
        />
      </main>

      <footer className="border-t border-zinc-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-zinc-400 sm:px-6">
          <span>{settings.churchName}</span>
          <span>Powered by Evolve ChMS</span>
        </div>
      </footer>
    </div>
  )
}

export default function MemberPortalRoute() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfcfb]">
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
          </div>
        </div>
      }
    >
      <MemberPortalPage />
    </React.Suspense>
  )
}
