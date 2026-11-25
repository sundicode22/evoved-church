"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { SelectFormField, TextFormField } from "@/components/form-fields"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { createCustomFieldSchema } from "@/features/settings/schemas"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

type CustomFieldFormInput = z.input<typeof createCustomFieldSchema>
type CustomFieldFormOutput = z.output<typeof createCustomFieldSchema>

const ENTITY_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "visitor", label: "Visitor" },
  { value: "group", label: "Group" },
]

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
]

const EMPTY_FIELD: CustomFieldFormInput = {
  entityType: "member",
  fieldKey: "",
  fieldLabel: "",
  fieldType: "text",
  isRequired: false,
  isConfidential: false,
}

type CustomField = {
  id: string
  entityType: string
  fieldKey: string
  fieldLabel: string
  fieldType: string
  isRequired?: boolean
}

export function CustomFieldsTab({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const form = useForm<CustomFieldFormInput, unknown, CustomFieldFormOutput>({
    resolver: zodResolver(createCustomFieldSchema),
    defaultValues: EMPTY_FIELD,
  })

  const { data: fields = [] } = useQuery({
    queryKey: ["custom-fields"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CustomField[]>>("/settings/custom-fields")
      return res.data.data || []
    },
  })

  const create = useMutation({
    mutationFn: async (input: CustomFieldFormOutput) => {
      await apiClient.post("/settings/custom-fields", input)
    },
    onSuccess: () => {
      toast.success("Custom field created")
      qc.invalidateQueries({ queryKey: ["custom-fields"] })
      setOpen(false)
      form.reset(EMPTY_FIELD)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Custom fields</h2>
          <p className="text-xs text-zinc-500">Extend members, visitors, and groups with your own fields.</p>
        </div>
        {canEdit ? (
          <Button variant="primary" onClick={() => setOpen(true)}>
            Add field
          </Button>
        ) : null}
      </div>

      {fields.length === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyTitle>No custom fields yet</EmptyTitle>
          <EmptyDescription>Create your first field to capture ministry-specific data.</EmptyDescription>
        </Empty>
      ) : (
        <div className="rounded-xl border bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.fieldLabel}</TableCell>
                  <TableCell className="font-mono text-xs">{f.fieldKey}</TableCell>
                  <TableCell>{f.entityType}</TableCell>
                  <TableCell>{f.fieldType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={form.handleSubmit((values) => create.mutate(values))}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Add custom field</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <Form {...form}>
                <FieldGroup className="gap-4">
                  <SelectFormField
                    control={form.control}
                    name="entityType"
                    label="Entity"
                    options={ENTITY_OPTIONS}
                  />
                  <TextFormField control={form.control} name="fieldLabel" label="Label" />
                  <TextFormField
                    control={form.control}
                    name="fieldKey"
                    label="Key"
                    placeholder="allergy_notes"
                    transform={(v) => v.replace(/\s+/g, "_").toLowerCase()}
                  />
                  <SelectFormField
                    control={form.control}
                    name="fieldType"
                    label="Type"
                    options={FIELD_TYPE_OPTIONS}
                  />
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={create.isPending}>
                Save field
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
