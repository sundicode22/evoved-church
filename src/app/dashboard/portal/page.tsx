"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ExternalLink, GripVertical, LayoutTemplate, Mail, Pencil, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { FieldGroup } from "@/components/ui/field"
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form"
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
import { SelectFormField, TextareaFormField, TextFormField } from "@/components/form-fields"
import { ConfirmAction } from "@/components/confirm-action"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { Can, RequireAbility } from "@/components/auth/can"
import { StatusPill, TableAddButton, TablePanel } from "@/components/table-panel"
import { useAbility } from "@/features/auth/ability-context"
import {
  useAddPortalBlock,
  useDeleteNewsletterIssue,
  useDeleteSubscriber,
  useCreateNewsletterIssue,
  useNewsletterIssues,
  useNewsletterSubscribers,
  usePortal,
  usePortals,
  useRemovePortalBlock,
  useSendNewsletterIssue,
  useUpdateNewsletterIssue,
  useUpdatePortalBlock,
  useUpdatePortalFlags,
  useUpdatePortalLayout,
  useUpdatePortalTheme,
} from "@/features/portal/hooks/use-portal"
import {
  BLOCK_TYPE_LABELS,
  SCRIPTURE_PRESETS,
  createNewsletterIssueSchema,
  portalBlockTypeSchema,
  type NewsletterIssue,
  type NewsletterSubscriber,
  type PortalBlock,
  type PortalBlockType,
} from "@/features/portal/schemas"

/* -------------------------------------------------------------------------- */
/* Form schemas                                                               */
/* -------------------------------------------------------------------------- */

const blockFormSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  reference: z.string().optional(),
  translation: z.string().optional(),
  verseText: z.string().optional(),
})
type BlockFormValues = z.infer<typeof blockFormSchema>

const themeFormSchema = z.object({
  headline: z.string().min(2, "Headline is required"),
  tagline: z.string(),
  accent: z.enum(["brand", "emerald"]),
  showNav: z.boolean(),
})
type ThemeFormValues = z.infer<typeof themeFormSchema>

const issueFormSchema = createNewsletterIssueSchema.extend({
  previewText: z.string(),
})
type IssueFormValues = z.infer<typeof issueFormSchema>

const emptyIssue: IssueFormValues = { subject: "", previewText: "", bodyHtml: "" }

const ACCENT_OPTIONS = [
  { value: "brand", label: "Brand (cornflower)" },
  { value: "emerald", label: "Emerald" },
]

const BLOCK_TYPES = portalBlockTypeSchema.options

/** Which editable fields each block type exposes. */
const BLOCK_FIELDS: Record<
  PortalBlockType,
  { subtitle?: boolean; body?: boolean; cta?: boolean; scripture?: boolean }
> = {
  hero: { subtitle: true, cta: true },
  scripture: { scripture: true },
  stories: { subtitle: true },
  events: { subtitle: true },
  groups: { subtitle: true },
  announcements: { subtitle: true },
  newsletter: { subtitle: true },
  give_cta: { subtitle: true, cta: true },
  custom_text: { body: true },
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return format(parseISO(value), "MMM d, yyyy")
  } catch {
    return "—"
  }
}

/* -------------------------------------------------------------------------- */
/* Sortable block row                                                         */
/* -------------------------------------------------------------------------- */

