"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
  const [name, setName] = React.useState("")
  const [city, setCity] = React.useState("")
  const [slug, setSlug] = React.useState("")

  const { data: locations = [] } = useQuery({
    queryKey: ["campuses"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Campus[]>>("/campuses")
      return res.data.data || []
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      await apiClient.post("/campuses", {
        name,
        slug: slug || slugify(name),
        city,
        type: "regional",
      })
    },
    onSuccess: () => {
      toast.success("Location created")
      qc.invalidateQueries({ queryKey: ["campuses"] })
      setOpen(false)
      setName("")
      setCity("")
      setSlug("")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Locations</h2>
          <p className="text-xs text-zinc-500">Sites of your church (Main, North, Online).</p>
        </div>
        {canEdit ? (
          <Button
            onClick={() => setOpen(true)}
            className="h-9 rounded-lg bg-[var(--brand)] text-sm text-white hover:bg-[var(--brand-hover)]"
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
                      <span className="ml-2 text-xs text-[var(--brand)]">Main</span>
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
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add location</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setSlug(slugify(e.target.value))
                  }}
                  placeholder="North Location"
                />
              </Field>
              <Field>
                <FieldLabel>City</FieldLabel>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Slug</FieldLabel>
                <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
              </Field>
            </FieldGroup>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={name.trim().length < 2 || create.isPending}
              onClick={() => create.mutate()}
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]"
            >
              Save location
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
