"use client"

import type { PaginationMeta } from "@/lib/axios"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type ServerPaginationProps = {
  meta?: PaginationMeta | null
  onPageChange: (page: number) => void
  className?: string
}

function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "ellipsis")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push("ellipsis")
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push("ellipsis")
  pages.push(total)
  return pages
}

/**
 * Server-driven pagination — pages come from API meta, not client slicing.
 */
export function ServerPagination({ meta, onPageChange, className }: ServerPaginationProps) {
  if (!meta || meta.totalPages <= 1) return null

  const pages = pageWindow(meta.page, meta.totalPages)

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-2 border-t border-zinc-100 px-4 py-3 sm:flex-row sm:justify-between">
        <p className="text-[11px] text-zinc-400 tabular-nums">
          Page {meta.page} of {meta.totalPages} · {meta.total} rows
        </p>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={!meta.hasPrev}
                className={!meta.hasPrev ? "pointer-events-none opacity-40" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  if (meta.hasPrev) onPageChange(meta.page - 1)
                }}
              />
            </PaginationItem>
            {pages.map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === meta.page}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={!meta.hasNext}
                className={!meta.hasNext ? "pointer-events-none opacity-40" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  if (meta.hasNext) onPageChange(meta.page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
