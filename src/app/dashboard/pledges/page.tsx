"use client"

import * as React from "react"
import { HeartHandshake, Plus } from "lucide-react"
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
} from "@/features/giving/schemas"

const todayISO = () => new Date().toISOString().slice(0, 10)

const pledgeFormSchema = z.object({
  memberDisplayName: z.string().trim().min(1, "Member name is required"),
  fundId: z.string().min(1, "Fund is required"),
  amountTotal: z
    .number({ error: "Total pledged is required" })
    .positive("Amount must be greater than 0"),
  frequency: z.enum(PLEDGE_FREQUENCIES),
  startDate: z.string().min(1, "Start date is required"),
})

type PledgeFormValues = z.infer<typeof pledgeFormSchema>

const pledgeDefaults = (fundId: string, startDate = ""): Partial<PledgeFormValues> => ({
  memberDisplayName: "",
  fundId,
  amountTotal: undefined,
  frequency: "monthly",
  startDate,
})

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

  const defaultFundId = funds?.[0]?.id ?? "fund-1"

  const form = useForm<PledgeFormValues>({
    resolver: zodResolver(pledgeFormSchema),
    defaultValues: pledgeDefaults(defaultFundId),
  })

  React.useEffect(() => {
    if (sheetOpen) form.reset(pledgeDefaults(defaultFundId, todayISO()))
  }, [sheetOpen, defaultFundId, form])

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

  function onSubmit(values: PledgeFormValues) {
    create.mutate(
      {
        memberId: `mem-pledge-${crypto.randomUUID().slice(0, 8)}`,
        memberDisplayName: values.memberDisplayName,
        fundId: values.fundId,
        fundName: fundItems.find((f) => f.value === values.fundId)?.label,
        amountTotal: values.amountTotal,
        frequency: values.frequency,
        startDate: new Date(values.startDate).toISOString(),
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          form.reset(pledgeDefaults(defaultFundId))
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle className="font-medium">New pledge</SheetTitle>
                    <SheetDescription>
                      Capture a member’s pledged amount toward a fund.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField
                        control={form.control}
                        name="memberDisplayName"
                        label="Member name"
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
                        name="amountTotal"
                        label="Total pledged"
                        min={0.01}
                        step="0.01"
                      />
                      <SelectFormField
                        control={form.control}
                        name="frequency"
                        label="Frequency"
                        options={FREQUENCY_ITEMS}
                      />
                      <DateFormField
                        control={form.control}
                        name="startDate"
                        label="Start date"
                      />
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
                      {create.isPending ? "Saving…" : "Create pledge"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
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
