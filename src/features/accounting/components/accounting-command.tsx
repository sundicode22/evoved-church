"use client"

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Search as Search } from "lucide-react"

type JumpItem = { id: string; label: string; hint?: string }

type AccountingCommandProps = {
  funds: JumpItem[]
  accounts: JumpItem[]
  requisitions: JumpItem[]
  onJump: (kind: "funds" | "budgets" | "requisitions" | "ledger" | "coa", id?: string) => void
  onNewRequisition: () => void
  onExportLedger: () => void
}

/**
 * ⌘K palette for fund accounting — jump to funds, accounts, requisitions, or run actions.
 */
export function AccountingCommand({
  funds,
  accounts,
  requisitions,
  onJump,
  onNewRequisition,
  onExportLedger,
}: AccountingCommandProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-xs text-zinc-500"
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5" />
        Jump…
        <Kbd className="ml-1">⌘K</Kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Fund accounting"
        description="Jump to a fund, account, or requisition"
      >
        <Command className="rounded-none border-0">
        <CommandInput placeholder="Search funds, accounts, requisitions…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem
              onSelect={() => {
                onJump("funds")
                setOpen(false)
              }}
            >
              Funds
              <CommandShortcut>1</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onJump("budgets")
                setOpen(false)
              }}
            >
              Budget lines
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onJump("requisitions")
                setOpen(false)
              }}
            >
              Expense requisitions
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onJump("ledger")
                setOpen(false)
              }}
            >
              Journal / ledger
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onJump("coa")
                setOpen(false)
              }}
            >
              Chart of accounts
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                onNewRequisition()
                setOpen(false)
              }}
            >
              New requisition
              <CommandShortcut>⌘ N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                onExportLedger()
                setOpen(false)
              }}
            >
              Export ledger CSV
            </CommandItem>
          </CommandGroup>
          {funds.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Funds">
                {funds.slice(0, 8).map((f) => (
                  <CommandItem
                    key={f.id}
                    value={`fund ${f.label}`}
                    onSelect={() => {
                      onJump("funds", f.id)
                      setOpen(false)
                    }}
                  >
                    {f.label}
                    {f.hint && (
                      <span className="ml-auto text-[10px] text-zinc-400">{f.hint}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {accounts.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Accounts">
                {accounts.slice(0, 8).map((a) => (
                  <CommandItem
                    key={a.id}
                    value={`account ${a.label}`}
                    onSelect={() => {
                      onJump("coa", a.id)
                      setOpen(false)
                    }}
                  >
                    {a.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          {requisitions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Requisitions">
                {requisitions.slice(0, 8).map((r) => (
                  <CommandItem
                    key={r.id}
                    value={`req ${r.label}`}
                    onSelect={() => {
                      onJump("requisitions", r.id)
                      setOpen(false)
                    }}
                  >
                    {r.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
