"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  ChevronRight,
  Coins,
  FileText,
  Home,
  Megaphone,
  Settings,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"
import { CampusSwitcher } from "@/components/campus-switcher"
import { NavUser } from "@/components/nav-user"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSession } from "@/features/auth/auth-client"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import { useNomenclatureQuery } from "@/features/settings/hooks/use-nomenclature-api"
import { useAbility } from "@/features/auth/ability-context"
import { NAV_PERMISSION } from "@/features/auth/permissions-catalog"

type SubItem = { title: string; url: string }

type NavGroup = {
  title: string
  icon: LucideIcon
  items: SubItem[]
}

function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-4 shrink-0" strokeWidth={1.75} />
}

export function AppSidebar({
  collapsible = "icon",
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  useNomenclatureQuery()
  const { nomenclature } = useNomenclatureStore()
  const { canAny } = useAbility()

  const groups: NavGroup[] = [
    {
      title: "Workspace",
      icon: Home,
      items: [{ title: "Workspace", url: "/dashboard" }],
    },
    {
      title: "People",
      icon: Users,
      items: [
        { title: "People", url: "/dashboard/members" },
        { title: "Families", url: "/dashboard/families" },
        { title: nomenclature.groupTermPlural, url: "/dashboard/groups" },
        {
          title: `${nomenclature.visitorTermSingular}s`,
          url: "/dashboard/visitors",
        },
        { title: "Organigram", url: "/dashboard/organigram" },
      ],
    },
    {
      title: "Finances",
      icon: Coins,
      items: [
        { title: "Giving", url: "/dashboard/giving" },
        { title: "Funds", url: "/dashboard/funds" },
        { title: "Pledges", url: "/dashboard/pledges" },
        { title: "Batches", url: "/dashboard/batches" },
        { title: "Accounting", url: "/dashboard/accounting" },
        { title: "Financial Settings", url: "/dashboard/settings?tab=integrations" },
      ],
    },
    {
      title: "Calendar",
      icon: Calendar,
      items: [
        { title: "Calendar", url: "/dashboard/calendar" },
        { title: "Services", url: "/dashboard/services" },
        { title: "Attendance", url: "/dashboard/attendance" },
        { title: "Rooms", url: "/dashboard/rooms" },
        { title: "Resources", url: "/dashboard/resources" },
        { title: "Appointments", url: "/dashboard/appointments" },
        { title: "Follow Ups", url: "/dashboard/follow-ups" },
        { title: "Projects", url: "/dashboard/projects" },
      ],
    },
    {
      title: "Communications",
      icon: Megaphone,
      items: [
        { title: "Campaigns", url: "/dashboard/campaigns" },
        { title: "Drips", url: "/dashboard/communications" },
        { title: "Announcements", url: "/dashboard/announcements" },
        { title: "Blog", url: "/dashboard/blog" },
        { title: "Documents", url: "/dashboard/documents" },
        { title: "Policies", url: "/dashboard/policies" },
      ],
    },
    {
      title: "Reports and Metrics",
      icon: TrendingUp,
      items: [
        { title: "Reports", url: "/dashboard/metrics?tab=reports" },
        { title: "Metrics", url: "/dashboard/metrics?tab=metrics" },
        { title: "Audit log", url: "/dashboard/audit" },
      ],
    },
  ]

  function isAllowed(url: string) {
    const path = url.split("?")[0]
    const required = NAV_PERMISSION[path]
    if (!required) return true
    return canAny(Array.isArray(required) ? required : [required])
  }

  function isActive(url: string) {
    const path = url.split("?")[0]
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isAllowed(item.url)),
    }))
    .filter((group) => group.items.length > 0)

  const { data: session } = useSession()
  const currentUser = {
    name: session?.user?.name?.trim() || "Account",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }

  return (
    <Sidebar {...props} collapsible={collapsible}>
      <SidebarHeader>
        <CampusSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {visibleGroups.map((group) =>
              group.items.length === 1 && group.title === "Workspace" ? (
                <SidebarMenuItem key={group.title}>
                  <SidebarMenuButton
                    render={<Link href={group.items[0].url} />}
                    tooltip={group.items[0].title}
                    isActive={isActive(group.items[0].url)}
                  >
                    <NavIcon icon={Home} />
                    <span>{group.items[0].title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <NavCollapsible key={group.title} group={group} isActive={isActive} />
              )
            )}
            {isAllowed("/dashboard/forms") ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/forms" />}
                  tooltip="Forms"
                  isActive={isActive("/dashboard/forms")}
                >
                  <NavIcon icon={FileText} />
                  <span>Forms</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
            {isAllowed("/dashboard/settings") ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/settings" />}
                  tooltip="Church Settings"
                  isActive={isActive("/dashboard/settings")}
                >
                  <NavIcon icon={Settings} />
                  <span>Church Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
            {isAllowed("/dashboard/settings") ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/settings?tab=roles" />}
                  tooltip="Users and Roles"
                >
                  <NavIcon icon={Users} />
                  <span>Users and Roles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavCollapsible({
  group,
  isActive,
}: {
  group: NavGroup
  isActive: (url: string) => boolean
}) {
  const { state, isMobile } = useSidebar()
  const openByRoute = group.items.some((item) => isActive(item.url))
  const [open, setOpen] = React.useState(openByRoute)

  React.useEffect(() => {
    if (openByRoute) setOpen(true)
  }, [openByRoute])

  // Icon rail: flyout to the right (no tooltip on trigger — conflicts with menu).
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                isActive={openByRoute}
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
              />
            }
          >
            <NavIcon icon={group.icon} />
            <span>{group.title}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 min-w-56 rounded-lg p-1"
            side="right"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>{group.title}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {group.items.map((item) => (
                <DropdownMenuItem
                  key={item.url}
                  className={isActive(item.url) ? "bg-brand-soft text-brand-ink" : undefined}
                  render={<Link href={item.url} />}
                >
                  {item.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={<SidebarMenuButton tooltip={group.title} isActive={openByRoute} />}
        >
          <NavIcon icon={group.icon} />
          <span>{group.title}</span>
          <ChevronRight
            className={`ml-auto size-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            strokeWidth={1.75}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  render={<Link href={item.url} />}
                  isActive={isActive(item.url)}
                >
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
