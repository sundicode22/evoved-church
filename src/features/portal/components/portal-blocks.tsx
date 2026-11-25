"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Megaphone,
  Quote,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { TextFormField } from "@/components/form-fields"
import { useSubscribeNewsletter } from "@/features/portal/hooks/use-portal"
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
  type PortalAnnouncement,
  type PortalBlock,
  type PortalBlogCard,
  type PortalEvent,
  type PortalGroup,
  type PortalSettings,
} from "@/features/portal/schemas"

type PortalBlocksProps = {
  slug: string
  settings: PortalSettings
  posts: PortalBlogCard[]
  events: PortalEvent[]
  groups: PortalGroup[]
  announcements: PortalAnnouncement[]
}

function SectionHeading({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon?: React.ReactNode
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-6">
      {(eyebrow || icon) && (
        <div className="mb-1.5 flex items-center gap-2 text-brand-ink">
          {icon}
          {eyebrow ? (
            <span className="text-xs font-medium tracking-[0.08em] text-brand uppercase">
              {eyebrow}
            </span>
          ) : null}
        </div>
      )}
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h2>
      {subtitle ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-500">{subtitle}</p> : null}
    </div>
  )
}

function NewsletterBlock({
  slug,
  block,
}: {
  slug: string
  block: PortalBlock
}) {
  const subscribe = useSubscribeNewsletter(slug)
  const form = useForm<NewsletterSubscribeInput>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues: { email: "", name: "" },
  })

  return (
    <section
      id="newsletter"
      className="rounded-2xl border border-zinc-200/80 bg-white px-6 py-8 shadow-xs sm:px-8"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="text-xs font-medium tracking-[0.08em] text-brand uppercase">Newsletter</p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">
            {block.title || "Stay in the loop"}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            {block.subtitle || "Get stories and Sunday updates in your inbox."}
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await subscribe.mutateAsync(values)
              form.reset({ email: "", name: "" })
            })}
            className="space-y-3"
          >
            <FieldGroup className="gap-3">
              <TextFormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Optional"
              />
              <TextFormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="you@email.com"
              />
            </FieldGroup>
            <Button
              type="submit"
              variant="primary"
              className="h-[39px] w-full"
              disabled={subscribe.isPending}
            >
              {subscribe.isPending ? "Subscribing…" : block.ctaLabel || "Subscribe"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}

