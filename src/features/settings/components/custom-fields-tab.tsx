"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
  const [entityType, setEntityType] = React.useState("member")
  const [fieldKey, setFieldKey] = React.useState("")
  const [fieldLabel, setFieldLabel] = React.useState("")
  const [fieldType, setFieldType] = React.useState("text")

  const { data: fields = [] } = useQuery({
    queryKey: ["custom-fields"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<CustomField[]>>("/settings/custom-fields")
      return res.data.data || []
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      await apiClient.post("/settings/custom-fields", {
        entityType,
        fieldKey,
        fieldLabel,
        fieldType,
        isRequired: false,
        isConfidential: false,
      })
    },
    onSuccess: () => {
      toast.success("Custom field created")
      qc.invalidateQueries({ queryKey: ["custom-fields"] })
      setOpen(false)
      setFieldKey("")
      setFieldLabel("")
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
          <Button
            onClick={() => setOpen(true)}
            className="h-9 rounded-lg bg-[#16a34a] text-sm text-white hover:bg-[#15803d]"
          >
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
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add custom field</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Entity</FieldLabel>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Label</FieldLabel>
                <Input value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Key</FieldLabel>
                <Input
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value.replace(/\s+/g, "_").toLowerCase())}
                  placeholder="allergy_notes"
                />
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select value={fieldType} onValueChange={setFieldType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!fieldKey || !fieldLabel || create.isPending}
              onClick={() => create.mutate()}
              className="bg-[#16a34a] text-white hover:bg-[#15803d]"
            >
              Save field
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
