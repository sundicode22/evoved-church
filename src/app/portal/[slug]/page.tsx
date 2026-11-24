"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { CalendarDays, HeartHandshake, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePortal } from "@/features/portal/hooks/use-portal"

export default function MemberPortalPage() {
  const params = useParams<{ slug: string }>()
  const { data, isLoading, error } = usePortal(params.slug)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-zinc-600">
        Portal not found.
      </div>
    )
  }

  const { settings, events, groups, announcements } = data

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <header className="border-b border-zinc-200/80 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#16a34a]">
              Member portal
            </p>
            <h1 className="text-2xl font-medium text-zinc-900">{settings.churchName}</h1>
          </div>
          {settings.publicGiving && (
            <Button
              asChild
              className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
            >
              <Link href={settings.givingUrl}>
                <HeartHandshake className="mr-1.5 size-4" strokeWidth={1.75} />
                Give
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
        {settings.publicEvents && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="size-4 text-[#16a34a]" strokeWidth={1.75} />
              <h2 className="text-sm font-medium text-zinc-900">Upcoming events</h2>
            </div>
            <ul className="space-y-2">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-zinc-200/80 bg-white px-4 py-3 shadow-xs"
                >
                  <p className="text-sm font-medium text-zinc-900">{e.title}</p>
                  <p className="text-xs text-zinc-500">
                    {format(parseISO(e.startsAt), "EEE, MMM d · h:mm a")}
                    {e.locationLabel ? ` · ${e.locationLabel}` : ""}
                  </p>
                </li>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-zinc-400">No upcoming events.</p>
              )}
            </ul>
          </section>
        )}

        {settings.publicGroups && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-4 text-[#16a34a]" strokeWidth={1.75} />
              <h2 className="text-sm font-medium text-zinc-900">Groups</h2>
            </div>
            <ul className="space-y-2">
              {groups.map((g) => (
                <li
                  key={g.id}
                  className="rounded-lg border border-zinc-200/80 bg-white px-4 py-3 shadow-xs"
                >
                  <p className="text-sm font-medium text-zinc-900">{g.name}</p>
                  <p className="text-xs text-zinc-500">{g.meetingDay}</p>
                  <p className="mt-1 text-xs text-zinc-400">{g.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-900">Announcements</h2>
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-zinc-200/80 bg-white px-4 py-3 shadow-xs"
              >
                <p className="text-sm font-medium text-zinc-900">{a.title}</p>
                <div
                  className="prose prose-sm mt-1 max-w-none text-zinc-600"
                  dangerouslySetInnerHTML={{ __html: a.bodyHtml }}
                />
              </li>
            ))}
            {announcements.length === 0 && (
              <p className="text-xs text-zinc-400">No announcements yet.</p>
            )}
          </ul>
        </section>
      </main>
    </div>
  )
}
