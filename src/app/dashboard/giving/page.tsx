"use client"

import * as React from "react"
import { File, Mail, Plus, Search } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"

const COLUMNS: ColumnOption[] = [
  { id: "donor", label: "Donor" },
  { id: "fund", label: "Fund" },
  { id: "method", label: "Method" },
  { id: "date", label: "Date" },
  { id: "envelope", label: "Envelope" },
  { id: "amount", label: "Amount" },
  { id: "status", label: "Tax status" },
]

const contributions = [
  {
    id: "tx-1",
    donor: "Brian Robbin",
    fund: "General Operating Fund",
    method: "ACH Direct Bank",
    amount: 1250.0,
    date: "Nov 22, 2024",
    envelope: "#104",
    status: "cleared",
  },
  {
    id: "tx-2",
    donor: "Eleanor Pena",
    fund: "Sanctuary Capital Campaign",
    method: "Online Card (Stripe)",
    amount: 2500.0,
    date: "Nov 21, 2024",
    envelope: "#208",
    status: "cleared",
  },
  {
    id: "tx-3",
    donor: "Jane Cooper",
    fund: "General Operating Fund",
    method: "Sunday Envelope (Check)",
    amount: 500.0,
    date: "Nov 17, 2024",
    envelope: "#312",
    status: "cleared",
  },
  {
    id: "tx-4",
    donor: "Ahmad Fawaid",
    fund: "World Missions",
    method: "Online Card (Recurring)",
    amount: 350.0,
    date: "Nov 15, 2024",
    envelope: "#115",
    status: "cleared",
  },
  {
    id: "tx-5",
    donor: "Kathryn Murphy",
    fund: "Benevolence & Food Pantry",
    method: "Cash Envelope",
    amount: 200.0,
    date: "Nov 17, 2024",
    envelope: "#405",
    status: "cleared",
  },
]

export default function GivingPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const filtered = contributions.filter(
    (tx) =>
      !searchQuery.trim() ||
      tx.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fund.toLowerCase().includes(searchQuery.toLowerCase())
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
        <PageHeader
          title="Offering"
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border-zinc-200 text-xs font-normal shadow-xs"
              >
                <File className="size-3.5" strokeWidth={1.75} />
                Tax statements
              </Button>
              <TableAddButton>
                <Plus className="size-3.5" strokeWidth={1.75} />
                Record Batch
              </TableAddButton>
            </>
          }
        >
          <div className="relative max-w-xs">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search contributions…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="h-8 rounded-lg border-zinc-200 bg-zinc-50 pl-8 text-xs shadow-xs"
            />
          </div>
        </PageHeader>

        <div className="p-6 md:p-8">
          <TablePanel>
            <TableChrome
              trailing={
                <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
              }
            />
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {isVisible("donor") && <TableHead className="pl-4">Donor</TableHead>}
                  {isVisible("fund") && <TableHead>Fund</TableHead>}
                  {isVisible("method") && <TableHead>Method</TableHead>}
                  {isVisible("date") && <TableHead>Date</TableHead>}
                  {isVisible("envelope") && <TableHead>Envelope</TableHead>}
                  {isVisible("amount") && <TableHead>Amount</TableHead>}
                  {isVisible("status") && <TableHead>Tax status</TableHead>}
                  <TableHead className="w-28 text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((tx) => (
                  <TableRow key={tx.id}>
                    {isVisible("donor") && (
                      <TableCell className="pl-4 font-medium text-zinc-900">{tx.donor}</TableCell>
                    )}
                    {isVisible("fund") && (
                      <TableCell>
                        <Badge variant="outline" className="px-2 font-normal text-muted-foreground">
                          {tx.fund}
                        </Badge>
                      </TableCell>
                    )}
                    {isVisible("method") && (
                      <TableCell className="text-zinc-600">{tx.method}</TableCell>
                    )}
                    {isVisible("date") && (
                      <TableCell className="text-zinc-500">{tx.date}</TableCell>
                    )}
                    {isVisible("envelope") && (
                      <TableCell className="font-mono text-zinc-500">{tx.envelope}</TableCell>
                    )}
                    {isVisible("amount") && (
                      <TableCell className="tabular-nums font-medium text-zinc-900">
                        ${tx.amount.toFixed(2)}
                      </TableCell>
                    )}
                    {isVisible("status") && (
                      <TableCell>
                        <StatusPill tone="success">Cleared</StatusPill>
                      </TableCell>
                    )}
                    <TableCell className="pr-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs font-normal text-emerald-700 hover:text-emerald-800"
                      >
                        <Mail className="size-3" strokeWidth={1.75} />
                        Resend
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
