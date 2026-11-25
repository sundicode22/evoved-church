"use client"

import * as React from "react"
import { HandCoins, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  useContributions,
  useCreateContribution,
  usePostContribution,
} from "@/features/giving/hooks/use-giving"
import { useFunds } from "@/features/accounting/hooks/use-funds"
import {
  GIVING_CHANNELS,
  GIVING_FREQUENCIES,
  GIVING_METHODS,
  METHOD_LABELS,
  STATUS_LABELS,
  type GivingChannel,
  type GivingContribution,
  type GivingFrequency,
  type GivingMethod,
} from "@/features/giving/schemas"

const COLUMNS: ColumnOption[] = [
  { id: "donor", label: "Donor" },
  { id: "fund", label: "Fund" },
  { id: "method", label: "Method" },
  { id: "channel", label: "Channel" },
  { id: "date", label: "Date" },
  { id: "amount", label: "Amount" },
  { id: "status", label: "Status" },
]

const METHOD_ITEMS = GIVING_METHODS.map((value) => ({
  value,
  label: METHOD_LABELS[value],
}))
const CHANNEL_ITEMS = GIVING_CHANNELS.map((value) => ({
  value,
  label: value === "in_person" ? "In person" : "Online",
}))
const FREQUENCY_ITEMS = GIVING_FREQUENCIES.map((value) => ({
  value,
  label: value === "one_time" ? "One-time" : "Recurring",
}))

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n)
}

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function statusTone(status: GivingContribution["status"]) {
  if (status === "posted_to_ledger") return "success" as const
  if (status === "draft") return "neutral" as const
  return "info" as const
}

