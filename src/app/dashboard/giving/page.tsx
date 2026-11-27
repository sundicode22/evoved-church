"use client"

import * as React from "react"
import { HandCoins, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DateFormField,
  NumberFormField,
  SelectFormField,
  TextFormField,
} from "@/components/form-fields"
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
import { FieldGroup } from "@/components/ui/field"
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
import { TableExportButton } from "@/components/table-export-button"
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
  type GivingContribution,
} from "@/features/giving/schemas"

const todayISO = () => new Date().toISOString().slice(0, 10)

const givingFormSchema = z.object({
  donorDisplayName: z.string().trim().min(1, "Donor name is required"),
  fundId: z.string().min(1, "Fund is required"),
  amount: z
    .number({ error: "Amount is required" })
    .positive("Amount must be greater than 0"),
  method: z.enum(GIVING_METHODS),
  channel: z.enum(GIVING_CHANNELS),
  frequency: z.enum(GIVING_FREQUENCIES),
  contributionDate: z.string().min(1, "Date is required"),
  notes: z.string(),
})

type GivingFormValues = z.infer<typeof givingFormSchema>

const givingDefaults = (
  fundId: string,
  contributionDate = ""
): Partial<GivingFormValues> => ({
  donorDisplayName: "",
  fundId,
  amount: undefined,
  method: "cash_envelope",
  channel: "in_person",
  frequency: "one_time",
  contributionDate,
  notes: "",
})

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

  const defaultFundId = funds?.[0]?.id ?? "fund-1"

  const form = useForm<GivingFormValues>({
    resolver: zodResolver(givingFormSchema),
    defaultValues: givingDefaults(defaultFundId),
  })

  React.useEffect(() => {
    if (sheetOpen) form.reset(givingDefaults(defaultFundId, todayISO()))
  }, [sheetOpen, defaultFundId, form])

  const contributions = data?.contributions ?? []
  const summary = data?.summary ?? { total: 0, inPerson: 0, online: 0, recurring: 0 }

  const filtered = contributions.filter(
    (tx) =>
      !searchQuery.trim() ||
      tx.donorDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fundName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const exportPayload = React.useMemo(
    () => ({
      filename: "giving",
      title: "Giving",
      headers: ["Donor", "Fund", "Method", "Channel", "Date", "Amount", "Status"],
      rows: filtered.map((tx) => [
        tx.donorDisplayName,
        tx.fundName,
        METHOD_LABELS[tx.method] || tx.method,
        tx.channel.replace("_", " "),
        formatDate(tx.contributionDate),
        formatMoney(tx.amount),
        STATUS_LABELS[tx.status] || tx.status,
      ]),
    }),
    [filtered]
  )

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

  function onSubmit(values: GivingFormValues) {
    create.mutate(
      {
        donorDisplayName: values.donorDisplayName,
        fundId: values.fundId,
        amount: values.amount,
        method: values.method,
        channel: values.channel,
        frequency: values.frequency,
        contributionDate: new Date(values.contributionDate).toISOString(),
        notes: values.notes || null,
        isTaxDeductible: true,
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          form.reset(givingDefaults(defaultFundId, ""))
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
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="accounting.read">
          <PageHeader
            title="Offering"
            description="Record contributions and post them to the books."
            icon={<HandCoins className="size-5 text-brand" strokeWidth={1.75} />}
          />

          <div className="space-y-6 p-6 md:p-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border bg-card px-5 py-6 shadow-xs sm:px-6 sm:py-7"
                >
                  <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
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
                    <TableExportButton payload={exportPayload} />
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
                        <TableCell className="pl-4 font-medium text-foreground">
                          {tx.donorDisplayName}
                        </TableCell>
                      )}
                      {isVisible("fund") && (
                        <TableCell>
                          <StatusPill>{tx.fundName}</StatusPill>
                        </TableCell>
                      )}
                      {isVisible("method") && (
                        <TableCell className="text-muted-foreground">
                          {METHOD_LABELS[tx.method]}
                        </TableCell>
                      )}
                      {isVisible("channel") && (
                        <TableCell className="capitalize text-muted-foreground">
                          {tx.channel.replace("_", " ")}
                        </TableCell>
                      )}
                      {isVisible("date") && (
                        <TableCell className="text-zinc-500">
                          {formatDate(tx.contributionDate)}
                        </TableCell>
                      )}
                      {isVisible("amount") && (
                        <TableCell className="tabular-nums font-medium text-foreground">
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle className="font-medium">Add giving</SheetTitle>
                    <SheetDescription>
                      Record a contribution. Posting to the ledger is a separate confirm step.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField
                        control={form.control}
                        name="donorDisplayName"
                        label="Donor name"
                      />
                      <SelectFormField
                        control={form.control}
                        name="fundId"
                        label="Fund"
                        options={
                          fundItems.length
                            ? fundItems
                            : [{ value: "fund-1", label: "General Operating Fund" }]
                        }
                      />
                      <NumberFormField
                        control={form.control}
                        name="amount"
                        label="Amount"
                        min={0.01}
                        step="0.01"
                      />
                      <SelectFormField
                        control={form.control}
                        name="method"
                        label="Method"
                        options={METHOD_ITEMS}
                      />
                      <SelectFormField
                        control={form.control}
                        name="channel"
                        label="Channel"
                        options={CHANNEL_ITEMS}
                      />
                      <SelectFormField
                        control={form.control}
                        name="frequency"
                        label="Frequency"
                        options={FREQUENCY_ITEMS}
                      />
                      <DateFormField
                        control={form.control}
                        name="contributionDate"
                        label="Date"
                      />
                      <TextFormField control={form.control} name="notes" label="Notes" />
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
                    <Button type="submit" variant="primary" disabled={create.isPending}>
                      {create.isPending ? "Saving…" : "Record contribution"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
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
