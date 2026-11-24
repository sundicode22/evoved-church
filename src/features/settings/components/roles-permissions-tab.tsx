"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(
      { name, description: description || undefined },
      {
        onSuccess: (role) => {
          onOpenChange(false)
          setName("")
          setDescription("")
          onCreated(role)
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset size="sm" className="p-0">
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader className="pr-12">
            <SheetTitle>Create role</SheetTitle>
            <SheetDescription>
              New roles start with no permissions; assign them in the matrix.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" className="h-9" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || name.trim().length < 2}
              className="h-9 bg-[#22c55e] text-white hover:bg-[#16a34a]"
            >
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
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="h-8 gap-1.5 bg-[#22c55e] font-normal text-white hover:bg-[#16a34a]"
            >
              <Plus className="size-3.5" />
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
          <SheetBody>
            {selected?.isAdmin && (
              <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-900">
                <Info className="size-3.5" />
                <AlertTitle>Administrator</AlertTitle>
                <AlertDescription>
                  This role always receives every permission. The list below is read-only.
                </AlertDescription>
              </Alert>
            )}
            <ScrollArea className="h-[min(520px,60vh)] pr-3">
              <Accordion multiple defaultValue={grouped.map(([g]) => g)}>
                {grouped.map(([group, items]) => {
                  const allOn = items.every((p) => checked.has(p.key))
                  return (
                    <AccordionItem key={group} value={group}>
                      <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
                        <div className="flex w-full items-center justify-between gap-3 pr-2">
                          <span className="text-sm text-foreground">{group}</span>
                          <span className="text-xs text-muted-foreground">
                            {items.filter((p) => checked.has(p.key) || selected?.isAdmin).length}/
                            {items.length}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="mb-2 flex justify-end">
                          <Can permission="settings.roles">
                            <button
                              type="button"
                              disabled={selected?.isAdmin}
                              onClick={() => toggleGroup(items, !allOn)}
                              className="text-xs text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {allOn ? "Clear group" : "Select all in group"}
                            </button>
                          </Can>
                        </div>
                        <div className="space-y-2.5">
                          {items.map((p) => (
                            <label
                              key={p.key}
                              className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground"
                            >
                              <Checkbox
                                checked={Boolean(selected?.isAdmin || checked.has(p.key))}
                                disabled={selected?.isAdmin}
                                onCheckedChange={(v) => toggle(p.key, Boolean(v))}
                                className="mt-0.5"
                              />
                              <span>
                                {p.label}
                                <span className="block font-mono text-xs text-muted-foreground">
                                  {p.key}
                                </span>
                              </span>
                            </label>
                          ))}
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
                className="bg-[#22c55e] font-normal text-white hover:bg-[#16a34a]"
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
