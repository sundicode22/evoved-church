"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { TextFormField } from "@/components/form-fields"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Can } from "@/components/auth/can"
import { RowActionsMenu } from "@/components/row-actions-menu"
import { StatusPill, TablePagination, TablePanel } from "@/components/table-panel"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useCreateRole,
  usePermissionCatalog,
  useRoles,
  useSaveRolePermissions,
  type PermissionRecord,
  type RoleRecord,
} from "@/features/settings/hooks/use-rbac"
import { createRoleFormSchema } from "@/features/settings/rbac-schemas"
import { CheckCircle2, Info, Plus } from "lucide-react"

function groupPermissions(perms: PermissionRecord[]) {
  const groups = new Map<string, PermissionRecord[]>()
  for (const p of perms) {
    groups.set(p.groupName, [...(groups.get(p.groupName) ?? []), p])
  }
  return [...groups.entries()]
}

function CreateRoleSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (role: RoleRecord) => void
}) {
  const create = useCreateRole()
  const form = useForm<z.infer<typeof createRoleFormSchema>>({
    resolver: zodResolver(createRoleFormSchema),
    defaultValues: { name: "", description: "" },
  })

  function submit(values: z.infer<typeof createRoleFormSchema>) {
    create.mutate(
      { name: values.name, description: values.description || undefined },
      {
        onSuccess: (role) => {
          onOpenChange(false)
          form.reset()
          onCreated(role)
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset size="sm" className="p-0">
        <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
          <SheetHeader className="pr-12">
            <SheetTitle>Create role</SheetTitle>
            <SheetDescription>
              New roles start with no permissions; assign them in the matrix.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <Form {...form}>
              <FieldGroup className="gap-4">
                <TextFormField control={form.control} name="name" label="Role name" />
                <TextFormField control={form.control} name="description" label="Description" />
              </FieldGroup>
            </Form>
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" className="h-9" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={create.isPending}>
              Create role
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function RolesPermissionsTab() {
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const { data: permissions, isLoading: permsLoading } = usePermissionCatalog()
  const save = useSaveRolePermissions()
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // Unsaved edits per role; absent entry means "show the saved permissions".
  const [edits, setEdits] = React.useState<Record<string, Set<string>>>({})
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const selected = roles?.find((r) => r.id === (selectedId ?? roles[0]?.id))
  const grouped = React.useMemo(() => groupPermissions(permissions ?? []), [permissions])

  const checked = React.useMemo(
    () =>
      selected
        ? (edits[selected.id] ??
          new Set(selected.isAdmin ? (permissions ?? []).map((p) => p.key) : selected.permissionKeys))
        : new Set<string>(),
    [edits, selected, permissions]
  )

  const setChecked = (updater: (prev: Set<string>) => Set<string>) => {
    if (!selected) return
    setEdits((prev) => ({ ...prev, [selected.id]: updater(prev[selected.id] ?? checked) }))
  }

  const dirty =
    selected && !selected.isAdmin
      ? checked.size !== selected.permissionKeys.length ||
        selected.permissionKeys.some((k) => !checked.has(k))
      : false

  function toggle(key: string, on: boolean) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (on) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function toggleGroup(items: PermissionRecord[], on: boolean) {
    setChecked((prev) => {
      const next = new Set(prev)
      items.forEach((p) => (on ? next.add(p.key) : next.delete(p.key)))
      return next
    })
  }

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [editorOpen, setEditorOpen] = React.useState(false)

  if (rolesLoading || permsLoading) return <Skeleton className="h-96 w-full rounded-lg" />

  const rows = roles ?? []
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <TablePanel>
        <div className="flex justify-end px-1">
          <Can permission="settings.roles">
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              New role
            </Button>
          </Can>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No roles yet.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="pl-4 text-foreground">{role.name}</TableCell>
                <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                  {role.isAdmin
                    ? "Every permission"
                    : role.description || "—"}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {role.isAdmin ? permissions?.length ?? "All" : role.permissionKeys.length}
                </TableCell>
                <TableCell>
                  <StatusPill tone={role.isAdmin ? "success" : "neutral"}>
                    {role.isAdmin ? "Admin" : "Custom"}
                  </StatusPill>
                </TableCell>
                <TableCell className="pr-3 text-right">
                  <RowActionsMenu
                    label="Role"
                    groups={[
                      {
                        items: [
                          {
                            label: "Edit permissions",
                            onClick: () => {
                              setSelectedId(role.id)
                              setEditorOpen(true)
                            },
                          },
                        ],
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={rows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </TablePanel>

      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent side="right" inset size="lg" className="p-0">
          <SheetHeader className="pr-12">
            <SheetTitle>{selected?.name ?? "Role"}</SheetTitle>
            <SheetDescription>
              {selected?.isAdmin
                ? "Administrators always have every permission."
                : selected?.description || "Choose what this role can see and do."}
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="gap-4">
            {selected?.isAdmin && (
              <Alert className="border-brand/20 bg-brand-soft text-brand-ink">
                <Info className="size-3.5" />
                <AlertTitle>Administrator</AlertTitle>
                <AlertDescription className="text-brand-ink/80">
                  This role always has every permission. The list below is read-only.
                </AlertDescription>
              </Alert>
            )}
            <ScrollArea className="h-[min(520px,60vh)] pr-3">
              <Accordion
                multiple
                defaultValue={grouped.slice(0, 2).map(([g]) => g)}
                className="gap-2 overflow-visible rounded-none border-0"
              >
                {grouped.map(([group, items]) => {
                  const selectedCount = items.filter(
                    (p) => checked.has(p.key) || selected?.isAdmin
                  ).length
                  const allOn = selectedCount === items.length
                  return (
                    <AccordionItem
                      key={group}
                      value={group}
                      className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs data-open:bg-white"
                    >
                      <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                        <div className="flex w-full items-center justify-between gap-3 pr-2 text-left">
                          <span className="font-semibold text-zinc-900">{group}</span>
                          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-700">
                            {selectedCount}/{items.length}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-zinc-100 px-2 pb-2">
                        {!selected?.isAdmin ? (
                          <div className="flex justify-end px-2 pt-2">
                            <Can permission="settings.roles">
                              <button
                                type="button"
                                onClick={() => toggleGroup(items, !allOn)}
                                className="text-xs font-medium text-[var(--brand-hover)] hover:underline"
                              >
                                {allOn ? "Clear group" : "Select all"}
                              </button>
                            </Can>
                          </div>
                        ) : null}
                        <div className="space-y-1 pt-1">
                          {items.map((p) => {
                            const on = Boolean(selected?.isAdmin || checked.has(p.key))
                            return (
                              <label
                                key={p.key}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-zinc-50"
                              >
                                <Checkbox
                                  checked={on}
                                  disabled={selected?.isAdmin}
                                  onCheckedChange={(v) => toggle(p.key, Boolean(v))}
                                />
                                <span className="text-sm font-medium leading-snug text-zinc-900">
                                  {p.label}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </ScrollArea>
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              Close
            </Button>
            <Can permission="settings.roles">
              <Button
                disabled={!dirty || save.isPending || selected?.isAdmin}
                onClick={() =>
                  selected &&
                  save.mutate(
                    { roleId: selected.id, permissionKeys: [...checked] },
                    {
                      onSuccess: () => {
                        setEdits((prev) => {
                          const rest = { ...prev }
                          delete rest[selected.id]
                          return rest
                        })
                        setEditorOpen(false)
                      },
                    }
                  )
                }
                className="font-normal"
              >
                <CheckCircle2 className="size-3.5" />
                Save permissions
              </Button>
            </Can>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <CreateRoleSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(role) => {
          setSelectedId(role.id)
          setEditorOpen(true)
        }}
      />
    </>
  )
}