export function PortalBlocks({
  slug,
  settings,
  posts,
  events,
  groups,
  announcements,
}: PortalBlocksProps) {
  const featured = posts[0]
  const restPosts = posts.slice(1)
  const blocks = settings.blocks.filter((b) => b.enabled)

  return (
    <>
      {blocks.map((block) => {
        if (block.type === "hero") {
          return (
            <section
              key={block.id}
              className="relative overflow-hidden border-b border-zinc-200/60 bg-[radial-gradient(ellipse_at_top,_rgba(100,149,237,0.16),_transparent_55%)]"
            >
              <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-16">
                <div>
                  <p className="text-sm font-medium text-brand">Welcome</p>
                  <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                    {block.title || settings.theme.headline || settings.churchName}
                  </h1>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-zinc-600">
                    {block.subtitle || settings.theme.tagline}
                  </p>
                  {block.ctaLabel ? (
                    <a
                      href={block.ctaHref || "#stories"}
                      className="mt-6 inline-flex h-[39px] items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-medium text-white shadow-xs hover:bg-brand-hover"
                    >
                      {block.ctaLabel}
                      <ArrowRight className="size-3.5" />
                    </a>
                  ) : null}
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
                        <div className="flex size-full items-center justify-center bg-brand-soft text-brand-ink">
                          <BookOpen className="size-10" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 p-5">
                      <p className="text-[11px] font-medium tracking-wide text-brand uppercase">
                        Featured story
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-brand">
                        {featured.title}
                      </h2>
                      <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600">
                        {featured.excerpt}
                      </p>
                    </div>
                  </Link>
                ) : null}
              </div>
            </section>
          )
        }

        if (block.type === "scripture") {
          return (
            <section key={block.id} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="rounded-2xl border border-zinc-200/80 bg-white px-6 py-8 shadow-xs sm:px-10">
                <div className="flex items-start gap-3">
                  <Quote className="mt-1 size-5 shrink-0 text-brand" strokeWidth={1.75} />
                  <div>
                    <p className="text-xs font-medium tracking-[0.08em] text-brand uppercase">
                      {block.title || "Scripture"}
                    </p>
                    <blockquote className="mt-3 text-xl font-medium leading-relaxed tracking-tight text-zinc-900 sm:text-2xl">
                      “{block.verseText}”
                    </blockquote>
                    <p className="mt-4 text-sm font-medium text-zinc-500">
                      {block.reference}
                      {block.translation ? ` · ${block.translation}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )
        }

        if (block.type === "stories") {
          return (
            <section key={block.id} id="stories" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <SectionHeading
                icon={<BookOpen className="size-4" strokeWidth={1.75} />}
                eyebrow="Blog"
                title={block.title || "Church stories"}
                subtitle={block.subtitle}
              />
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
                          <div className="flex size-full items-center justify-center bg-brand-soft">
                            <BookOpen className="size-8 text-brand-ink" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <h3 className="text-base font-semibold tracking-tight text-zinc-900 group-hover:text-brand">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500">
                          {post.excerpt}
                        </p>
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
          )
        }

        if (block.type === "events" && settings.publicEvents) {
          return (
            <section key={block.id} id="events" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <SectionHeading
                icon={<CalendarDays className="size-4" strokeWidth={1.75} />}
                title={block.title || "Upcoming events"}
              />
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
          )
        }

        if (block.type === "groups" && settings.publicGroups) {
          return (
            <section key={block.id} id="groups" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <SectionHeading
                icon={<Users className="size-4" strokeWidth={1.75} />}
                title={block.title || "Groups"}
              />
              <ul className="space-y-3">
                {groups.map((g) => (
                  <li
                    key={g.id}
                    className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-zinc-900">{g.name}</p>
                      <span className="shrink-0 rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-ink">
                        {g.meetingDay}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{g.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )
        }

        if (block.type === "announcements") {
          return (
            <section key={block.id} id="news" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <SectionHeading
                icon={<Megaphone className="size-4" strokeWidth={1.75} />}
                title={block.title || "Announcements"}
              />
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
          )
        }

        if (block.type === "newsletter") {
          return (
            <div key={block.id} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <NewsletterBlock slug={slug} block={block} />
            </div>
          )
        }

        if (block.type === "give_cta" && settings.publicGiving) {
          return (
            <section key={block.id} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-brand-soft px-6 py-8 sm:flex-row sm:items-center sm:px-8">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-brand-ink">
                    {block.title || "Partner in the mission"}
                  </h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-brand-ink/80">
                    {block.subtitle || "Give securely online to support ministry this week."}
                  </p>
                </div>
                <Link
                  href={block.ctaHref || settings.givingUrl}
                  className="inline-flex h-[39px] items-center gap-1.5 rounded-lg bg-accent-cta px-4 text-sm font-medium text-white shadow-xs hover:bg-accent-cta-hover"
                >
                  <HeartHandshake className="size-4" strokeWidth={1.75} />
                  {block.ctaLabel || "Give now"}
                </Link>
              </div>
            </section>
          )
        }

        if (block.type === "custom_text") {
          return (
            <section key={block.id} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="rounded-2xl border border-zinc-200/80 bg-white px-6 py-8 shadow-xs sm:px-8">
                {block.title ? (
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{block.title}</h2>
                ) : null}
                {block.body ? (
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600">{block.body}</p>
                ) : null}
              </div>
            </section>
          )
        }

        return null
      })}
    </>
  )
}
