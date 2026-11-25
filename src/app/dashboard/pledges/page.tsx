"use client"

import * as React from "react"
import { HeartHandshake, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
} from "@/components/table-panel"
import {
  useCreatePledge,
  useDeletePledge,
  usePledges,
} from "@/features/giving/hooks/use-giving"
import { useFunds } from "@/features/accounting/hooks/use-funds"
import {
  PLEDGE_FREQUENCIES,
  type GivingPledge,
  type PledgeFrequency,
} from "@/features/giving/schemas"

const FREQUENCY_ITEMS = PLEDGE_FREQUENCIES.map((value) => ({
  value,
  label: value.replace("_", " "),
}))

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n)
}

export default function PledgesPage() {
  const { data, isLoading } = usePledges()
  const { data: funds } = useFunds()
  const create = useCreatePledge()
  const remove = useDeletePledge()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<GivingPledge | null>(null)

  const [memberDisplayName, setMemberDisplayName] = React.useState("")
  const [fundId, setFundId] = React.useState("fund-1")
  const [amountTotal, setAmountTotal] = React.useState("")
  const [frequency, setFrequency] = React.useState<PledgeFrequency>("monthly")
  const [startDate, setStartDate] = React.useState(() => new Date().toISOString().slice(0, 10))

  React.useEffect(() => {
    if (funds?.[0]?.id && fundId === "fund-1") setFundId(funds[0].id)
  }, [funds, fundId])

  const rows = data ?? []
  const filtered = rows.filter(
    (p) =>
      !searchQuery.trim() ||
      p.memberDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fundName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const fundItems = (funds ?? []).map((f: { id: string; name: string }) => ({
    value: f.id,
    label: f.name,
  }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(amountTotal)
    if (!Number.isFinite(amount) || amount <= 0) return
    create.mutate(
      {
        memberId: `mem-pledge-${crypto.randomUUID().slice(0, 8)}`,
        memberDisplayName,
        fundId,
        fundName: fundItems.find((f) => f.value === fundId)?.label,
        amountTotal: amount,
        frequency,
        startDate: new Date(startDate).toISOString(),
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          setMemberDisplayName("")
          setAmountTotal("")
          setFrequency("monthly")
          setStartDate(new Date().toISOString().slice(0, 10))
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
            title="Pledges"
            description="Track pledged giving toward funds and campaigns."
            icon={<HeartHandshake className="size-5 text-brand" strokeWidth={1.75} />}
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
                    placeholder="Search pledges…"
                  />
                }
                trailing={
                  <Can permission="accounting.journal.post">
                    <TableAddButton onClick={() => setSheetOpen(true)}>
                      <Plus className="size-3.5" strokeWidth={1.75} />
                      New pledge
                    </TableAddButton>
                  </Can>
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Member</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Pledged</TableHead>
                    <TableHead>Given</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    [0, 1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="pl-4">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-sm text-zinc-500">
                        No pledges yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map((pledge) => (
                    <TableRow key={pledge.id}>
                      <TableCell className="pl-4 font-medium text-zinc-900">
                        {pledge.memberDisplayName}
                      </TableCell>
                      <TableCell className="text-zinc-600">{pledge.fundName}</TableCell>
                      <TableCell className="capitalize text-zinc-600">
                        {pledge.frequency.replace("_", " ")}
                      </TableCell>
                      <TableCell className="tabular-nums text-zinc-900">
                        {formatMoney(pledge.amountTotal)}
                      </TableCell>
                      <TableCell className="tabular-nums text-zinc-600">
                        {formatMoney(pledge.amountGiven)}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          tone={
                            pledge.status === "active"
                              ? "success"
                              : pledge.status === "cancelled"
                                ? "danger"
                                : "neutral"
                          }
                        >
                          {pledge.status}
                        </StatusPill>
                      </TableCell>
                      <TableCell className="pr-3 text-right">
                        <RowActionsMenu
                          groups={[
                            {
                              items: [
                                {
                                  label: "Delete",
                                  onClick: () => setDeleteTarget(pledge),
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
                  <SheetTitle className="font-medium">New pledge</SheetTitle>
                  <SheetDescription>
                    Capture a member’s pledged amount toward a fund.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Member name</FieldLabel>
                      <Input
                        value={memberDisplayName}
                        onChange={(e) => setMemberDisplayName(e.target.value)}
                        className="h-9 text-sm"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Fund</FieldLabel>
                      <Select
                        value={fundId}
                        items={
                          fundItems.length
                            ? fundItems
                            : [{ value: "fund-1", label: "General Operating Fund" }]
                        }
                        onValueChange={(v) => v && setFundId(v)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(fundItems.length
                            ? fundItems
                            : [{ value: "fund-1", label: "General Operating Fund" }]
                          ).map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Total pledged</FieldLabel>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amountTotal}
                        onChange={(e) => setAmountTotal(e.target.value)}
                        className="h-9 text-sm"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Frequency</FieldLabel>
                      <Select
                        value={frequency}
                        items={FREQUENCY_ITEMS}
                        onValueChange={(v) => v && setFrequency(v as PledgeFrequency)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_ITEMS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Start date</FieldLabel>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 text-sm"
                        required
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
                    {create.isPending ? "Saving…" : "Create pledge"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title="Delete pledge"
            description={
              deleteTarget
                ? `Remove the pledge for ${deleteTarget.memberDisplayName}?`
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
