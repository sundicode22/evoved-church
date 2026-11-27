"use client"

import * as React from "react"

/** Next.js requires a Suspense boundary around `useSearchParams` pages. */
export function AuthSearchParamsFallback() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
      <div className="mx-auto h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="mx-auto mt-3 h-4 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
