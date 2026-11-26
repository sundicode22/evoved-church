"use client"

import * as React from "react"
import { Landmark } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RequireAbility } from "@/components/auth/can"
import {
  ColumnCustomize,
  StatusPill,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { useFunds } from "@/features/accounting/hooks/use-funds"
import { formatMoney } from "@/lib/format"

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Fund" },
  { id: "code", label: "Code" },
  { id: "type", label: "Type" },
  { id: "balance", label: "Balance" },
  { id: "encumbered", label: "Encumbered" },
  { id: "available", label: "Available" },
]

function typeLabel(type?: string) {
  if (!type) return "—"
  return type.replaceAll("_", " ")
}

export default function FundsPage() {
  const { data, isLoading } = useFunds()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const rows = data ?? []
  const filtered = rows.filter(
    (f: { name?: string; code?: string }) =>
      !searchQuery.trim() ||
      (f.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.code || "").toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="accounting.read">
          <PageHeader
            title="Funds"
            description="Fund balances from the chart of accounts."
            icon={<Landmark className="size-5 text-brand" strokeWidth={1.75} />}
          />

          <div className="p-6 md:p-8">
            <TablePanel>
              <TableChrome
                search={
                  <TableSearch
                    value={searchQuery}
                    onChange={(v) => {
                      setSearchQuery(v)
                      setPage(1)
                    }}
                    placeholder="Search funds…"
                  />
                }
                trailing={
                  <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {isVisible("name") && <TableHead className="pl-4">Fund</TableHead>}
                    {isVisible("code") && <TableHead>Code</TableHead>}
                    {isVisible("type") && <TableHead>Type</TableHead>}
                    {isVisible("balance") && <TableHead>Balance</TableHead>}
                    {isVisible("encumbered") && <TableHead>Encumbered</TableHead>}
                    {isVisible("available") && <TableHead>Available</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    [0, 1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6} className="pl-4">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                        No funds found.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map(
                    (fund: {
                      id: string
                      name: string
                      code?: string
                      type?: string
                      balance?: number
                      encumberedAmount?: number
                      netAvailable?: number
                    }) => (
                      <TableRow key={fund.id}>
                        {isVisible("name") && (
                          <TableCell className="pl-4 font-medium text-zinc-900">
                            {fund.name}
                          </TableCell>
                        )}
                        {isVisible("code") && (
                          <TableCell>
                            <StatusPill className="font-mono">{fund.code || "—"}</StatusPill>
                          </TableCell>
                        )}
                        {isVisible("type") && (
                          <TableCell>
                            <StatusPill>{typeLabel(fund.type)}</StatusPill>
                          </TableCell>
                        )}
                        {isVisible("balance") && (
                          <TableCell className="tabular-nums font-medium text-zinc-900">
                            {formatMoney(Number(fund.balance || 0))}
                          </TableCell>
                        )}
                        {isVisible("encumbered") && (
                          <TableCell className="tabular-nums text-zinc-600">
                            {formatMoney(Number(fund.encumberedAmount || 0))}
                          </TableCell>
                        )}
                        {isVisible("available") && (
                          <TableCell className="tabular-nums text-zinc-600">
                            {formatMoney(
                              Number(
                                fund.netAvailable ??
                                  Number(fund.balance || 0) - Number(fund.encumberedAmount || 0)
                              )
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </TablePanel>
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
