"use client"

import * as React from "react"
import { Package, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
import { RESOURCE_CATEGORIES } from "@/features/facilities/schemas"

export default function ResourcesPage() {
  const { data, isLoading } = useResources()
  const create = useCreateResource()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState<"equipment" | "supply" | "other">(
    "equipment"
  )
  const [description, setDescription] = React.useState("")
  const [quantity, setQuantity] = React.useState("1")
  const [requiresApproval, setRequiresApproval] = React.useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(
      {
        name,
        category,
        description,
        quantity: Number(quantity) || 1,
        requiresApproval,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setName("")
          setDescription("")
          setQuantity("1")
          setCategory("equipment")
          setRequiresApproval(false)
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
            icon={<Package className="size-5 text-[var(--brand)]" strokeWidth={1.75} />}
            actions={
              <Can permission="facilities.write">
                <Button
                  className="h-8 gap-1.5 bg-[var(--brand)] text-xs font-normal text-white hover:bg-[var(--brand)]"
                  onClick={() => setOpen(true)}
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
                  <Button
                    className="mt-4 bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
                    onClick={() => setOpen(true)}
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
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Add resource</SheetTitle>
                  <SheetDescription>
                    Catalog equipment or supplies teams can book for events.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        className="h-9"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Category</FieldLabel>
                      <Select
                        value={category}
                        items={RESOURCE_CATEGORIES.map((c) => ({
                          value: c.value,
                          label: c.label,
                        }))}
                        onValueChange={(v) =>
                          v && setCategory(v as "equipment" | "supply" | "other")
                        }
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOURCE_CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Quantity</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        className="h-9"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        className="min-h-16"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Field>
                    <Field className="flex flex-row items-center justify-between gap-3">
                      <FieldLabel>Requires approval</FieldLabel>
                      <Switch
                        checked={requiresApproval}
                        onCheckedChange={setRequiresApproval}
                      />
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={create.isPending || name.trim().length < 2}
                    className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]"
                  >
                    Save resource
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
