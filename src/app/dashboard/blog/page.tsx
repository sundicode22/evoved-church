"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { BookOpen, ExternalLink, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { ImageUpload } from "@/components/image-upload"
import { RichTextEditor } from "@/components/rich-text-editor"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { Can, RequireAbility } from "@/components/auth/can"
import { StatusPill, TableAddButton, TablePanel } from "@/components/table-panel"
import {
  useBlogPosts,
  useCreateBlogPost,
  useDeleteBlogPost,
  usePublishBlogPost,
  useUpdateBlogPost,
} from "@/features/blog/hooks/use-blog"
import type { BlogPost } from "@/features/blog/schemas"

const emptyForm = {
  title: "",
  excerpt: "",
  coverImageUrl: "",
  authorName: "",
  bodyHtml: "<p></p>",
}

export default function BlogDashboardPage() {
  const { data, isLoading } = useBlogPosts()
  const create = useCreateBlogPost()
  const update = useUpdateBlogPost()
  const publish = usePublishBlogPost()
  const remove = useDeleteBlogPost()

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<BlogPost | null>(null)
  const [confirmPublish, setConfirmPublish] = React.useState<BlogPost | null>(null)
  const [form, setForm] = React.useState(emptyForm)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(post: BlogPost) {
    setEditing(post)
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl || "",
      authorName: post.authorName,
      bodyHtml: post.bodyHtml,
    })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      coverImageUrl: form.coverImageUrl.trim(),
      authorName: form.authorName.trim() || "Staff",
      bodyHtml: form.bodyHtml,
    }
    if (editing) {
      update.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            setOpen(false)
            setEditing(null)
          },
        }
      )
    } else {
      create.mutate(
        { ...payload, status: "draft" },
        {
          onSuccess: () => {
            setOpen(false)
            setForm(emptyForm)
          },
        }
      )
    }
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="blog.read">
          <PageHeader
            title="Blog"
            description="Write stories with images for the member portal."
            icon={<BookOpen className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href="/portal/main"
                  target="_blank"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink className="size-4" strokeWidth={1.75} />
                  View portal
                </Link>
                <Can permission="blog.write">
                  <TableAddButton onClick={openCreate}>
                    <Plus className="size-4" strokeWidth={1.75} />
                    New post
                  </TableAddButton>
                </Can>
              </div>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-xl bg-[#f8faf9] py-16 shadow-xs">
                <EmptyHeader>
                  <EmptyTitle>No blog posts</EmptyTitle>
                  <EmptyDescription>
                    Draft a story with a cover photo — members open it from the portal in one click.
                  </EmptyDescription>
                </EmptyHeader>
                <Can permission="blog.write">
                  <Button type="button" className="mt-2" onClick={openCreate}>
                    <Plus className="size-4" strokeWidth={1.75} />
                    Write first post
                  </Button>
                </Can>
              </Empty>
            ) : (
              <TablePanel>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5} className="pl-4">
                            <Skeleton className="h-10 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {(data || []).map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-3">
                            <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                              {post.coverImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={post.coverImageUrl}
                                  alt=""
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center bg-brand-soft">
                                  <BookOpen className="size-4 text-brand-ink" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-900">
                                {post.title}
                              </p>
                              <p className="truncate text-xs text-zinc-400">{post.excerpt || post.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-zinc-600">{post.authorName}</TableCell>
                        <TableCell>
                          <StatusPill
                            tone={
                              post.status === "published"
                                ? "success"
                                : post.status === "archived"
                                  ? "neutral"
                                  : "warning"
                            }
                          >
                            {post.status}
                          </StatusPill>
                        </TableCell>
                        <TableCell className="text-sm text-zinc-500">
                          {post.publishedAt
                            ? format(parseISO(post.publishedAt), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Can permission="blog.write">
                            <RowActionsMenu
                              label="Post"
                              groups={[
                                {
                                  items: [
                                    { label: "Edit", onClick: () => openEdit(post) },
                                    ...(post.status !== "published"
                                      ? [
                                          {
                                            label: "Publish",
                                            onClick: () => setConfirmPublish(post),
                                          },
                                        ]
                                      : [
                                          {
                                            label: "Open on portal",
                                            onClick: () =>
                                              window.open(
                                                `/portal/main/blog/${post.slug}`,
                                                "_blank"
                                              ),
                                          },
                                        ]),
                                  ],
                                },
                                {
                                  items: [
                                    {
                                      label: "Delete",
                                      destructive: true,
                                      onClick: () => remove.mutate(post.id),
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
            <SheetContent side="right" inset size="lg" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">
                    {editing ? "Edit post" : "New blog post"}
                  </SheetTitle>
                  <SheetDescription>
                    Add a cover image and rich body — members read it on the portal.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup className="gap-4">
                    <Field>
                      <FieldLabel htmlFor="blog-title">Title</FieldLabel>
                      <Input
                        id="blog-title"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="Sunday welcome story"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="blog-excerpt">Excerpt</FieldLabel>
                      <Input
                        id="blog-excerpt"
                        value={form.excerpt}
                        onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                        placeholder="Short preview shown on the portal grid"
                      />
                    </Field>
                    <Field>
                      <ImageUpload
                        label="Cover image (optional)"
                        value={form.coverImageUrl}
                        onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
                        previewClassName="aspect-[21/9] w-full object-cover"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="blog-author">Author</FieldLabel>
                      <Input
                        id="blog-author"
                        value={form.authorName}
                        onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                        placeholder="Pastor name"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Body</FieldLabel>
                      <RichTextEditor
                        value={form.bodyHtml}
                        onChange={(html) => setForm((f) => ({ ...f, bodyHtml: html }))}
                        placeholder="Write the story… use the image button to insert photos inline."
                        minHeight="280px"
                        enableImages
                      />
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={create.isPending || update.isPending || !form.title.trim()}
                  >
                    {editing ? "Save changes" : "Save draft"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(confirmPublish)}
            onOpenChange={(v) => !v && setConfirmPublish(null)}
            title="Publish this post?"
            description="Published stories appear on the member portal for everyone to read."
            confirmLabel="Publish"
            loading={publish.isPending}
            onConfirm={async () => {
              if (!confirmPublish) return
              await publish.mutateAsync(confirmPublish.id)
              setConfirmPublish(null)
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
