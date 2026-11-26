"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { FieldGroup, FieldSet, FieldLegend } from "@/components/ui/field"
import {
  NumberFormField,
  SelectFormField,
  TextFormField,
  TextareaFormField,
} from "@/components/form-fields"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { ConfirmAction } from "@/components/confirm-action"
import { FileAttachment, type AttachmentFile } from "@/components/file-attachment"
import { TableToolbar } from "@/components/table-toolbar"
import { StatusPill, TablePanel } from "@/components/table-panel"
import { ServerPagination } from "@/components/server-pagination"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { Can, RequireAbility } from "@/components/auth/can"
import { ChartOfAccountsAccordion } from "@/features/accounting/components/coa-accordion"
import { AccountingCommand } from "@/features/accounting/components/accounting-command"
import { downloadCsv } from "@/features/accounting/lib/export-csv"
import {
  useFunds,
  useRequisitions,
  useApproveRequisition,
  useJournalEntries,
  usePostJournalEntry,
  useChartOfAccounts,
  useCreateRequisition,
  useCreateFund,
  useCreateAccount,
  useBudgetLines,
  useCreateBudgetLine,
} from "@/features/accounting/hooks/use-funds"
import {
  createAccountSchema,
  createBudgetLineSchema,
  createFundSchema,
  createRequisitionSchema,
} from "@/features/accounting/schemas"
import { PageHeader } from "@/components/page-header"
import { Coins, Plus, Receipt as Receipt, Shield } from "lucide-react"

