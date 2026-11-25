"use client"

import * as React from "react"
import { Package, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Form, FormField } from "@/components/ui/form"
import {
  NumberFormField,
  SelectFormField,
  TextFormField,
  TextareaFormField,
} from "@/components/form-fields"
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
import { TablePanel } from "@/components/table-panel"
import {
  useCreateResource,
  useResources,
} from "@/features/facilities/hooks/use-facilities"
import {
  RESOURCE_CATEGORIES,
  createResourceSchema,
} from "@/features/facilities/schemas"

const resourceFormSchema = createResourceSchema
  .pick({ name: true, description: true })
  .extend({
    category: z.enum(["equipment", "supply", "other"]),
    quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
    requiresApproval: z.boolean(),
  })

type ResourceFormValues = z.infer<typeof resourceFormSchema>

const emptyForm: ResourceFormValues = {
  name: "",
  category: "equipment",
  description: "",
  quantity: 1,
  requiresApproval: false,
}

export default function ResourcesPage() {
  const { data, isLoading } = useResources()
  const create = useCreateResource()
  const [open, setOpen] = React.useState(false)
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: emptyForm,
  })

  function openCreate() {
    form.reset(emptyForm)
    setOpen(true)
  }

  function submit(values: ResourceFormValues) {
    create.mutate(
      {
        name: values.name,
        category: values.category,
        description: values.description ?? "",
        quantity: values.quantity ?? 1,
        requiresApproval: values.requiresApproval,
        isActive: true,
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
        <RequireAbility permission="facilities.read">
          <PageHeader
            title="Resources"
            description="Equipment and supplies available for ministry use."
            icon={<Package className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="facilities.write">
                <Button
                  onClick={openCreate}
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  Add resource
                </Button>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-zinc-200/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No resources yet</EmptyTitle>
                  <EmptyDescription>
                    Track AV gear, tables, and supplies that teams can request.
                  </EmptyDescription>
                </EmptyHeader>
                <Can permission="facilities.write">
                  <Button className="mt-4"
                    onClick={openCreate}
                  >
                    Create resource
                  </Button>
                </Can>
              </Empty>
            ) : (
              <TablePanel>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Resource</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={4} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {(data ?? []).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="pl-4">
                          <p className="font-medium text-zinc-900">{r.name}</p>
                          <p className="text-xs text-zinc-400">
                            {r.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell className="capitalize">{r.category}</TableCell>
                        <TableCell>{r.quantity}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              r.isActive
                                ? "border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                                : "text-[10px]"
                            }
                          >
                            {r.isActive ? "Active" : "Inactive"}
                          </Badge>
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
                  <SheetTitle>Add resource</SheetTitle>
                  <SheetDescription>
                    Catalog equipment or supplies teams can book for events.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <TextFormField control={form.control} name="name" label="Name" />
                    <SelectFormField
                      control={form.control}
                      name="category"
                      label="Category"
                      options={RESOURCE_CATEGORIES.map((c) => ({
                        value: c.value,
                        label: c.label,
                      }))}
                    />
                    <NumberFormField
                      control={form.control}
                      name="quantity"
                      label="Quantity"
                      min={1}
                      step={1}
                    />
                    <TextareaFormField
                      control={form.control}
                      name="description"
                      label="Description"
                    />
                    <FormField
                      control={form.control}
                      name="requiresApproval"
                      render={({ field }) => (
                        <Field className="flex flex-row items-center justify-between gap-3">
                          <FieldLabel>Requires approval</FieldLabel>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={create.isPending}>
                    Save resource
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
