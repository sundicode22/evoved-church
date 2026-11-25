"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Megaphone,
  Users,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePortal } from "@/features/portal/hooks/use-portal"

export default function MemberPortalPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data, isLoading, error } = usePortal(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8f6]">
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
  const featured = posts[0]
  const restPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--brand-hover)] uppercase">
              Member portal
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900">{settings.churchName}</p>
          </div>
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
          </nav>
          {settings.publicGiving ? (
            <Link
              href={settings.givingUrl}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent-cta)] px-3.5 text-sm font-medium text-white shadow-xs hover:bg-[var(--accent-cta-hover)]"
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
        <section className="relative overflow-hidden border-b border-zinc-200/60 bg-[radial-gradient(ellipse_at_top,_rgba(132,204,22,0.14),_transparent_55%)]">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-16">
            <div>
              <p className="text-sm font-medium text-[var(--brand-hover)]">Welcome</p>
              <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                {settings.churchName}
              </h1>
              <p className="mt-3 max-w-md text-base text-zinc-600">
                Stories, gatherings, and groups — everything your church family needs in one place.
              </p>
            </div>
            {featured ? (
              <Link
                href={`/portal/${slug}/blog/${featured.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs"
              >
                <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                  {featured.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.coverImageUrl}
                      alt=""
                      className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                      <BookOpen className="size-10" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <p className="text-[11px] font-semibold tracking-wide text-[var(--brand-hover)] uppercase">
                    Featured story
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-[var(--brand-hover)]">
                    {featured.title}
                  </h2>
                  <p className="line-clamp-2 text-sm text-zinc-600">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-hover)]">
                    Read story
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
          <section id="stories">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[var(--brand-hover)]">
                  <BookOpen className="size-4" strokeWidth={1.75} />
                  <span className="text-xs font-semibold tracking-wide uppercase">Blog</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Church stories</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Click any story to read the full post with photos.
                </p>
              </div>
            </div>

            {posts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-10 text-center text-sm text-zinc-500">
                No stories published yet.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(featured ? restPosts : posts).map((post) => (
                  <Link
                    key={post.id}
                    href={`/portal/${slug}/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs transition hover:border-zinc-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                      {post.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImageUrl}
                          alt=""
                          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[var(--brand-soft)]">
                          <BookOpen className="size-8 text-[var(--brand-ink)]" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h3 className="text-base font-semibold tracking-tight text-zinc-900 group-hover:text-[var(--brand-hover)]">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 flex-1 text-sm text-zinc-500">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
                        <span>{post.authorName}</span>
                        {post.publishedAt ? (
                          <time dateTime={post.publishedAt}>
                            {format(parseISO(post.publishedAt), "MMM d")}
                          </time>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-10 lg:grid-cols-2">
            {settings.publicEvents && (
              <section id="events">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="size-4 text-[var(--brand-hover)]" strokeWidth={1.75} />
                  <h2 className="text-lg font-semibold tracking-tight">Upcoming events</h2>
                </div>
                <ul className="space-y-3">
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-xs"
                    >
                      <p className="text-sm font-semibold text-zinc-900">{e.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {format(parseISO(e.startsAt), "EEE, MMM d · h:mm a")}
                        {e.locationLabel ? ` · ${e.locationLabel}` : ""}
                      </p>
                    </li>
                  ))}
                  {events.length === 0 && (
                    <li className="text-sm text-zinc-400">No upcoming events.</li>
                  )}
                </ul>
              </section>
            )}

            {settings.publicGroups && (
              <section id="groups">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="size-4 text-[var(--brand-hover)]" strokeWidth={1.75} />
                  <h2 className="text-lg font-semibold tracking-tight">Groups</h2>
                </div>
                <ul className="space-y-3">
                  {groups.map((g) => (
                    <li
                      key={g.id}
                      className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-zinc-900">{g.name}</p>
                        <span className="shrink-0 rounded-md bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--brand-ink)]">
                          {g.meetingDay}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-zinc-500">{g.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section id="news">
            <div className="mb-4 flex items-center gap-2">
              <Megaphone className="size-4 text-[var(--brand-hover)]" strokeWidth={1.75} />
              <h2 className="text-lg font-semibold tracking-tight">Announcements</h2>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {announcements.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-zinc-200/80 bg-white px-4 py-4 shadow-xs"
                >
                  <p className="text-sm font-semibold text-zinc-900">{a.title}</p>
                  <div
                    className="prose prose-sm mt-2 max-w-none text-zinc-600"
                    dangerouslySetInnerHTML={{ __html: a.bodyHtml }}
                  />
                </li>
              ))}
              {announcements.length === 0 && (
                <li className="text-sm text-zinc-400">No announcements yet.</li>
              )}
            </ul>
          </section>
        </div>
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
