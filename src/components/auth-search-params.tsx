"use client"

import * as React from "react"

/** Next.js requires a Suspense boundary around `useSearchParams` pages. */
export function AuthSearchParamsFallback() {
  return (
    <div className="w-full rounded-2xl border border-zinc-200/60 bg-white p-6 shadow-xs">
      <div className="mx-auto h-6 w-40 animate-pulse rounded bg-zinc-100" />
      <div className="mx-auto mt-3 h-4 w-56 animate-pulse rounded bg-zinc-50" />
      <div className="mt-6 space-y-3">
        <div className="h-10 animate-pulse rounded-lg bg-zinc-50" />
        <div className="h-10 animate-pulse rounded-lg bg-zinc-50" />
        <div className="h-10 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </div>
  )
}
