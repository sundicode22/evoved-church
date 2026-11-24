"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Megaphone, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { RichTextEditor } from "@/components/rich-text-editor"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { Can, RequireAbility } from "@/components/auth/can"
import { StatusPill, TablePanel } from "@/components/table-panel"
import {
  useAnnouncements,
  useCreateAnnouncement,
  usePublishAnnouncement,
} from "@/features/announcements/hooks/use-announcements"
import type { Announcement } from "@/features/announcements/schemas"

export default function AnnouncementsPage() {
  const { data, isLoading } = useAnnouncements()
  const create = useCreateAnnouncement()
  const publish = usePublishAnnouncement()

  const [open, setOpen] = React.useState(false)
  const [confirmPublish, setConfirmPublish] = React.useState<Announcement | null>(null)
  const [title, setTitle] = React.useState("")
  const [bodyHtml, setBodyHtml] = React.useState("<p></p>")
  const [isPinned, setIsPinned] = React.useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(
      { title, bodyHtml, isPinned, status: "draft" },
      {
        onSuccess: () => {
          setOpen(false)
          setTitle("")
          setBodyHtml("<p></p>")
          setIsPinned(false)
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
        <RequireAbility permission="announcements.read">
          <PageHeader
            title="Announcements"
            description="Post news for the member portal and campus screens."
            icon={<Megaphone className="size-5 text-[var(--brand)]" strokeWidth={1.75} />}
            actions={
              <Can permission="announcements.write">
                <Button
                  className="h-8 gap-1.5 bg-[var(--brand)] text-xs font-normal text-white hover:bg-[var(--brand)]"
                  onClick={() => setOpen(true)}
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  New announcement
                </Button>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-zinc-200/80 py-16">
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
                          <p className="font-medium text-zinc-900">
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
                                        ]
                                      : [{ label: "Already posted", onClick: () => undefined }],
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
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Post announcement</SheetTitle>
                  <SheetDescription>
                    Write with the rich editor. Save as draft, then publish when ready.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Title</FieldLabel>
                      <Input
                        className="h-9"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </Field>
                    <Field className="flex flex-row items-center justify-between gap-3">
                      <FieldLabel>Pin to top</FieldLabel>
                      <Switch checked={isPinned} onCheckedChange={setIsPinned} />
                    </Field>
                    <Field>
                      <FieldLabel>Body</FieldLabel>
                      <RichTextEditor value={bodyHtml} onChange={setBodyHtml} minHeight="280px" />
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={create.isPending || title.trim().length < 2}
                    className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
                  >
                    Save draft
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(confirmPublish)}
            onOpenChange={(o) => !o && setConfirmPublish(null)}
            title="Publish this announcement?"
            description="Posted announcements appear on the member portal."
            confirmLabel="Publish"
            onConfirm={async () => {
              if (confirmPublish) await publish.mutateAsync(confirmPublish.id)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
