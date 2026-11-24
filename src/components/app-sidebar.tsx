"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Church, Coins, Megaphone, Settings, Users } from "lucide-react"
import { CampusSwitcher } from "@/components/campus-switcher"
import { NavUser } from "@/components/nav-user"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  useNomenclatureQuery()
  const { nomenclature } = useNomenclatureStore()
  const { canAny } = useAbility()

  const groups: NavGroup[] = [
    {
      title: "Church",
      icon: Church,
      items: [
        { title: "Dashboard", url: "/dashboard" },
        {
          title: `${nomenclature.visitorTermSingular} pipeline`,
          url: "/dashboard/visitors",
        },
        { title: "Appointments", url: "/dashboard/appointments" },
        { title: "Services", url: "/dashboard/services" },
        { title: "Calendar", url: "/dashboard/calendar" },
        { title: "Projects", url: "/dashboard/projects" },
      ],
    },
    {
      title: "People",
      icon: Users,
      items: [
        { title: "Organigram", url: "/dashboard/organigram" },
        {
          title: `${nomenclature.memberTermPlural}`,
          url: "/dashboard/members",
        },
        { title: nomenclature.groupTermPlural, url: "/dashboard/groups" },
      ],
    },
    {
      title: "Stewardship",
      icon: Coins,
      items: [
        { title: "Fund", url: "/dashboard/accounting" },
        { title: "Offering", url: "/dashboard/giving" },
        { title: "Metrics", url: "/dashboard/metrics" },
      ],
    },
    {
      title: "Ministry",
      icon: Megaphone,
      items: [
        { title: "Documents", url: "/dashboard/documents" },
        { title: "Policies", url: "/dashboard/policies" },
        { title: "Campaigns", url: "/dashboard/campaigns" },
        { title: "Communications", url: "/dashboard/communications" },
      ],
    },
  ]

  function isAllowed(url: string) {
    const required = NAV_PERMISSION[url]
    if (!required) return true
    return canAny(Array.isArray(required) ? required : [required])
  }

  function isActive(url: string) {
    if (url === "/dashboard") return pathname === "/dashboard"
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isAllowed(item.url)),
    }))
    .filter((group) => group.items.length > 0)

  const currentUser = {
    name: "Ahmad Fawaid",
    email: "Grace City Main Campus",
    avatar: "/avatars/ahmad.jpg",
  }

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader>
        <CampusSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {visibleGroups.map((group) => (
              <NavCollapsible
                key={group.title}
                group={group}
                isActive={isActive}
              />
            ))}
            {isAllowed("/dashboard/settings") ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/settings" />}
                  tooltip="Settings"
                  isActive={isActive("/dashboard/settings")}
                >
                  <Settings />
                  <span>Settings</span>
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
  const openByRoute = group.items.some((item) => isActive(item.url))
  const [open, setOpen] = React.useState(openByRoute)
  const Icon = group.icon

  React.useEffect(() => {
    if (openByRoute) setOpen(true)
  }, [openByRoute])

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={<SidebarMenuButton tooltip={group.title} />}
        >
          <Icon />
          <span>{group.title}</span>
          <ChevronRight
            className={`ml-auto transition-transform duration-200 ${open ? "rotate-90" : ""}`}
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
