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
  Coins01Icon,
  Invoice01Icon,
  Folder01Icon,
  Settings05Icon,
  Mail01Icon,
  UserCircle02Icon,
  ChartHistogramIcon,
  ChurchIcon,
} from "@hugeicons/core-free-icons"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const dashboardItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: DashboardSquare01Icon,
      isActive: false,
    },
    {
      title: "Deals Pipeline",
      url: "/dashboard/pipeline",
      icon: Coins01Icon,
      badge: "32",
      isActive: true, // Default active matching screenshot
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments",
      icon: Calendar03Icon,
      isActive: false,
    },
    {
      title: "Sunday Services",
      url: "/dashboard/services",
      icon: ChurchIcon,
      isActive: false,
    },
    {
      title: "Tasks",
      url: "/dashboard/tasks",
      icon: Task01Icon,
      isActive: false,
    },
  ]

  const managementItems = [
    {
      title: "Organigram & Structure",
      url: "/dashboard/organigram",
      icon: HierarchySquare02Icon,
    },
    {
      title: "Members & Families",
      url: "/dashboard/members",
      icon: UserGroupIcon,
    },
    {
      title: "Small Groups (Cells)",
      url: "/dashboard/groups",
      icon: UserCircle02Icon,
    },
    {
      title: "Fund Accounting",
      url: "/dashboard/accounting",
      icon: Invoice01Icon,
    },
    {
      title: "Giving & Pledges",
      url: "/dashboard/giving",
      icon: Coins01Icon,
    },
    {
      title: "Document Vault",
      url: "/dashboard/vault",
      icon: Folder01Icon,
    },
    {
      title: "Visitor Drip Sequences",
      url: "/dashboard/sequences",
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

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-200/80 bg-white dark:bg-zinc-950" {...props}>
      <SidebarHeader className="p-3 border-b border-zinc-100 dark:border-zinc-900">
        <CampusSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-6">
        {/* DASHBOARD SECTION */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    className={`h-9 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-between ${
                      item.isActive
                        ? "bg-[#eaf5ea] text-[#1b5e20] dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <HugeiconsIcon
                        icon={item.icon}
                        strokeWidth={item.isActive ? 2.2 : 1.8}
                        className={`size-4 ${item.isActive ? "text-[#1b5e20] dark:text-emerald-300" : "text-zinc-500"}`}
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MANAGEMENT SECTION */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    className="h-9 px-3 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4 text-zinc-500" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
