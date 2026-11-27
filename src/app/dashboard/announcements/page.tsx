"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Megaphone, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RichTextFormField, TextFormField } from "@/components/form-fields"
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
import { ConfirmAction } from "@/components/confirm-action"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { Can, RequireAbility } from "@/components/auth/can"
import { StatusPill, TablePanel } from "@/components/table-panel"
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
} from "@/features/announcements/hooks/use-announcements"
import {
  createAnnouncementSchema,
  type Announcement,
} from "@/features/announcements/schemas"

const announcementFormSchema = createAnnouncementSchema
  .pick({ title: true, bodyHtml: true })
  .extend({ isPinned: z.boolean() })

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>

const emptyForm: AnnouncementFormValues = {
  title: "",
  bodyHtml: "<p></p>",
  isPinned: false,
}

export default function AnnouncementsPage() {
  const { data, isLoading } = useAnnouncements()
  const create = useCreateAnnouncement()
  const publish = usePublishAnnouncement()
  const remove = useDeleteAnnouncement()

  const [open, setOpen] = React.useState(false)
  const [confirmPublish, setConfirmPublish] = React.useState<Announcement | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<Announcement | null>(null)
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: emptyForm,
  })

  function openCreate() {
    form.reset(emptyForm)
    setOpen(true)
  }

  function submit(values: AnnouncementFormValues) {
    create.mutate(
      { ...values, status: "draft" },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset(emptyForm)
        },
      }
    )
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="announcements.read">
          <PageHeader
            title="Announcements"
            description="Post news for campus screens and church communications."
            icon={<Megaphone className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="announcements.write">
                <Button variant="primary" onClick={openCreate}>
                  <Plus strokeWidth={2} className="size-3.5" />
                  New announcement
                </Button>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-border/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No announcements</EmptyTitle>
                  <EmptyDescription>
                    Draft and post updates for your congregation.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <TablePanel>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Announcement</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={4} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {(data ?? []).map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="pl-4">
                          <p className="font-medium text-foreground">
                            {a.isPinned ? (
                              <span className="mr-1.5 text-[10px] font-medium uppercase text-emerald-700">
                                Pinned
                              </span>
                            ) : null}
                            {a.title}
                          </p>
                          <p className="line-clamp-1 text-xs text-zinc-400">
                            {a.bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 80)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            tone={
                              a.status === "posted"
                                ? "success"
                                : a.status === "scheduled"
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {a.status}
                          </StatusPill>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500">
                          {a.postedAt
                            ? format(parseISO(a.postedAt), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell className="pr-3 text-right">
                          <Can permission="announcements.write">
                            <RowActionsMenu
                              label="Announcement"
                              groups={[
                                {
                                  items:
                                    a.status !== "posted"
                                      ? [
                                          {
                                            label: "Publish",
                                            onClick: () => setConfirmPublish(a),
                                          },
                                          {
                                            label: "Delete",
                                            onClick: () => setConfirmDelete(a),
                                            destructive: true,
                                          },
                                        ]
                                      : [
                                          {
                                            label: "Delete",
                                            onClick: () => setConfirmDelete(a),
                                            destructive: true,
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
            <SheetContent side="right" inset size="xl" className="p-0">
              <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Post announcement</SheetTitle>
                  <SheetDescription>
                    Write with the rich editor. Save as draft, then publish when ready.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <TextFormField control={form.control} name="title" label="Title" />
                    <FormField
                      control={form.control}
                      name="isPinned"
                      render={({ field }) => (
                        <Field className="flex flex-row items-center justify-between gap-3">
                          <FieldLabel>Pin to top</FieldLabel>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </Field>
                      )}
                    />
                    <RichTextFormField
                      control={form.control}
                      name="bodyHtml"
                      label="Body"
                      placeholder="Write the announcement…"
                      minHeight="280px"
                    />
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={create.isPending}>
                    Save draft
                  </Button>
                </SheetFooter>
              </form>
              </Form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(confirmPublish)}
            onOpenChange={(o) => !o && setConfirmPublish(null)}
            title="Publish this announcement?"
            description="Posted announcements appear for staff and campus screens."
            confirmLabel="Publish"
            onConfirm={async () => {
              if (confirmPublish) await publish.mutateAsync(confirmPublish.id)
            }}
          />
          <ConfirmAction
            open={Boolean(confirmDelete)}
            onOpenChange={(o) => !o && setConfirmDelete(null)}
            title="Delete this announcement?"
            description="This removes it from the staff list."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={async () => {
              if (confirmDelete) await remove.mutateAsync(confirmDelete.id)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
