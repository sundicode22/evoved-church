"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, ChevronsUpDown, CreditCard, LogOut, UserCircle } from "lucide-react"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { ConfirmAction } from "@/components/confirm-action"
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/features/auth/auth-client"
import { clearOnboardingCompletedCookie } from "@/features/onboarding/cookie"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function confirmLogout() {
    setLoggingOut(true)
    try {
      clearOnboardingCompletedCookie()
      const { error } = await signOut({
        fetchOptions: {
          credentials: "include",
        },
      })
      if (error) {
        toast.error(error.message || "Could not log out. Try again.")
        return
      }
      toast.success("Signed out")
      router.replace("/login")
      router.refresh()
    } catch {
      toast.error("Could not log out. Try again.")
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-brand-soft text-brand-ink">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{initials || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/dashboard/account" />}>
                <UserCircle className="size-4" strokeWidth={1.75} />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/settings?tab=billing" />}>
                <CreditCard className="size-4" strokeWidth={1.75} />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/settings?tab=integrations" />}>
                <Bell className="size-4" strokeWidth={1.75} />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={loggingOut}
              onClick={() => {
                // Open confirm after the menu finishes closing so the dialog is usable
                window.setTimeout(() => setLogoutOpen(true), 0)
              }}
            >
              <LogOut className="size-4" strokeWidth={1.75} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <ConfirmAction
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You will need to sign in again to open the church workspace."
        confirmLabel="Log out"
        variant="destructive"
        loading={loggingOut}
        onConfirm={confirmLogout}
      />
    </SidebarMenu>
  )
}
