"use client"

import * as React from "react"
import { Layers, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmAction } from "@/components/confirm-action"
import { Can, RequireAbility } from "@/components/auth/can"
import { RowActionsMenu } from "@/components/row-actions-menu"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import {
  useBatches,
  useCreateBatch,
  useDeleteBatch,
} from "@/features/giving/hooks/use-giving"
import type { GivingBatch } from "@/features/giving/schemas"
import { formatDate, formatMoney } from "@/lib/format"

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Batch" },
  { id: "date", label: "Date" },
  { id: "status", label: "Status" },
  { id: "contributors", label: "Contributors" },
  { id: "total", label: "Total" },
]

export default function BatchesPage() {
  const { data, isLoading } = useBatches()
  const create = useCreateBatch()
  const remove = useDeleteBatch()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<GivingBatch | null>(null)

  const [name, setName] = React.useState("")
  const [batchDate, setBatchDate] = React.useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = React.useState("")
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const rows = data ?? []
  const filtered = rows.filter(
    (b) =>
      !searchQuery.trim() ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(
      {
        name,
        batchDate: new Date(batchDate).toISOString(),
        notes: notes || null,
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          setName("")
          setNotes("")
          setBatchDate(new Date().toISOString().slice(0, 10))
        },
      }
    )
  }

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
            title="Batches"
            description="Group envelope and deposit contributions for counting."
            icon={<Layers className="size-5 text-brand" strokeWidth={1.75} />}
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
                    placeholder="Search batches…"
                  />
                }
                trailing={
                  <>
                    <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                    <Can permission="accounting.journal.post">
                      <TableAddButton onClick={() => setSheetOpen(true)}>
                        <Plus className="size-3.5" strokeWidth={1.75} />
                        New batch
                      </TableAddButton>
                    </Can>
                  </>
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {isVisible("name") && <TableHead className="pl-4">Batch</TableHead>}
                    {isVisible("date") && <TableHead>Date</TableHead>}
                    {isVisible("status") && <TableHead>Status</TableHead>}
                    {isVisible("contributors") && <TableHead>Contributors</TableHead>}
                    {isVisible("total") && <TableHead>Total</TableHead>}
                    <TableHead className="w-10" />
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
                        No batches yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map((batch) => (
                    <TableRow key={batch.id}>
                      {isVisible("name") && (
                        <TableCell className="pl-4">
                          <div className="font-medium text-zinc-900">{batch.name}</div>
                          {batch.notes && (
                            <div className="mt-0.5 text-xs text-zinc-500">{batch.notes}</div>
                          )}
                        </TableCell>
                      )}
                      {isVisible("date") && (
                        <TableCell className="text-zinc-500">
                          {formatDate(batch.batchDate)}
                        </TableCell>
                      )}
                      {isVisible("status") && (
                        <TableCell>
                          <StatusPill tone={batch.status === "open" ? "success" : "neutral"}>
                            {batch.status}
                          </StatusPill>
                        </TableCell>
                      )}
                      {isVisible("contributors") && (
                        <TableCell className="tabular-nums text-zinc-600">
                          {batch.uniqueContributors}
                        </TableCell>
                      )}
                      {isVisible("total") && (
                        <TableCell className="tabular-nums font-medium text-zinc-900">
                          {formatMoney(batch.totalAmount)}
                        </TableCell>
                      )}
                      <TableCell className="pr-3 text-right">
                        <RowActionsMenu
                          groups={[
                            {
                              items: [
                                {
                                  label: "Delete",
                                  onClick: () => setDeleteTarget(batch),
                                  destructive: true,
                                },
                              ],
                            },
                          ]}
                        />
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

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">New batch</SheetTitle>
                  <SheetDescription>
                    Create a counting batch for Sunday envelopes or online deposits.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-9 text-sm"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Batch date</FieldLabel>
                      <Input
                        type="date"
                        value={batchDate}
                        onChange={(e) => setBatchDate(e.target.value)}
                        className="h-9 text-sm"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Notes</FieldLabel>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9"
                    onClick={() => setSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={create.isPending}
                  >
                    {create.isPending ? "Saving…" : "Create batch"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete batch"
            description={
              deleteTarget
                ? `Remove “${deleteTarget.name}”? Contributions stay recorded but lose this batch link.`
                : null
            }
            confirmLabel="Delete"
            variant="destructive"
            loading={remove.isPending}
            onConfirm={async () => {
              if (!deleteTarget) return
              await remove.mutateAsync(deleteTarget.id)
              setDeleteTarget(null)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
