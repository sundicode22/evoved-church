"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { TextFormField } from "@/components/form-fields"
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
import { slugify } from "@/features/onboarding/presets"
import { createCampusSchema } from "@/features/campuses/schemas"

const addLocationFormSchema = createCampusSchema
  .pick({ name: true, slug: true })
  .extend({ city: z.string() })

type AddLocationFormValues = z.infer<typeof addLocationFormSchema>

const ADD_LOCATION_DEFAULTS: AddLocationFormValues = { name: "", city: "", slug: "" }

type Campus = {
  id: string
  name: string
  slug: string
  city?: string
  type?: string
  isMainCampus?: boolean
}

export function LocationsTab({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const form = useForm<AddLocationFormValues>({
    resolver: zodResolver(addLocationFormSchema),
    defaultValues: ADD_LOCATION_DEFAULTS,
  })

  React.useEffect(() => {
    const sub = form.watch((values, { name: changed }) => {
      if (changed === "name") {
        form.setValue("slug", slugify(values.name ?? ""), { shouldValidate: form.formState.isSubmitted })
      } else if (changed === "slug") {
        const next = slugify(values.slug ?? "")
        if (next !== values.slug) form.setValue("slug", next)
      }
    })
    return () => sub.unsubscribe()
  }, [form])

  const { data: locations = [] } = useQuery({
    queryKey: ["campuses"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Campus[]>>("/campuses")
      return res.data.data || []
    },
  })

  const create = useMutation({
    mutationFn: async (values: AddLocationFormValues) => {
      await apiClient.post("/campuses", {
        name: values.name.trim(),
        slug: values.slug || slugify(values.name),
        city: values.city.trim(),
        type: "regional",
      })
    },
    onSuccess: () => {
      toast.success("Location created with its own books")
      qc.invalidateQueries({ queryKey: ["campuses"] })
      qc.invalidateQueries({ queryKey: ["accounting"] })
      setOpen(false)
      form.reset(ADD_LOCATION_DEFAULTS)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Locations</h2>
          <p className="text-xs text-zinc-500">
            Each site gets its own General Fund and chart of accounts.
          </p>
        </div>
        {canEdit ? (
          <Button
            variant="primary"
            onClick={() => {
              form.reset(ADD_LOCATION_DEFAULTS)
              setOpen(true)
            }}
          >
            Add location
          </Button>
        ) : null}
      </div>

      {locations.length === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyTitle>No locations yet</EmptyTitle>
          <EmptyDescription>Add your first location to scope people and finances.</EmptyDescription>
        </Empty>
      ) : (
        <div className="rounded-xl border bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    {l.name}
                    {l.isMainCampus ? (
                      <span className="ml-2 text-xs text-brand">Main</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{l.slug}</TableCell>
                  <TableCell>{l.city || "—"}</TableCell>
                  <TableCell>{l.type || "—"}</TableCell>
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
              <SheetTitle>Add location</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <Form {...form}>
                <FieldGroup className="gap-4">
                  <TextFormField
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="North Location"
                  />
                  <TextFormField control={form.control} name="city" label="City" />
                  <TextFormField control={form.control} name="slug" label="Slug" />
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={create.isPending}>
                Save location
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
