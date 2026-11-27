"use client"

import * as React from "react"
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ClipboardList,
  Copy,
  ExternalLink,
  GripVertical,
  Info,
  Plus,
  QrCode,
  Trash2,
  Users,
} from "lucide-react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ServiceDaySheet } from "@/components/attendance/service-day-sheet"
import { FormSubmissionsSheet } from "@/components/forms/form-submissions-sheet"
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
import { Form } from "@/components/ui/form"
import { SelectFormField, TextFormField, TextareaFormField } from "@/components/form-fields"
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
import {
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePanel,
  TableSearch,
} from "@/components/table-panel"
import { TableExportButton } from "@/components/table-export-button"
import {
  useAddFormField,
  useCreateForm,
  useFormDetail,
  useForms,
  usePublishForm,
  useRemoveFormField,
  useReorderFormFields,
  useUnpublishForm,
  useUpdateForm,
  useVisitorIntakeForm,
} from "@/features/forms/hooks/use-forms"
import {
  FORM_FIELD_TYPES,
  FORM_PURPOSES,
  updateFormSchema,
  type ChurchForm,
  type ChurchFormField,
} from "@/features/forms/schemas"
import { cn } from "cn"

const formBuilderSchema = z.object({
  title: z.string().min(2, "Title is required"),
    slug: z
      .string()
      .refine((v) => !v || v.trim().length >= 2, "Slug must be at least 2 characters"),
  description: z.string(),
  purpose: z.enum(["general", "visitor_intake"]),
  })

type FormBuilderValues = z.infer<typeof formBuilderSchema>
const fieldBuilderSchema = z.object({
  label: z.string().min(1),
  fieldType: z.enum([
    "short_text",
    "long_text",
    "multiple_choice",
    "checkboxes",
    "email",
    "phone",
    "number",
    "date",
    "time",
  ]),
  required: z.boolean(),
  optionsText: z.string().optional(),
  orderIndex: z.number().int().optional(),
})
type FieldBuilderValues = z.infer<typeof fieldBuilderSchema>

const emptyForm: FormBuilderValues = {
  title: "",
  slug: "",
  description: "",
  purpose: "general",
}
const PURPOSE_OPTIONS = FORM_PURPOSES.map((p) => ({ value: p.value, label: p.label }))
const emptyField: FieldBuilderValues = {
  label: "",
  fieldType: "short_text",
  required: false,
  optionsText: "",
}

const FIELD_TYPE_OPTIONS = FORM_FIELD_TYPES.map((t) => ({ value: t.value, label: t.label }))

function publicUrl(slug: string) {
  if (typeof window === "undefined") return `/f/${slug}`
  return `${window.location.origin}/f/${slug}`
}

function SortableFieldRow({
  field,
  locked,
  removing,
  onRemove,
}: {
  field: ChurchFormField
  locked: boolean
  removing: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    disabled: locked,
  })

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2.5",
        isDragging && "z-10 shadow-md ring-1 ring-brand/30"
      )}
    >
      {!locked ? (
        <button
          type="button"
          className="inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-zinc-400 hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder ${field.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" strokeWidth={1.75} />
        </button>
      ) : (
        <span className="size-8 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {field.label}
          {field.required ? <span className="text-rose-500"> *</span> : null}
        </p>
        <p className="text-xs text-zinc-500">
          {field.fieldType.replaceAll("_", " ")}
          {field.options?.length ? ` · ${field.options.join(", ")}` : ""}
        </p>
      </div>
      {!locked ? (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={removing}
          onClick={onRemove}
        >
          <Trash2 className="size-3.5 text-zinc-500" />
        </Button>
      ) : null}
    </li>
  )
}

