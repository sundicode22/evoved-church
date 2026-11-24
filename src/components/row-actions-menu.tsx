"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export type RowActionItem = {
  label: string
  onClick: () => void
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
}

export type RowActionGroup = {
  label?: string
  items: RowActionItem[]
}

export type RowActionSubmenu = {
  label: string
  items: RowActionItem[]
}

type RowActionsMenuProps = {
  label?: string
  groups?: RowActionGroup[]
  submenu?: RowActionSubmenu
  footerItems?: RowActionItem[]
}

/**
 * Datatable row "more" menu — groups, optional submenu, shortcuts.
 */
export function RowActionsMenu({
  label = "Actions",
  groups = [],
  submenu,
  footerItems = [],
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 text-zinc-400 hover:text-zinc-700"
            aria-label="Row actions"
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] tracking-wider text-zinc-400 uppercase">
            {label}
          </DropdownMenuLabel>
          {groups.map((g, gi) => (
            <div key={g.label || gi}>
              {gi > 0 && <DropdownMenuSeparator />}
              {g.label && (
                <DropdownMenuLabel className="text-[10px] text-zinc-400">{g.label}</DropdownMenuLabel>
              )}
              {g.items.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  disabled={item.disabled}
                  variant={item.destructive ? "destructive" : undefined}
                  onClick={item.onClick}
                >
                  {item.label}
                  {item.shortcut && (
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </DropdownMenuGroup>

        {submenu && submenu.items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{submenu.label}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {submenu.items.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    disabled={item.disabled}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

        {footerItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {footerItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                disabled={item.disabled}
                variant={item.destructive ? "destructive" : undefined}
                onClick={item.onClick}
              >
                {item.label}
                {item.shortcut && (
                  <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
