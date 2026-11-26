"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { ListChecks, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DateTimeFormField,
  TextareaFormField,
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
import { Can, RequireAbility } from "@/components/auth/can"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { StatusPill, TablePanel } from "@/components/table-panel"
import {
  useCreateFollowUp,
  useFollowUps,
  useUpdateFollowUp,
} from "@/features/follow-ups/hooks/use-follow-ups"
import { FOLLOW_UP_STATUSES, type FollowUp } from "@/features/follow-ups/schemas"

const followUpFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  relatedLeadName: z.string(),
  relatedMemberName: z.string(),
  assignedToName: z.string(),
  dueAt: z.string(),
  notes: z.string(),
})

type FollowUpFormValues = z.infer<typeof followUpFormSchema>

const FOLLOW_UP_DEFAULTS: FollowUpFormValues = {
  title: "",
  relatedLeadName: "",
  relatedMemberName: "",
  assignedToName: "",
  dueAt: "",
  notes: "",
}

function statusTone(status: FollowUp["status"]) {
  if (status === "done") return "success" as const
  if (status === "cancelled") return "warning" as const
  if (status === "in_progress") return "info" as const
  return "neutral" as const
}

export default function FollowUpsPage() {
  const { data, isLoading } = useFollowUps()
  const create = useCreateFollowUp()
  const update = useUpdateFollowUp()
  const [open, setOpen] = React.useState(false)
  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: FOLLOW_UP_DEFAULTS,
  })

  React.useEffect(() => {
    if (open) form.reset(FOLLOW_UP_DEFAULTS)
  }, [open, form])

  function onSubmit(values: FollowUpFormValues) {
    create.mutate(
      {
        title: values.title,
        relatedLeadName: values.relatedLeadName,
        relatedMemberName: values.relatedMemberName,
        assignedToName: values.assignedToName,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : undefined,
        notes: values.notes,
        status: "open",
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset(FOLLOW_UP_DEFAULTS)
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
        <RequireAbility permission="followups.read">
          <PageHeader
            title="Follow-ups"
            description="Pastoral care tasks for guests and members."
            icon={<ListChecks className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="followups.write">
                <Button
                  onClick={() => setOpen(true)}
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  Add follow-up
                </Button>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-zinc-200/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No follow-ups</EmptyTitle>
                  <EmptyDescription>
                    Assign welcome calls, hospital visits, and care tasks here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <TablePanel>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Task</TableHead>
                      <TableHead>Related</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
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
                    {(data ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="pl-4">
                          <p className="font-medium text-zinc-900">{row.title}</p>
                          {row.notes && (
                            <p className="text-xs text-zinc-400 line-clamp-1">{row.notes}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-600">
                          {row.relatedLeadName || row.relatedMemberName || "—"}
                        </TableCell>
                        <TableCell>{row.assignedToName || "—"}</TableCell>
                        <TableCell className="text-xs">
                          {row.dueAt ? format(parseISO(row.dueAt), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusPill tone={statusTone(row.status)}>
                            {FOLLOW_UP_STATUSES.find((s) => s.value === row.status)?.label ||
                              row.status}
                          </StatusPill>
                        </TableCell>
                        <TableCell className="pr-3 text-right">
                          <Can permission="followups.write">
                            <RowActionsMenu
                              label="Follow-up"
                              groups={[
                                {
                                  items: [
                                    {
                                      label: "Mark in progress",
                                      onClick: () =>
                                        update.mutate({
                                          id: row.id,
                                          input: { status: "in_progress" },
                                        }),
                                    },
                                    {
                                      label: "Mark done",
                                      onClick: () =>
                                        update.mutate({
                                          id: row.id,
                                          input: { status: "done" },
                                        }),
                                    },
                                  ],
                                },
                              ]}
                            />
                          </Can>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TablePanel>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle>Add follow-up</SheetTitle>
                    <SheetDescription>
                      Capture who needs care, who owns it, and when it is due.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField control={form.control} name="title" label="Title" />
                      <TextFormField
                        control={form.control}
                        name="relatedLeadName"
                        label="Related guest / lead"
                      />
                      <TextFormField
                        control={form.control}
                        name="relatedMemberName"
                        label="Related member"
                      />
                      <TextFormField
                        control={form.control}
                        name="assignedToName"
                        label="Assignee"
                      />
                      <DateTimeFormField
                        control={form.control}
                        name="dueAt"
                        label="Due"
                      />
                      <TextareaFormField control={form.control} name="notes" label="Notes" />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={create.isPending}>
                      Save follow-up
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
