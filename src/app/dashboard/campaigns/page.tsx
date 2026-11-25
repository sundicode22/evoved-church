"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SelectFormField, TextFormField } from "@/components/form-fields"
import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  ColumnCustomize,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { useCampaigns, useCreateCampaign } from "@/features/campaigns/hooks/use-campaigns"
import { campaignChannelSchema } from "@/features/campaigns/schemas"
import { CHANNEL_ITEMS, STATUS_STYLES } from "@/features/campaigns/constants"
import { RowActionsMenu } from "@/components/row-actions-menu"

const campaignFormSchema = z.object({
  name: z.string().trim().min(2, "Campaign name is required"),
  channel: campaignChannelSchema,
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

const CAMPAIGN_FORM_DEFAULTS: CampaignFormValues = { name: "", channel: "email" }

const COLUMNS: ColumnOption[] = [
  { id: "campaign", label: "Campaign" },
  { id: "channel", label: "Channel" },
  { id: "status", label: "Status" },
  { id: "recipients", label: "Recipients" },
  { id: "schedule", label: "Schedule / Sent" },
]

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function CampaignsPage() {
  const router = useRouter()
  const { data, isLoading } = useCampaigns()
  const create = useCreateCampaign()
  const [open, setOpen] = React.useState(false)
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: CAMPAIGN_FORM_DEFAULTS,
  })

  React.useEffect(() => {
    if (open) form.reset(CAMPAIGN_FORM_DEFAULTS)
  }, [open, form])
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const rows = data ?? []
  const total = rows.length
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  function onSubmit(values: CampaignFormValues) {
    create.mutate(
      { name: values.name, channel: values.channel },
      {
        onSuccess: (c) => {
          setOpen(false)
          form.reset(CAMPAIGN_FORM_DEFAULTS)
          router.push(`/dashboard/campaigns/${c.id}`)
        },
      }
    )
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="campaigns.read">
          <PageHeader
            title="Campaigns"
            description="Reach your congregation by email and SMS."
            icon={<Mail className="size-5 text-brand" strokeWidth={1.75} />}
          />

          <div className="p-6 md:p-8">
            <TablePanel>
              <TableChrome
                trailing={
                  <>
                    <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                    <Can permission="campaigns.write">
                      <TableAddButton onClick={() => setOpen(true)}>
                        <Plus className="size-3.5" strokeWidth={1.75} />
                        Add Campaign
                      </TableAddButton>
                    </Can>
                  </>
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {isVisible("campaign") && <TableHead className="pl-4">Campaign</TableHead>}
                    {isVisible("channel") && <TableHead>Channel</TableHead>}
                    {isVisible("status") && <TableHead>Status</TableHead>}
                    {isVisible("recipients") && <TableHead>Recipients</TableHead>}
                    {isVisible("schedule") && <TableHead>Schedule / Sent</TableHead>}
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
                        No campaigns yet. Create your first one.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map((c) => (
                    <TableRow key={c.id}>
                      {isVisible("campaign") && (
                        <TableCell className="pl-4">
                          <Link
                            href={`/dashboard/campaigns/${c.id}`}
                            className="font-medium text-zinc-900 hover:text-brand"
                          >
                            {c.name}
                          </Link>
                        </TableCell>
                      )}
                      {isVisible("channel") && (
                        <TableCell>
                          <Badge variant="outline" className="px-1.5 font-normal text-zinc-600">
                            {c.channel}
                          </Badge>
                        </TableCell>
                      )}
                      {isVisible("status") && (
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`px-1.5 font-normal ${STATUS_STYLES[c.status] || ""}`}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                      )}
                      {isVisible("recipients") && (
                        <TableCell className="tabular-nums text-zinc-600">
                          {c.stats?.total ?? "—"}
                        </TableCell>
                      )}
                      {isVisible("schedule") && (
                        <TableCell className="text-zinc-500">
                          {formatDate(c.scheduleAt || c.sentAt)}
                        </TableCell>
                      )}
                      <TableCell className="pr-3 text-right">
                        <RowActionsMenu
                          groups={[
                            {
                              items: [
                                {
                                  label: "Open",
                                  onClick: () => router.push(`/dashboard/campaigns/${c.id}`),
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
                total={total}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </TablePanel>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle className="font-medium">New campaign</SheetTitle>
                    <SheetDescription>
                      Start with a name and channel. Email uses Resend; SMS uses a separate provider.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup className="gap-4">
                      <TextFormField control={form.control} name="name" label="Name" />
                      <SelectFormField
                        control={form.control}
                        name="channel"
                        label="Channel"
                        options={CHANNEL_ITEMS}
                      />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" className="h-9" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={create.isPending}>
                      Create
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
