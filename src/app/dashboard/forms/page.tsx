"use client"

import * as React from "react"
import { ClipboardList, Plus } from "lucide-react"
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
import { Form } from "@/components/ui/form"
import { TextFormField, TextareaFormField } from "@/components/form-fields"
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
  useCreateForm,
  useForms,
  usePublishForm,
} from "@/features/forms/hooks/use-forms"
import { createFormSchema, type ChurchForm } from "@/features/forms/schemas"

const formBuilderSchema = createFormSchema
  .pick({ title: true, description: true })
  .extend({
    slug: z
      .string()
      .refine((v) => !v || v.trim().length >= 2, "Slug must be at least 2 characters"),
  })

type FormBuilderValues = z.infer<typeof formBuilderSchema>

const emptyForm: FormBuilderValues = { title: "", slug: "", description: "" }

export default function FormsPage() {
  const { data, isLoading } = useForms()
  const create = useCreateForm()
  const publish = usePublishForm()
  const [open, setOpen] = React.useState(false)
  const [confirmPublish, setConfirmPublish] = React.useState<ChurchForm | null>(null)
  const form = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: emptyForm,
  })

  function openCreate() {
    form.reset(emptyForm)
    setOpen(true)
  }

  function submit(values: FormBuilderValues) {
    create.mutate(
      {
        title: values.title,
        slug: values.slug.trim() || undefined,
        description: values.description ?? "",
        status: "draft",
      },
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
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="forms.read">
          <PageHeader
            title="Forms"
            description="Public intake forms for prayer, serving, and connection."
            icon={<ClipboardList className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="forms.write">
                <Button
                  onClick={openCreate}
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  New form
                </Button>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-zinc-200/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No forms yet</EmptyTitle>
                  <EmptyDescription>
                    Create a form and publish it at /f/your-slug.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <TablePanel>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Form</TableHead>
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
                          <TableCell colSpan={5} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {(data ?? []).map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="pl-4">
                          <p className="font-medium text-zinc-900">{f.title}</p>
                          <p className="text-xs text-zinc-400">/f/{f.slug}</p>
                        </TableCell>
                        <TableCell>{f.fields.length}</TableCell>
                        <TableCell>{f.submissionCount}</TableCell>
                        <TableCell>
                          <StatusPill
                            tone={f.status === "published" ? "success" : "neutral"}
                          >
                            {f.status}
                          </StatusPill>
                        </TableCell>
                        <TableCell className="pr-3 text-right">
                          <RowActionsMenu
                            label="Form"
                            groups={[
                              {
                                items: [
                                  {
                                    label: "Open public link",
                                    onClick: () =>
                                      window.open(`/f/${f.slug}`, "_blank"),
                                  },
                                  ...(f.status !== "published"
                                    ? [
                                        {
                                          label: "Publish",
                                          onClick: () => setConfirmPublish(f),
                                        },
                                      ]
                                    : []),
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

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>New form</SheetTitle>
                  <SheetDescription>
                    Starts with Name + Email fields. Publish when ready for public submit.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
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
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={create.isPending}>
                    Create draft
                  </Button>
                </SheetFooter>
              </form>
              </Form>
            </SheetContent>
          </Sheet>

          <ConfirmAction
            open={Boolean(confirmPublish)}
            onOpenChange={(o) => !o && setConfirmPublish(null)}
            title="Publish this form?"
            description={
              confirmPublish
                ? `It will accept submissions at /f/${confirmPublish.slug}.`
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