function SortableBlockRow({
  block,
  canWrite,
  onToggle,
  onEdit,
  onDelete,
}: {
  block: PortalBlock
  canWrite: boolean
  onToggle: (enabled: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: !canWrite,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-xs ${
        isDragging ? "relative z-10 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        disabled={!canWrite}
        className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" strokeWidth={1.75} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium tracking-tight text-zinc-900">
          {BLOCK_TYPE_LABELS[block.type]}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {block.title || "No title"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={block.enabled}
          disabled={!canWrite}
          onCheckedChange={onToggle}
          aria-label={`${block.enabled ? "Hide" : "Show"} ${BLOCK_TYPE_LABELS[block.type]}`}
        />
        <Can permission="blog.write">
          <Button type="button" variant="outline" onClick={onEdit}>
            <Pencil className="size-3.5" strokeWidth={1.75} />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Delete section"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} />
          </Button>
        </Can>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Block edit sheet                                                           */
/* -------------------------------------------------------------------------- */

function BlockEditSheet({
  block,
  slug,
  onClose,
}: {
  block: PortalBlock | null
  slug: string
  onClose: () => void
}) {
  const updateBlock = useUpdatePortalBlock(slug)
  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: {},
  })

  React.useEffect(() => {
    if (!block) return
    form.reset({
      title: block.title ?? "",
      subtitle: block.subtitle ?? "",
      body: block.body ?? "",
      ctaLabel: block.ctaLabel ?? "",
      ctaHref: block.ctaHref ?? "",
      reference: block.reference ?? "",
      translation: block.translation ?? "",
      verseText: block.verseText ?? "",
    })
  }, [block, form])

  const fields = block ? BLOCK_FIELDS[block.type] : {}

  function submit(values: BlockFormValues) {
    if (!block) return
    const payload: Partial<PortalBlock> & { id: string } = { id: block.id, title: values.title?.trim() }
    if (fields.subtitle) payload.subtitle = values.subtitle?.trim()
    if (fields.body) payload.body = values.body
    if (fields.cta) {
      payload.ctaLabel = values.ctaLabel?.trim()
      payload.ctaHref = values.ctaHref?.trim()
    }
    if (fields.scripture) {
      payload.reference = values.reference?.trim()
      payload.translation = values.translation?.trim()
      payload.verseText = values.verseText?.trim()
    }
    updateBlock.mutate(payload, { onSuccess: onClose })
  }

  return (
    <Sheet open={Boolean(block)} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" inset size="lg" className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
            <SheetHeader className="pr-12">
              <SheetTitle className="font-medium tracking-tight">
                Edit {block ? BLOCK_TYPE_LABELS[block.type] : "section"}
              </SheetTitle>
              <SheetDescription>Update the copy shown in this portal section.</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <FieldGroup className="gap-4">
                <TextFormField control={form.control} name="title" label="Title" />
                {fields.subtitle && (
                  <TextFormField control={form.control} name="subtitle" label="Subtitle" />
                )}
                {fields.body && (
                  <TextareaFormField control={form.control} name="body" label="Body" rows={6} />
                )}
                {fields.scripture && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-zinc-900">Presets</p>
                      <div className="flex flex-wrap gap-2">
                        {SCRIPTURE_PRESETS.map((preset) => (
                          <Button
                            key={preset.reference}
                            type="button"
                            variant="outline"
                            onClick={() => {
                              form.setValue("reference", preset.reference, { shouldDirty: true })
                              form.setValue("translation", preset.translation, { shouldDirty: true })
                              form.setValue("verseText", preset.verseText, { shouldDirty: true })
                            }}
                          >
                            {preset.reference}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <TextFormField
                        control={form.control}
                        name="reference"
                        label="Reference"
                        placeholder="John 3:16"
                      />
                      <TextFormField
                        control={form.control}
                        name="translation"
                        label="Translation"
                        placeholder="ESV"
                      />
                    </div>
                    <TextareaFormField
                      control={form.control}
                      name="verseText"
                      label="Verse text"
                      rows={4}
                    />
                  </>
                )}
                {fields.cta && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextFormField control={form.control} name="ctaLabel" label="Button label" />
                    <TextFormField
                      control={form.control}
                      name="ctaHref"
                      label="Button link"
                      placeholder="/portal/main/blog"
                    />
                  </div>
                )}
              </FieldGroup>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateBlock.isPending}>
                Save changes
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

/* -------------------------------------------------------------------------- */
/* Layout tab                                                                 */
/* -------------------------------------------------------------------------- */

function LayoutTab({
  slug,
  blocks,
  isLoading,
}: {
  slug: string
  blocks: PortalBlock[]
  isLoading: boolean
}) {
  const { can } = useAbility()
  const canWrite = can("blog.write")
  const updateLayout = useUpdatePortalLayout(slug)
  const updateBlock = useUpdatePortalBlock(slug)
  const addBlock = useAddPortalBlock(slug)
  const removeBlock = useRemovePortalBlock(slug)

  const [override, setOverride] = React.useState<{
    source: PortalBlock[]
    list: PortalBlock[]
  } | null>(null)
  // Optimistic order applies only until fresh server data arrives.
  const ordered = override && override.source === blocks ? override.list : blocks
  const [editing, setEditing] = React.useState<PortalBlock | null>(null)
  const [deleting, setDeleting] = React.useState<PortalBlock | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = ordered.findIndex((b) => b.id === active.id)
    const to = ordered.findIndex((b) => b.id === over.id)
    if (from < 0 || to < 0) return
    const next = arrayMove(ordered, from, to)
    setOverride({ source: blocks, list: next })
    updateLayout.mutate(next, { onError: () => setOverride(null) })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">Sections</h2>
          <p className="text-sm text-zinc-500">
            Drag to reorder. Toggle a section to show or hide it on the portal.
          </p>
        </div>
        <Can permission="blog.write">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="primary" disabled={addBlock.isPending} />}
            >
              <Plus className="size-4" strokeWidth={1.75} />
              Add section
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              {BLOCK_TYPES.map((type) => (
                <DropdownMenuItem key={type} onClick={() => addBlock.mutate(type)}>
                  {BLOCK_TYPE_LABELS[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Can>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-lg" />
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <Empty className="rounded-xl bg-[#f8faf9] py-16 shadow-xs">
          <EmptyHeader>
            <EmptyTitle>No sections yet</EmptyTitle>
            <EmptyDescription>Add a hero, scripture, or stories section to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ordered.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ordered.map((block) => (
                <SortableBlockRow
                  key={block.id}
                  block={block}
                  canWrite={canWrite}
                  onToggle={(enabled) => updateBlock.mutate({ id: block.id, enabled })}
                  onEdit={() => setEditing(block)}
                  onDelete={() => setDeleting(block)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <BlockEditSheet block={editing} slug={slug} onClose={() => setEditing(null)} />

      <ConfirmAction
        open={Boolean(deleting)}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Remove this section?"
        description={
          deleting
            ? `“${BLOCK_TYPE_LABELS[deleting.type]}” will no longer appear on the portal.`
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
        loading={removeBlock.isPending}
        onConfirm={async () => {
          if (!deleting) return
          await removeBlock.mutateAsync(deleting.id)
          setDeleting(null)
        }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Theme tab                                                                  */
/* -------------------------------------------------------------------------- */

function ThemeTab({
  slug,
  theme,
  flags,
  isLoading,
}: {
  slug: string
  theme?: ThemeFormValues
  flags?: { publicEvents: boolean; publicGroups: boolean; publicGiving: boolean }
  isLoading: boolean
}) {
  const { can } = useAbility()
  const canWrite = can("blog.write")
  const updateTheme = useUpdatePortalTheme(slug)
  const updateFlags = useUpdatePortalFlags(slug)

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: { headline: "", tagline: "", accent: "brand", showNav: true },
  })

  React.useEffect(() => {
    if (theme) form.reset(theme)
  }, [theme, form])

  const flagRows: {
    key: "publicEvents" | "publicGroups" | "publicGiving"
    label: string
    description: string
  }[] = [
    { key: "publicEvents", label: "Public events", description: "Show upcoming events on the portal." },
    { key: "publicGroups", label: "Public groups", description: "List open groups members can join." },
    { key: "publicGiving", label: "Public giving", description: "Show a give link on the portal." },
  ]

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-lg" />
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">Theme</h2>
          <p className="text-sm text-zinc-500">Headline and style for the top of the portal.</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              updateTheme.mutate({
                headline: values.headline.trim(),
                tagline: values.tagline.trim(),
                accent: values.accent,
                showNav: values.showNav,
              })
            )}
            className="space-y-4"
          >
            <FieldGroup className="gap-4">
              <TextFormField
                control={form.control}
                name="headline"
                label="Headline"
                placeholder="Welcome"
                disabled={!canWrite}
              />
              <TextareaFormField
                control={form.control}
                name="tagline"
                label="Tagline"
                rows={3}
                disabled={!canWrite}
              />
              <SelectFormField
                control={form.control}
                name="accent"
                label="Accent"
                options={ACCENT_OPTIONS}
                disabled={!canWrite}
              />
              <FormField
                control={form.control}
                name="showNav"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3">
                    <FormLabel className="text-sm">Show navigation</FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canWrite}
                    />
                  </FormItem>
                )}
              />
            </FieldGroup>
            <Can permission="blog.write">
              <div className="flex justify-end">
                <Button type="submit" disabled={updateTheme.isPending}>
                  Save theme
                </Button>
              </div>
            </Can>
          </form>
        </Form>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">Visibility</h2>
          <p className="text-sm text-zinc-500">Choose what members can see without signing in.</p>
        </div>
        <div className="space-y-2">
          {flagRows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium tracking-tight text-zinc-900">{row.label}</p>
                <p className="text-xs text-zinc-500">{row.description}</p>
              </div>
              <Switch
                checked={flags?.[row.key] ?? false}
                disabled={!canWrite || updateFlags.isPending}
                onCheckedChange={(checked) => updateFlags.mutate({ [row.key]: checked })}
                aria-label={row.label}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Newsletter tab                                                             */
/* -------------------------------------------------------------------------- */

function subscriberTone(status: NewsletterSubscriber["status"]) {
  if (status === "subscribed") return "success" as const
  if (status === "pending") return "warning" as const
  return "neutral" as const
}

function NewsletterTab() {
  const subscribers = useNewsletterSubscribers()
  const issues = useNewsletterIssues()
  const createIssue = useCreateNewsletterIssue()
  const updateIssue = useUpdateNewsletterIssue()
  const deleteIssue = useDeleteNewsletterIssue()
  const sendIssue = useSendNewsletterIssue()
  const deleteSubscriber = useDeleteSubscriber()

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<NewsletterIssue | null>(null)
  const [sending, setSending] = React.useState<NewsletterIssue | null>(null)
  const [deletingIssue, setDeletingIssue] = React.useState<NewsletterIssue | null>(null)
  const [deletingSub, setDeletingSub] = React.useState<NewsletterSubscriber | null>(null)

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: emptyIssue,
  })

  function openCreate() {
    setEditing(null)
    form.reset(emptyIssue)
    setSheetOpen(true)
  }

  function openEdit(issue: NewsletterIssue) {
    setEditing(issue)
    form.reset({
      subject: issue.subject,
      previewText: issue.previewText ?? "",
      bodyHtml: issue.bodyHtml,
    })
    setSheetOpen(true)
  }

  function submit(values: IssueFormValues) {
    const payload = {
      subject: values.subject.trim(),
      previewText: values.previewText.trim(),
      bodyHtml: values.bodyHtml,
    }
    const done = {
      onSuccess: () => {
        setSheetOpen(false)
        setEditing(null)
        form.reset(emptyIssue)
      },
    }
    if (editing) updateIssue.mutate({ id: editing.id, ...payload }, done)
    else createIssue.mutate(payload, done)
  }

  const subscriberList = subscribers.data ?? []
  const issueList = issues.data ?? []

  return (
    <div className="space-y-8">
      {/* Issues */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">Issues</h2>
            <p className="text-sm text-zinc-500">Draft and send newsletters to subscribers.</p>
          </div>
          <Can permission="blog.write">
            <TableAddButton onClick={openCreate}>
              <Plus className="size-4" strokeWidth={1.75} />
              New issue
            </TableAddButton>
          </Can>
        </div>

        {!issues.isLoading && issueList.length === 0 ? (
          <Empty className="rounded-xl bg-[#f8faf9] py-12 shadow-xs">
            <EmptyHeader>
              <EmptyTitle>No issues yet</EmptyTitle>
              <EmptyDescription>Write your first newsletter draft.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <TablePanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.isLoading &&
                  [0, 1].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="pl-4">
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                {issueList.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="pl-4">
                      <p className="truncate text-sm font-medium text-zinc-900">{issue.subject}</p>
                      <p className="truncate text-xs text-zinc-400">{issue.previewText || "—"}</p>
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={issue.status === "sent" ? "success" : "warning"}>
                        {issue.status}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">{formatDate(issue.sentAt)}</TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {issue.status === "sent" ? issue.recipientCount : "—"}
                    </TableCell>
                    <TableCell>
                      <Can permission="blog.write">
                        <RowActionsMenu
                          label="Issue"
                          groups={[
                            ...(issue.status === "draft"
                              ? [
                                  {
                                    items: [
                                      { label: "Edit draft", onClick: () => openEdit(issue) },
                                      { label: "Send", onClick: () => setSending(issue) },
                                    ],
                                  },
                                ]
                              : []),
                            {
                              items: [
                                {
                                  label: "Delete",
                                  destructive: true,
                                  onClick: () => setDeletingIssue(issue),
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
      </section>

      {/* Subscribers */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">Subscribers</h2>
          <p className="text-sm text-zinc-500">
            {subscriberList.length} subscriber{subscriberList.length === 1 ? "" : "s"}
          </p>
        </div>
        {!subscribers.isLoading && subscriberList.length === 0 ? (
          <Empty className="rounded-xl bg-[#f8faf9] py-12 shadow-xs">
            <EmptyHeader>
              <EmptyTitle>No subscribers yet</EmptyTitle>
              <EmptyDescription>
                Members who sign up through the portal newsletter section appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <TablePanel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.isLoading &&
                  [0, 1, 2].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4} className="pl-4">
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                {subscriberList.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="pl-4 text-sm font-medium text-zinc-900">{sub.email}</TableCell>
                    <TableCell className="text-sm text-zinc-600">{sub.name || "—"}</TableCell>
                    <TableCell>
                      <StatusPill tone={subscriberTone(sub.status)}>{sub.status}</StatusPill>
                    </TableCell>
                    <TableCell>
                      <Can permission="blog.write">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete subscriber"
                          onClick={() => setDeletingSub(sub)}
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.75} />
                        </Button>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TablePanel>
        )}
      </section>

      {/* Create / edit issue */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" inset size="lg" className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
              <SheetHeader className="pr-12">
                <SheetTitle className="font-medium tracking-tight">
                  {editing ? "Edit draft" : "New issue"}
                </SheetTitle>
                <SheetDescription>
                  Compose the message. Nothing is sent until you confirm.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <FieldGroup className="gap-4">
                  <TextFormField
                    control={form.control}
                    name="subject"
                    label="Subject"
                    placeholder="This week at church"
                  />
                  <TextFormField
                    control={form.control}
                    name="previewText"
                    label="Preview text"
                    placeholder="Shown in the inbox next to the subject"
                  />
                  <TextareaFormField
                    control={form.control}
                    name="bodyHtml"
                    label="Body (HTML)"
                    rows={12}
                    placeholder="<p>Hello church family…</p>"
                  />
                </FieldGroup>
              </SheetBody>
              <SheetFooter>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={editing ? "default" : "primary"}
                  disabled={createIssue.isPending || updateIssue.isPending}
                >
                  {editing ? "Save draft" : "Create draft"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <ConfirmAction
        open={Boolean(sending)}
        onOpenChange={(v) => !v && setSending(null)}
        title="Send this newsletter?"
        description={
          sending
            ? `“${sending.subject}” will be emailed to all subscribed members. This cannot be undone.`
            : ""
        }
        confirmLabel="Send"
        loading={sendIssue.isPending}
        onConfirm={async () => {
          if (!sending) return
          await sendIssue.mutateAsync(sending.id)
          setSending(null)
        }}
      />

      <ConfirmAction
        open={Boolean(deletingIssue)}
        onOpenChange={(v) => !v && setDeletingIssue(null)}
        title="Delete this issue?"
        description="The issue will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteIssue.isPending}
        onConfirm={async () => {
          if (!deletingIssue) return
          await deleteIssue.mutateAsync(deletingIssue.id)
          setDeletingIssue(null)
        }}
      />

      <ConfirmAction
        open={Boolean(deletingSub)}
        onOpenChange={(v) => !v && setDeletingSub(null)}
        title="Remove subscriber?"
        description={deletingSub ? `${deletingSub.email} will be removed from the list.` : ""}
        confirmLabel="Remove"
        variant="destructive"
        loading={deleteSubscriber.isPending}
        onConfirm={async () => {
          if (!deletingSub) return
          await deleteSubscriber.mutateAsync(deletingSub.id)
          setDeletingSub(null)
        }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PortalStudioPage() {
  const { data: portals } = usePortals()
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null)
  const slug = selectedSlug ?? portals?.[0]?.slug ?? "main"

  const { data: portal, isLoading } = usePortal(slug)
  const settings = portal?.settings

  const blocks = React.useMemo(() => settings?.blocks ?? [], [settings?.blocks])
  const theme = React.useMemo(
    () =>
      settings
        ? {
            headline: settings.theme.headline,
            tagline: settings.theme.tagline,
            accent: settings.theme.accent,
            showNav: settings.theme.showNav,
          }
        : undefined,
    [settings]
  )
  const flags = React.useMemo(
    () =>
      settings
        ? {
            publicEvents: settings.publicEvents,
            publicGroups: settings.publicGroups,
            publicGiving: settings.publicGiving,
          }
        : undefined,
    [settings]
  )

  const slugOptions = (portals ?? []).map((p) => ({ value: p.slug, label: p.churchName || p.slug }))

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="blog.read">
          <PageHeader
            title="Portal Studio"
            description="Design the public member portal."
            icon={<LayoutTemplate className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <div className="flex items-center gap-2">
                {slugOptions.length > 1 && (
                  <Select
                    value={slug}
                    items={slugOptions}
                    onValueChange={(v) => v && setSelectedSlug(v)}
                  >
                    <SelectTrigger className="min-w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {slugOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Link
                  href={`/portal/${slug}`}
                  target="_blank"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink className="size-4" strokeWidth={1.75} />
                  View portal
                </Link>
              </div>
            }
          />

          <div className="p-6 md:p-8">
            <Tabs defaultValue="layout" className="gap-6">
              <TabsList>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="theme">Theme</TabsTrigger>
                <TabsTrigger value="newsletter">
                  <Mail className="size-3.5" strokeWidth={1.75} />
                  Newsletter
                </TabsTrigger>
              </TabsList>

              <TabsContent value="layout">
                <LayoutTab slug={slug} blocks={blocks} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="theme">
                <ThemeTab slug={slug} theme={theme} flags={flags} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="newsletter">
                <NewsletterTab />
              </TabsContent>
            </Tabs>
          </div>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
