"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

/**
 * Slim shell bar from shadcn sidebar-07: trigger, breadcrumb, optional actions.
 * Page title blocks and descriptions stay out of this bar.
 */
export function PageHeader({
  title,
  actions,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <Breadcrumb>
            <BreadcrumbList className="text-sm text-zinc-800">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink render={<Link href="/dashboard" />}>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2 pr-4">{actions}</div>
        ) : null}
      </header>
      {children ? <div className="px-4 pt-4 lg:px-6">{children}</div> : null}
    </>
  )
}