function FormBuilderSheet({
  formId,
  open,
  onOpenChange,
}: {
  formId: string | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { data: form, isLoading } = useFormDetail(open ? formId : null)
  const updateForm = useUpdateForm(formId)
  const addField = useAddFormField(formId)
  const removeField = useRemoveFormField(formId)
  const reorderFields = useReorderFormFields(formId)
  const publish = usePublishForm()
  const unpublish = useUnpublishForm()
  const [orderedFields, setOrderedFields] = React.useState<ChurchFormField[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  type DetailsValues = z.infer<typeof updateFormSchema>
  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(updateFormSchema) as Resolver<DetailsValues>,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      purpose: "general",
    },
  })

  React.useEffect(() => {
    setOrderedFields(form?.fields ?? [])
  }, [form?.fields])

  React.useEffect(() => {
    if (!form) return
    detailsForm.reset({
      title: form.title,
      slug: form.slug,
      description: form.description || "",
      purpose: form.purpose,
    })
  }, [form, detailsForm])

  const fieldForm = useForm<FieldBuilderValues>({
    resolver: zodResolver(fieldBuilderSchema) as Resolver<FieldBuilderValues>,
    defaultValues: emptyField,
  })
  const fieldType = fieldForm.watch("fieldType")

  function submitDetails(values: DetailsValues) {
    updateForm.mutate(values)
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedFields.findIndex((f) => f.id === active.id)
    const newIndex = orderedFields.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(orderedFields, oldIndex, newIndex)
    setOrderedFields(next)
    reorderFields.mutate(next.map((f) => f.id), {
      onError: () => setOrderedFields(form?.fields ?? []),
    })
  }

  function submitField(values: FieldBuilderValues) {
    const options =
      values.fieldType === "multiple_choice" || values.fieldType === "checkboxes"
        ? (values.optionsText || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    if (
      (values.fieldType === "multiple_choice" || values.fieldType === "checkboxes") &&
      options.length === 0
    ) {
      toast.error("Add at least one option (comma-separated)")
      return
    }
    addField.mutate(
      {
        label: values.label,
        fieldType: values.fieldType,
        required: values.required,
        options,
      },
      { onSuccess: () => fieldForm.reset(emptyField) }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset size="lg" className="isolate bg-background p-0">
        <SheetHeader className="border-b border-border bg-background pr-12">
          <SheetTitle>{form?.title || "Form builder"}</SheetTitle>
          <SheetDescription>
            Edit details and fields anytime — even while published. People fill it at /f/your-slug.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="gap-6 bg-background">
          {isLoading || !form ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" /> Loading form…
            </div>
          ) : (
            <>
              <Form {...detailsForm}>
                <form
                  onSubmit={detailsForm.handleSubmit(submitDetails)}
                  className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">Form details</p>
                    <StatusPill tone={form.status === "published" ? "success" : "neutral"}>
                      {form.status}
                    </StatusPill>
                  </div>
                  <FieldGroup className="gap-3">
                    <TextFormField
                      control={detailsForm.control}
                      name="title"
                      label="Title"
                    />
                    <TextFormField
                      control={detailsForm.control}
                      name="slug"
                      label="Public slug"
                      placeholder="visitor-connect"
                    />
                    <TextareaFormField
                      control={detailsForm.control}
                      name="description"
                      label="Description"
                    />
                    <SelectFormField
                      control={detailsForm.control}
                      name="purpose"
                      label="Purpose"
                      options={PURPOSE_OPTIONS}
                    />
                  </FieldGroup>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="submit" variant="primary" disabled={updateForm.isPending}>
                      {updateForm.isPending ? (
                        <>
                          <Spinner className="size-3.5" />
                          Saving…
                        </>
                      ) : (
                        "Save details"
                      )}
                    </Button>
                    <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">
                      {publicUrl(detailsForm.watch("slug") || form.slug)}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard.writeText(
                          publicUrl(detailsForm.getValues("slug") || form.slug)
                        )
                        toast.success("Link copied")
                      }}
                    >
                      <Copy className="size-3.5" />
                      Copy
                    </Button>
                    {form.status === "published" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/f/${form.slug}`, "_blank")}
                      >
                        <ExternalLink className="size-3.5" />
                        Open
                      </Button>
                    ) : null}
                  </div>
                </form>
              </Form>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Fields</h3>
                  <StatusPill tone={form.status === "published" ? "success" : "neutral"}>
                    {form.status}
                  </StatusPill>
                </div>
                {orderedFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No fields yet.</p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext
                      items={orderedFields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul className="space-y-2">
                        {orderedFields.map((f) => (
                          <SortableFieldRow
                            key={f.id}
                            field={f}
                            locked={false}
                            removing={removeField.isPending}
                            onRemove={() => removeField.mutate(f.id)}
                          />
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                )}
                {orderedFields.length > 1 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Drag the handle to reorder fields.
                  </p>
                ) : null}
              </div>

              <Form {...fieldForm}>
                <form
                  onSubmit={fieldForm.handleSubmit(submitField)}
                  className="space-y-3 rounded-xl border border-dashed border-border bg-card p-4"
                >
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Add field
                  </p>
                  <FieldGroup className="gap-3">
                    <TextFormField
                      control={fieldForm.control}
                      name="label"
                      label="Label"
                      placeholder="e.g. Prayer request"
                    />
                    <SelectFormField
                      control={fieldForm.control}
                      name="fieldType"
                      label="Type"
                      options={FIELD_TYPE_OPTIONS}
                    />
                    {fieldType === "multiple_choice" || fieldType === "checkboxes" ? (
                      <TextFormField
                        control={fieldForm.control}
                        name="optionsText"
                        label="Options (comma-separated)"
                        placeholder="Worship, Kids, Hospitality"
                      />
                    ) : null}
                  </FieldGroup>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border"
                      checked={Boolean(fieldForm.watch("required"))}
                      onChange={(e) => fieldForm.setValue("required", e.target.checked)}
                    />
                    Required
                  </label>
                  <Button type="submit" variant="primary" disabled={addField.isPending}>
                    {addField.isPending ? (
                      <>
                        <Spinner className="size-3.5" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5" />
                        Add field
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </SheetBody>
        <SheetFooter className="bg-background">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {form?.status === "published" ? (
            <Button
              type="button"
              variant="outline"
              disabled={unpublish.isPending}
              onClick={() => form && unpublish.mutate(form.id)}
            >
              {unpublish.isPending ? "Unpublishing…" : "Unpublish"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled={!form || form.fields.length === 0 || publish.isPending}
              onClick={() => form && publish.mutate(form.id)}
            >
              {publish.isPending ? "Publishing…" : "Publish form"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default function FormsPage() {
  const { data, isLoading } = useForms()
  const create = useCreateForm()
  const ensureVisitor = useVisitorIntakeForm(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [builderId, setBuilderId] = React.useState<string | null>(null)
  const [confirmPublish, setConfirmPublish] = React.useState<ChurchForm | null>(null)
  const [serviceDayOpen, setServiceDayOpen] = React.useState(false)
  const [submissionsFormId, setSubmissionsFormId] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const publish = usePublishForm()
  const unpublish = useUnpublishForm()

  const visitorForm = React.useMemo(
    () => (data ?? []).find((f) => f.purpose === "visitor_intake" && f.status === "published"),
    [data]
  )
  const formPublicUrl = React.useMemo(() => {
    if (!visitorForm) return null
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    return `${origin}/f/${visitorForm.slug}`
  }, [visitorForm])
  const form = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema) as Resolver<FormBuilderValues>,
    defaultValues: emptyForm,
  })
  const purposeWatch = form.watch("purpose")

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = data ?? []
    if (!q) return list
    return list.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.slug.toLowerCase().includes(q) ||
        f.purpose.toLowerCase().includes(q) ||
        f.status.toLowerCase().includes(q)
    )
  }, [data, search])

  const exportPayload = React.useMemo(
    () => ({
      filename: "forms",
      title: "Forms",
      headers: ["Title", "Slug", "Purpose", "Fields", "Submissions", "Status"],
      rows: rows.map((f) => [
        f.title,
        f.slug,
        f.purpose === "visitor_intake" ? "Visitor intake" : "General",
        f.fields.length,
        f.submissionCount,
        f.status,
      ]),
    }),
    [rows]
  )

  React.useEffect(() => {
    if (purposeWatch === "visitor_intake") {
      const cur = form.getValues()
      if (!cur.title.trim()) form.setValue("title", "Visitor Connect")
      if (!cur.slug.trim()) form.setValue("slug", "visitor-connect")
      if (!(cur.description ?? "").trim()) {
        form.setValue(
          "description",
          "Share your details so our welcome team can follow up."
        )
      }
    }
  }, [purposeWatch, form])

  function openCreate() {
    form.reset(emptyForm)
    setCreateOpen(true)
  }

  async function openVisitorIntake() {
    const existing = (data ?? []).find((f) => f.purpose === "visitor_intake")
    if (existing) {
      setBuilderId(existing.id)
      return
    }
    const ensured = await ensureVisitor.refetch()
    if (ensured.data) setBuilderId(ensured.data.id)
  }

  function submit(values: FormBuilderValues) {
    create.mutate(
      {
        title: values.title,
        slug: values.slug.trim() || undefined,
        description: values.description ?? "",
        purpose: values.purpose,
        status: "draft",
      },
      {
        onSuccess: (created) => {
          setCreateOpen(false)
          form.reset(emptyForm)
          setBuilderId(created.id)
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
        <RequireAbility permission="forms.read">
          <PageHeader
            title="Forms"
            description="Build public intake forms. Draft → add fields → publish → share /f/slug."
            icon={<ClipboardList className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="forms.write">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => void openVisitorIntake()}>
                    Visitor form
                  </Button>
                  <Button onClick={openCreate}>
                  <Plus strokeWidth={2} className="size-3.5" />
                  New form
                </Button>
                </div>
              </Can>
            }
          />

          <div className="space-y-4 p-6 md:p-8">
            <Alert className="items-start gap-x-3 border-border bg-card px-4 py-3.5 text-sm shadow-xs has-[>svg]:grid-cols-[auto_1fr] *:[svg]:size-4 *:[svg]:translate-y-0.5">
              <Info className="text-brand" strokeWidth={1.75} />
              <AlertTitle className="text-sm font-medium text-foreground">
                How forms work
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Create a draft, add questions, then publish. Guests fill it at{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  /f/your-slug
                </code>
                . Visitor intake also creates a lead — share the QR and open a visitor list for
                each service day to track arrivals.
              </AlertDescription>
              <div className="col-span-full mt-3 flex flex-wrap gap-2 sm:col-start-2">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => setServiceDayOpen(true)}
                >
                  <QrCode className="size-3.5" />
                  Share QR &amp; service day
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setServiceDayOpen(true)}
                >
                  <Users className="size-3.5" />
                  Open visitor list
                </Button>
              </div>
            </Alert>

            <ServiceDaySheet
              open={serviceDayOpen}
              onOpenChange={setServiceDayOpen}
              formUrl={formPublicUrl}
              formTitle={visitorForm?.title}
            />

            <FormSubmissionsSheet
              formId={submissionsFormId}
              open={Boolean(submissionsFormId)}
              onOpenChange={(open) => {
                if (!open) setSubmissionsFormId(null)
              }}
              onEditForm={(id) => setBuilderId(id)}
            />

            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-border py-16">
                <EmptyHeader>
                  <EmptyTitle>No forms yet</EmptyTitle>
                  <EmptyDescription>
                    Create a draft, add fields, then publish for public submissions.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <TablePanel>
                <TableChrome
                  search={
                    <TableSearch
                      value={search}
                      onChange={setSearch}
                      placeholder="Search forms…"
                    />
                  }
                  trailing={
                    <>
                      <TableExportButton payload={exportPayload} />
                      <Can permission="forms.write">
                        <TableAddButton onClick={openCreate}>
                          <Plus strokeWidth={2} className="size-3.5" />
                          New form
                        </TableAddButton>
                      </Can>
                    </>
                  }
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Form</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {rows.map((f) => (
                      <TableRow
                        key={f.id}
                        className="cursor-pointer"
                        onClick={() => setBuilderId(f.id)}
                      >
                        <TableCell className="pl-4">
                          <p className="font-medium text-foreground">{f.title}</p>
                          <p className="text-xs text-muted-foreground">/f/{f.slug}</p>
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            tone={f.purpose === "visitor_intake" ? "info" : "neutral"}
                          >
                            {f.purpose === "visitor_intake" ? "Visitor intake" : "General"}
                          </StatusPill>
                        </TableCell>
                        <TableCell>{f.fields.length}</TableCell>
                        <TableCell
                          onClick={(e) => {
                            e.stopPropagation()
                            setSubmissionsFormId(f.id)
                          }}
                        >
                          <button
                            type="button"
                            className="rounded-md px-1.5 py-0.5 text-left text-sm font-medium text-brand underline-offset-2 hover:underline"
                          >
                            {f.submissionCount}
                          </button>
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            tone={f.status === "published" ? "success" : "neutral"}
                          >
                            {f.status}
                          </StatusPill>
                        </TableCell>
                        <TableCell
                          className="pr-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RowActionsMenu
                            label="Form"
                            groups={[
                              {
                                items: [
                                  {
                                    label: "Edit form",
                                    onClick: () => setBuilderId(f.id),
                                  },
                                  {
                                    label: "View submissions",
                                    onClick: () => setSubmissionsFormId(f.id),
                                  },
                                  {
                                    label: "Open public link",
                                    onClick: () => window.open(`/f/${f.slug}`, "_blank"),
                                    disabled: f.status !== "published",
                                  },
                                  ...(f.status === "published"
                                    ? [
                                        {
                                          label: "Unpublish",
                                          onClick: () => unpublish.mutate(f.id),
                                        },
                                      ]
                                    : [
                                        {
                                          label: "Publish",
                                          onClick: () => setConfirmPublish(f),
                                        },
                                      ]),
                                ],
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TablePanel>
            )}
          </div>

          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetContent side="right" inset size="md" className="bg-background p-0">
              <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>New form</SheetTitle>
                  <SheetDescription>
                      {purposeWatch === "visitor_intake"
                        ? "Starts with visitor fields (name, email, phone, source). Submissions create Visitors leads."
                        : "Creates a draft with Name + Email. You&apos;ll add more fields next."}
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                      <SelectFormField
                        control={form.control}
                        name="purpose"
                        label="Purpose"
                        options={PURPOSE_OPTIONS}
                      />
                    <TextFormField control={form.control} name="title" label="Title" />
                    <TextFormField
                      control={form.control}
                      name="slug"
                      label="Slug"
                      placeholder="auto from title"
                    />
                    <TextareaFormField
                      control={form.control}
                      name="description"
                      label="Description"
                    />
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={create.isPending}>
                      {create.isPending ? "Creating…" : "Create draft"}
                  </Button>
                </SheetFooter>
              </form>
              </Form>
            </SheetContent>
          </Sheet>

          <FormBuilderSheet
            formId={builderId}
            open={Boolean(builderId)}
            onOpenChange={(o) => {
              if (!o) setBuilderId(null)
            }}
          />

          <ConfirmAction
            open={Boolean(confirmPublish)}
            onOpenChange={(o) => !o && setConfirmPublish(null)}
            title="Publish this form?"
            description={
              confirmPublish
                ? `It will accept submissions at /f/${confirmPublish.slug}. Field editing locks until you unpublish.`
                : ""
            }
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