function money(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type PendingDecision = {
  id: string
  decision: "approved" | "rejected"
  label: string
}

type TabKey = "funds" | "budgets" | "requisitions" | "ledger" | "coa"

export default function AccountingPage() {
  const [page, setPage] = React.useState(1)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [tab, setTab] = React.useState<TabKey>("funds")

  const { data: fundsData } = useFunds()
  const { data: reqsData, isLoading: reqsLoading } = useRequisitions({
    page,
    pageSize: 10,
    search: searchQuery.trim() || undefined,
  })
  const { data: journalData } = useJournalEntries()
  const { data: coaData } = useChartOfAccounts()
  const { data: budgetLines } = useBudgetLines()
  const approveMutation = useApproveRequisition()
  const postJournal = usePostJournalEntry()
  const createReq = useCreateRequisition()
  const createFund = useCreateFund()
  const createAccount = useCreateAccount()
  const createLine = useCreateBudgetLine()

  const [reqSheetOpen, setReqSheetOpen] = React.useState(false)
  const [fundDialogOpen, setFundDialogOpen] = React.useState(false)
  const [accountSheetOpen, setAccountSheetOpen] = React.useState(false)
  const [lineSheetOpen, setLineSheetOpen] = React.useState(false)
  const [pendingDecision, setPendingDecision] = React.useState<PendingDecision | null>(null)
  const [pendingPostId, setPendingPostId] = React.useState<string | null>(null)
  const [attachments, setAttachments] = React.useState<AttachmentFile[]>([])

  const reqForm = useForm<
    z.input<typeof createRequisitionSchema>,
    unknown,
    z.output<typeof createRequisitionSchema>
  >({
    resolver: zodResolver(createRequisitionSchema),
    defaultValues: {
      fundId: "",
      accountId: "",
      vendorName: "",
      amount: undefined,
      description: "",
      receiptUrl: "",
    },
  })
  const fundForm = useForm<
    z.input<typeof createFundSchema>,
    unknown,
    z.output<typeof createFundSchema>
  >({
    resolver: zodResolver(createFundSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "unrestricted",
      budgetAmount: 0,
      description: "",
    },
  })
  const accountForm = useForm<
    z.input<typeof createAccountSchema>,
    unknown,
    z.output<typeof createAccountSchema>
  >({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      category: "expense",
      description: "",
      openingBalance: 0,
    },
  })
  const lineForm = useForm<
    z.input<typeof createBudgetLineSchema>,
    unknown,
    z.output<typeof createBudgetLineSchema>
  >({
    resolver: zodResolver(createBudgetLineSchema),
    defaultValues: {
      fundId: "",
      label: "",
      department: "",
      allocatedAmount: undefined,
      fiscalYear: undefined,
    },
  })

  const funds = fundsData || []
  const requisitions = reqsData?.data || []
  const pagination = reqsData?.pagination
  const journalEntries = (journalData as any[]) || []
  const chartOfAccounts = (coaData as any[]) || []
  const lines = budgetLines || []

  const totalAvailable = funds.reduce(
    (s: number, f: any) =>
      s + Number(f.netAvailable ?? Number(f.balance) - Number(f.encumberedAmount || 0)),
    0
  )
  const totalEncumbered = funds.reduce(
    (s: number, f: any) => s + Number(f.encumberedAmount || 0),
    0
  )

  const fundItems = funds.map((f: any) => ({
    value: f.id,
    label: `${f.code} — ${f.name}`,
  }))
  const accountItems = chartOfAccounts.map((a: any) => ({
    value: a.id || a.accountNumber,
    label: `${a.accountNumber} — ${a.accountName}`,
  }))

  React.useEffect(() => {
    setPage(1)
  }, [searchQuery])

  function exportRequisitions() {
    downloadCsv(
      "expense-requisitions.csv",
      ["Number", "Vendor", "Purpose", "Amount", "Tier", "Status"],
      requisitions.map((r: any) => [
        r.requisitionNumber,
        r.vendorName,
        r.description,
        r.amount,
        r.currentTierLevel,
        r.status,
      ])
    )
    toast.success("Requisitions exported")
  }

  function exportLedger() {
    downloadCsv(
      "journal-ledger.csv",
      ["Entry", "Memo", "Status", "Created by", "Posted by", "Posted at"],
      journalEntries.map((je: any) => [
        je.entryNumber,
        je.memo,
        je.status,
        je.createdByName || je.createdByUserId || "",
        je.postedByName || je.postedByUserId || "",
        je.postedAt || "",
      ])
    )
    toast.success("Ledger exported")
  }

  function exportBudgetLines() {
    downloadCsv(
      "budget-lines.csv",
      ["Label", "Fund", "Department", "Year", "Allocated"],
      lines.map((l: any) => [
        l.label,
        l.fundName || l.fundId,
        l.department || "",
        l.fiscalYear,
        l.allocatedAmount,
      ])
    )
    toast.success("Budget lines exported")
  }

  function submitRequisition(values: z.output<typeof createRequisitionSchema>) {
    createReq.mutate(
      {
        fundId: values.fundId,
        accountId: values.accountId,
        vendorName: values.vendorName.trim(),
        amount: values.amount,
        description: values.description.trim(),
        receiptUrl: attachments[0]?.url.startsWith("http") ? attachments[0].url : undefined,
      },
      {
        onSuccess: () => {
          setReqSheetOpen(false)
          reqForm.reset()
          setAttachments([])
        },
      }
    )
  }

  function submitFund(values: z.output<typeof createFundSchema>) {
    createFund.mutate(
      {
        ...values,
        name: values.name.trim(),
        code: values.code.trim(),
        description: values.description?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setFundDialogOpen(false)
          fundForm.reset()
        },
      }
    )
  }

  function submitAccount(values: z.output<typeof createAccountSchema>) {
    createAccount.mutate(
      {
        ...values,
        accountName: values.accountName.trim(),
        accountNumber: values.accountNumber.trim(),
        description: values.description?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAccountSheetOpen(false)
          accountForm.reset()
        },
      }
    )
  }

  function submitLine(values: z.output<typeof createBudgetLineSchema>) {
    createLine.mutate(
      {
        fundId: values.fundId,
        label: values.label.trim(),
        department: values.department?.trim() || undefined,
        allocatedAmount: values.allocatedAmount,
        fiscalYear: values.fiscalYear,
      },
      {
        onSuccess: () => {
          setLineSheetOpen(false)
          lineForm.reset()
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
            title="Fund"
            description="Per-location books: funds, chart of accounts, encumbrance, and the audited ledger."
            icon={<Coins className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <>
                <AccountingCommand
                  funds={funds.map((f: any) => ({
                    id: f.id,
                    label: f.name,
                    hint: f.code,
                  }))}
                  accounts={chartOfAccounts.map((a: any) => ({
                    id: a.id || a.accountNumber,
                    label: `${a.accountNumber} ${a.accountName}`,
                  }))}
                  requisitions={requisitions.map((r: any) => ({
                    id: r.id,
                    label: `${r.requisitionNumber} · ${r.vendorName}`,
                  }))}
                  onJump={(kind) => setTab(kind)}
                  onNewRequisition={() => setReqSheetOpen(true)}
                  onExportLedger={exportLedger}
                />

                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-8 text-xs">
                        Guidance
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-72 gap-1 p-1">
                          <li>
                            <NavigationMenuLink
                              href="/dashboard/policies"
                              className="flex flex-col items-start gap-0.5"
                            >
                              <span className="font-medium">Expense policy</span>
                              <span className="text-[11px] text-zinc-500">
                                Multi-tier approvals & encumbrance rules
                              </span>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink
                              href="/dashboard/metrics"
                              className="flex flex-col items-start gap-0.5"
                            >
                              <span className="font-medium">FP reports</span>
                              <span className="text-[11px] text-zinc-500">
                                Budget vs actual and expense aging
                              </span>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                <Can permission="accounting.budgets">
                  <Button variant="primary" onClick={() => setFundDialogOpen(true)}>
                    <Plus strokeWidth={2} className="size-4" />
                    New fund
                  </Button>
                </Can>
                <Can permission="accounting.requisitions">
                  <Button variant="primary" onClick={() => setReqSheetOpen(true)}>
                    <Plus strokeWidth={2} className="size-4" />
                    New requisition
                  </Button>
                </Can>
              </>
            }
          >
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <HoverCard>
                <HoverCardTrigger
                  render={<button type="button" className="outline-none" />}
                >
                  Active funds:{" "}
                  <strong className="text-zinc-800 tabular-nums">{funds.length}</strong>
                </HoverCardTrigger>
                <HoverCardContent className="w-56 p-3 text-xs">
                  Count of active restricted and unrestricted funds for this location.
                </HoverCardContent>
              </HoverCard>
              <span className="text-zinc-300">·</span>
              <span>
                Available:{" "}
                <strong className="font-medium text-emerald-700 tabular-nums">
                  ${money(totalAvailable)}
                </strong>
              </span>
              <span className="text-zinc-300">·</span>
              <HoverCard>
                <HoverCardTrigger
                  render={<button type="button" className="outline-none" />}
                >
                  Encumbered:{" "}
                  <strong className="font-medium text-amber-700 tabular-nums">
                    ${money(totalEncumbered)}
                  </strong>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-3 text-xs">
                  Dollars reserved by open requisitions — not yet expended, not freely spendable.
                </HoverCardContent>
              </HoverCard>
            </div>
          </PageHeader>

          <div className="p-8">
            <Tabs
              value={tab}
              onValueChange={(v) => v && setTab(v as TabKey)}
              className="space-y-6"
            >
              <TabsList>
                <TabsTrigger value="funds">Funds</TabsTrigger>
                <TabsTrigger value="budgets">Budget lines</TabsTrigger>
                <TabsTrigger value="requisitions">Expenses</TabsTrigger>
                <TabsTrigger value="ledger">Ledger</TabsTrigger>
                <TabsTrigger value="coa">Chart of accounts</TabsTrigger>
              </TabsList>

              <TabsContent value="funds" className="space-y-6">
                {funds.length === 0 ? (
                  <Empty className="border border-dashed border-zinc-200 py-14">
                    <EmptyHeader>
                      <EmptyTitle>No funds</EmptyTitle>
                      <EmptyDescription>
                        Create a fund to start budgeting and encumbering expenses.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {funds.map((fund: any) => {
                      const net = Number(
                        fund.netAvailable ??
                          Number(fund.balance) - Number(fund.encumberedAmount || 0)
                      )
                      const percentUsed = Math.min(
                        100,
                        Math.round(
                          (Number(fund.expendedAmount || 0) /
                            (Number(fund.budgetAmount) || 1)) *
                            100
                        )
                      )
                      return (
                        <div
                          key={fund.id}
                          className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <StatusPill
                                tone={fund.type === "unrestricted" ? "success" : "warning"}
                                className="capitalize"
                              >
                                {String(fund.type).replace(/_/g, " ")}
                              </StatusPill>
                              <h3 className="mt-2 text-sm font-medium text-foreground">{fund.name}</h3>
                              <HoverCard>
                                <HoverCardTrigger
                                  render={
                                    <button
                                      type="button"
                                      className="mt-0.5 text-[11px] text-zinc-400 outline-none hover:text-emerald-700"
                                    />
                                  }
                                >
                                  {fund.code}
                                </HoverCardTrigger>
                                <HoverCardContent className="w-56 p-3 text-xs">
                                  Fund code used on journal lines and requisitions.
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                              <Coins className="size-4" />
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] text-zinc-400">Available</p>
                            <p className="text-xl font-medium tabular-nums text-foreground">
                              ${money(net)}
                            </p>
                          </div>
                          <Progress value={percentUsed} className="gap-1.5">
                            <ProgressLabel className="text-[10px] text-zinc-400">
                              Budget used
                            </ProgressLabel>
                            <ProgressValue className="text-[10px]" />
                          </Progress>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="budgets">
                <div className="flex flex-col gap-4">
                  <TableToolbar
                    title="Budget lines"
                    description="Allocations by fund, department, and fiscal year."
                    count={lines.length}
                    onExport={exportBudgetLines}
                    moreActions={[
                      {
                        label: "Refresh",
                        shortcut: "⌘ R",
                        onClick: () => toast.message("Budget lines refreshed"),
                      },
                      {
                        label: "Print worksheet",
                        onClick: () => toast.message("Print coming soon"),
                      },
                    ]}
                    primaryAction={
                      <Can permission="accounting.budgets">
                        <Button
                          variant="primary"
                          onClick={() => {
                            lineForm.reset({
                              fundId: "",
                              label: "",
                              department: "",
                              allocatedAmount: undefined,
                              fiscalYear: new Date().getFullYear(),
                            })
                            setLineSheetOpen(true)
                          }}
                        >
                          Add line
                        </Button>
                      </Can>
                    }
                  />
                  {lines.length === 0 ? (
                    <Empty className="py-12">
                      <EmptyHeader>
                        <EmptyTitle>No budget lines</EmptyTitle>
                        <EmptyDescription>
                          Split a fund budget into departments for clearer FP reporting.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <ScrollArea className="max-h-[520px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Line</TableHead>
                            <TableHead>Fund</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-right">Allocated</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lines.map((line: any) => (
                            <TableRow key={line.id}>
                              <TableCell className="font-medium">{line.label}</TableCell>
                              <TableCell className="text-xs text-zinc-600">
                                {line.fundName || line.fundId}
                              </TableCell>
                              <TableCell className="text-xs text-zinc-600">
                                {line.department || "—"}
                              </TableCell>
                              <TableCell className="text-xs tabular-nums">
                                {line.fiscalYear}
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                ${money(Number(line.allocatedAmount))}
                              </TableCell>
                              <TableCell>
                                <RowActionsMenu
                                  label="Budget line"
                                  groups={[
                                    {
                                      items: [
                                        {
                                          label: "Copy label",
                                          onClick: () => {
                                            void navigator.clipboard.writeText(line.label)
                                            toast.success("Copied")
                                          },
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
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="requisitions">
                <div className="flex flex-col gap-4">
                  <TableToolbar
                    title="Expense requisitions"
                    description="Server-paginated. Approve / reject via confirm — encumbrance stays with the fund."
                    icon={
                      <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Receipt className="size-4" />
                      </div>
                    }
                    count={pagination?.total}
                    search={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Search vendor or #"
                    onExport={exportRequisitions}
                    onFilter={() => toast.message("Status filters coming soon")}
                    moreActions={[
                      {
                        label: "Export CSV",
                        shortcut: "⌘ E",
                        onClick: exportRequisitions,
                      },
                      {
                        label: "Only pending",
                        onClick: () => toast.message("Filter: pending tiers"),
                      },
                    ]}
                  />

                  {reqsLoading ? (
                    <p className="px-5 py-8 text-center text-xs text-zinc-400">Loading…</p>
                  ) : requisitions.length === 0 ? (
                    <Empty className="py-12">
                      <EmptyHeader>
                        <EmptyTitle>No requisitions</EmptyTitle>
                        <EmptyDescription>
                          Submit a requisition to encumber a fund and start approvals.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Requisition</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-10 text-right"> </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requisitions.map((req: any) => {
                            const locked =
                              req.status === "approved" ||
                              req.status === "rejected" ||
                              req.status === "disbursed"
                            return (
                              <TableRow key={req.id}>
                                <TableCell className="font-medium text-emerald-700">
                                  {req.requisitionNumber}
                                </TableCell>
                                <TableCell className="font-medium">{req.vendorName}</TableCell>
                                <TableCell className="max-w-xs truncate text-zinc-500">
                                  <HoverCard>
                                    <HoverCardTrigger
                                      render={
                                        <button
                                          type="button"
                                          className="max-w-full truncate text-left outline-none"
                                        />
                                      }
                                    >
                                      {req.description}
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-72 p-3 text-xs">
                                      {req.description}
                                    </HoverCardContent>
                                  </HoverCard>
                                </TableCell>
                                <TableCell className="font-medium tabular-nums">
                                  ${Number(req.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-1.5 text-zinc-700">
                                    <Shield className="size-3.5 text-emerald-600" />
                                    Tier {req.currentTierLevel}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <StatusPill tone="warning" className="capitalize">
                                    {String(req.status).replace(/_/g, " ")}
                                  </StatusPill>
                                </TableCell>
                                <TableCell className="text-right">
                                  <RowActionsMenu
                                    label="Requisition"
                                    groups={[
                                      {
                                        items: [
                                          {
                                            label: "Approve",
                                            shortcut: "⌘ ↵",
                                            disabled: locked,
                                            onClick: () =>
                                              setPendingDecision({
                                                id: req.id,
                                                decision: "approved",
                                                label: req.requisitionNumber,
                                              }),
                                          },
                                          {
                                            label: "Reject",
                                            disabled: locked,
                                            destructive: true,
                                            onClick: () =>
                                              setPendingDecision({
                                                id: req.id,
                                                decision: "rejected",
                                                label: req.requisitionNumber,
                                              }),
                                          },
                                        ],
                                      },
                                    ]}
                                    submenu={{
                                      label: "More",
                                      items: [
                                        {
                                          label: "Copy number",
                                          onClick: () => {
                                            void navigator.clipboard.writeText(
                                              req.requisitionNumber
                                            )
                                            toast.success("Copied")
                                          },
                                        },
                                        {
                                          label: "View receipt",
                                          disabled: !req.receiptUrl,
                                          onClick: () =>
                                            req.receiptUrl &&
                                            window.open(req.receiptUrl, "_blank"),
                                        },
                                      ],
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                      <ServerPagination meta={pagination} onPageChange={setPage} />
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ledger">
                <div className="flex flex-col gap-4">
                  <TableToolbar
                    title="General ledger"
                    description="Drafts are editable. Posting records who posted — never silent."
                    count={journalEntries.length}
                    onExport={exportLedger}
                    moreActions={[
                      {
                        label: "Export CSV",
                        shortcut: "⌘ E",
                        onClick: exportLedger,
                      },
                      {
                        label: "Only drafts",
                        onClick: () => toast.message("Filter: draft entries"),
                      },
                    ]}
                  />
                  {journalEntries.length === 0 ? (
                    <Empty className="py-12">
                      <EmptyHeader>
                        <EmptyTitle>No journal entries</EmptyTitle>
                        <EmptyDescription>
                          Balanced drafts appear here until an authorized user posts them.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <ScrollArea className="max-h-[560px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Entry #</TableHead>
                            <TableHead>Memo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created by</TableHead>
                            <TableHead>Posted by</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {journalEntries.map((je: any) => (
                            <TableRow key={je.id}>
                              <TableCell className="font-medium text-emerald-700">
                                {je.entryNumber}
                              </TableCell>
                              <TableCell>{je.memo}</TableCell>
                              <TableCell>
                                <StatusPill
                                  tone={je.status === "posted" ? "success" : "neutral"}
                                  className="capitalize"
                                >
                                  {je.status}
                                </StatusPill>
                              </TableCell>
                              <TableCell className="text-xs text-zinc-600">
                                {je.createdByName || je.createdByUserId || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-zinc-600">
                                {je.postedByName || je.postedByUserId || "—"}
                              </TableCell>
                              <TableCell>
                                <RowActionsMenu
                                  label="Journal"
                                  groups={[
                                    {
                                      items: [
                                        {
                                          label: "Post to ledger",
                                          shortcut: "⌘ P",
                                          disabled: je.status !== "draft",
                                          onClick: () => setPendingPostId(je.id),
                                        },
                                        {
                                          label: "Copy entry #",
                                          onClick: () => {
                                            void navigator.clipboard.writeText(je.entryNumber)
                                            toast.success("Copied")
                                          },
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
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="coa">
                <div className="flex flex-col gap-4">
                  <TableToolbar
                    title="Chart of accounts"
                    description="This location’s books — starter accounts plus any you add."
                    count={chartOfAccounts.length}
                    onExport={() => {
                      downloadCsv(
                        "chart-of-accounts.csv",
                        ["Number", "Name", "Category", "Balance"],
                        chartOfAccounts.map((a: any) => [
                          a.accountNumber,
                          a.accountName,
                          a.category,
                          a.balance ?? "",
                        ])
                      )
                      toast.success("COA exported")
                    }}
                    moreActions={[
                      {
                        label: "Expand all classes",
                        onClick: () => toast.message("Accordion expands by default"),
                      },
                    ]}
                    primaryAction={
                      <Can permission="accounting.budgets">
                        <Button variant="primary" onClick={() => setAccountSheetOpen(true)}>
                          <Plus strokeWidth={2} className="size-4" />
                          Add account
                        </Button>
                      </Can>
                    }
                  />
                  <ChartOfAccountsAccordion accounts={chartOfAccounts} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Requisition Sheet — Field + FileAttachment */}
          <Sheet open={reqSheetOpen} onOpenChange={setReqSheetOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <form
                onSubmit={reqForm.handleSubmit(submitRequisition)}
                className="flex h-full flex-col"
              >
                <SheetHeader className="pr-12">
                  <SheetTitle>Expense requisition</SheetTitle>
                  <SheetDescription>
                    Encumber a fund. Attach a receipt before pastoral approval when possible.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <Form {...reqForm}>
                    <FieldSet>
                      <FieldLegend>Request details</FieldLegend>
                      <FieldGroup>
                        <SelectFormField
                          control={reqForm.control}
                          name="fundId"
                          label="Fund"
                          placeholder="Select fund"
                          options={fundItems}
                          description="Available balance is checked before encumbrance."
                        />
                        <SelectFormField
                          control={reqForm.control}
                          name="accountId"
                          label="Expense account"
                          placeholder="Select account"
                          options={accountItems}
                        />
                        <TextFormField
                          control={reqForm.control}
                          name="vendorName"
                          label="Vendor"
                        />
                        <NumberFormField
                          control={reqForm.control}
                          name="amount"
                          label="Amount"
                          min={0.01}
                          step="0.01"
                        />
                        <TextareaFormField
                          control={reqForm.control}
                          name="description"
                          label="Ministry purpose"
                          rows={4}
                        />
                        <FileAttachment
                          value={attachments}
                          onChange={setAttachments}
                          label="Receipt / quote"
                          hint="PDF or image · optional"
                          maxFiles={3}
                          accept="image/*,.pdf"
                        />
                      </FieldGroup>
                    </FieldSet>
                  </Form>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setReqSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={createReq.isPending}>
                    Submit requisition
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <Sheet open={accountSheetOpen} onOpenChange={setAccountSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form
                onSubmit={accountForm.handleSubmit(submitAccount)}
                className="flex h-full flex-col"
              >
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">Add account</SheetTitle>
                  <SheetDescription>
                    Name it whatever you need for this location. Numbers must be unique within
                    these books.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <Form {...accountForm}>
                    <FieldGroup className="gap-4">
                      <TextFormField
                        control={accountForm.control}
                        name="accountName"
                        label="Account name"
                        placeholder="e.g. Youth Camp Fees, Van Lease"
                        autoFocus
                      />
                      <TextFormField
                        control={accountForm.control}
                        name="accountNumber"
                        label="Account number"
                        placeholder="e.g. 5040"
                        description="Suggested ranges: 1xxx assets · 2xxx liabilities · 3xxx net assets · 4xxx revenue · 5xxx expense"
                      />
                      <SelectFormField
                        control={accountForm.control}
                        name="category"
                        label="Category"
                        options={[
                          { value: "asset", label: "Asset" },
                          { value: "liability", label: "Liability" },
                          { value: "net_assets", label: "Net assets" },
                          { value: "revenue", label: "Revenue" },
                          { value: "expense", label: "Expense" },
                        ]}
                      />
                      <NumberFormField
                        control={accountForm.control}
                        name="openingBalance"
                        label="Opening balance"
                        min={0}
                        step="0.01"
                      />
                      <TextareaFormField
                        control={accountForm.control}
                        name="description"
                        label="Description (optional)"
                        placeholder="What this account tracks"
                      />
                    </FieldGroup>
                  </Form>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setAccountSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={createAccount.isPending}>
                    {createAccount.isPending ? "Saving…" : "Add account"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={fundForm.handleSubmit(submitFund)} className="grid gap-4">
                <DialogHeader>
                  <DialogTitle>Create fund</DialogTitle>
                  <DialogDescription>
                    Added to this location’s books. Restricted vs unrestricted with a starting
                    budget.
                  </DialogDescription>
                </DialogHeader>
                <Form {...fundForm}>
                  <FieldGroup className="gap-4">
                    <TextFormField control={fundForm.control} name="name" label="Name" />
                    <div className="grid grid-cols-2 gap-3">
                      <TextFormField control={fundForm.control} name="code" label="Code" />
                      <NumberFormField
                        control={fundForm.control}
                        name="budgetAmount"
                        label="Budget"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <SelectFormField
                      control={fundForm.control}
                      name="type"
                      label="Restriction type"
                      options={[
                        { value: "unrestricted", label: "Unrestricted" },
                        { value: "temporarily_restricted", label: "Temporarily restricted" },
                        { value: "permanently_restricted", label: "Permanently restricted" },
                      ]}
                    />
                  </FieldGroup>
                </Form>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setFundDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={createFund.isPending}>
                    Create fund
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Sheet open={lineSheetOpen} onOpenChange={setLineSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form
                onSubmit={lineForm.handleSubmit(submitLine)}
                className="flex h-full flex-col"
              >
                <SheetHeader className="pr-12">
                  <SheetTitle>Budget line</SheetTitle>
                  <SheetDescription>
                    Allocate part of a fund to a department for the fiscal year.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <Form {...lineForm}>
                    <FieldGroup>
                      <SelectFormField
                        control={lineForm.control}
                        name="fundId"
                        label="Fund"
                        placeholder="Select fund"
                        options={fundItems}
                      />
                      <TextFormField control={lineForm.control} name="label" label="Label" />
                      <TextFormField
                        control={lineForm.control}
                        name="department"
                        label="Department"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <NumberFormField
                          control={lineForm.control}
                          name="fiscalYear"
                          label="Fiscal year"
                          step={1}
                        />
                        <NumberFormField
                          control={lineForm.control}
                          name="allocatedAmount"
                          label="Allocated"
                          min={0}
                          step="0.01"
                        />
                      </div>
                    </FieldGroup>
                  </Form>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setLineSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={createLine.isPending}>
                    Add line
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(pendingDecision)}
            onOpenChange={(o) => !o && setPendingDecision(null)}
            title={
              pendingDecision?.decision === "approved"
                ? `Approve ${pendingDecision.label}?`
                : `Reject ${pendingDecision?.label}?`
            }
            description={
              pendingDecision?.decision === "approved"
                ? "Records you as approver at the current tier."
                : "Releases the encumbrance back to the fund."
            }
            confirmLabel={pendingDecision?.decision === "approved" ? "Approve" : "Reject"}
            variant={pendingDecision?.decision === "rejected" ? "destructive" : "default"}
            loading={approveMutation.isPending}
            onConfirm={async () => {
              if (!pendingDecision) return
              await approveMutation.mutateAsync({
                id: pendingDecision.id,
                input: {
                  decision: pendingDecision.decision,
                  comments:
                    pendingDecision.decision === "approved"
                      ? "Approved via confirm modal"
                      : "Rejected via confirm modal",
                },
              })
            }}
          />

          <ConfirmAction
            open={Boolean(pendingPostId)}
            onOpenChange={(o) => !o && setPendingPostId(null)}
            title="Post journal entry to the ledger?"
            description="Your user id is stored as the poster. Posting is never silent."
            confirmLabel="Post to ledger"
            loading={postJournal.isPending}
            onConfirm={async () => {
              if (!pendingPostId) return
              await postJournal.mutateAsync({
                id: pendingPostId,
                input: { postedByUserId: "user-pastor-1" },
              })
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
