"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { toast } from "sonner"

const CATEGORY_META: Record<
  string,
  { label: string; hint: string; range: string }
> = {
  asset: {
    label: "Assets",
    hint: "Cash, receivables, and other resources the church controls.",
    range: "1000s",
  },
  liability: {
    label: "Liabilities",
    hint: "Amounts owed — payables, deferred revenue, notes.",
    range: "2000s",
  },
  net_assets: {
    label: "Net Assets",
    hint: "Unrestricted and restricted equity after liabilities.",
    range: "3000s",
  },
  revenue: {
    label: "Revenue",
    hint: "Tithes, offerings, pledges, and other income.",
    range: "4000s",
  },
  expense: {
    label: "Expenses",
    hint: "Ministry, facilities, payroll, and program spending.",
    range: "5000s",
  },
}

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type CoaAccount = {
  id?: string
  accountNumber: string
  accountName: string
  category: string
  balance?: number
  description?: string
}

export function ChartOfAccountsAccordion({ accounts }: { accounts: CoaAccount[] }) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, CoaAccount[]>()
    for (const a of accounts) {
      const key = a.category || "other"
      map.set(key, [...(map.get(key) || []), a])
    }
    const order = ["asset", "liability", "net_assets", "revenue", "expense"]
    return [...map.entries()].sort(
      (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
    )
  }, [accounts])

  if (accounts.length === 0) {
    return (
      <Empty className="border border-dashed border-zinc-200 py-12">
        <EmptyHeader>
          <EmptyTitle>No accounts yet</EmptyTitle>
          <EmptyDescription>
            Seed or import a chart of accounts to post journal activity.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea className="max-h-[640px]">
      <Accordion
        multiple
        defaultValue={grouped.map(([c]) => c)}
        className="rounded-none border-0"
      >
        {grouped.map(([category, rows]) => {
          const meta = CATEGORY_META[category] || {
            label: category.replace(/_/g, " "),
            hint: "General ledger accounts in this class.",
            range: "—",
          }
          const subtotal = rows.reduce((s, r) => s + Number(r.balance || 0), 0)
          return (
            <AccordionItem key={category} value={category} className="border-b px-0">
              <AccordionTrigger className="px-5 py-3.5 hover:no-underline">
                <div className="flex w-full items-center justify-between gap-3 pr-2">
                  <div className="flex items-center gap-2 text-left">
                    <HoverCard>
                      <HoverCardTrigger
                        render={
                          <button
                            type="button"
                            className="text-sm font-normal capitalize text-zinc-900 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                      >
                        {meta.label}
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 space-y-1 p-3">
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-zinc-500">{meta.hint}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          Typical range {meta.range}
                        </Badge>
                      </HoverCardContent>
                    </HoverCard>
                    <Badge variant="outline" className="text-[10px] tabular-nums">
                      {rows.length}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-zinc-600">
                    ${money(subtotal)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f8faf9] hover:bg-[#f8faf9]">
                      <TableHead className="px-5 text-xs">Account #</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Class</TableHead>
                      <TableHead className="text-right text-xs">Balance</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((acct) => (
                      <TableRow key={acct.id || acct.accountNumber}>
                        <TableCell className="px-5 font-mono text-xs text-emerald-700">
                          <HoverCard>
                            <HoverCardTrigger
                              render={
                                <button
                                  type="button"
                                  className="underline-offset-2 hover:underline"
                                />
                              }
                            >
                              {acct.accountNumber}
                            </HoverCardTrigger>
                            <HoverCardContent className="w-60 space-y-1 p-3">
                              <p className="text-sm font-medium">{acct.accountName}</p>
                              <p className="text-xs text-zinc-500">
                                {acct.description ||
                                  `${meta.label} account used for fund accounting journals.`}
                              </p>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{acct.accountName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {category.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {acct.balance != null ? `$${money(Number(acct.balance))}` : "—"}
                        </TableCell>
                        <TableCell className="pr-3">
                          <RowActionsMenu
                            label="Account"
                            groups={[
                              {
                                items: [
                                  {
                                    label: "View activity",
                                    shortcut: "↵",
                                    onClick: () =>
                                      toast.message(`Ledger filter: ${acct.accountNumber}`),
                                  },
                                  {
                                    label: "Copy account #",
                                    shortcut: "⌘ C",
                                    onClick: () => {
                                      void navigator.clipboard.writeText(acct.accountNumber)
                                      toast.success("Account number copied")
                                    },
                                  },
                                ],
                              },
                            ]}
                            submenu={{
                              label: "Use in…",
                              items: [
                                {
                                  label: "New requisition",
                                  onClick: () => toast.message("Open requisition with this account"),
                                },
                                {
                                  label: "Journal line",
                                  onClick: () => toast.message("Add as journal line"),
                                },
                              ],
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </ScrollArea>
  )
}
