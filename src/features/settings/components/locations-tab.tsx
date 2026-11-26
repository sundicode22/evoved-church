"use client"

import * as React from "react"
import { toast } from "sonner"
import { MapPin, Plus } from "lucide-react"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { apiClient } from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { slugify } from "@/features/onboarding/presets"
import { createCampusSchema } from "@/features/campuses/schemas"
import { CAMPUS_KEYS, useCampuses } from "@/features/campuses/hooks/use-campuses"
import { StatusPill, TableChrome, TablePanel } from "@/components/table-panel"
import { TableExportButton } from "@/components/table-export-button"

const addLocationFormSchema = createCampusSchema
  .pick({ name: true, slug: true })
  .extend({ city: z.string() })

type AddLocationFormValues = z.infer<typeof addLocationFormSchema>

const ADD_LOCATION_DEFAULTS: AddLocationFormValues = { name: "", city: "", slug: "" }

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
        form.setValue("slug", slugify(values.name ?? ""), {
          shouldValidate: form.formState.isSubmitted,
        })
      } else if (changed === "slug") {
        const next = slugify(values.slug ?? "")
        if (next !== values.slug) form.setValue("slug", next)
      }
    })
    return () => sub.unsubscribe()
  }, [form])

  const { data: locations = [], isLoading } = useCampuses()

  const create = useMutation({
    mutationFn: async (values: AddLocationFormValues) => {
      await apiClient.post("/campuses", {
        name: values.name.trim(),
        slug: values.slug || slugify(values.name),
        city: values.city.trim(),
        type: locations.length === 0 ? "main" : "regional",
      })
    },
    onSuccess: () => {
      toast.success("Location created with standard chart of accounts")
      qc.invalidateQueries({ queryKey: CAMPUS_KEYS.all })
      qc.invalidateQueries({ queryKey: ["accounting"] })
      setOpen(false)
      form.reset(ADD_LOCATION_DEFAULTS)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const exportPayload = React.useMemo(
    () => ({
      filename: "locations",
      title: "Locations",
      headers: ["Name", "Slug", "City", "Type", "Main"],
      rows: locations.map((l) => [
        l.name,
        l.slug,
        l.city || "",
        l.type || "",
        l.isMainCampus ? "Yes" : "No",
      ]),
    }),
    [locations]
  )

  return (
    <div className="w-full space-y-4 text-left">
      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : locations.length === 0 ? (
        <Empty className="border border-dashed border-zinc-200 py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPin className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No locations yet</EmptyTitle>
            <EmptyDescription>
              Add your first campus or site. Each location gets its own General Fund and chart of
              accounts.
            </EmptyDescription>
          </EmptyHeader>
          {canEdit ? (
            <Button
              variant="primary"
              onClick={() => {
                form.reset(ADD_LOCATION_DEFAULTS)
                setOpen(true)
              }}
            >
              <Plus className="size-3.5" />
              Add location
            </Button>
          ) : null}
        </Empty>
      ) : (
        <TablePanel selectable={false} reorderable={false}>
          <TableChrome
            trailing={
              <>
                <TableExportButton payload={exportPayload} />
                {canEdit ? (
                  <Button
                    variant="primary"
                    onClick={() => {
                      form.reset(ADD_LOCATION_DEFAULTS)
                      setOpen(true)
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add location
                  </Button>
                ) : null}
              </>
            }
          />
          <Table selectable={false} reorderable={false}>
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
                  <TableCell className="pl-4">
                    <span className="font-medium text-foreground">{l.name}</span>
                    {l.isMainCampus ? (
                      <StatusPill tone="info" className="ml-2">
                        Main
                      </StatusPill>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-600">{l.slug}</TableCell>
                  <TableCell>{l.city || "—"}</TableCell>
                  <TableCell className="capitalize">{l.type || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TablePanel>
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
                {create.isPending ? (
                  <>
                    <Spinner className="size-3.5" />
                    Saving…
                  </>
                ) : (
                  "Save location"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
