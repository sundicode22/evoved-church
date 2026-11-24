"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CampusSwitcher } from "@/components/campus-switcher"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  HierarchySquare02Icon,
  UserGroupIcon,
  Calendar03Icon,
  Task01Icon,
  Megaphone01Icon,
  Coins01Icon,
  Invoice01Icon,
  Folder01Icon,
  Settings05Icon,
  Mail01Icon,
  UserCircle02Icon,
  ChartHistogramIcon,
  ChurchIcon,
  UserAdd01Icon,
  FileValidationIcon,
} from "@hugeicons/core-free-icons"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { useNomenclatureQuery } from "@/features/settings/hooks/use-nomenclature-api"
import { useAbility } from "@/features/auth/ability-context"
import { NAV_PERMISSION } from "@/features/auth/permissions-catalog"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  useNomenclatureQuery()
  const { nomenclature } = useNomenclatureStore()
  const { canAny } = useAbility()

  const dashboardItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: DashboardSquare01Icon,
    },
    {
      title: `${nomenclature.visitorTermSingular} Pipeline`,
      url: "/dashboard/visitors",
      icon: UserAdd01Icon,
      badge: "32",
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments",
      icon: Calendar03Icon,
    },
    {
      title: "Sunday Services",
      url: "/dashboard/sunday-services",
      icon: ChurchIcon,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: Task01Icon,
    },
  ]

  const managementItems = [
    {
      title: "Organigram & Structure",
      url: "/dashboard/organigram",
      icon: HierarchySquare02Icon,
    },
    {
      title: `${nomenclature.memberTermPlural} & Families`,
      url: "/dashboard/members",
      icon: UserGroupIcon,
    },
    {
      title: nomenclature.groupTermPlural,
      url: "/dashboard/groups",
      icon: UserCircle02Icon,
    },
    {
      title: "Fund Accounting",
      url: "/dashboard/accounting",
      icon: Invoice01Icon,
    },
    {
      title: nomenclature.givingTerm,
      url: "/dashboard/giving",
      icon: Coins01Icon,
    },
    {
      title: "Documents",
      url: "/dashboard/documents",
      icon: Folder01Icon,
    },
    {
      title: "Policies",
      url: "/dashboard/policies",
      icon: FileValidationIcon,
    },
    {
      title: "Campaigns",
      url: "/dashboard/campaigns",
      icon: Megaphone01Icon,
    },
    {
      title: "Communications",
      url: "/dashboard/communications",
      icon: Mail01Icon,
    },
    {
      title: "Metrics & Reports",
      url: "/dashboard/metrics",
      icon: ChartHistogramIcon,
    },
    {
      title: "Settings & RBAC",
      url: "/dashboard/settings",
      icon: Settings05Icon,
    },
  ]

  const currentUser = {
    name: "Ahmad Fawaid",
    email: "Grace City Main Campus",
    avatar: "/avatars/ahmad.jpg",
  }

  function isAllowed(url: string) {
    const required = NAV_PERMISSION[url]
    if (!required) return true
    return canAny(Array.isArray(required) ? required : [required])
  }

  const visibleDashboardItems = dashboardItems.filter((i) => isAllowed(i.url))
  const visibleManagementItems = managementItems.filter((i) => isAllowed(i.url))

  function isActive(url: string) {
    if (url === "/dashboard") return pathname === "/dashboard"
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200/80 bg-white dark:bg-zinc-950" {...props}>
      <SidebarHeader className="p-3 border-b border-zinc-100 dark:border-zinc-900">
        <CampusSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {visibleDashboardItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                      className={`h-9 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-between ${
                        active
                          ? "bg-[#eaf5ea] text-[#1b5e20] dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <HugeiconsIcon
                          icon={item.icon}
                          strokeWidth={active ? 2.2 : 1.8}
                          className={`size-4 ${active ? "text-[#1b5e20] dark:text-emerald-300" : "text-zinc-500"}`}
                        />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {visibleManagementItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                      className={`h-9 px-3 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-[#eaf5ea] text-[#1b5e20] font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4 text-zinc-500" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-zinc-100 dark:border-zinc-900">
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
