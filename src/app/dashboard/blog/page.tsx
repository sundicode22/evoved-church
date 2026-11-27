"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { BookOpen, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
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
import { ImageUpload } from "@/components/image-upload"
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
import { createBlogPostSchema, type BlogPost } from "@/features/blog/schemas"

const blogFormSchema = createBlogPostSchema.pick({
  title: true,
  excerpt: true,
  coverImageUrl: true,
  authorName: true,
  bodyHtml: true,
})

type BlogFormValues = z.infer<typeof blogFormSchema>

const emptyForm: BlogFormValues = {
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
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: emptyForm,
  })

  function openCreate() {
    setEditing(null)
    form.reset(emptyForm)
    setOpen(true)
  }

  function openEdit(post: BlogPost) {
    setEditing(post)
    form.reset({
      title: post.title,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl || "",
      authorName: post.authorName,
      bodyHtml: post.bodyHtml,
    })
    setOpen(true)
  }

  function submit(values: BlogFormValues) {
    const payload = {
      title: values.title.trim(),
      excerpt: (values.excerpt ?? "").trim(),
      coverImageUrl: (values.coverImageUrl ?? "").trim(),
      authorName: (values.authorName ?? "").trim() || "Staff",
      bodyHtml: values.bodyHtml,
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
            form.reset(emptyForm)
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
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="blog.read">
          <PageHeader
            title="Blog"
            description="Write church stories with cover images and rich content."
            icon={<BookOpen className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="blog.write">
                <TableAddButton onClick={openCreate}>
                  <Plus className="size-4" strokeWidth={1.75} />
                  New post
                </TableAddButton>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-xl bg-muted py-16 shadow-xs">
                <EmptyHeader>
                  <EmptyTitle>No blog posts</EmptyTitle>
                  <EmptyDescription>
                    Draft a story with a cover photo and rich body content.
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
                            <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
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
                              <p className="truncate text-sm font-medium text-foreground">
                                {post.title}
                              </p>
                              <p className="truncate text-xs text-zinc-400">{post.excerpt || post.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{post.authorName}</TableCell>
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
                                      : []),
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
              <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">
                    {editing ? "Edit post" : "New blog post"}
                  </SheetTitle>
                  <SheetDescription>
                    Add a cover image and rich body for this story.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup className="gap-4">
                    <TextFormField
                      control={form.control}
                      name="title"
                      label="Title"
                      placeholder="Sunday welcome story"
                    />
                    <TextFormField
                      control={form.control}
                      name="excerpt"
                      label="Excerpt"
                      placeholder="Short preview shown in the post list"
                    />
                    <FormField
                      control={form.control}
                      name="coverImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <ImageUpload
                            label="Cover image (optional)"
                            value={field.value ?? ""}
                            onChange={(url) => field.onChange(url)}
                            previewClassName="aspect-[21/9] w-full object-cover"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <TextFormField
                      control={form.control}
                      name="authorName"
                      label="Author"
                      placeholder="Pastor name"
                    />
                    <RichTextFormField
                      control={form.control}
                      name="bodyHtml"
                      label="Body"
                      placeholder="Write the story… use the toolbar for formatting and images."
                      minHeight="280px"
                      enableImages
                    />
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={create.isPending || update.isPending}
                  >
                    {editing ? "Save changes" : "Save draft"}
                  </Button>
                </SheetFooter>
              </form>
              </Form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(confirmPublish)}
            onOpenChange={(v) => !v && setConfirmPublish(null)}
            title="Publish this post?"
            description="Published stories become visible for members to read."
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