export default function GivingPage() {
  const { data, isLoading } = useContributions()
  const { data: funds } = useFunds()
  const create = useCreateContribution()
  const post = usePostContribution()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [postTarget, setPostTarget] = React.useState<GivingContribution | null>(null)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const [donorDisplayName, setDonorDisplayName] = React.useState("")
  const [fundId, setFundId] = React.useState("fund-1")
  const [amount, setAmount] = React.useState("")
  const [method, setMethod] = React.useState<GivingMethod>("cash_envelope")
  const [channel, setChannel] = React.useState<GivingChannel>("in_person")
  const [frequency, setFrequency] = React.useState<GivingFrequency>("one_time")
  const [contributionDate, setContributionDate] = React.useState(
    () => new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (funds?.[0]?.id && fundId === "fund-1") setFundId(funds[0].id)
  }, [funds, fundId])

  const contributions = data?.contributions ?? []
  const summary = data?.summary ?? { total: 0, inPerson: 0, online: 0, recurring: 0 }

  const filtered = contributions.filter(
    (tx) =>
      !searchQuery.trim() ||
      tx.donorDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fundName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const fundItems = (funds ?? []).map((f: { id: string; name: string }) => ({
    value: f.id,
    label: f.name,
  }))

  const cards = [
    { label: "Total giving", value: summary.total },
    { label: "In person", value: summary.inPerson },
    { label: "Online", value: summary.online },
    { label: "Recurring", value: summary.recurring },
  ]

  function resetForm() {
    setDonorDisplayName("")
    setAmount("")
    setMethod("cash_envelope")
    setChannel("in_person")
    setFrequency("one_time")
    setContributionDate(new Date().toISOString().slice(0, 10))
    setNotes("")
  }

  function submitCreate(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return
    create.mutate(
      {
        donorDisplayName,
        fundId,
        amount: parsedAmount,
        method,
        channel,
        frequency,
        contributionDate: new Date(contributionDate).toISOString(),
        notes: notes || null,
        isTaxDeductible: true,
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          resetForm()
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
            title="Offering"
            description="Record contributions and post them to the books."
            icon={<HandCoins className="size-5 text-[var(--brand)]" strokeWidth={1.75} />}
          />

          <div className="space-y-6 p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-zinc-200/80 bg-white px-4 py-3 shadow-xs"
                >
                  <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                    {card.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-900">
                    {isLoading ? "—" : formatMoney(card.value)}
                  </p>
                </div>
              ))}
            </div>

            <TablePanel>
              <TableChrome
                search={
                  <TableSearch
                    value={searchQuery}
                    onChange={(v) => {
                      setSearchQuery(v)
                      setPage(1)
                    }}
                    placeholder="Search contributions…"
                  />
                }
                trailing={
                  <>
                    <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                    <Can permission="accounting.journal.post">
                      <TableAddButton onClick={() => setSheetOpen(true)}>
                        <Plus className="size-3.5" strokeWidth={1.75} />
                        Add giving
                      </TableAddButton>
                    </Can>
                  </>
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {isVisible("donor") && <TableHead className="pl-4">Donor</TableHead>}
                    {isVisible("fund") && <TableHead>Fund</TableHead>}
                    {isVisible("method") && <TableHead>Method</TableHead>}
                    {isVisible("channel") && <TableHead>Channel</TableHead>}
                    {isVisible("date") && <TableHead>Date</TableHead>}
                    {isVisible("amount") && <TableHead>Amount</TableHead>}
                    {isVisible("status") && <TableHead>Status</TableHead>}
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    [0, 1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8} className="pl-4">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-sm text-zinc-500">
                        No contributions yet. Record your first gift.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map((tx) => (
                    <TableRow key={tx.id}>
                      {isVisible("donor") && (
                        <TableCell className="pl-4 font-medium text-zinc-900">
                          {tx.donorDisplayName}
                        </TableCell>
                      )}
                      {isVisible("fund") && (
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="px-2 font-normal text-muted-foreground"
                          >
                            {tx.fundName}
                          </Badge>
                        </TableCell>
                      )}
                      {isVisible("method") && (
                        <TableCell className="text-zinc-600">
                          {METHOD_LABELS[tx.method]}
                        </TableCell>
                      )}
                      {isVisible("channel") && (
                        <TableCell className="capitalize text-zinc-600">
                          {tx.channel.replace("_", " ")}
                        </TableCell>
                      )}
                      {isVisible("date") && (
                        <TableCell className="text-zinc-500">
                          {formatDate(tx.contributionDate)}
                        </TableCell>
                      )}
                      {isVisible("amount") && (
                        <TableCell className="tabular-nums font-medium text-zinc-900">
                          {formatMoney(tx.amount)}
                        </TableCell>
                      )}
                      {isVisible("status") && (
                        <TableCell>
                          <StatusPill tone={statusTone(tx.status)}>
                            {STATUS_LABELS[tx.status]}
                          </StatusPill>
                        </TableCell>
                      )}
                      <TableCell className="pr-3 text-right">
                        <RowActionsMenu
                          groups={[
                            {
                              items: [
                                ...(tx.status !== "posted_to_ledger"
                                  ? [
                                      {
                                        label: "Post to books",
                                        onClick: () => setPostTarget(tx),
                                      },
                                    ]
                                  : []),
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
              <form onSubmit={submitCreate} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">Add giving</SheetTitle>
                  <SheetDescription>
                    Record a contribution. Posting to the ledger is a separate confirm step.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Donor name</FieldLabel>
                      <Input
                        value={donorDisplayName}
                        onChange={(e) => setDonorDisplayName(e.target.value)}
                        className="h-9 text-sm"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Fund</FieldLabel>
                      <Select
                        value={fundId}
                        items={fundItems.length ? fundItems : [{ value: "fund-1", label: "General Operating Fund" }]}
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
                      <FieldLabel>Amount</FieldLabel>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-9 text-sm"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Method</FieldLabel>
                      <Select
                        value={method}
                        items={METHOD_ITEMS}
                        onValueChange={(v) => v && setMethod(v as GivingMethod)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METHOD_ITEMS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Channel</FieldLabel>
                      <Select
                        value={channel}
                        items={CHANNEL_ITEMS}
                        onValueChange={(v) => v && setChannel(v as GivingChannel)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANNEL_ITEMS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Frequency</FieldLabel>
                      <Select
                        value={frequency}
                        items={FREQUENCY_ITEMS}
                        onValueChange={(v) => v && setFrequency(v as GivingFrequency)}
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
                      <FieldLabel>Date</FieldLabel>
                      <Input
                        type="date"
                        value={contributionDate}
                        onChange={(e) => setContributionDate(e.target.value)}
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
                    {create.isPending ? "Saving…" : "Record contribution"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(postTarget)}
            onOpenChange={(open) => !open && setPostTarget(null)}
            title="Post to books"
            description={
              postTarget
                ? `Post ${formatMoney(postTarget.amount)} from ${postTarget.donorDisplayName} to the ledger. This records who posted and cannot be undone quietly.`
                : null
            }
            confirmLabel="Post to books"
            loading={post.isPending}
            onConfirm={async () => {
              if (!postTarget) return
              await post.mutateAsync({ id: postTarget.id })
              setPostTarget(null)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
