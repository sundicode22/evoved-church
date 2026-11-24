"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublishedBlogPost } from "@/features/blog/hooks/use-blog"
import { usePortal } from "@/features/portal/hooks/use-portal"

export default function PortalBlogPostPage() {
  const params = useParams<{ slug: string; postSlug: string }>()
  const portalSlug = params.slug
  const postSlug = params.postSlug
  const { data: portal } = usePortal(portalSlug)
  const { data: post, isLoading, error } = usePublishedBlogPost(postSlug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8f6]">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-sm text-zinc-600">Story not found.</p>
        <Link
          href={`/portal/${portalSlug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-hover)]"
        >
          <ArrowLeft className="size-3.5" />
          Back to portal
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <header className="border-b border-zinc-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href={`/portal/${portalSlug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="size-3.5" />
            {portal?.settings.churchName || "Portal"}
          </Link>
          <span className="inline-flex items-center gap-1 text-xs font-medium tracking-wide text-[var(--brand-hover)] uppercase">
            <BookOpen className="size-3.5" />
            Story
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-[var(--brand-hover)]">
          {post.authorName}
          {post.publishedAt
            ? ` · ${format(parseISO(post.publishedAt), "MMMM d, yyyy")}`
            : ""}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-3 text-lg text-zinc-600">{post.excerpt}</p>
        ) : null}

        {post.coverImageUrl ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200/80 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt=""
              className="aspect-[21/9] w-full object-cover"
            />
          </div>
        ) : null}

        <div
          className="prose prose-zinc mt-10 max-w-none prose-headings:tracking-tight prose-a:text-[var(--brand-hover)] prose-img:rounded-xl prose-img:border prose-img:border-zinc-200/80 prose-img:shadow-xs"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />

        <div className="mt-12 border-t border-zinc-200 pt-6">
          <Link
            href={`/portal/${portalSlug}#stories`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-hover)] hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            More stories
          </Link>
        </div>
      </article>
    </div>
  )
}
